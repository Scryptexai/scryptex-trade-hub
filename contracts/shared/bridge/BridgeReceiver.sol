
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IBridgeMessageRouter.sol";
import "./interfaces/IPointsModule.sol";

contract BridgeReceiver is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    struct BridgeTx {
        bytes32 txId;
        address token;
        uint256 amount;
        uint256 srcChainId;
        address to;
        address from;
        bool executed;
        uint256 timestamp;
    }

    IBridgeMessageRouter public messageRouter;
    IPointsModule public pointsModule;
    
    mapping(bytes32 => bool) public executedTransactions;
    mapping(uint256 => address) public trustedSenders; // chainId => BridgeCore address
    
    uint256 public constant BRIDGE_POINTS_REWARD = 20;

    event BridgeExecuted(
        bytes32 indexed txId,
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 srcChainId
    );

    event TrustedSenderUpdated(uint256 indexed chainId, address sender);

    constructor(
        address _messageRouter,
        address _pointsModule
    ) {
        require(_messageRouter != address(0), "Invalid router");
        require(_pointsModule != address(0), "Invalid points module");
        
        messageRouter = IBridgeMessageRouter(_messageRouter);
        pointsModule = IPointsModule(_pointsModule);
    }

    function receiveMessage(
        uint256 srcChainId,
        bytes calldata payload
    ) external nonReentrant whenNotPaused {
        require(msg.sender == address(messageRouter), "Only router");
        require(trustedSenders[srcChainId] != address(0), "Untrusted sender");

        // Decode payload
        (
            bytes32 txId,
            address token,
            uint256 amount,
            uint256 _srcChainId,
            address to,
            address from
        ) = abi.decode(payload, (bytes32, address, uint256, uint256, address, address));

        require(srcChainId == _srcChainId, "Chain ID mismatch");
        require(!executedTransactions[txId], "Already executed");
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");

        // Mark as executed
        executedTransactions[txId] = true;

        // Transfer tokens or ETH to user
        if (token == address(0)) {
            // ETH transfer
            require(address(this).balance >= amount, "Insufficient ETH");
            payable(to).transfer(amount);
        } else {
            // Token transfer
            require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient tokens");
            IERC20(token).safeTransfer(to, amount);
        }

        // Award STEX points
        pointsModule.addPoints(to, BRIDGE_POINTS_REWARD);

        emit BridgeExecuted(txId, to, token, amount, srcChainId);
    }

    function addTrustedSender(uint256 chainId, address sender) external onlyOwner {
        require(sender != address(0), "Invalid sender");
        trustedSenders[chainId] = sender;
        emit TrustedSenderUpdated(chainId, sender);
    }

    function removeTrustedSender(uint256 chainId) external onlyOwner {
        delete trustedSenders[chainId];
        emit TrustedSenderUpdated(chainId, address(0));
    }

    function updatePointsModule(address _newPointsModule) external onlyOwner {
        require(_newPointsModule != address(0), "Invalid points module");
        pointsModule = IPointsModule(_newPointsModule);
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    receive() external payable {}
}
