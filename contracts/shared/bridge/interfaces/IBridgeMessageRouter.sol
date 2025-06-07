
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IBridgeMessageRouter {
    function sendMessage(uint256 dstChainId, bytes calldata payload) external payable;
    function receiveMessage(uint256 srcChainId, bytes calldata payload) external;
}
