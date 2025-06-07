
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PointsModule is Ownable, ReentrancyGuard {
    mapping(address => uint256) public points;
    mapping(address => bool) public authorizedCallers;
    mapping(address => uint256) public totalPointsEarned;
    mapping(address => uint256) public lastActivityTimestamp;
    
    uint256 public totalPointsDistributed;
    
    struct UserStats {
        uint256 currentPoints;
        uint256 totalEarned;
        uint256 lastActivity;
        uint256 rank;
    }

    event PointsAwarded(address indexed user, uint256 amount, string reason);
    event PointsClaimed(address indexed user, uint256 amount);
    event AuthorizedCallerUpdated(address indexed caller, bool authorized);
    event PointsTransferred(address indexed from, address indexed to, uint256 amount);

    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor() {}

    function addPoints(address user, uint256 amount) external onlyAuthorized {
        require(user != address(0), "Invalid user");
        require(amount > 0, "Invalid amount");
        
        points[user] += amount;
        totalPointsEarned[user] += amount;
        totalPointsDistributed += amount;
        lastActivityTimestamp[user] = block.timestamp;
        
        emit PointsAwarded(user, amount, "Bridge transaction");
    }

    function addPointsWithReason(
        address user, 
        uint256 amount, 
        string calldata reason
    ) external onlyAuthorized {
        require(user != address(0), "Invalid user");
        require(amount > 0, "Invalid amount");
        
        points[user] += amount;
        totalPointsEarned[user] += amount;
        totalPointsDistributed += amount;
        lastActivityTimestamp[user] = block.timestamp;
        
        emit PointsAwarded(user, amount, reason);
    }

    function claimPoints(uint256 amount) external nonReentrant {
        require(amount > 0, "Invalid amount");
        require(points[msg.sender] >= amount, "Insufficient points");
        
        points[msg.sender] -= amount;
        
        // In a real implementation, this might mint reward tokens or NFTs
        // For now, we just emit an event
        emit PointsClaimed(msg.sender, amount);
    }

    function transferPoints(address to, uint256 amount) external {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        require(points[msg.sender] >= amount, "Insufficient points");
        require(to != msg.sender, "Cannot transfer to self");
        
        points[msg.sender] -= amount;
        points[to] += amount;
        lastActivityTimestamp[to] = block.timestamp;
        
        emit PointsTransferred(msg.sender, to, amount);
    }

    function getPoints(address user) external view returns (uint256) {
        return points[user];
    }

    function getUserStats(address user) external view returns (UserStats memory) {
        return UserStats({
            currentPoints: points[user],
            totalEarned: totalPointsEarned[user],
            lastActivity: lastActivityTimestamp[user],
            rank: getUserRank(user)
        });
    }

    function getUserRank(address user) public view returns (uint256) {
        uint256 userScore = totalPointsEarned[user];
        uint256 rank = 1;
        
        // This is a simple ranking system - in production, you'd want to optimize this
        // Consider using a more efficient ranking system for large user bases
        
        return rank;
    }

    function getLeaderboard(uint256 limit) external view returns (
        address[] memory users,
        uint256[] memory scores
    ) {
        // Return top users by total points earned
        // This is a simplified implementation
        users = new address[](limit);
        scores = new uint256[](limit);
        
        // In production, maintain a sorted leaderboard
        return (users, scores);
    }

    function setAuthorizedCaller(address caller, bool authorized) external onlyOwner {
        require(caller != address(0), "Invalid caller");
        authorizedCallers[caller] = authorized;
        emit AuthorizedCallerUpdated(caller, authorized);
    }

    function batchAddPoints(
        address[] calldata users,
        uint256[] calldata amounts,
        string calldata reason
    ) external onlyAuthorized {
        require(users.length == amounts.length, "Length mismatch");
        
        for (uint256 i = 0; i < users.length; i++) {
            if (users[i] != address(0) && amounts[i] > 0) {
                points[users[i]] += amounts[i];
                totalPointsEarned[users[i]] += amounts[i];
                totalPointsDistributed += amounts[i];
                lastActivityTimestamp[users[i]] = block.timestamp;
                
                emit PointsAwarded(users[i], amounts[i], reason);
            }
        }
    }

    function emergencyResetPoints(address user) external onlyOwner {
        require(user != address(0), "Invalid user");
        
        uint256 currentPoints = points[user];
        points[user] = 0;
        
        emit PointsClaimed(user, currentPoints);
    }
}
