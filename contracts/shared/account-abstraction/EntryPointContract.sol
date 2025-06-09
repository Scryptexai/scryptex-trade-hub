
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

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

contract EntryPointContract is ReentrancyGuard, Ownable {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(uint256 => uint256)) public nonceSequenceNumber;
    mapping(address => bool) public authorizedPaymasters;
    
    uint256 constant VALIDATION_AGGREGATOR = 1;
    uint256 constant VALIDATION_ACCOUNT = 0;
    
    event UserOperationEvent(
        bytes32 indexed userOpHash,
        address indexed sender,
        address indexed paymaster,
        uint256 nonce,
        bool success,
        uint256 actualGasCost,
        uint256 actualGasUsed
    );
    
    event AccountDeployed(
        bytes32 indexed userOpHash,
        address indexed sender,
        address factory,
        address paymaster
    );
    
    event PaymasterRegistered(address indexed paymaster);
    
    function registerPaymaster(address paymaster) external onlyOwner {
        authorizedPaymasters[paymaster] = true;
        emit PaymasterRegistered(paymaster);
    }
    
    function handleOps(UserOperation[] calldata ops, address payable beneficiary) external nonReentrant {
        uint256 opslen = ops.length;
        UserOpInfo[] memory opInfos = new UserOpInfo[](opslen);
        
        for (uint256 i = 0; i < opslen; i++) {
            UserOpInfo memory opInfo = opInfos[i];
            (uint256 validationData, uint256 pmValidationData) = _validatePrepayment(i, ops[i], opInfo);
            _validateAccountAndPaymasterValidationData(i, validationData, pmValidationData, address(0));
        }
        
        uint256 collected = 0;
        for (uint256 i = 0; i < opslen; i++) {
            collected += _executeUserOp(i, ops[i], opInfos[i]);
        }
        
        _compensate(beneficiary, collected);
    }
    
    function handleAggregatedOps(
        UserOpsPerAggregator[] calldata opsPerAggregator,
        address payable beneficiary
    ) external nonReentrant {
        uint256 opasLen = opsPerAggregator.length;
        uint256 totalOps = 0;
        
        for (uint256 i = 0; i < opasLen; i++) {
            totalOps += opsPerAggregator[i].userOps.length;
        }
        
        UserOpInfo[] memory opInfos = new UserOpInfo[](totalOps);
        uint256 opIndex = 0;
        
        for (uint256 a = 0; a < opasLen; a++) {
            UserOpsPerAggregator calldata opa = opsPerAggregator[a];
            UserOperation[] calldata ops = opa.userOps;
            
            for (uint256 i = 0; i < ops.length; i++) {
                UserOpInfo memory opInfo = opInfos[opIndex];
                (uint256 validationData, uint256 pmValidationData) = _validatePrepayment(opIndex, ops[i], opInfo);
                _validateAccountAndPaymasterValidationData(opIndex, validationData, pmValidationData, opa.aggregator);
                opIndex++;
            }
        }
        
        uint256 collected = 0;
        opIndex = 0;
        
        for (uint256 a = 0; a < opasLen; a++) {
            UserOpsPerAggregator calldata opa = opsPerAggregator[a];
            UserOperation[] calldata ops = opa.userOps;
            
            for (uint256 i = 0; i < ops.length; i++) {
                collected += _executeUserOp(opIndex, ops[i], opInfos[opIndex]);
                opIndex++;
            }
        }
        
        _compensate(beneficiary, collected);
    }
    
    function _validatePrepayment(
        uint256 opIndex,
        UserOperation calldata userOp,
        UserOpInfo memory outOpInfo
    ) internal returns (uint256 validationData, uint256 paymasterValidationData) {
        uint256 preGas = gasleft();
        bytes32 userOpHash = getUserOpHash(userOp);
        address sender = userOp.sender;
        
        outOpInfo.userOpHash = userOpHash;
        
        uint256 verificationGasLimit = userOp.verificationGasLimit;
        require(verificationGasLimit > 0, "AA21 didn't pay prefund");
        
        outOpInfo.prefund = _getRequiredPrefund(userOp);
        
        if (userOp.initCode.length != 0) {
            address sender1 = _createSenderIfNeeded(opIndex, userOp, outOpInfo);
            require(sender1 == sender, "AA14 initCode must return sender");
        }
        
        uint256 missingAccountFunds = 0;
        address paymaster = address(bytes20(userOp.paymasterAndData[0:20]));
        
        if (paymaster == address(0)) {
            uint256 bal = balanceOf[sender];
            missingAccountFunds = bal > outOpInfo.prefund ? 0 : outOpInfo.prefund - bal;
        }
        
        try IAccount(sender).validateUserOp{gas: verificationGasLimit}(userOp, userOpHash, missingAccountFunds)
        returns (uint256 _validationData) {
            validationData = _validationData;
        } catch {
            revert("AA23 reverted: account");
        }
        
        if (paymaster != address(0)) {
            require(authorizedPaymasters[paymaster], "AA30 paymaster not registered");
            
            try IPaymaster(paymaster).validatePaymasterUserOp{gas: verificationGasLimit}(userOp, userOpHash, outOpInfo.prefund)
            returns (bytes memory context, uint256 _paymasterValidationData) {
                outOpInfo.context = context;
                paymasterValidationData = _paymasterValidationData;
            } catch {
                revert("AA33 reverted: paymaster");
            }
        }
        
        outOpInfo.preOpGas = preGas - gasleft() + userOp.preVerificationGas;
    }
    
    function _executeUserOp(
        uint256 opIndex,
        UserOperation calldata userOp,
        UserOpInfo memory opInfo
    ) internal returns (uint256 collected) {
        uint256 preGas = gasleft();
        bytes calldata callData = userOp.callData;
        
        if (callData.length > 0) {
            bool success = Exec.call(userOp.sender, 0, callData, gasleft());
            if (!success) {
                bytes memory result = Exec.getReturnData(REVERT_REASON_MAX_LEN);
                if (result.length > 0) {
                    emit UserOperationRevertReason(opInfo.userOpHash, userOp.sender, userOp.nonce, result);
                }
            }
        }
        
        uint256 actualGas;
        uint256 actualGasCost;
        (actualGas, actualGasCost) = _handlePostOp(opIndex, userOp, opInfo, preGas);
        
        emit UserOperationEvent(
            opInfo.userOpHash,
            userOp.sender,
            address(bytes20(userOp.paymasterAndData[0:20])),
            userOp.nonce,
            true,
            actualGasCost,
            actualGas
        );
        
        collected = actualGasCost;
    }
    
    function getUserOpHash(UserOperation calldata userOp) public view returns (bytes32) {
        return keccak256(abi.encode(
            keccak256(abi.encode(
                userOp.sender,
                userOp.nonce,
                keccak256(userOp.initCode),
                keccak256(userOp.callData),
                userOp.callGasLimit,
                userOp.verificationGasLimit,
                userOp.preVerificationGas,
                userOp.maxFeePerGas,
                userOp.maxPriorityFeePerGas,
                keccak256(userOp.paymasterAndData)
            )),
            address(this),
            block.chainid
        ));
    }
    
    function depositTo(address account) public payable {
        balanceOf[account] = balanceOf[account] + msg.value;
    }
    
    function _getRequiredPrefund(UserOperation calldata userOp) internal pure returns (uint256) {
        return userOp.callGasLimit + userOp.verificationGasLimit + userOp.preVerificationGas;
    }
    
    // Additional helper functions would be implemented here
    function _createSenderIfNeeded(uint256 opIndex, UserOperation calldata userOp, UserOpInfo memory opInfo) internal returns (address) {
        // Implementation for account creation
        return userOp.sender;
    }
    
    function _validateAccountAndPaymasterValidationData(uint256 opIndex, uint256 validationData, uint256 paymasterValidationData, address aggregator) internal {
        // Implementation for validation
    }
    
    function _handlePostOp(uint256 opIndex, UserOperation calldata userOp, UserOpInfo memory opInfo, uint256 preGas) internal returns (uint256, uint256) {
        // Implementation for post-op handling
        return (0, 0);
    }
    
    function _compensate(address payable beneficiary, uint256 amount) internal {
        // Implementation for compensation
    }
}

struct UserOpInfo {
    bytes32 userOpHash;
    uint256 prefund;
    bytes context;
    uint256 preOpGas;
}

struct UserOpsPerAggregator {
    UserOperation[] userOps;
    address aggregator;
    bytes signature;
}

interface IAccount {
    function validateUserOp(UserOperation calldata userOp, bytes32 userOpHash, uint256 missingAccountFunds) external returns (uint256 validationData);
}

interface IPaymaster {
    function validatePaymasterUserOp(UserOperation calldata userOp, bytes32 userOpHash, uint256 maxCost) external returns (bytes memory context, uint256 validationData);
}

library Exec {
    function call(address to, uint256 value, bytes calldata data, uint256 txGas) internal returns (bool success) {
        assembly {
            success := call(txGas, to, value, add(data.offset, 0x20), data.length, 0, 0)
        }
    }
    
    function getReturnData(uint256 maxLen) internal pure returns (bytes memory returnData) {
        assembly {
            let len := returndatasize()
            if gt(len, maxLen) { len := maxLen }
            returnData := mload(0x40)
            mstore(returnData, len)
            returndatacopy(add(returnData, 0x20), 0, len)
            mstore(0x40, add(returnData, add(0x20, len)))
        }
    }
}

uint256 constant REVERT_REASON_MAX_LEN = 2048;

event UserOperationRevertReason(
    bytes32 indexed userOpHash,
    address indexed sender,
    uint256 nonce,
    bytes revertReason
);
