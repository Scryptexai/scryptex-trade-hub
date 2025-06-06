
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface IBondingCurveToken {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
}

contract TradingRiseChain is ReentrancyGuard, Ownable, Pausable {
    struct Token {
        address tokenAddress;
        address creator;
        string name;
        string symbol;
        string description;
        string logoUrl;
        uint256 totalSupply;
        uint256 marketCap;
        uint256 currentPrice;
        uint256 initialPrice;
        uint256 priceIncrement;
        uint256 volumeTraded;
        uint256 createdAt;
        bool isActive;
        bool isListed;
    }

    struct Trade {
        bytes32 id;
        address trader;
        address token;
        bool isBuy;
        uint256 amount;
        uint256 price;
        uint256 totalCost;
        uint256 timestamp;
    }

    struct BondingCurve {
        uint256 k; // Curve constant
        uint256 supply;
        uint256 reserveBalance;
        uint256 reserveRatio; // 0-1000000 (1000000 = 100%)
        uint256 maxSupply;
        uint256 targetPrice;
    }

    mapping(address => Token) public tokens;
    mapping(address => BondingCurve) public bondingCurves;
    mapping(bytes32 => Trade) public trades;
    mapping(address => mapping(address => uint256)) public userBalances;
    mapping(address => uint256) public userPoints;
    mapping(address => bool) public listedTokens;

    address[] public allTokens;
    address[] public newTokens;
    address[] public trendingTokens;
    bytes32[] public allTrades;

    uint256 public tradingFee = 30; // 0.3%
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant POINTS_PER_TRADE = 50;
    uint256 public constant LISTING_THRESHOLD = 1000000 * 1e18; // 1M market cap
    uint256 public listingFee = 0.1 ether;

    event TokenCreated(address indexed tokenAddress, address indexed creator, string name, string symbol);
    event TokenTraded(address indexed token, address indexed trader, bool isBuy, uint256 amount, uint256 price);
    event TokenListed(address indexed token, uint256 marketCap);
    event PointsEarned(address indexed user, uint256 points, uint256 totalPoints);
    event BondingCurveUpdated(address indexed token, uint256 newPrice, uint256 supply);

    constructor() {}

    function createToken(
        address tokenAddress,
        string memory name,
        string memory symbol,
        string memory description,
        string memory logoUrl,
        uint256 initialPrice,
        uint256 priceIncrement,
        uint256 maxSupply
    ) external payable nonReentrant whenNotPaused returns (address) {
        require(msg.value >= listingFee, "Insufficient listing fee");
        require(initialPrice > 0, "Invalid initial price");
        require(maxSupply > 0, "Invalid max supply");
        require(tokens[tokenAddress].tokenAddress == address(0), "Token already exists");

        tokens[tokenAddress] = Token({
            tokenAddress: tokenAddress,
            creator: msg.sender,
            name: name,
            symbol: symbol,
            description: description,
            logoUrl: logoUrl,
            totalSupply: 0,
            marketCap: 0,
            currentPrice: initialPrice,
            initialPrice: initialPrice,
            priceIncrement: priceIncrement,
            volumeTraded: 0,
            createdAt: block.timestamp,
            isActive: true,
            isListed: false
        });

        // Initialize bonding curve
        bondingCurves[tokenAddress] = BondingCurve({
            k: initialPrice * 1e18,
            supply: 0,
            reserveBalance: 0,
            reserveRatio: 500000, // 50%
            maxSupply: maxSupply,
            targetPrice: initialPrice * 10 // 10x price target for listing
        });

        allTokens.push(tokenAddress);
        newTokens.push(tokenAddress);

        emit TokenCreated(tokenAddress, msg.sender, name, symbol);
        return tokenAddress;
    }

    function buyTokens(address tokenAddress, uint256 minTokensOut) external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Invalid ETH amount");
        require(tokens[tokenAddress].isActive, "Token not active");

        Token storage token = tokens[tokenAddress];
        BondingCurve storage curve = bondingCurves[tokenAddress];

        uint256 fee = (msg.value * tradingFee) / FEE_DENOMINATOR;
        uint256 ethAfterFee = msg.value - fee;

        // Calculate tokens to mint using bonding curve
        uint256 tokensToMint = _calculatePurchaseReturn(tokenAddress, ethAfterFee);
        require(tokensToMint >= minTokensOut, "Slippage too high");
        require(curve.supply + tokensToMint <= curve.maxSupply, "Exceeds max supply");

        // Update bonding curve
        curve.supply += tokensToMint;
        curve.reserveBalance += ethAfterFee;
        token.currentPrice = _calculatePrice(tokenAddress);
        token.totalSupply += tokensToMint;
        token.marketCap = (token.totalSupply * token.currentPrice) / 1e18;
        token.volumeTraded += msg.value;

        // Mint tokens
        IBondingCurveToken(tokenAddress).mint(msg.sender, tokensToMint);

        // Record trade
        bytes32 tradeId = keccak256(abi.encodePacked(
            msg.sender, tokenAddress, true, tokensToMint, block.timestamp
        ));

        trades[tradeId] = Trade({
            id: tradeId,
            trader: msg.sender,
            token: tokenAddress,
            isBuy: true,
            amount: tokensToMint,
            price: token.currentPrice,
            totalCost: msg.value,
            timestamp: block.timestamp
        });

        allTrades.push(tradeId);

        // Award points
        uint256 points = (msg.value * POINTS_PER_TRADE) / 1e18;
        userPoints[msg.sender] += points;

        // Check if token should be listed
        if (!token.isListed && token.marketCap >= LISTING_THRESHOLD) {
            _listToken(tokenAddress);
        }

        // Update trending if volume is high
        _updateTrending(tokenAddress);

        emit TokenTraded(tokenAddress, msg.sender, true, tokensToMint, token.currentPrice);
        emit PointsEarned(msg.sender, points, userPoints[msg.sender]);
        emit BondingCurveUpdated(tokenAddress, token.currentPrice, curve.supply);
    }

    function sellTokens(address tokenAddress, uint256 tokenAmount, uint256 minEthOut) external nonReentrant whenNotPaused {
        require(tokenAmount > 0, "Invalid token amount");
        require(tokens[tokenAddress].isActive, "Token not active");
        require(IERC20(tokenAddress).balanceOf(msg.sender) >= tokenAmount, "Insufficient balance");

        Token storage token = tokens[tokenAddress];
        BondingCurve storage curve = bondingCurves[tokenAddress];

        // Calculate ETH to return using bonding curve
        uint256 ethToReturn = _calculateSaleReturn(tokenAddress, tokenAmount);
        uint256 fee = (ethToReturn * tradingFee) / FEE_DENOMINATOR;
        uint256 ethAfterFee = ethToReturn - fee;

        require(ethAfterFee >= minEthOut, "Slippage too high");
        require(ethAfterFee <= address(this).balance, "Insufficient contract balance");

        // Update bonding curve
        curve.supply -= tokenAmount;
        curve.reserveBalance -= ethToReturn;
        token.currentPrice = _calculatePrice(tokenAddress);
        token.totalSupply -= tokenAmount;
        token.marketCap = (token.totalSupply * token.currentPrice) / 1e18;
        token.volumeTraded += ethToReturn;

        // Burn tokens
        IBondingCurveToken(tokenAddress).burn(msg.sender, tokenAmount);

        // Record trade
        bytes32 tradeId = keccak256(abi.encodePacked(
            msg.sender, tokenAddress, false, tokenAmount, block.timestamp
        ));

        trades[tradeId] = Trade({
            id: tradeId,
            trader: msg.sender,
            token: tokenAddress,
            isBuy: false,
            amount: tokenAmount,
            price: token.currentPrice,
            totalCost: ethToReturn,
            timestamp: block.timestamp
        });

        allTrades.push(tradeId);

        // Transfer ETH
        payable(msg.sender).transfer(ethAfterFee);

        // Award points
        uint256 points = (ethToReturn * POINTS_PER_TRADE) / 1e18;
        userPoints[msg.sender] += points;

        emit TokenTraded(tokenAddress, msg.sender, false, tokenAmount, token.currentPrice);
        emit PointsEarned(msg.sender, points, userPoints[msg.sender]);
        emit BondingCurveUpdated(tokenAddress, token.currentPrice, curve.supply);
    }

    function _calculatePurchaseReturn(address tokenAddress, uint256 ethAmount) internal view returns (uint256) {
        BondingCurve memory curve = bondingCurves[tokenAddress];
        if (curve.supply == 0) {
            return (ethAmount * 1e18) / tokens[tokenAddress].initialPrice;
        }
        
        // Simplified bonding curve: price = initialPrice * (1 + supply/maxSupply)
        uint256 currentPrice = tokens[tokenAddress].initialPrice * (1e18 + (curve.supply * 1e18) / curve.maxSupply) / 1e18;
        return (ethAmount * 1e18) / currentPrice;
    }

    function _calculateSaleReturn(address tokenAddress, uint256 tokenAmount) internal view returns (uint256) {
        Token memory token = tokens[tokenAddress];
        BondingCurve memory curve = bondingCurves[tokenAddress];
        
        uint256 avgPrice = (token.currentPrice + token.initialPrice) / 2;
        return (tokenAmount * avgPrice) / 1e18;
    }

    function _calculatePrice(address tokenAddress) internal view returns (uint256) {
        Token memory token = tokens[tokenAddress];
        BondingCurve memory curve = bondingCurves[tokenAddress];
        
        if (curve.supply == 0) return token.initialPrice;
        
        // Price increases with supply using bonding curve
        return token.initialPrice * (1e18 + (curve.supply * 1e18) / curve.maxSupply) / 1e18;
    }

    function _listToken(address tokenAddress) internal {
        tokens[tokenAddress].isListed = true;
        listedTokens[tokenAddress] = true;
        
        // Remove from new tokens, add to trending
        _removeFromNewTokens(tokenAddress);
        if (trendingTokens.length < 10) {
            trendingTokens.push(tokenAddress);
        }

        emit TokenListed(tokenAddress, tokens[tokenAddress].marketCap);
    }

    function _updateTrending(address tokenAddress) internal {
        // Simple trending logic based on recent volume
        uint256 recentVolume = tokens[tokenAddress].volumeTraded;
        if (recentVolume > 10 ether && !_isInTrending(tokenAddress)) {
            if (trendingTokens.length >= 10) {
                // Replace least trending
                trendingTokens[0] = tokenAddress;
            } else {
                trendingTokens.push(tokenAddress);
            }
        }
    }

    function _isInTrending(address tokenAddress) internal view returns (bool) {
        for (uint i = 0; i < trendingTokens.length; i++) {
            if (trendingTokens[i] == tokenAddress) return true;
        }
        return false;
    }

    function _removeFromNewTokens(address tokenAddress) internal {
        for (uint i = 0; i < newTokens.length; i++) {
            if (newTokens[i] == tokenAddress) {
                newTokens[i] = newTokens[newTokens.length - 1];
                newTokens.pop();
                break;
            }
        }
    }

    // View functions
    function getTokenInfo(address tokenAddress) external view returns (Token memory) {
        return tokens[tokenAddress];
    }

    function getBondingCurveInfo(address tokenAddress) external view returns (BondingCurve memory) {
        return bondingCurves[tokenAddress];
    }

    function getNewTokens() external view returns (address[] memory) {
        return newTokens;
    }

    function getTrendingTokens() external view returns (address[] memory) {
        return trendingTokens;
    }

    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }

    function getUserPoints(address user) external view returns (uint256) {
        return userPoints[user];
    }

    function calculatePurchaseReturn(address tokenAddress, uint256 ethAmount) external view returns (uint256) {
        return _calculatePurchaseReturn(tokenAddress, ethAmount);
    }

    function calculateSaleReturn(address tokenAddress, uint256 tokenAmount) external view returns (uint256) {
        return _calculateSaleReturn(tokenAddress, tokenAmount);
    }

    // Admin functions
    function updateTradingFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high");
        tradingFee = newFee;
    }

    function updateListingFee(uint256 newFee) external onlyOwner {
        listingFee = newFee;
    }

    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    receive() external payable {}
}
