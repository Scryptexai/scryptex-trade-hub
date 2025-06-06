
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface ITradingContract {
    function createToken(
        address tokenAddress,
        string memory name,
        string memory symbol,
        string memory description,
        string memory logoUrl,
        uint256 initialPrice,
        uint256 priceIncrement,
        uint256 maxSupply
    ) external payable returns (address);
}

contract BondingCurveToken is ERC20, Ownable {
    address public tradingContract;
    address public creator;
    string public description;
    string public logoUrl;
    uint256 public maxSupply;
    uint256 public initialPrice;
    uint256 public priceIncrement;
    
    modifier onlyTradingContract() {
        require(msg.sender == tradingContract, "Only trading contract");
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        string memory _description,
        string memory _logoUrl,
        address _creator,
        uint256 _maxSupply,
        uint256 _initialPrice,
        uint256 _priceIncrement,
        address _tradingContract
    ) ERC20(name, symbol) {
        description = _description;
        logoUrl = _logoUrl;
        creator = _creator;
        maxSupply = _maxSupply;
        initialPrice = _initialPrice;
        priceIncrement = _priceIncrement;
        tradingContract = _tradingContract;
        _transferOwnership(_creator);
    }

    function mint(address to, uint256 amount) external onlyTradingContract {
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyTradingContract {
        _burn(from, amount);
    }

    function updateTradingContract(address newContract) external onlyOwner {
        tradingContract = newContract;
    }
}

contract CreateTokenRiseChain is ReentrancyGuard, Ownable {
    struct TokenParams {
        string name;
        string symbol;
        string description;
        string logoUrl;
        string website;
        string twitter;
        string telegram;
        uint256 initialPrice;
        uint256 priceIncrement;
        uint256 maxSupply;
    }

    struct CreatedToken {
        address tokenAddress;
        address creator;
        string name;
        string symbol;
        uint256 createdAt;
        bool isActive;
    }

    mapping(address => CreatedToken[]) public userTokens;
    mapping(address => CreatedToken) public tokens;
    address[] public allCreatedTokens;

    address public tradingContract;
    uint256 public creationFee = 0.05 ether;
    uint256 public deploymentCost = 0.1 ether;

    event TokenCreated(
        address indexed tokenAddress,
        address indexed creator,
        string name,
        string symbol,
        uint256 initialPrice,
        uint256 maxSupply
    );

    constructor(address _tradingContract) {
        tradingContract = _tradingContract;
    }

    function createToken(
        TokenParams calldata params
    ) external payable nonReentrant returns (address) {
        require(msg.value >= creationFee + deploymentCost, "Insufficient fee");
        require(bytes(params.name).length > 0, "Name required");
        require(bytes(params.symbol).length > 0, "Symbol required");
        require(params.initialPrice > 0, "Invalid initial price");
        require(params.maxSupply > 0, "Invalid max supply");
        require(params.maxSupply <= 1000000000 * 1e18, "Max supply too high");

        // Deploy new bonding curve token
        BondingCurveToken newToken = new BondingCurveToken(
            params.name,
            params.symbol,
            params.description,
            params.logoUrl,
            msg.sender,
            params.maxSupply,
            params.initialPrice,
            params.priceIncrement,
            tradingContract
        );

        address tokenAddress = address(newToken);

        // Register with trading contract
        ITradingContract(tradingContract).createToken{value: deploymentCost}(
            tokenAddress,
            params.name,
            params.symbol,
            params.description,
            params.logoUrl,
            params.initialPrice,
            params.priceIncrement,
            params.maxSupply
        );

        // Store token info
        CreatedToken memory createdToken = CreatedToken({
            tokenAddress: tokenAddress,
            creator: msg.sender,
            name: params.name,
            symbol: params.symbol,
            createdAt: block.timestamp,
            isActive: true
        });

        tokens[tokenAddress] = createdToken;
        userTokens[msg.sender].push(createdToken);
        allCreatedTokens.push(tokenAddress);

        emit TokenCreated(
            tokenAddress,
            msg.sender,
            params.name,
            params.symbol,
            params.initialPrice,
            params.maxSupply
        );

        return tokenAddress;
    }

    function getUserTokens(address user) external view returns (CreatedToken[] memory) {
        return userTokens[user];
    }

    function getAllCreatedTokens() external view returns (address[] memory) {
        return allCreatedTokens;
    }

    function getTokenInfo(address tokenAddress) external view returns (CreatedToken memory) {
        return tokens[tokenAddress];
    }

    function updateCreationFee(uint256 newFee) external onlyOwner {
        creationFee = newFee;
    }

    function updateDeploymentCost(uint256 newCost) external onlyOwner {
        deploymentCost = newCost;
    }

    function updateTradingContract(address newContract) external onlyOwner {
        tradingContract = newContract;
    }

    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function calculateCreationCost() external view returns (uint256) {
        return creationFee + deploymentCost;
    }
}
