
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract SmartWallet is Initializable, ReentrancyGuard {
    using ECDSA for bytes32;
    
    address public owner;
    address public entryPoint;
    uint256 public nonce;
    
    mapping(address => uint256) public sessionKeys; // sessionKey => expiry
    mapping(address => bool) public recoveryMethods;
    mapping(bytes32 => bool) public socialMethods; // hash(provider+socialId) => authorized
    
    struct Call {
        address target;
        uint256 value;
        bytes data;
    }
    
    event SessionKeyAdded(address indexed sessionKey, uint256 expiry);
    event SessionKeyRemoved(address indexed sessionKey);
    event RecoveryMethodAdded(address indexed recovery);
    event SocialMethodAdded(bytes32 indexed methodHash, string provider);
    event WalletInitialized(address indexed owner, string socialProvider, string socialId);
    
    modifier onlyOwnerOrValidSession() {
        require(
            msg.sender == owner || 
            (sessionKeys[msg.sender] > block.timestamp) ||
            msg.sender == entryPoint,
            "Unauthorized"
        );
        _;
    }
    
    modifier onlyEntryPoint() {
        require(msg.sender == entryPoint, "Only EntryPoint");
        _;
    }
    
    function initialize(
        address _owner,
        address _entryPoint,
        string calldata socialProvider,
        string calldata socialId
    ) external initializer {
        owner = _owner;
        entryPoint = _entryPoint;
        
        // Register social login method
        bytes32 socialHash = keccak256(abi.encodePacked(socialProvider, socialId));
        socialMethods[socialHash] = true;
        
        emit WalletInitialized(_owner, socialProvider, socialId);
        emit SocialMethodAdded(socialHash, socialProvider);
    }
    
    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external onlyEntryPoint returns (uint256 validationData) {
        validationData = _validateSignature(userOp, userOpHash);
        
        if (missingAccountFunds > 0) {
            (bool success,) = payable(msg.sender).call{value: missingAccountFunds}("");
            require(success, "Failed to pay entry point");
        }
    }
    
    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal view returns (uint256 validationData) {
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        address signer = hash.recover(userOp.signature);
        
        // Check if signer is owner
        if (signer == owner) {
            return 0;
        }
        
        // Check if signer is valid session key
        if (sessionKeys[signer] > block.timestamp) {
            return 0;
        }
        
        // Check if it's a recovery method
        if (recoveryMethods[signer]) {
            return 0;
        }
        
        return 1; // Invalid signature
    }
    
    function execute(
        address dest,
        uint256 value,
        bytes calldata func
    ) external onlyOwnerOrValidSession {
        _call(dest, value, func);
    }
    
    function executeBatch(Call[] calldata calls) external onlyOwnerOrValidSession {
        for (uint256 i = 0; i < calls.length; i++) {
            _call(calls[i].target, calls[i].value, calls[i].data);
        }
    }
    
    function executeWithPaymaster(
        UserOperation calldata userOp
    ) external onlyEntryPoint {
        // This function is called by EntryPoint for gasless execution
        require(userOp.sender == address(this), "Invalid sender");
        
        if (userOp.callData.length > 0) {
            (bool success, bytes memory result) = address(this).call(userOp.callData);
            if (!success) {
                assembly {
                    revert(add(result, 32), mload(result))
                }
            }
        }
    }
    
    function addSessionKey(address sessionKey, uint256 expiry) external onlyOwnerOrValidSession {
        require(expiry > block.timestamp, "Invalid expiry");
        sessionKeys[sessionKey] = expiry;
        emit SessionKeyAdded(sessionKey, expiry);
    }
    
    function removeSessionKey(address sessionKey) external onlyOwnerOrValidSession {
        delete sessionKeys[sessionKey];
        emit SessionKeyRemoved(sessionKey);
    }
    
    function addRecoveryMethod(address recovery, bytes32 method) external onlyOwnerOrValidSession {
        recoveryMethods[recovery] = true;
        emit RecoveryMethodAdded(recovery);
    }
    
    function addSocialMethod(string calldata provider, string calldata socialId) external onlyOwnerOrValidSession {
        bytes32 methodHash = keccak256(abi.encodePacked(provider, socialId));
        socialMethods[methodHash] = true;
        emit SocialMethodAdded(methodHash, provider);
    }
    
    function recoverWallet(
        address newOwner,
        bytes calldata recoveryProof
    ) external {
        require(recoveryMethods[msg.sender], "Invalid recovery method");
        
        // Verify recovery proof (could be social login, guardian signature, etc.)
        require(_verifyRecoveryProof(recoveryProof), "Invalid recovery proof");
        
        owner = newOwner;
    }
    
    function _verifyRecoveryProof(bytes calldata proof) internal pure returns (bool) {
        // Implementation for recovery proof verification
        // This could involve checking guardian signatures, social proofs, etc.
        return true; // Simplified for now
    }
    
    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }
    
    function isValidSessionKey(address sessionKey) external view returns (bool) {
        return sessionKeys[sessionKey] > block.timestamp;
    }
    
    function isSocialMethodAuthorized(string calldata provider, string calldata socialId) external view returns (bool) {
        bytes32 methodHash = keccak256(abi.encodePacked(provider, socialId));
        return socialMethods[methodHash];
    }
    
    function getNonce() external view returns (uint256) {
        return nonce;
    }
    
    receive() external payable {}
    
    fallback() external payable {}
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
