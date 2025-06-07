
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ValidatorRegistry is Ownable {
    struct ValidationData {
        uint256 voteCount;
        mapping(address => bool) hasVoted;
        bool validated;
        uint256 timestamp;
    }

    mapping(address => bool) public validators;
    mapping(bytes32 => ValidationData) public validations;
    
    address[] public validatorList;
    uint256 public validatorCount;
    uint256 public quorumPercentage = 6600; // 66% in basis points

    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    event ValidatorVoted(bytes32 indexed txId, address indexed validator);
    event TransactionValidated(bytes32 indexed txId, uint256 voteCount);
    event QuorumUpdated(uint256 newQuorum);

    modifier onlyValidator() {
        require(validators[msg.sender], "Not a validator");
        _;
    }

    constructor(address[] memory _initialValidators) {
        require(_initialValidators.length > 0, "Need initial validators");
        
        for (uint256 i = 0; i < _initialValidators.length; i++) {
            require(_initialValidators[i] != address(0), "Invalid validator");
            validators[_initialValidators[i]] = true;
            validatorList.push(_initialValidators[i]);
        }
        validatorCount = _initialValidators.length;
    }

    function addValidator(address validator) external onlyOwner {
        require(validator != address(0), "Invalid validator");
        require(!validators[validator], "Already validator");
        
        validators[validator] = true;
        validatorList.push(validator);
        validatorCount++;
        
        emit ValidatorAdded(validator);
    }

    function removeValidator(address validator) external onlyOwner {
        require(validators[validator], "Not a validator");
        require(validatorCount > 1, "Cannot remove last validator");
        
        validators[validator] = false;
        
        // Remove from array
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validatorList[i] == validator) {
                validatorList[i] = validatorList[validatorList.length - 1];
                validatorList.pop();
                break;
            }
        }
        
        validatorCount--;
        emit ValidatorRemoved(validator);
    }

    function validateTransaction(bytes32 txId) external onlyValidator {
        ValidationData storage validation = validations[txId];
        
        require(!validation.hasVoted[msg.sender], "Already voted");
        require(!validation.validated, "Already validated");
        
        validation.hasVoted[msg.sender] = true;
        validation.voteCount++;
        validation.timestamp = block.timestamp;
        
        emit ValidatorVoted(txId, msg.sender);
        
        // Check if quorum reached
        if (validation.voteCount >= requiredVotes()) {
            validation.validated = true;
            emit TransactionValidated(txId, validation.voteCount);
        }
    }

    function requiredVotes() public view returns (uint256) {
        return (validatorCount * quorumPercentage) / 10000;
    }

    function isValidated(bytes32 txId) external view returns (bool) {
        return validations[txId].validated;
    }

    function getValidationInfo(bytes32 txId) external view returns (
        uint256 voteCount,
        bool validated,
        uint256 timestamp,
        uint256 required
    ) {
        ValidationData storage validation = validations[txId];
        return (
            validation.voteCount,
            validation.validated,
            validation.timestamp,
            requiredVotes()
        );
    }

    function updateQuorum(uint256 _newQuorum) external onlyOwner {
        require(_newQuorum > 5000 && _newQuorum <= 10000, "Invalid quorum"); // 50-100%
        quorumPercentage = _newQuorum;
        emit QuorumUpdated(_newQuorum);
    }

    function getAllValidators() external view returns (address[] memory) {
        address[] memory activeValidators = new address[](validatorCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]]) {
                activeValidators[index] = validatorList[i];
                index++;
            }
        }
        
        return activeValidators;
    }
}
