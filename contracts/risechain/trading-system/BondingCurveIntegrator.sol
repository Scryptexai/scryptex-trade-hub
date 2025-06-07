
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BondingCurveIntegrator is ReentrancyGuard, Ownable {
    struct BondingCurve {
        address token;
        uint256 virtualTokenReserves; // 800M tokens
        uint256 virtualSolReserves;   // 30 ETH equivalent
        uint256 realTokenReserves;
        uint256 realSolReserves;
        uint256 totalSupply;
        bool isGraduated;
        uint256 createdAt;
        uint256 lastTradeTime;
    }

    struct PricePoint {
        uint256 price;
        uint256 timestamp;
        uint256 volume;
    }

    mapping(address => BondingCurve) public bondingCurves;
    mapping(address => PricePoint[]) public priceHistory;
    mapping(address => uint256) public graduationProgress;

    // Constants - Exact Pump.Fun Formula
    uint256 public constant VIRTUAL_TOKEN_RESERVES = 800_000_000 * 1e18; // 800M tokens
    uint256 public constant VIRTUAL_SOL_RESERVES = 30 * 1e18; // 30 ETH
    uint256 public constant GRADUATION_THRESHOLD = 69_000 * 1e18; // $69k
    uint256 public constant MIGRATION_TOKENS = 206_900_000 * 1e18; // 206.9M tokens
    uint256 public constant CREATOR_REWARD = 0.5 * 1e18; // 0.5 ETH
    uint256 public constant SERVICE_FEE = 2.3 * 1e18; // 2.3 ETH

    address public tradingEngine;
    address public graduationManager;

    event CurveInitialized(address indexed token, uint256 virtualTokens, uint256 virtualSol);
    event PriceUpdated(address indexed token, uint256 newPrice, uint256 marketCap);
    event TokenGraduated(address indexed token, uint256 finalPrice, uint256 liquidityMigrated);

    modifier onlyTradingEngine() {
        require(msg.sender == tradingEngine, "Only trading engine");
        _;
    }

    constructor(address _tradingEngine) {
        tradingEngine = _tradingEngine;
    }

    function initializeBondingCurve(
        address token,
        uint256 initialSupply,
        uint256 maxSupply
    ) external onlyTradingEngine returns (address) {
        require(bondingCurves[token].token == address(0), "Curve already exists");

        bondingCurves[token] = BondingCurve({
            token: token,
            virtualTokenReserves: VIRTUAL_TOKEN_RESERVES,
            virtualSolReserves: VIRTUAL_SOL_RESERVES,
            realTokenReserves: 0,
            realSolReserves: 0,
            totalSupply: initialSupply,
            isGraduated: false,
            createdAt: block.timestamp,
            lastTradeTime: 0
        });

        emit CurveInitialized(token, VIRTUAL_TOKEN_RESERVES, VIRTUAL_SOL_RESERVES);
        return address(this);
    }

    // Exact Pump.Fun Price Calculation Formula
    function calculatePrice(uint256 supply) public pure returns (uint256) {
        // Formula: y = 1073000191 - 32190005730/(30+x)
        // Where x is supply in millions of tokens
        uint256 supplyInMillions = supply / 1e24; // Convert to millions
        uint256 denominator = 30 + supplyInMillions;
        
        if (denominator == 0) return 1073000191;
        
        uint256 fraction = (32190005730 * 1e18) / denominator;
        
        if (fraction >= 1073000191) return 0;
        
        return 1073000191 - fraction;
    }

    function calculateBuyAmount(
        address token,
        uint256 ethAmount
    ) external view returns (uint256 tokenAmount, uint256 newPrice) {
        BondingCurve memory curve = bondingCurves[token];
        require(curve.token != address(0), "Curve not found");

        // Get current price based on total supply
        uint256 currentPrice = calculatePrice(curve.totalSupply);
        
        // Calculate approximate tokens for ETH amount
        // This is a simplified calculation - in production, you'd use integral calculus
        tokenAmount = (ethAmount * 1e18) / currentPrice;
        
        // Calculate new price after purchase
        newPrice = calculatePrice(curve.totalSupply + tokenAmount);
        
        // Validate purchase doesn't exceed limits
        require(tokenAmount <= (curve.totalSupply * 200) / 10000, "Exceeds 2% supply limit");
    }

    function calculateSellAmount(
        address token,
        uint256 tokenAmount
    ) external view returns (uint256 ethAmount, uint256 newPrice) {
        BondingCurve memory curve = bondingCurves[token];
        require(curve.token != address(0), "Curve not found");
        require(tokenAmount <= curve.totalSupply, "Insufficient supply");

        // Calculate new supply after sell
        uint256 newSupply = curve.totalSupply - tokenAmount;
        
        // Get prices
        uint256 currentPrice = calculatePrice(curve.totalSupply);
        newPrice = calculatePrice(newSupply);
        
        // Calculate ETH return (average price method)
        uint256 avgPrice = (currentPrice + newPrice) / 2;
        ethAmount = (tokenAmount * avgPrice) / 1e18;
        
        // Ensure we have enough reserves
        require(ethAmount <= curve.realSolReserves, "Insufficient reserves");
    }

    function executeBuy(
        address buyer,
        uint256 ethAmount
    ) external payable onlyTradingEngine returns (uint256 tokenAmount) {
        require(msg.value == ethAmount, "ETH amount mismatch");
        
        BondingCurve storage curve = bondingCurves[msg.sender];
        require(!curve.isGraduated, "Token graduated");

        (tokenAmount,) = this.calculateBuyAmount(msg.sender, ethAmount);
        
        // Update curve state
        curve.realSolReserves += ethAmount;
        curve.totalSupply += tokenAmount;
        curve.lastTradeTime = block.timestamp;

        // Record price point
        uint256 newPrice = calculatePrice(curve.totalSupply);
        priceHistory[msg.sender].push(PricePoint({
            price: newPrice,
            timestamp: block.timestamp,
            volume: ethAmount
        }));

        // Update graduation progress
        uint256 marketCap = _calculateMarketCap(msg.sender);
        graduationProgress[msg.sender] = (marketCap * 100) / GRADUATION_THRESHOLD;

        // Mint tokens to buyer
        // Note: This would typically call the token contract's mint function
        
        emit PriceUpdated(msg.sender, newPrice, marketCap);
    }

    function executeSell(
        address seller,
        uint256 tokenAmount
    ) external onlyTradingEngine returns (uint256 ethAmount) {
        BondingCurve storage curve = bondingCurves[msg.sender];
        require(!curve.isGraduated, "Token graduated");

        (ethAmount,) = this.calculateSellAmount(msg.sender, tokenAmount);
        
        // Update curve state
        curve.realSolReserves -= ethAmount;
        curve.totalSupply -= tokenAmount;
        curve.lastTradeTime = block.timestamp;

        // Record price point
        uint256 newPrice = calculatePrice(curve.totalSupply);
        priceHistory[msg.sender].push(PricePoint({
            price: newPrice,
            timestamp: block.timestamp,
            volume: ethAmount
        }));

        // Update graduation progress
        uint256 marketCap = _calculateMarketCap(msg.sender);
        graduationProgress[msg.sender] = (marketCap * 100) / GRADUATION_THRESHOLD;

        // Burn tokens from seller
        // Note: This would typically call the token contract's burn function
        
        // Transfer ETH to seller
        payable(seller).transfer(ethAmount);
        
        emit PriceUpdated(msg.sender, newPrice, marketCap);
    }

    function executeGraduation(address token) external onlyTradingEngine {
        BondingCurve storage curve = bondingCurves[token];
        require(!curve.isGraduated, "Already graduated");
        
        uint256 marketCap = _calculateMarketCap(token);
        require(marketCap >= GRADUATION_THRESHOLD, "Not eligible for graduation");

        // Mark as graduated
        curve.isGraduated = true;

        // Calculate final price
        uint256 finalPrice = calculatePrice(curve.totalSupply);

        // Migration logic would be implemented here
        // - Migrate liquidity to DEX
        // - Create LP tokens
        // - Distribute rewards

        emit TokenGraduated(token, finalPrice, MIGRATION_TOKENS);
    }

    function _calculateMarketCap(address token) internal view returns (uint256) {
        BondingCurve memory curve = bondingCurves[token];
        uint256 currentPrice = calculatePrice(curve.totalSupply);
        return (curve.totalSupply * currentPrice) / 1e18;
    }

    // View functions
    function getCurrentPrice(address token) external view returns (uint256) {
        BondingCurve memory curve = bondingCurves[token];
        return calculatePrice(curve.totalSupply);
    }

    function getMarketCap(address token) external view returns (uint256) {
        return _calculateMarketCap(token);
    }

    function isGraduated(address token) external view returns (bool) {
        return bondingCurves[token].isGraduated;
    }

    function getBondingCurve(address token) external view returns (BondingCurve memory) {
        return bondingCurves[token];
    }

    function getPriceHistory(address token) external view returns (PricePoint[] memory) {
        return priceHistory[token];
    }

    function getGraduationStatus(address token) external view returns (
        uint256 currentMarketCap,
        uint256 progress,
        bool isEligible
    ) {
        currentMarketCap = _calculateMarketCap(token);
        progress = graduationProgress[token];
        isEligible = currentMarketCap >= GRADUATION_THRESHOLD;
    }

    // TWAP calculation
    function calculateTWAP(address token, uint256 timeWindow) external view returns (uint256) {
        PricePoint[] memory history = priceHistory[token];
        if (history.length < 2) return getCurrentPrice(token);

        uint256 cutoffTime = block.timestamp - timeWindow;
        uint256 weightedSum = 0;
        uint256 totalWeight = 0;

        for (uint256 i = history.length; i > 0; i--) {
            if (history[i-1].timestamp < cutoffTime) break;
            
            uint256 weight = history[i-1].volume;
            weightedSum += history[i-1].price * weight;
            totalWeight += weight;
        }

        return totalWeight > 0 ? weightedSum / totalWeight : getCurrentPrice(token);
    }

    // Admin functions
    function setTradingEngine(address _tradingEngine) external onlyOwner {
        tradingEngine = _tradingEngine;
    }

    function setGraduationManager(address _graduationManager) external onlyOwner {
        graduationManager = _graduationManager;
    }

    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}
}
