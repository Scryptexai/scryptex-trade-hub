
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IBridgeMessageRouter.sol";
import "./interfaces/IFeeTreasury.sol";

contract BridgeCore is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    struct BridgeTx {
        bytes32 txId;
        address token;
        uint256 amount;
        uint256 srcChainId;
        uint256 dstChainId;
        address from;
        address to;
        uint256 timestamp;
        bool executed;
    }

    IBridgeMessageRouter public messageRouter;
    IFeeTreasury public feeTreasury;
    
    mapping(bytes32 => BridgeTx) public bridgeTransactions;
    mapping(address => uint256) public userNonces;
    
    uint256 public bridgeFee; // Basis points (100 = 1%)
    uint256 public constant MAX_FEE = 1000; // 10% max
    uint256 public immutable CURRENT_CHAIN_ID;

    event BridgeInitiated(
        bytes32 indexed txId,
        address indexed token,
        uint256 amount,
        uint256 dstChainId,
        address indexed to,
        address from
    );

    constructor(
        address _messageRouter,
        address _feeTreasury,
        uint256 _bridgeFee
    ) {
        require(_messageRouter != address(0), "Invalid router");
        require(_feeTreasury != address(0), "Invalid treasury");
        require(_bridgeFee <= MAX_FEE, "Fee too high");
        
        messageRouter = IBridgeMessageRouter(_messageRouter);
        feeTreasury = IFeeTreasury(_feeTreasury);
        bridgeFee = _bridgeFee;
        CURRENT_CHAIN_ID = block.chainid;
    }

    function bridgeToken(
        address token,
        uint256 amount,
        uint256 dstChainId,
        address to
    ) external nonReentrant whenNotPaused {
        require(token != address(0), "Invalid token");
        require(amount > 0, "Amount must be > 0");
        require(to != address(0), "Invalid recipient");
        require(dstChainId != CURRENT_CHAIN_ID, "Same chain");

        // Calculate fee
        uint256 fee = (amount * bridgeFee) / 10000;
        uint256 netAmount = amount - fee;
        
        // Transfer tokens from user
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Send fee to treasury
        if (fee > 0) {
            IERC20(token).safeTransfer(address(feeTreasury), fee);
            feeTreasury.recordFee(token, fee);
        }

        // Generate unique transaction ID
        bytes32 txId = keccak256(
            abi.encodePacked(
                msg.sender,
                token,
                netAmount,
                dstChainId,
                to,
                userNonces[msg.sender]++,
                block.timestamp
            )
        );

        // Store transaction
        bridgeTransactions[txId] = BridgeTx({
            txId: txId,
            token: token,
            amount: netAmount,
            srcChainId: CURRENT_CHAIN_ID,
            dstChainId: dstChainId,
            from: msg.sender,
            to: to,
            timestamp: block.timestamp,
            executed: false
        });

        // Prepare payload
        bytes memory payload = abi.encode(
            txId,
            token,
            netAmount,
            CURRENT_CHAIN_ID,
            to,
            msg.sender
        );

        // Send message to destination chain
        messageRouter.sendMessage(dstChainId, payload);

        emit BridgeInitiated(txId, token, netAmount, dstChainId, to, msg.sender);
    }

    function bridgeETH(
        uint256 dstChainId,
        address to
    ) external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Amount must be > 0");
        require(to != address(0), "Invalid recipient");
        require(dstChainId != CURRENT_CHAIN_ID, "Same chain");

        // Calculate fee
        uint256 fee = (msg.value * bridgeFee) / 10000;
        uint256 netAmount = msg.value - fee;
        
        // Send fee to treasury
        if (fee > 0) {
            payable(address(feeTreasury)).transfer(fee);
            feeTreasury.recordFee(address(0), fee); // ETH represented as address(0)
        }

        // Generate unique transaction ID
        bytes32 txId = keccak256(
            abi.encodePacked(
                msg.sender,
                address(0), // ETH
                netAmount,
                dstChainId,
                to,
                userNonces[msg.sender]++,
                block.timestamp
            )
        );

        // Store transaction
        bridgeTransactions[txId] = BridgeTx({
            txId: txId,
            token: address(0), // ETH
            amount: netAmount,
            srcChainId: CURRENT_CHAIN_ID,
            dstChainId: dstChainId,
            from: msg.sender,
            to: to,
            timestamp: block.timestamp,
            executed: false
        });

        // Prepare payload
        bytes memory payload = abi.encode(
            txId,
            address(0), // ETH
            netAmount,
            CURRENT_CHAIN_ID,
            to,
            msg.sender
        );

        // Send message to destination chain
        messageRouter.sendMessage{value: netAmount}(dstChainId, payload);

        emit BridgeInitiated(txId, address(0), netAmount, dstChainId, to, msg.sender);
    }

    function updateBridgeFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= MAX_FEE, "Fee too high");
        bridgeFee = _newFee;
    }

    function updateMessageRouter(address _newRouter) external onlyOwner {
        require(_newRouter != address(0), "Invalid router");
        messageRouter = IBridgeMessageRouter(_newRouter);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    receive() external payable {}
}
