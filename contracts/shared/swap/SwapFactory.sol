
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SwapPair.sol";

contract SwapFactory is Ownable {
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;
    
    address public feeTo;
    address public pointsModule;
    uint256 public createPairFee = 0; // Fee in ETH to create pair

    event PairCreated(
        address indexed token0,
        address indexed token1,
        address pair,
        uint256 totalPairs
    );

    event FeeToUpdated(address indexed feeTo);
    event CreatePairFeeUpdated(uint256 newFee);

    constructor(address _feeTo, address _pointsModule) {
        feeTo = _feeTo;
        pointsModule = _pointsModule;
    }

    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }

    function createPair(
        address tokenA,
        address tokenB
    ) external payable returns (address pair) {
        require(tokenA != tokenB, "Identical addresses");
        require(msg.value >= createPairFee, "Insufficient fee");
        
        (address token0, address token1) = sortTokens(tokenA, tokenB);
        require(token0 != address(0), "Zero address");
        require(getPair[token0][token1] == address(0), "Pair exists");

        bytes memory bytecode = type(SwapPair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        
        SwapPair(pair).initialize(token0, token1, feeTo, pointsModule);
        
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);

        emit PairCreated(token0, token1, pair, allPairs.length);

        // Send excess ETH back
        if (msg.value > createPairFee) {
            payable(msg.sender).transfer(msg.value - createPairFee);
        }
    }

    function sortTokens(
        address tokenA,
        address tokenB
    ) public pure returns (address token0, address token1) {
        require(tokenA != tokenB, "Identical addresses");
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "Zero address");
    }

    function pairFor(
        address tokenA,
        address tokenB
    ) external view returns (address pair) {
        (address token0, address token1) = sortTokens(tokenA, tokenB);
        pair = getPair[token0][token1];
    }

    function setFeeTo(address _feeTo) external onlyOwner {
        feeTo = _feeTo;
        emit FeeToUpdated(_feeTo);
    }

    function setPointsModule(address _pointsModule) external onlyOwner {
        require(_pointsModule != address(0), "Invalid points module");
        pointsModule = _pointsModule;
    }

    function setCreatePairFee(uint256 _fee) external onlyOwner {
        createPairFee = _fee;
        emit CreatePairFeeUpdated(_fee);
    }

    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}
}
