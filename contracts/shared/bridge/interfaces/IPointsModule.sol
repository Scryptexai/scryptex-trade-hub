
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IPointsModule {
    function addPoints(address user, uint256 amount) external;
    function getPoints(address user) external view returns (uint256);
    function claimPoints(uint256 amount) external;
}
