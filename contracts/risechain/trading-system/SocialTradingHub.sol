
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SocialTradingHub is ReentrancyGuard, Ownable {
    struct TradeComment {
        address trader;
        address token;
        string comment;
        uint256 timestamp;
        uint256 likes;
        bool isVisible;
    }

    struct TraderProfile {
        address trader;
        string username;
        string bio;
        uint256 reputation;
        uint256 totalTrades;
        uint256 successfulTrades;
        uint256 totalVolume;
        bool isVerified;
        uint256 joinedAt;
    }

    struct SocialMetrics {
        uint256 totalComments;
        uint256 totalLikes;
        uint256 communityScore;
        uint256 lastActivity;
    }

    mapping(address => TraderProfile) public traderProfiles;
    mapping(address => SocialMetrics) public tokenSocialMetrics;
    mapping(uint256 => TradeComment) public tradeComments;
    mapping(uint256 => mapping(address => bool)) public commentLikes;
    mapping(address => uint256[]) public traderComments;
    mapping(address => uint256[]) public tokenComments;

    uint256 public nextCommentId = 1;
    uint256 public constant REPUTATION_THRESHOLD = 1000;
    uint256 public constant VERIFICATION_THRESHOLD = 5000;

    address public tradingEngine;

    event ProfileCreated(address indexed trader, string username);
    event CommentPosted(uint256 indexed commentId, address indexed trader, address indexed token);
    event CommentLiked(uint256 indexed commentId, address indexed liker);
    event ReputationUpdated(address indexed trader, uint256 newReputation);
    event TraderVerified(address indexed trader);

    modifier onlyTradingEngine() {
        require(msg.sender == tradingEngine, "Only trading engine");
        _;
    }

    modifier validTrader(address trader) {
        require(traderProfiles[trader].trader != address(0), "Trader not registered");
        _;
    }

    constructor(address _tradingEngine) {
        tradingEngine = _tradingEngine;
    }

    function createProfile(string calldata username, string calldata bio) external {
        require(traderProfiles[msg.sender].trader == address(0), "Profile already exists");
        require(bytes(username).length > 0 && bytes(username).length <= 50, "Invalid username");

        traderProfiles[msg.sender] = TraderProfile({
            trader: msg.sender,
            username: username,
            bio: bio,
            reputation: 100, // Starting reputation
            totalTrades: 0,
            successfulTrades: 0,
            totalVolume: 0,
            isVerified: false,
            joinedAt: block.timestamp
        });

        emit ProfileCreated(msg.sender, username);
    }

    function postTradeComment(
        address token,
        string calldata comment,
        uint256 tradeAmount,
        bool isSuccessful
    ) external nonReentrant validTrader(msg.sender) {
        require(bytes(comment).length > 0 && bytes(comment).length <= 500, "Invalid comment");

        uint256 commentId = nextCommentId++;
        
        tradeComments[commentId] = TradeComment({
            trader: msg.sender,
            token: token,
            comment: comment,
            timestamp: block.timestamp,
            likes: 0,
            isVisible: true
        });

        traderComments[msg.sender].push(commentId);
        tokenComments[token].push(commentId);

        // Update social metrics
        tokenSocialMetrics[token].totalComments++;
        tokenSocialMetrics[token].lastActivity = block.timestamp;

        // Update trader stats
        TraderProfile storage profile = traderProfiles[msg.sender];
        profile.totalTrades++;
        profile.totalVolume += tradeAmount;
        
        if (isSuccessful) {
            profile.successfulTrades++;
        }

        // Update reputation
        _updateReputation(msg.sender, tradeAmount, isSuccessful);

        emit CommentPosted(commentId, msg.sender, token);
    }

    function likeComment(uint256 commentId) external validTrader(msg.sender) {
        require(tradeComments[commentId].trader != address(0), "Comment not found");
        require(!commentLikes[commentId][msg.sender], "Already liked");
        require(tradeComments[commentId].isVisible, "Comment not visible");

        commentLikes[commentId][msg.sender] = true;
        tradeComments[commentId].likes++;

        // Update token social metrics
        address token = tradeComments[commentId].token;
        tokenSocialMetrics[token].totalLikes++;
        tokenSocialMetrics[token].communityScore = _calculateCommunityScore(token);

        // Reward comment author with reputation
        address commentAuthor = tradeComments[commentId].trader;
        traderProfiles[commentAuthor].reputation += 5;

        emit CommentLiked(commentId, msg.sender);
    }

    function _updateReputation(address trader, uint256 tradeAmount, bool isSuccessful) internal {
        TraderProfile storage profile = traderProfiles[trader];
        
        uint256 volumeBonus = tradeAmount / 1e18; // 1 point per ETH
        uint256 successBonus = isSuccessful ? 10 : 0;
        
        profile.reputation += volumeBonus + successBonus;

        // Check for verification eligibility
        if (!profile.isVerified && profile.reputation >= VERIFICATION_THRESHOLD) {
            profile.isVerified = true;
            emit TraderVerified(trader);
        }

        emit ReputationUpdated(trader, profile.reputation);
    }

    function _calculateCommunityScore(address token) internal view returns (uint256) {
        SocialMetrics memory metrics = tokenSocialMetrics[token];
        
        if (metrics.totalComments == 0) return 0;
        
        uint256 engagementRatio = (metrics.totalLikes * 100) / metrics.totalComments;
        uint256 timeDecay = _calculateTimeDecay(metrics.lastActivity);
        
        return (engagementRatio * timeDecay) / 100;
    }

    function _calculateTimeDecay(uint256 lastActivity) internal view returns (uint256) {
        uint256 timeSinceActivity = block.timestamp - lastActivity;
        
        if (timeSinceActivity > 7 days) return 50; // 50% after a week
        if (timeSinceActivity > 1 days) return 80; // 80% after a day
        
        return 100; // Full score for recent activity
    }

    // View functions
    function getTraderProfile(address trader) external view returns (TraderProfile memory) {
        return traderProfiles[trader];
    }

    function getTokenSocialMetrics(address token) external view returns (SocialMetrics memory) {
        return tokenSocialMetrics[token];
    }

    function getTraderComments(address trader) external view returns (uint256[] memory) {
        return traderComments[trader];
    }

    function getTokenComments(address token) external view returns (uint256[] memory) {
        return tokenComments[token];
    }

    function calculateTraderRank(address trader) external view returns (uint256) {
        TraderProfile memory profile = traderProfiles[trader];
        if (profile.trader == address(0)) return 0;

        uint256 reputationScore = profile.reputation * 40 / 100;
        uint256 volumeScore = (profile.totalVolume / 1e18) * 30 / 100;
        uint256 successRateScore = profile.totalTrades > 0 ? 
            (profile.successfulTrades * 100 / profile.totalTrades) * 30 / 100 : 0;

        return reputationScore + volumeScore + successRateScore;
    }

    // Admin functions
    function setTradingEngine(address _tradingEngine) external onlyOwner {
        tradingEngine = _tradingEngine;
    }

    function moderateComment(uint256 commentId, bool isVisible) external onlyOwner {
        require(tradeComments[commentId].trader != address(0), "Comment not found");
        tradeComments[commentId].isVisible = isVisible;
    }

    function updateProfile(string calldata bio) external validTrader(msg.sender) {
        require(bytes(bio).length <= 200, "Bio too long");
        traderProfiles[msg.sender].bio = bio;
    }
}
