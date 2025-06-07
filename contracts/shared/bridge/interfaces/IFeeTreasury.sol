
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IFeeTreasury {
    function recordFee(address token, uint256 amount) external;
    function withdrawFees(address token, uint256 amount) external;
    function getAvailableFees(address token) external view returns (uint256);
}
