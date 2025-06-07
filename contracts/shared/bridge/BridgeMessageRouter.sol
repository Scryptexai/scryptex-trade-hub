
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IBridgeMessageRouter.sol";

contract BridgeMessageRouter is IBridgeMessageRouter, Ownable, ReentrancyGuard {
    mapping(uint256 => address) public remoteBridgeContracts;
    mapping(address => bool) public authorizedCallers;
    
    address public bridgeReceiver;

    event MessageSent(uint256 indexed dstChainId, bytes payload, address indexed sender);
    event MessageReceived(uint256 indexed srcChainId, bytes payload);
    event RemoteBridgeUpdated(uint256 indexed chainId, address remoteBridge);
    event AuthorizedCallerUpdated(address indexed caller, bool authorized);

    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender], "Not authorized");
        _;
    }

    constructor(address _bridgeReceiver) {
        require(_bridgeReceiver != address(0), "Invalid receiver");
        bridgeReceiver = _bridgeReceiver;
    }

    function sendMessage(
        uint256 dstChainId,
        bytes calldata payload
    ) external payable override onlyAuthorized nonReentrant {
        require(remoteBridgeContracts[dstChainId] != address(0), "No remote bridge");
        
        // In a real implementation, this would integrate with LayerZero, Axelar, CCIP, etc.
        // For demo purposes, we emit an event that would be picked up by relayers
        emit MessageSent(dstChainId, payload, msg.sender);
        
        // Store the message for potential relay
        _storeMessageForRelay(dstChainId, payload);
    }

    function receiveMessage(
        uint256 srcChainId,
        bytes calldata payload
    ) external override {
        require(remoteBridgeContracts[srcChainId] != address(0), "Unknown source chain");
        
        // Validate message came from trusted source
        // In production, this would verify LayerZero/Axelar/CCIP message authenticity
        
        emit MessageReceived(srcChainId, payload);
        
        // Forward to bridge receiver
        (bool success, ) = bridgeReceiver.call(
            abi.encodeWithSignature("receiveMessage(uint256,bytes)", srcChainId, payload)
        );
        require(success, "Receiver call failed");
    }

    function setRemoteBridge(uint256 chainId, address remoteBridge) external onlyOwner {
        remoteBridgeContracts[chainId] = remoteBridge;
        emit RemoteBridgeUpdated(chainId, remoteBridge);
    }

    function setAuthorizedCaller(address caller, bool authorized) external onlyOwner {
        authorizedCallers[caller] = authorized;
        emit AuthorizedCallerUpdated(caller, authorized);
    }

    function updateBridgeReceiver(address _newReceiver) external onlyOwner {
        require(_newReceiver != address(0), "Invalid receiver");
        bridgeReceiver = _newReceiver;
    }

    function _storeMessageForRelay(uint256 dstChainId, bytes calldata payload) internal {
        // Store message hash and details for relay verification
        // This would integrate with actual cross-chain messaging protocols
    }

    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}
}
