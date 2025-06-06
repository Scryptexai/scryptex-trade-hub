
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface IOracle {
    function latest_answer() external view returns (uint256);
}

interface IWETH {
    function deposit() external payable;
    function withdraw(uint256) external;
    function transfer(address, uint256) external returns (bool);
    function balanceOf(address) external view returns (uint256);
}

contract SwapRiseChain is ReentrancyGuard, Ownable, Pausable {
    // RiseChain Predeploy Contracts
    IWETH public constant WETH = IWETH(0x4200000000000000000000000000000000000006);
    
    // RiseChain Tokens
    address public constant RISE_USDC = 0x40918ba7f132e0acba2ce4de4c4baf9bd2d7d849;
    address public constant RISE_USDT = 0xf32d39ff9f6aa7a7a64d7a4f00a54826ef791a55;
    address public constant RISE_DAI = 0xd6e1afe5ca8d00a2efc01b89997abe2de47fdfaf;
    address public constant RISE_LINK = 0x99dbe4aea58e518c50a1c04ae9b48c9f6354612f;
    address public constant RISE_UNI = 0x6f6f570f45833e249e27022648a26f4076f48f78;

    // RiseChain Oracles
    address public constant ETH_ORACLE = 0x7114E2537851e727678DE5a96C8eE5d0Ca14f03D;
    address public constant USDC_ORACLE = 0x50524C5bDa18aE25C600a8b81449B9CeAeB50471;
    address public constant USDT_ORACLE = 0x9190159b1bb78482Dca6EBaDf03ab744de0c0197;
    address public constant DAI_ORACLE = 0xadDAEd879D549E5DBfaf3e35470C20D8C50fDed0;

    struct Pool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalLiquidity;
        uint256 feeRate; // basis points (e.g., 30 = 0.3%)
        bool active;
    }

    struct SwapParams {
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 minAmountOut;
        address to;
        uint256 deadline;
    }

    mapping(bytes32 => Pool) public pools;
    mapping(address => mapping(bytes32 => uint256)) public liquidityBalances;
    mapping(address => uint256) public userPoints;
    
    bytes32[] public poolList;
    uint256 public swapFee = 30; // 0.3%
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant POINTS_PER_SWAP = 100;

    event PoolCreated(bytes32 indexed poolId, address tokenA, address tokenB, uint256 feeRate);
    event LiquidityAdded(bytes32 indexed poolId, address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidity);
    event LiquidityRemoved(bytes32 indexed poolId, address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidity);
    event Swap(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut, uint256 points);
    event PointsEarned(address indexed user, uint256 points, uint256 totalPoints);

    constructor() {}

    function createPool(address tokenA, address tokenB, uint256 feeRate) external onlyOwner returns (bytes32) {
        require(tokenA != tokenB, "Identical tokens");
        require(tokenA != address(0) && tokenB != address(0), "Zero address");
        require(feeRate <= 1000, "Fee too high"); // Max 10%

        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        bytes32 poolId = keccak256(abi.encodePacked(token0, token1));
        
        require(!pools[poolId].active, "Pool exists");

        pools[poolId] = Pool({
            tokenA: token0,
            tokenB: token1,
            reserveA: 0,
            reserveB: 0,
            totalLiquidity: 0,
            feeRate: feeRate,
            active: true
        });

        poolList.push(poolId);
        emit PoolCreated(poolId, token0, token1, feeRate);
        return poolId;
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) external payable nonReentrant whenNotPaused returns (uint256 liquidity) {
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        bytes32 poolId = keccak256(abi.encodePacked(token0, token1));
        
        Pool storage pool = pools[poolId];
        require(pool.active, "Pool not found");

        (uint256 amount0Desired, uint256 amount1Desired) = tokenA == token0 ? 
            (amountADesired, amountBDesired) : (amountBDesired, amountADesired);
        (uint256 amount0Min, uint256 amount1Min) = tokenA == token0 ? 
            (amountAMin, amountBMin) : (amountBMin, amountAMin);

        uint256 amount0;
        uint256 amount1;

        if (pool.totalLiquidity == 0) {
            amount0 = amount0Desired;
            amount1 = amount1Desired;
            liquidity = sqrt(amount0 * amount1);
        } else {
            uint256 amount1Optimal = (amount0Desired * pool.reserveB) / pool.reserveA;
            if (amount1Optimal <= amount1Desired) {
                require(amount1Optimal >= amount1Min, "Insufficient B amount");
                amount0 = amount0Desired;
                amount1 = amount1Optimal;
            } else {
                uint256 amount0Optimal = (amount1Desired * pool.reserveA) / pool.reserveB;
                require(amount0Optimal >= amount0Min, "Insufficient A amount");
                amount0 = amount0Optimal;
                amount1 = amount1Desired;
            }
            liquidity = min((amount0 * pool.totalLiquidity) / pool.reserveA, 
                           (amount1 * pool.totalLiquidity) / pool.reserveB);
        }

        // Transfer tokens
        if (token0 == address(0)) {
            require(msg.value >= amount0, "Insufficient ETH");
            WETH.deposit{value: amount0}();
            if (msg.value > amount0) {
                payable(msg.sender).transfer(msg.value - amount0);
            }
        } else {
            IERC20(token0).transferFrom(msg.sender, address(this), amount0);
        }

        if (token1 == address(0)) {
            require(msg.value >= amount1, "Insufficient ETH");
            WETH.deposit{value: amount1}();
        } else {
            IERC20(token1).transferFrom(msg.sender, address(this), amount1);
        }

        pool.reserveA += amount0;
        pool.reserveB += amount1;
        pool.totalLiquidity += liquidity;
        liquidityBalances[msg.sender][poolId] += liquidity;

        emit LiquidityAdded(poolId, msg.sender, amount0, amount1, liquidity);
    }

    function swap(SwapParams calldata params) external payable nonReentrant whenNotPaused {
        require(params.deadline >= block.timestamp, "Expired");
        require(params.amountIn > 0, "Invalid amount");

        (address token0, address token1) = params.tokenIn < params.tokenOut ? 
            (params.tokenIn, params.tokenOut) : (params.tokenOut, params.tokenIn);
        bytes32 poolId = keccak256(abi.encodePacked(token0, token1));
        
        Pool storage pool = pools[poolId];
        require(pool.active, "Pool not found");

        bool isToken0In = params.tokenIn == token0;
        (uint256 reserveIn, uint256 reserveOut) = isToken0In ? 
            (pool.reserveA, pool.reserveB) : (pool.reserveB, pool.reserveA);

        // Calculate output amount with fee
        uint256 amountInWithFee = params.amountIn * (FEE_DENOMINATOR - pool.feeRate);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * FEE_DENOMINATOR) + amountInWithFee;
        uint256 amountOut = numerator / denominator;

        require(amountOut >= params.minAmountOut, "Insufficient output");
        require(amountOut < reserveOut, "Insufficient liquidity");

        // Transfer input token
        if (params.tokenIn == address(0)) {
            require(msg.value >= params.amountIn, "Insufficient ETH");
            WETH.deposit{value: params.amountIn}();
            if (msg.value > params.amountIn) {
                payable(msg.sender).transfer(msg.value - params.amountIn);
            }
        } else {
            IERC20(params.tokenIn).transferFrom(msg.sender, address(this), params.amountIn);
        }

        // Transfer output token
        if (params.tokenOut == address(0)) {
            WETH.withdraw(amountOut);
            payable(params.to).transfer(amountOut);
        } else {
            IERC20(params.tokenOut).transfer(params.to, amountOut);
        }

        // Update reserves
        if (isToken0In) {
            pool.reserveA += params.amountIn;
            pool.reserveB -= amountOut;
        } else {
            pool.reserveA -= amountOut;
            pool.reserveB += params.amountIn;
        }

        // Award points
        uint256 points = _calculatePoints(params.amountIn, params.tokenIn);
        userPoints[msg.sender] += points;

        emit Swap(msg.sender, params.tokenIn, params.tokenOut, params.amountIn, amountOut, points);
        emit PointsEarned(msg.sender, points, userPoints[msg.sender]);
    }

    function _calculatePoints(uint256 amount, address token) internal view returns (uint256) {
        uint256 valueInETH = _getTokenValueInETH(token, amount);
        return (valueInETH * POINTS_PER_SWAP) / 1e18;
    }

    function _getTokenValueInETH(address token, uint256 amount) internal view returns (uint256) {
        if (token == address(0)) return amount;
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

    function getPoolInfo(bytes32 poolId) external view returns (Pool memory) {
        return pools[poolId];
    }

    function getUserPoints(address user) external view returns (uint256) {
        return userPoints[user];
    }

    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    receive() external payable {}
}
