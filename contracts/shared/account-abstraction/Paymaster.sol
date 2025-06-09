
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Paymaster is Ownable, ReentrancyGuard {
    address public immutable entryPoint;
    
    mapping(address => uint256) public sponsorshipBudgets; // user => remaining budget
    mapping(address => bool) public authorizedUsers;
    mapping(string => uint256) public operationLimits; // operation type => gas limit
    mapping(address => uint256) public userDailySpent; // user => amount spent today
    mapping(address => uint256) public lastResetDay; // user => last reset day
    
    uint256 public constant DAILY_LIMIT = 0.01 ether; // 0.01 ETH per user per day
    uint256 public totalBudget;
    uint256 public totalSpent;
    
    event UserAuthorized(address indexed user, uint256 budget);
    event GasSponsored(address indexed user, uint256 amount, string operationType);
    event BudgetIncreased(address indexed user, uint256 amount);
    event PaymasterFunded(uint256 amount);
    
    modifier onlyEntryPoint() {
        require(msg.sender == entryPoint, "Only EntryPoint");
        _;
    }
    
    constructor(address _entryPoint) {
        entryPoint = _entryPoint;
        
        // Set default operation limits
        operationLimits["token_creation"] = 300000;
        operationLimits["token_trade"] = 200000;
        operationLimits["bridge"] = 250000;
        operationLimits["swap"] = 150000;
        operationLimits["general"] = 100000;
    }
    
    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) external onlyEntryPoint returns (bytes memory context, uint256 validationData) {
        address sender = userOp.sender;
        
        // Check if user is authorized
        require(authorizedUsers[sender] || sponsorshipBudgets[sender] > 0, "User not authorized");
        
        // Reset daily limit if needed
        _resetDailyLimitIfNeeded(sender);
        
        // Check daily limit
        require(userDailySpent[sender] + maxCost <= DAILY_LIMIT, "Daily limit exceeded");
        
        // Check operation-specific limits
        string memory operationType = _extractOperationType(userOp.callData);
        uint256 gasLimit = operationLimits[operationType];
        require(userOp.callGasLimit <= gasLimit, "Gas limit exceeded for operation");
        
        // Check if we have enough budget
        require(address(this).balance >= maxCost, "Insufficient paymaster balance");
        
        // Check user's individual budget if applicable
        if (sponsorshipBudgets[sender] > 0) {
            require(sponsorshipBudgets[sender] >= maxCost, "User budget insufficient");
        }
        
        // Encode context for postOp
        context = abi.encode(sender, maxCost, operationType);
        validationData = 0; // Success
        
        return (context, validationData);
    }
    
    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) external onlyEntryPoint {
        if (mode == PostOpMode.opSucceeded || mode == PostOpMode.opReverted) {
            (address sender, uint256 maxCost, string memory operationType) = abi.decode(context, (address, uint256, string));
            
            // Deduct from user's budget if applicable
            if (sponsorshipBudgets[sender] > 0) {
                if (sponsorshipBudgets[sender] >= actualGasCost) {
                    sponsorshipBudgets[sender] -= actualGasCost;
                } else {
                    sponsorshipBudgets[sender] = 0;
                }
            }
            
            // Update daily spending
            userDailySpent[sender] += actualGasCost;
            totalSpent += actualGasCost;
            
            emit GasSponsored(sender, actualGasCost, operationType);
        }
    }
    
    function _extractOperationType(bytes calldata callData) internal pure returns (string memory) {
        if (callData.length < 4) return "general";
        
        bytes4 selector = bytes4(callData[:4]);
        
        // Map function selectors to operation types
        if (selector == bytes4(keccak256("createToken(string,string,uint256)"))) {
            return "token_creation";
        } else if (selector == bytes4(keccak256("buyToken(address,uint256)")) || 
                   selector == bytes4(keccak256("sellToken(address,uint256)"))) {
            return "token_trade";
        } else if (selector == bytes4(keccak256("initiateBridge(address,uint256,uint256)"))) {
            return "bridge";
        } else if (selector == bytes4(keccak256("swap(address,address,uint256)"))) {
            return "swap";
        }
        
        return "general";
    }
    
    function _resetDailyLimitIfNeeded(address user) internal {
        uint256 today = block.timestamp / 1 days;
        if (lastResetDay[user] < today) {
            userDailySpent[user] = 0;
            lastResetDay[user] = today;
        }
    }
    
    function authorizeUser(address user, uint256 budget) external onlyOwner {
        authorizedUsers[user] = true;
        if (budget > 0) {
            sponsorshipBudgets[user] += budget;
        }
        emit UserAuthorized(user, budget);
    }
    
    function authorizeUsersBatch(address[] calldata users, uint256[] calldata budgets) external onlyOwner {
        require(users.length == budgets.length, "Length mismatch");
        
        for (uint256 i = 0; i < users.length; i++) {
            authorizedUsers[users[i]] = true;
            if (budgets[i] > 0) {
                sponsorshipBudgets[users[i]] += budgets[i];
            }
            emit UserAuthorized(users[i], budgets[i]);
        }
    }
    
    function increaseBudget(address user, uint256 amount) external onlyOwner {
        sponsorshipBudgets[user] += amount;
        emit BudgetIncreased(user, amount);
    }
    
    function setOperationLimit(string calldata operationType, uint256 gasLimit) external onlyOwner {
        operationLimits[operationType] = gasLimit;
    }
    
    function fundPaymaster() external payable onlyOwner {
        totalBudget += msg.value;
        emit PaymasterFunded(msg.value);
    }
    
    function withdrawFunds(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        payable(owner()).transfer(amount);
    }
    
    function getUserBudget(address user) external view returns (uint256) {
        return sponsorshipBudgets[user];
    }
    
    function getUserDailySpent(address user) external view returns (uint256) {
        return userDailySpent[user];
    }
    
    function getRemainingDailyLimit(address user) external view returns (uint256) {
        uint256 today = block.timestamp / 1 days;
        if (lastResetDay[user] < today) {
            return DAILY_LIMIT;
        }
        
        if (userDailySpent[user] >= DAILY_LIMIT) {
            return 0;
        }
        
        return DAILY_LIMIT - userDailySpent[user];
    }
    
    function getPaymasterStats() external view returns (
        uint256 balance,
        uint256 _totalBudget,
        uint256 _totalSpent,
        uint256 utilization
    ) {
        balance = address(this).balance;
        _totalBudget = totalBudget;
        _totalSpent = totalSpent;
        utilization = totalBudget > 0 ? (_totalSpent * 10000) / totalBudget : 0; // in basis points
    }
    
    receive() external payable {
        totalBudget += msg.value;
        emit PaymasterFunded(msg.value);
    }
}

enum PostOpMode {
    opSucceeded,
    opReverted,
    postOpReverted
}

struct UserOperation {
    address sender;
    uint256 nonce;
    bytes initCode;
    bytes callData;
    uint256 callGasLimit;
    uint256 verificationGasLimit;
    uint256 preVerificationGas;
    uint256 maxFeePerGas;
    uint256 maxPriorityFeePerGas;
    bytes paymasterAndData;
    bytes signature;
}
