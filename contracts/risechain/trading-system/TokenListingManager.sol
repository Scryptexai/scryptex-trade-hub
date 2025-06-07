
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenListingManager is ReentrancyGuard, Ownable {
    struct ListingRequest {
        address token;
        address creator;
        string name;
        string symbol;
        string description;
        string website;
        string twitter;
        string telegram;
        uint256 initialSupply;
        uint256 maxSupply;
        uint256 requestTime;
        uint256 approvalTime;
        ListingStatus status;
        uint256 listingFee;
        bool isPaid;
    }

    struct TokenMetadata {
        string logoUrl;
        string description;
        string website;
        string twitter;
        string telegram;
        uint256 category;
        bool isVerified;
        uint256 verificationTime;
        uint256 socialScore;
    }

    enum ListingStatus {
        Pending,
        Approved,
        Rejected,
        Active,
        Suspended
    }

    mapping(address => ListingRequest) public listingRequests;
    mapping(address => TokenMetadata) public tokenMetadata;
    mapping(address => bool) public isListed;
    mapping(address => uint256) public creatorTokenCount;
    mapping(uint256 => address[]) public tokensByCategory;

    address[] public pendingTokens;
    address[] public listedTokens;
    
    uint256 public listingFee = 0.1 ether;
    uint256 public constant MAX_TOKENS_PER_CREATOR = 5;
    
    address public tradingEngine;
    address public bondingCurveIntegrator;

    event ListingRequested(address indexed token, address indexed creator);
    event ListingApproved(address indexed token, uint256 timestamp);
    event ListingRejected(address indexed token, string reason);
    event TokenSuspended(address indexed token, string reason);
    event MetadataUpdated(address indexed token);

    modifier onlyTradingEngine() {
        require(msg.sender == tradingEngine, "Only trading engine");
        _;
    }

    modifier validToken(address token) {
        require(token != address(0), "Invalid token address");
        require(isListed[token], "Token not listed");
        _;
    }

    constructor(address _tradingEngine, address _bondingCurveIntegrator) {
        tradingEngine = _tradingEngine;
        bondingCurveIntegrator = _bondingCurveIntegrator;
    }

    function requestListing(
        address token,
        string calldata name,
        string calldata symbol,
        string calldata description,
        string calldata website,
        string calldata twitter,
        string calldata telegram,
        uint256 initialSupply,
        uint256 maxSupply,
        uint256 category
    ) external payable nonReentrant {
        require(msg.value >= listingFee, "Insufficient listing fee");
        require(token != address(0), "Invalid token address");
        require(listingRequests[token].token == address(0), "Already requested");
        require(creatorTokenCount[msg.sender] < MAX_TOKENS_PER_CREATOR, "Creator limit exceeded");
        require(bytes(name).length > 0 && bytes(symbol).length > 0, "Invalid token details");

        listingRequests[token] = ListingRequest({
            token: token,
            creator: msg.sender,
            name: name,
            symbol: symbol,
            description: description,
            website: website,
            twitter: twitter,
            telegram: telegram,
            initialSupply: initialSupply,
            maxSupply: maxSupply,
            requestTime: block.timestamp,
            approvalTime: 0,
            status: ListingStatus.Pending,
            listingFee: msg.value,
            isPaid: true
        });

        tokenMetadata[token] = TokenMetadata({
            logoUrl: "",
            description: description,
            website: website,
            twitter: twitter,
            telegram: telegram,
            category: category,
            isVerified: false,
            verificationTime: 0,
            socialScore: 0
        });

        pendingTokens.push(token);
        creatorTokenCount[msg.sender]++;

        emit ListingRequested(token, msg.sender);
    }

    function approveListing(address token) external onlyOwner {
        ListingRequest storage request = listingRequests[token];
        require(request.status == ListingStatus.Pending, "Invalid status");

        request.status = ListingStatus.Approved;
        request.approvalTime = block.timestamp;
        
        isListed[token] = true;
        listedTokens.push(token);
        tokensByCategory[tokenMetadata[token].category].push(token);

        // Remove from pending
        _removeFromPending(token);

        // Initialize token in trading engine
        // This would typically call the trading engine to register the token
        
        emit ListingApproved(token, block.timestamp);
    }

    function rejectListing(address token, string calldata reason) external onlyOwner {
        ListingRequest storage request = listingRequests[token];
        require(request.status == ListingStatus.Pending, "Invalid status");

        request.status = ListingStatus.Rejected;
        
        // Refund listing fee
        if (request.isPaid && request.listingFee > 0) {
            payable(request.creator).transfer(request.listingFee);
        }

        // Remove from pending
        _removeFromPending(token);
        creatorTokenCount[request.creator]--;

        emit ListingRejected(token, reason);
    }

    function suspendToken(address token, string calldata reason) external onlyOwner validToken(token) {
        listingRequests[token].status = ListingStatus.Suspended;
        isListed[token] = false;

        emit TokenSuspended(token, reason);
    }

    function verifyToken(address token) external onlyOwner validToken(token) {
        TokenMetadata storage metadata = tokenMetadata[token];
        metadata.isVerified = true;
        metadata.verificationTime = block.timestamp;

        emit MetadataUpdated(token);
    }

    function updateTokenMetadata(
        address token,
        string calldata logoUrl,
        string calldata description,
        string calldata website,
        string calldata twitter,
        string calldata telegram
    ) external {
        require(listingRequests[token].creator == msg.sender, "Not token creator");
        
        TokenMetadata storage metadata = tokenMetadata[token];
        metadata.logoUrl = logoUrl;
        metadata.description = description;
        metadata.website = website;
        metadata.twitter = twitter;
        metadata.telegram = telegram;

        emit MetadataUpdated(token);
    }

    function updateSocialScore(address token, uint256 score) external onlyTradingEngine {
        tokenMetadata[token].socialScore = score;
    }

    function _removeFromPending(address token) internal {
        for (uint256 i = 0; i < pendingTokens.length; i++) {
            if (pendingTokens[i] == token) {
                pendingTokens[i] = pendingTokens[pendingTokens.length - 1];
                pendingTokens.pop();
                break;
            }
        }
    }

    // View functions
    function getListingRequest(address token) external view returns (ListingRequest memory) {
        return listingRequests[token];
    }

    function getTokenMetadata(address token) external view returns (TokenMetadata memory) {
        return tokenMetadata[token];
    }

    function getPendingTokens() external view returns (address[] memory) {
        return pendingTokens;
    }

    function getListedTokens() external view returns (address[] memory) {
        return listedTokens;
    }

    function getTokensByCategory(uint256 category) external view returns (address[] memory) {
        return tokensByCategory[category];
    }

    function isTokenListed(address token) external view returns (bool) {
        return isListed[token] && listingRequests[token].status == ListingStatus.Approved;
    }

    // Admin functions
    function setListingFee(uint256 _listingFee) external onlyOwner {
        listingFee = _listingFee;
    }

    function setTradingEngine(address _tradingEngine) external onlyOwner {
        tradingEngine = _tradingEngine;
    }

    function setBondingCurveIntegrator(address _bondingCurveIntegrator) external onlyOwner {
        bondingCurveIntegrator = _bondingCurveIntegrator;
    }

    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}
}
