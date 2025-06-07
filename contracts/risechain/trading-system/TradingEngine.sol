
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ITokenFactory {
    event TokenCreated(
        address indexed token,
        address indexed creator,
        string name,
        string symbol,
        uint256 maxSupply,
        address bondingCurve
    );
}

interface IBondingCurve {
    function getCurrentPrice() external view returns (uint256);
    function calculateBuyAmount(uint256 ethAmount) external view returns (uint256 tokenAmount, uint256 newPrice);
    function calculateSellAmount(uint256 tokenAmount) external view returns (uint256 ethAmount, uint256 newPrice);
    function executeBuy(address buyer, uint256 ethAmount) external payable returns (uint256 tokenAmount);
    function executeSell(address seller, uint256 tokenAmount) external returns (uint256 ethAmount);
    function isGraduated() external view returns (bool);
    function getMarketCap() external view returns (uint256);
}

contract TradingEngine is ReentrancyGuard, Ownable, Pausable {
    struct TokenInfo {
        address creator;
        address bondingCurve;
        bool isActive;
        uint256 listingTime;
        uint256 totalVolume;
        uint256 socialScore;
        bool isGraduated;
        uint256 graduatedAt;
    }

    struct TokenMetrics {
        uint256 volume24h;
        uint256 volumeAllTime;
        uint256 trades24h;
        uint256 tradesAllTime;
        uint256 uniqueTraders;
        uint256 marketCap;
        uint256 lastPrice;
        int256 priceChange24h;
        uint256 lastUpdated;
    }

    struct TradeOrder {
        address token;
        uint256 amount;
        uint256 maxSlippage;
        uint256 deadline;
        bool isBuy;
    }

    struct UserStats {
        uint256 totalVolume;
        uint256 totalTrades;
        int256 totalProfit;
        uint256 firstTradeTime;
        uint256 lastTradeTime;
        uint256 reputation;
        bool isVerified;
    }

    // State variables
    mapping(address => TokenInfo) public tokenInfo;
    mapping(address => TokenMetrics) public tokenMetrics;
    mapping(address => UserStats) public userStats;
    mapping(address => mapping(address => uint256)) public userTokenBalances;
    mapping(address => uint256) private tokenLocks;
    mapping(address => bool) public authorizedFactories;

    address[] public listedTokens;
    address[] public graduatedTokens;

    // Constants
    uint256 public constant TRADING_FEE_RATE = 100; // 1%
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant MAX_SLIPPAGE = 1500; // 15%
    uint256 public constant GRADUATION_THRESHOLD = 69000 * 1e18; // $69k
    uint256 public constant MAX_SUPPLY_PER_TX = 200; // 2% max per transaction

    // Events
    event TokenRegistered(address indexed token, address indexed creator, address bondingCurve);
    event TradeExecuted(
        address indexed token,
        address indexed trader,
        uint256 amount,
        uint256 price,
        bool isBuy,
        uint256 timestamp,
        string socialNote
    );
    event TokenGraduated(address indexed token, uint256 timestamp, uint256 finalMarketCap);
    event BatchTradeExecuted(address indexed trader, uint256 successfulTrades, uint256 failedTrades);

    modifier onlyAuthorizedFactory() {
        require(authorizedFactories[msg.sender], "Unauthorized factory");
        _;
    }

    modifier noConflict(address token) {
        require(tokenLocks[token] == 0, "Token locked");
        tokenLocks[token] = 1;
        _;
        tokenLocks[token] = 0;
    }

    modifier validToken(address token) {
        require(tokenInfo[token].isActive, "Token not active");
        require(!tokenInfo[token].isGraduated, "Token graduated");
        _;
    }

    constructor() {}

    // Token Registration (called by TokenFactory)
    function registerNewToken(
        address token,
        address creator,
        address bondingCurve
    ) external onlyAuthorizedFactory {
        require(token != address(0), "Invalid token address");
        require(!tokenInfo[token].isActive, "Token already registered");

        tokenInfo[token] = TokenInfo({
            creator: creator,
            bondingCurve: bondingCurve,
            isActive: true,
            listingTime: block.timestamp,
            totalVolume: 0,
            socialScore: 0,
            isGraduated: false,
            graduatedAt: 0
        });

        tokenMetrics[token] = TokenMetrics({
            volume24h: 0,
            volumeAllTime: 0,
            trades24h: 0,
            tradesAllTime: 0,
            uniqueTraders: 0,
            marketCap: 0,
            lastPrice: 0,
            priceChange24h: 0,
            lastUpdated: block.timestamp
        });

        listedTokens.push(token);
        emit TokenRegistered(token, creator, bondingCurve);
    }

    // Core Trading Functions
    function buyTokens(
        address token,
        uint256 maxSlippage,
        uint256 deadline,
        string calldata socialNote
    ) external payable nonReentrant whenNotPaused validToken(token) noConflict(token) {
        require(msg.value > 0, "Invalid ETH amount");
        require(maxSlippage <= MAX_SLIPPAGE, "Slippage too high");
        require(deadline >= block.timestamp, "Trade expired");

        _validatePurchase(token, msg.value);

        IBondingCurve curve = IBondingCurve(tokenInfo[token].bondingCurve);
        (uint256 tokenAmount, uint256 newPrice) = curve.calculateBuyAmount(msg.value);

        // Execute trade
        uint256 actualTokens = curve.executeBuy{value: msg.value}(msg.sender, msg.value);
        require(actualTokens > 0, "Trade failed");

        // Update metrics
        _updateTokenMetrics(token, msg.value, true, newPrice);
        _updateUserStats(msg.sender, msg.value, true);

        // Check for graduation
        _checkGraduation(token);

        emit TradeExecuted(token, msg.sender, actualTokens, newPrice, true, block.timestamp, socialNote);
    }

    function sellTokens(
        address token,
        uint256 amount,
        uint256 maxSlippage,
        uint256 deadline,
        string calldata socialNote
    ) external nonReentrant whenNotPaused validToken(token) noConflict(token) {
        require(amount > 0, "Invalid amount");
        require(maxSlippage <= MAX_SLIPPAGE, "Slippage too high");
        require(deadline >= block.timestamp, "Trade expired");
        require(IERC20(token).balanceOf(msg.sender) >= amount, "Insufficient balance");

        IBondingCurve curve = IBondingCurve(tokenInfo[token].bondingCurve);
        (uint256 ethAmount, uint256 newPrice) = curve.calculateSellAmount(amount);

        // Execute trade
        uint256 actualEth = curve.executeSell(msg.sender, amount);
        require(actualEth > 0, "Trade failed");

        // Update metrics
        _updateTokenMetrics(token, actualEth, false, newPrice);
        _updateUserStats(msg.sender, actualEth, false);

        emit TradeExecuted(token, msg.sender, amount, newPrice, false, block.timestamp, socialNote);
    }

    // Batch Trading (pEVM Optimized)
    function batchTrade(
        TradeOrder[] calldata orders
    ) external payable nonReentrant whenNotPaused {
        uint256 successfulTrades = 0;
        uint256 failedTrades = 0;

        for (uint256 i = 0; i < orders.length; i++) {
            TradeOrder memory order = orders[i];
            
            try this._executeSingleTrade(order, msg.sender) {
                successfulTrades++;
            } catch {
                failedTrades++;
            }
        }

        emit BatchTradeExecuted(msg.sender, successfulTrades, failedTrades);
    }

    function _executeSingleTrade(TradeOrder memory order, address trader) external {
        require(msg.sender == address(this), "Internal only");
        
        if (order.isBuy) {
            this.buyTokens{value: order.amount}(order.token, order.maxSlippage, order.deadline, "");
        } else {
            this.sellTokens(order.token, order.amount, order.maxSlippage, order.deadline, "");
        }
    }

    // Internal Functions
    function _validatePurchase(address token, uint256 ethAmount) internal view {
        IBondingCurve curve = IBondingCurve(tokenInfo[token].bondingCurve);
        (uint256 tokenAmount,) = curve.calculateBuyAmount(ethAmount);
        
        uint256 totalSupply = IERC20(token).totalSupply();
        require(tokenAmount <= (totalSupply * MAX_SUPPLY_PER_TX) / 10000, "Exceeds max per transaction");
    }

    function _updateTokenMetrics(address token, uint256 volume, bool isBuy, uint256 newPrice) internal {
        TokenMetrics storage metrics = tokenMetrics[token];
        TokenInfo storage info = tokenInfo[token];

        // Update volume
        metrics.volume24h += volume;
        metrics.volumeAllTime += volume;
        info.totalVolume += volume;

        // Update trades
        metrics.trades24h++;
        metrics.tradesAllTime++;

        // Update price
        int256 priceChange = int256(newPrice) - int256(metrics.lastPrice);
        metrics.priceChange24h = priceChange;
        metrics.lastPrice = newPrice;

        // Update market cap
        IBondingCurve curve = IBondingCurve(info.bondingCurve);
        metrics.marketCap = curve.getMarketCap();

        metrics.lastUpdated = block.timestamp;
    }

    function _updateUserStats(address user, uint256 volume, bool isBuy) internal {
        UserStats storage stats = userStats[user];
        
        if (stats.firstTradeTime == 0) {
            stats.firstTradeTime = block.timestamp;
        }

        stats.totalVolume += volume;
        stats.totalTrades++;
        stats.lastTradeTime = block.timestamp;

        // Update reputation based on activity
        stats.reputation = _calculateReputation(user);
    }

    function _calculateReputation(address user) internal view returns (uint256) {
        UserStats memory stats = userStats[user];
        if (stats.totalTrades == 0) return 0;

        uint256 volumeRep = stats.totalVolume / 1 ether;
        uint256 profitRep = stats.totalProfit > 0 ? uint256(stats.totalProfit) / 0.1 ether : 0;
        uint256 timeRep = (block.timestamp - stats.firstTradeTime) / 86400; // days

        return (volumeRep + profitRep + timeRep) / 3;
    }

    function _checkGraduation(address token) internal {
        IBondingCurve curve = IBondingCurve(tokenInfo[token].bondingCurve);
        uint256 marketCap = curve.getMarketCap();

        if (marketCap >= GRADUATION_THRESHOLD && !tokenInfo[token].isGraduated) {
            _executeGraduation(token);
        }
    }

    function _executeGraduation(address token) internal {
        tokenInfo[token].isGraduated = true;
        tokenInfo[token].graduatedAt = block.timestamp;
        graduatedTokens.push(token);

        IBondingCurve curve = IBondingCurve(tokenInfo[token].bondingCurve);
        uint256 finalMarketCap = curve.getMarketCap();

        emit TokenGraduated(token, block.timestamp, finalMarketCap);
    }

    // View Functions
    function getTokenMetrics(address token) external view returns (TokenMetrics memory) {
        return tokenMetrics[token];
    }

    function getUserStats(address user) external view returns (UserStats memory) {
        return userStats[user];
    }

    function getListedTokens() external view returns (address[] memory) {
        return listedTokens;
    }

    function getGraduatedTokens() external view returns (address[] memory) {
        return graduatedTokens;
    }

    function calculateTrendingScore(address token) public view returns (uint256) {
        TokenMetrics memory metrics = tokenMetrics[token];
        if (metrics.lastUpdated == 0) return 0;

        uint256 volumeScore = metrics.volume24h * 40 / 100;
        uint256 tradersScore = metrics.uniqueTraders * 30 / 100;
        uint256 socialScore = tokenInfo[token].socialScore * 20 / 100;
        uint256 timeScore = _calculateTimeDecay(token) * 10 / 100;

        return volumeScore + tradersScore + socialScore + timeScore;
    }

    function _calculateTimeDecay(address token) internal view returns (uint256) {
        uint256 timeSinceListing = block.timestamp - tokenInfo[token].listingTime;
        if (timeSinceListing > 7 days) return 0;
        return 100 - (timeSinceListing * 100 / 7 days);
    }

    // Admin Functions
    function authorizeFactory(address factory, bool authorized) external onlyOwner {
        authorizedFactories[factory] = authorized;
    }

    function updateSocialScore(address token, uint256 score) external onlyOwner {
        tokenInfo[token].socialScore = score;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}
}
