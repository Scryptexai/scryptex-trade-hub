
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract SecurityManager is ReentrancyGuard, Ownable, Pausable {
    struct SecurityConfig {
        uint256 maxTradeAmount;
        uint256 maxDailyVolume;
        uint256 cooldownPeriod;
        uint256 mevProtectionDelay;
        uint256 botDetectionThreshold;
        bool enableMevProtection;
        bool enableBotDetection;
        bool enableVolumeLimit;
    }

    struct UserSecurityData {
        uint256 dailyVolume;
        uint256 lastTradeTime;
        uint256 tradeCount24h;
        uint256 suspiciousActivityScore;
        bool isBlacklisted;
        bool isWhitelisted;
        uint256 lastVolumeReset;
    }

    struct SecurityAlert {
        address user;
        address token;
        uint256 amount;
        string alertType;
        uint256 timestamp;
        uint256 riskScore;
        bool isResolved;
    }

    mapping(address => UserSecurityData) public userSecurityData;
    mapping(address => SecurityConfig) public tokenSecurityConfig;
    mapping(uint256 => SecurityAlert) public securityAlerts;
    mapping(address => bool) public authorizedContracts;
    mapping(address => uint256[]) public userAlerts;

    SecurityConfig public defaultConfig;
    uint256 public nextAlertId = 1;
    uint256 public constant MAX_RISK_SCORE = 100;
    uint256 public constant HIGH_RISK_THRESHOLD = 80;

    address public tradingEngine;
    address public orderBookManager;

    event SecurityAlertTriggered(uint256 indexed alertId, address indexed user, string alertType);
    event UserBlacklisted(address indexed user, string reason);
    event UserWhitelisted(address indexed user);
    event MEVAttemptDetected(address indexed user, address indexed token, uint256 amount);
    event BotActivityDetected(address indexed user, uint256 score);
    event SecurityConfigUpdated(address indexed token);

    modifier onlyAuthorized() {
        require(authorizedContracts[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    modifier notBlacklisted(address user) {
        require(!userSecurityData[user].isBlacklisted, "User blacklisted");
        _;
    }

    constructor() {
        defaultConfig = SecurityConfig({
            maxTradeAmount: 10 ether,
            maxDailyVolume: 100 ether,
            cooldownPeriod: 30 seconds,
            mevProtectionDelay: 3 seconds,
            botDetectionThreshold: 50,
            enableMevProtection: true,
            enableBotDetection: true,
            enableVolumeLimit: true
        });
    }

    function validateTrade(
        address user,
        address token,
        uint256 amount,
        bool isBuy
    ) external onlyAuthorized notBlacklisted(user) returns (bool) {
        UserSecurityData storage userData = userSecurityData[user];
        SecurityConfig memory config = _getSecurityConfig(token);

        // Reset daily volume if needed
        if (block.timestamp >= userData.lastVolumeReset + 24 hours) {
            userData.dailyVolume = 0;
            userData.tradeCount24h = 0;
            userData.lastVolumeReset = block.timestamp;
        }

        // Check trade amount limits
        if (config.enableVolumeLimit && amount > config.maxTradeAmount) {
            _createSecurityAlert(user, token, amount, "LARGE_TRADE", 70);
            return false;
        }

        // Check daily volume limits
        if (config.enableVolumeLimit && userData.dailyVolume + amount > config.maxDailyVolume) {
            _createSecurityAlert(user, token, amount, "DAILY_LIMIT_EXCEEDED", 80);
            return false;
        }

        // Check cooldown period
        if (block.timestamp < userData.lastTradeTime + config.cooldownPeriod) {
            _createSecurityAlert(user, token, amount, "COOLDOWN_VIOLATION", 60);
            return false;
        }

        // MEV Protection
        if (config.enableMevProtection) {
            if (!_checkMEVProtection(user, token, amount)) {
                return false;
            }
        }

        // Bot Detection
        if (config.enableBotDetection) {
            uint256 botScore = _calculateBotScore(user, amount);
            if (botScore > config.botDetectionThreshold) {
                _createSecurityAlert(user, token, amount, "BOT_DETECTED", botScore);
                emit BotActivityDetected(user, botScore);
                return false;
            }
        }

        // Update user data
        userData.dailyVolume += amount;
        userData.lastTradeTime = block.timestamp;
        userData.tradeCount24h++;

        return true;
    }

    function _checkMEVProtection(
        address user,
        address token,
        uint256 amount
    ) internal returns (bool) {
        UserSecurityData storage userData = userSecurityData[user];
        SecurityConfig memory config = _getSecurityConfig(token);

        // Check for rapid sequential trades (potential MEV)
        if (block.timestamp < userData.lastTradeTime + config.mevProtectionDelay) {
            _createSecurityAlert(user, token, amount, "MEV_ATTEMPT", 90);
            emit MEVAttemptDetected(user, token, amount);
            return false;
        }

        // Check for sandwich attack patterns
        if (_detectSandwichPattern(user, token, amount)) {
            _createSecurityAlert(user, token, amount, "SANDWICH_ATTACK", 95);
            return false;
        }

        return true;
    }

    function _detectSandwichPattern(
        address user,
        address token,
        uint256 amount
    ) internal view returns (bool) {
        // Simplified sandwich attack detection
        // In production, this would analyze multiple transactions in the mempool
        UserSecurityData memory userData = userSecurityData[user];
        
        // Check for unusually large trades followed by quick reversals
        if (userData.tradeCount24h > 10 && amount > userData.dailyVolume / 2) {
            return true;
        }
        
        return false;
    }

    function _calculateBotScore(address user, uint256 amount) internal view returns (uint256) {
        UserSecurityData memory userData = userSecurityData[user];
        
        uint256 score = 0;
        
        // High frequency trading indicator
        if (userData.tradeCount24h > 100) {
            score += 30;
        } else if (userData.tradeCount24h > 50) {
            score += 20;
        } else if (userData.tradeCount24h > 20) {
            score += 10;
        }
        
        // Regular timing patterns
        if (userData.lastTradeTime > 0) {
            uint256 timeDiff = block.timestamp - userData.lastTradeTime;
            if (timeDiff < 60 && timeDiff % 12 == 0) { // Every 12 seconds
                score += 25;
            }
        }
        
        // Consistent trade sizes
        if (amount == userData.dailyVolume / userData.tradeCount24h) {
            score += 15;
        }
        
        // Accumulated suspicious activity
        score += userData.suspiciousActivityScore / 10;
        
        return score > MAX_RISK_SCORE ? MAX_RISK_SCORE : score;
    }

    function _createSecurityAlert(
        address user,
        address token,
        uint256 amount,
        string memory alertType,
        uint256 riskScore
    ) internal {
        uint256 alertId = nextAlertId++;
        
        securityAlerts[alertId] = SecurityAlert({
            user: user,
            token: token,
            amount: amount,
            alertType: alertType,
            timestamp: block.timestamp,
            riskScore: riskScore,
            isResolved: false
        });
        
        userAlerts[user].push(alertId);
        
        // Update user's suspicious activity score
        userSecurityData[user].suspiciousActivityScore += riskScore / 10;
        
        emit SecurityAlertTriggered(alertId, user, alertType);
        
        // Auto-blacklist for very high risk
        if (riskScore >= HIGH_RISK_THRESHOLD) {
            _blacklistUser(user, alertType);
        }
    }

    function _getSecurityConfig(address token) internal view returns (SecurityConfig memory) {
        SecurityConfig memory config = tokenSecurityConfig[token];
        
        // Use default config if token-specific config is not set
        if (config.maxTradeAmount == 0) {
            return defaultConfig;
        }
        
        return config;
    }

    function _blacklistUser(address user, string memory reason) internal {
        userSecurityData[user].isBlacklisted = true;
        emit UserBlacklisted(user, reason);
    }

    // Admin functions
    function setDefaultSecurityConfig(SecurityConfig calldata config) external onlyOwner {
        defaultConfig = config;
        emit SecurityConfigUpdated(address(0));
    }

    function setTokenSecurityConfig(address token, SecurityConfig calldata config) external onlyOwner {
        tokenSecurityConfig[token] = config;
        emit SecurityConfigUpdated(token);
    }

    function blacklistUser(address user, string calldata reason) external onlyOwner {
        _blacklistUser(user, reason);
    }

    function whitelistUser(address user) external onlyOwner {
        UserSecurityData storage userData = userSecurityData[user];
        userData.isBlacklisted = false;
        userData.isWhitelisted = true;
        userData.suspiciousActivityScore = 0;
        emit UserWhitelisted(user);
    }

    function resolveSecurityAlert(uint256 alertId) external onlyOwner {
        require(securityAlerts[alertId].user != address(0), "Alert not found");
        securityAlerts[alertId].isResolved = true;
    }

    function authorizeContract(address contractAddr, bool authorized) external onlyOwner {
        authorizedContracts[contractAddr] = authorized;
    }

    function setTradingEngine(address _tradingEngine) external onlyOwner {
        tradingEngine = _tradingEngine;
        authorizedContracts[_tradingEngine] = true;
    }

    function setOrderBookManager(address _orderBookManager) external onlyOwner {
        orderBookManager = _orderBookManager;
        authorizedContracts[_orderBookManager] = true;
    }

    function emergencyPause() external onlyOwner {
        _pause();
    }

    function emergencyUnpause() external onlyOwner {
        _unpause();
    }

    // View functions
    function getUserSecurityData(address user) external view returns (UserSecurityData memory) {
        return userSecurityData[user];
    }

    function getSecurityAlert(uint256 alertId) external view returns (SecurityAlert memory) {
        return securityAlerts[alertId];
    }

    function getUserAlerts(address user) external view returns (uint256[] memory) {
        return userAlerts[user];
    }

    function getTokenSecurityConfig(address token) external view returns (SecurityConfig memory) {
        return _getSecurityConfig(token);
    }

    function isUserSecure(address user) external view returns (bool) {
        UserSecurityData memory userData = userSecurityData[user];
        return !userData.isBlacklisted && userData.suspiciousActivityScore < HIGH_RISK_THRESHOLD;
    }

    function calculateRiskScore(address user, address token, uint256 amount) external view returns (uint256) {
        uint256 botScore = _calculateBotScore(user, amount);
        uint256 volumeRisk = 0;
        
        SecurityConfig memory config = _getSecurityConfig(token);
        UserSecurityData memory userData = userSecurityData[user];
        
        // Volume risk calculation
        if (config.enableVolumeLimit) {
            if (amount > config.maxTradeAmount) {
                volumeRisk += 30;
            }
            if (userData.dailyVolume + amount > config.maxDailyVolume) {
                volumeRisk += 40;
            }
        }
        
        uint256 totalRisk = botScore + volumeRisk + (userData.suspiciousActivityScore / 5);
        return totalRisk > MAX_RISK_SCORE ? MAX_RISK_SCORE : totalRisk;
    }
}
