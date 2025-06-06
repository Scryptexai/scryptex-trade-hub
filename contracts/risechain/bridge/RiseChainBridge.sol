
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface IOracle {
    function latest_answer() external view returns (uint256);
}

contract RiseChainBridge is ReentrancyGuard, Ownable, Pausable {
    // RiseChain Predeploy Contracts
    address public constant WETH = 0x4200000000000000000000000000000000000006;
    address public constant L2_BRIDGE = 0x4200000000000000000000000000000000000010;
    address public constant GAS_ORACLE = 0x420000000000000000000000000000000000000F;
    address public constant MULTICALL = 0xcA11bde05977b3631167028862bE2a173976CA11;

    // RiseChain Tokens
    address public constant RISE_USDC = 0x40918ba7f132e0acba2ce4de4c4baf9bd2d7d849;
    address public constant RISE_USDT = 0xf32d39ff9f6aa7a7a64d7a4f00a54826ef791a55;
    address public constant RISE_DAI = 0xd6e1afe5ca8d00a2efc01b89997abe2de47fdfaf;

    // RiseChain Oracles
    address public constant ETH_ORACLE = 0x7114E2537851e727678DE5a96C8eE5d0Ca14f03D;
    address public constant USDC_ORACLE = 0x50524C5bDa18aE25C600a8b81449B9CeAeB50471;
    address public constant USDT_ORACLE = 0x9190159b1bb78482Dca6EBaDf03ab744de0c0197;
    address public constant DAI_ORACLE = 0xadDAEd879D549E5DBfaf3e35470C20D8C50fDed0;

    struct BridgeTransaction {
        bytes32 id;
        address user;
        address token;
        uint256 amount;
        uint256 sourceChain;
        uint256 destinationChain;
        address destinationAddress;
        uint8 status; // 0=PENDING, 1=VALIDATED, 2=EXECUTED
        uint8 votes;
        uint8 requiredVotes;
        uint256 timestamp;
    }

    mapping(bytes32 => BridgeTransaction) public bridgeTransactions;
    mapping(bytes32 => mapping(address => bool)) public validatorVotes;
    mapping(address => bool) public validators;
    address[] public validatorList;

    uint256 public bridgeFee = 30; // 0.3%
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint8 public requiredValidations = 3;

    event BridgeInitiated(bytes32 indexed transactionId, address indexed user, address token, uint256 amount, address destinationAddress);
    event BridgeValidated(bytes32 indexed transactionId, address indexed validator, uint8 currentVotes, uint8 requiredVotes);
    event BridgeExecuted(bytes32 indexed transactionId, address indexed user, uint256 amount);
    event ValidatorAdded(address indexed validator);
    event FeeUpdated(uint256 newFee);

    constructor(address[] memory _validators) {
        for (uint i = 0; i < _validators.length; i++) {
            validators[_validators[i]] = true;
            validatorList.push(_validators[i]);
        }
        requiredValidations = uint8((_validators.length * 60) / 100); // 60% consensus
    }

    function bridgeETH(address destinationAddress, uint256 destinationChain) external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Amount must be greater than 0");
        require(destinationAddress != address(0), "Invalid destination address");

        uint256 fee = (msg.value * bridgeFee) / FEE_DENOMINATOR;
        uint256 bridgeAmount = msg.value - fee;

        bytes32 transactionId = keccak256(abi.encodePacked(
            msg.sender,
            address(0), // ETH
            bridgeAmount,
            block.chainid,
            destinationChain,
            destinationAddress,
            block.timestamp
        ));

        bridgeTransactions[transactionId] = BridgeTransaction({
            id: transactionId,
            user: msg.sender,
            token: address(0),
            amount: bridgeAmount,
            sourceChain: block.chainid,
            destinationChain: destinationChain,
            destinationAddress: destinationAddress,
            status: 0,
            votes: 0,
            requiredVotes: requiredValidations,
            timestamp: block.timestamp
        });

        emit BridgeInitiated(transactionId, msg.sender, address(0), bridgeAmount, destinationAddress);
    }

    function bridgeToken(address token, uint256 amount, address destinationAddress, uint256 destinationChain) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(destinationAddress != address(0), "Invalid destination address");
        require(token != address(0), "Invalid token address");

        IERC20(token).transferFrom(msg.sender, address(this), amount);

        uint256 fee = (amount * bridgeFee) / FEE_DENOMINATOR;
        uint256 bridgeAmount = amount - fee;

        bytes32 transactionId = keccak256(abi.encodePacked(
            msg.sender,
            token,
            bridgeAmount,
            block.chainid,
            destinationChain,
            destinationAddress,
            block.timestamp
        ));

        bridgeTransactions[transactionId] = BridgeTransaction({
            id: transactionId,
            user: msg.sender,
            token: token,
            amount: bridgeAmount,
            sourceChain: block.chainid,
            destinationChain: destinationChain,
            destinationAddress: destinationAddress,
            status: 0,
            votes: 0,
            requiredVotes: requiredValidations,
            timestamp: block.timestamp
        });

        emit BridgeInitiated(transactionId, msg.sender, token, bridgeAmount, destinationAddress);
    }

    function validateTransaction(bytes32 transactionId) external {
        require(validators[msg.sender], "Not a validator");
        require(!validatorVotes[transactionId][msg.sender], "Already voted");
        
        BridgeTransaction storage transaction = bridgeTransactions[transactionId];
        require(transaction.status == 0, "Transaction not pending");

        validatorVotes[transactionId][msg.sender] = true;
        transaction.votes++;

        if (transaction.votes >= transaction.requiredVotes) {
            transaction.status = 1;
            emit BridgeExecuted(transactionId, transaction.user, transaction.amount);
        }

        emit BridgeValidated(transactionId, msg.sender, transaction.votes, transaction.requiredVotes);
    }

    function _getTokenValueInETH(address token, uint256 amount) internal view returns (uint256) {
        if (token == RISE_USDC) {
            return _getOraclePrice(USDC_ORACLE, amount, 6);
        } else if (token == RISE_USDT) {
            return _getOraclePrice(USDT_ORACLE, amount, 6);
        } else if (token == RISE_DAI) {
            return _getOraclePrice(DAI_ORACLE, amount, 18);
        }
        return amount;
    }

    function _getOraclePrice(address oracle, uint256 amount, uint8 tokenDecimals) internal view returns (uint256) {
        try IOracle(oracle).latest_answer() returns (uint256 price) {
            return (amount * price) / (10 ** tokenDecimals);
        } catch {
            return amount;
        }
    }

    function addValidator(address validator) external onlyOwner {
        require(!validators[validator], "Already a validator");
        validators[validator] = true;
        validatorList.push(validator);
        emit ValidatorAdded(validator);
    }

    function updateFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        bridgeFee = newFee;
        emit FeeUpdated(newFee);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function getBridgeTransaction(bytes32 transactionId) external view returns (BridgeTransaction memory) {
        return bridgeTransactions[transactionId];
    }
}
