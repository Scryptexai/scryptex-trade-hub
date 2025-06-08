
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract GMContract {
    struct GMRecord {
        address user;
        uint256 timestamp;
        string message;
        uint256 chainId;
    }
    
    mapping(address => uint256) public userStreaks;
    mapping(address => uint256) public lastGMTimestamp;
    mapping(address => uint256) public totalGMs;
    
    GMRecord[] public gmHistory;
    
    event GMSent(
        address indexed user,
        uint256 timestamp,
        string message,
        uint256 streak,
        uint256 chainId
    );
    
    function sendGM(string memory message) external payable {
        require(msg.value >= 0.001 ether, "Minimum fee required");
        require(bytes(message).length > 0, "Message cannot be empty");
        
        address user = msg.sender;
        uint256 currentTime = block.timestamp;
        uint256 oneDayAgo = currentTime - 86400; // 24 hours
        
        // Check if user sent GM in last 24 hours
        if (lastGMTimestamp[user] >= oneDayAgo) {
            userStreaks[user] += 1;
        } else {
            userStreaks[user] = 1; // Reset streak
        }
        
        lastGMTimestamp[user] = currentTime;
        totalGMs[user] += 1;
        
        // Store GM record
        gmHistory.push(GMRecord({
            user: user,
            timestamp: currentTime,
            message: message,
            chainId: block.chainid
        }));
        
        emit GMSent(user, currentTime, message, userStreaks[user], block.chainid);
    }
    
    function getUserStats(address user) external view returns (
        uint256 streak,
        uint256 lastGM,
        uint256 total
    ) {
        return (userStreaks[user], lastGMTimestamp[user], totalGMs[user]);
    }
    
    function getGMHistory(uint256 limit) external view returns (GMRecord[] memory) {
        uint256 length = gmHistory.length;
        if (length == 0) {
            return new GMRecord[](0);
        }
        
        uint256 actualLimit = limit > length ? length : limit;
        GMRecord[] memory recent = new GMRecord[](actualLimit);
        
        for (uint256 i = 0; i < actualLimit; i++) {
            recent[i] = gmHistory[length - 1 - i];
        }
        
        return recent;
    }
    
    function withdraw() external {
        require(msg.sender == owner(), "Only owner can withdraw");
        payable(owner()).transfer(address(this).balance);
    }
    
    address private _owner;
    
    constructor() {
        _owner = msg.sender;
    }
    
    function owner() public view returns (address) {
        return _owner;
    }
}
