
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract FeeTreasury is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    mapping(address => uint256) public totalFeeCollected;
    mapping(address => bool) public authorizedCallers;
    
    uint256 public constant MAX_FEE_RATE = 1000; // 10% max

    event FeeRecorded(address indexed token, uint256 amount);
    event FeesWithdrawn(address indexed token, uint256 amount, address indexed to);
    event AuthorizedCallerUpdated(address indexed caller, bool authorized);

    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor() {}

    function recordFee(address token, uint256 amount) external onlyAuthorized {
        require(amount > 0, "Invalid amount");
        
        totalFeeCollected[token] += amount;
        emit FeeRecorded(token, amount);
    }

    function withdrawFees(address token, uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Invalid amount");
        
        if (token == address(0)) {
            // ETH withdrawal
            require(address(this).balance >= amount, "Insufficient ETH");
            require(totalFeeCollected[token] >= amount, "Insufficient recorded fees");
            
            totalFeeCollected[token] -= amount;
            payable(owner()).transfer(amount);
        } else {
            // Token withdrawal
            require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient tokens");
            require(totalFeeCollected[token] >= amount, "Insufficient recorded fees");
            
            totalFeeCollected[token] -= amount;
            IERC20(token).safeTransfer(owner(), amount);
        }
        
        emit FeesWithdrawn(token, amount, owner());
    }

    function withdrawAllFees(address token) external onlyOwner {
        uint256 amount = totalFeeCollected[token];
        if (amount > 0) {
            withdrawFees(token, amount);
        }
    }

    function setAuthorizedCaller(address caller, bool authorized) external onlyOwner {
        require(caller != address(0), "Invalid caller");
        authorizedCallers[caller] = authorized;
        emit AuthorizedCallerUpdated(caller, authorized);
    }

    function getAvailableFees(address token) external view returns (uint256) {
        return totalFeeCollected[token];
    }

    function batchWithdraw(
        address[] calldata tokens,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(tokens.length == amounts.length, "Length mismatch");
        
        for (uint256 i = 0; i < tokens.length; i++) {
            if (amounts[i] > 0 && totalFeeCollected[tokens[i]] >= amounts[i]) {
                withdrawFees(tokens[i], amounts[i]);
            }
        }
    }

    receive() external payable {
        // Allow receiving ETH fees
    }
}
