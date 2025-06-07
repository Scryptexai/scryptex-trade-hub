
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OrderBookManager is ReentrancyGuard, Ownable {
    struct Order {
        uint256 orderId;
        address trader;
        address token;
        uint256 amount;
        uint256 price;
        uint256 filled;
        uint256 timestamp;
        uint256 expiration;
        OrderType orderType;
        OrderSide side;
        OrderStatus status;
        TimeInForce timeInForce;
    }

    struct OrderBook {
        uint256[] buyOrders;
        uint256[] sellOrders;
        mapping(uint256 => uint256) orderIndex;
        uint256 totalBuyVolume;
        uint256 totalSellVolume;
        uint256 lastPrice;
        uint256 lastUpdate;
    }

    enum OrderType { Market, Limit, Stop, StopLimit }
    enum OrderSide { Buy, Sell }
    enum OrderStatus { Open, PartiallyFilled, Filled, Cancelled, Expired }
    enum TimeInForce { GTC, IOC, FOK, GTD }

    mapping(uint256 => Order) public orders;
    mapping(address => OrderBook) public orderBooks;
    mapping(address => uint256[]) public userOrders;
    mapping(address => mapping(address => uint256)) public userBalances;

    uint256 public nextOrderId = 1;
    uint256 public constant MAX_ORDERS_PER_USER = 100;
    uint256 public constant MIN_ORDER_SIZE = 1e15; // 0.001 ETH
    uint256 public constant MAX_PRICE_SLIPPAGE = 1000; // 10%

    address public tradingEngine;

    event OrderCreated(uint256 indexed orderId, address indexed trader, address indexed token);
    event OrderMatched(uint256 indexed buyOrderId, uint256 indexed sellOrderId, uint256 amount, uint256 price);
    event OrderCancelled(uint256 indexed orderId, address indexed trader);
    event OrderExpired(uint256 indexed orderId);

    modifier onlyTradingEngine() {
        require(msg.sender == tradingEngine, "Only trading engine");
        _;
    }

    modifier validOrder(uint256 orderId) {
        require(orders[orderId].trader != address(0), "Order not found");
        _;
    }

    constructor(address _tradingEngine) {
        tradingEngine = _tradingEngine;
    }

    function createLimitOrder(
        address token,
        uint256 amount,
        uint256 price,
        OrderSide side,
        TimeInForce timeInForce,
        uint256 expiration
    ) external nonReentrant returns (uint256 orderId) {
        require(amount >= MIN_ORDER_SIZE, "Order too small");
        require(price > 0, "Invalid price");
        require(userOrders[msg.sender].length < MAX_ORDERS_PER_USER, "Too many orders");

        if (timeInForce == TimeInForce.GTD) {
            require(expiration > block.timestamp, "Invalid expiration");
        }

        orderId = nextOrderId++;

        orders[orderId] = Order({
            orderId: orderId,
            trader: msg.sender,
            token: token,
            amount: amount,
            price: price,
            filled: 0,
            timestamp: block.timestamp,
            expiration: expiration,
            orderType: OrderType.Limit,
            side: side,
            status: OrderStatus.Open,
            timeInForce: timeInForce
        });

        // Reserve funds
        if (side == OrderSide.Buy) {
            _reserveFunds(msg.sender, address(0), amount * price / 1e18);
        } else {
            _reserveFunds(msg.sender, token, amount);
        }

        // Add to order book
        _addToOrderBook(token, orderId);

        // Try to match immediately
        _tryMatchOrder(orderId);

        emit OrderCreated(orderId, msg.sender, token);
        return orderId;
    }

    function createMarketOrder(
        address token,
        uint256 amount,
        OrderSide side
    ) external nonReentrant returns (uint256 orderId) {
        require(amount >= MIN_ORDER_SIZE, "Order too small");

        orderId = nextOrderId++;

        orders[orderId] = Order({
            orderId: orderId,
            trader: msg.sender,
            token: token,
            amount: amount,
            price: 0, // Market price
            filled: 0,
            timestamp: block.timestamp,
            expiration: 0,
            orderType: OrderType.Market,
            side: side,
            status: OrderStatus.Open,
            timeInForce: TimeInForce.IOC
        });

        // Execute market order immediately
        _executeMarketOrder(orderId);

        emit OrderCreated(orderId, msg.sender, token);
        return orderId;
    }

    function cancelOrder(uint256 orderId) external nonReentrant validOrder(orderId) {
        Order storage order = orders[orderId];
        require(order.trader == msg.sender, "Not your order");
        require(order.status == OrderStatus.Open || order.status == OrderStatus.PartiallyFilled, "Cannot cancel");

        order.status = OrderStatus.Cancelled;

        // Release reserved funds
        uint256 unfilledAmount = order.amount - order.filled;
        if (order.side == OrderSide.Buy) {
            _releaseFunds(msg.sender, address(0), unfilledAmount * order.price / 1e18);
        } else {
            _releaseFunds(msg.sender, order.token, unfilledAmount);
        }

        // Remove from order book
        _removeFromOrderBook(order.token, orderId);

        emit OrderCancelled(orderId, msg.sender);
    }

    function _addToOrderBook(address token, uint256 orderId) internal {
        Order memory order = orders[orderId];
        OrderBook storage book = orderBooks[token];

        if (order.side == OrderSide.Buy) {
            book.buyOrders.push(orderId);
            book.totalBuyVolume += order.amount;
            _sortBuyOrders(token);
        } else {
            book.sellOrders.push(orderId);
            book.totalSellVolume += order.amount;
            _sortSellOrders(token);
        }

        book.orderIndex[orderId] = order.side == OrderSide.Buy ? 
            book.buyOrders.length - 1 : book.sellOrders.length - 1;
        book.lastUpdate = block.timestamp;

        userOrders[order.trader].push(orderId);
    }

    function _removeFromOrderBook(address token, uint256 orderId) internal {
        Order memory order = orders[orderId];
        OrderBook storage book = orderBooks[token];
        
        if (order.side == OrderSide.Buy) {
            _removeFromArray(book.buyOrders, orderId);
            book.totalBuyVolume -= (order.amount - order.filled);
        } else {
            _removeFromArray(book.sellOrders, orderId);
            book.totalSellVolume -= (order.amount - order.filled);
        }

        delete book.orderIndex[orderId];
    }

    function _tryMatchOrder(uint256 orderId) internal {
        Order storage order = orders[orderId];
        OrderBook storage book = orderBooks[order.token];

        if (order.side == OrderSide.Buy) {
            _matchBuyOrder(orderId, book.sellOrders);
        } else {
            _matchSellOrder(orderId, book.buyOrders);
        }

        // Handle different time in force rules
        if (order.timeInForce == TimeInForce.IOC && order.filled < order.amount) {
            order.status = OrderStatus.Cancelled;
            _removeFromOrderBook(order.token, orderId);
        } else if (order.timeInForce == TimeInForce.FOK && order.filled != order.amount) {
            order.status = OrderStatus.Cancelled;
            _removeFromOrderBook(order.token, orderId);
        }
    }

    function _matchBuyOrder(uint256 buyOrderId, uint256[] storage sellOrders) internal {
        Order storage buyOrder = orders[buyOrderId];
        
        for (uint256 i = 0; i < sellOrders.length && buyOrder.filled < buyOrder.amount; i++) {
            uint256 sellOrderId = sellOrders[i];
            Order storage sellOrder = orders[sellOrderId];
            
            if (sellOrder.status != OrderStatus.Open && sellOrder.status != OrderStatus.PartiallyFilled) {
                continue;
            }
            
            if (buyOrder.price >= sellOrder.price) {
                uint256 matchAmount = _min(
                    buyOrder.amount - buyOrder.filled,
                    sellOrder.amount - sellOrder.filled
                );
                
                _executeMatch(buyOrderId, sellOrderId, matchAmount, sellOrder.price);
            }
        }
    }

    function _matchSellOrder(uint256 sellOrderId, uint256[] storage buyOrders) internal {
        Order storage sellOrder = orders[sellOrderId];
        
        for (uint256 i = 0; i < buyOrders.length && sellOrder.filled < sellOrder.amount; i++) {
            uint256 buyOrderId = buyOrders[i];
            Order storage buyOrder = orders[buyOrderId];
            
            if (buyOrder.status != OrderStatus.Open && buyOrder.status != OrderStatus.PartiallyFilled) {
                continue;
            }
            
            if (buyOrder.price >= sellOrder.price) {
                uint256 matchAmount = _min(
                    sellOrder.amount - sellOrder.filled,
                    buyOrder.amount - buyOrder.filled
                );
                
                _executeMatch(buyOrderId, sellOrderId, matchAmount, sellOrder.price);
            }
        }
    }

    function _executeMatch(
        uint256 buyOrderId,
        uint256 sellOrderId,
        uint256 amount,
        uint256 price
    ) internal {
        Order storage buyOrder = orders[buyOrderId];
        Order storage sellOrder = orders[sellOrderId];

        buyOrder.filled += amount;
        sellOrder.filled += amount;

        // Update order status
        if (buyOrder.filled == buyOrder.amount) {
            buyOrder.status = OrderStatus.Filled;
        } else {
            buyOrder.status = OrderStatus.PartiallyFilled;
        }

        if (sellOrder.filled == sellOrder.amount) {
            sellOrder.status = OrderStatus.Filled;
        } else {
            sellOrder.status = OrderStatus.PartiallyFilled;
        }

        // Execute trade
        uint256 ethAmount = amount * price / 1e18;
        _transferFunds(buyOrder.trader, sellOrder.trader, buyOrder.token, amount, ethAmount);

        // Update order book
        orderBooks[buyOrder.token].lastPrice = price;

        emit OrderMatched(buyOrderId, sellOrderId, amount, price);
    }

    function _executeMarketOrder(uint256 orderId) internal {
        Order storage order = orders[orderId];
        OrderBook storage book = orderBooks[order.token];

        if (order.side == OrderSide.Buy) {
            _matchBuyOrder(orderId, book.sellOrders);
        } else {
            _matchSellOrder(orderId, book.buyOrders);
        }

        // Mark remaining as cancelled for market orders
        if (order.filled < order.amount) {
            order.status = OrderStatus.Cancelled;
        }
    }

    function _reserveFunds(address user, address token, uint256 amount) internal {
        if (token == address(0)) {
            // Reserve ETH
            require(msg.value >= amount, "Insufficient ETH");
            userBalances[user][token] += amount;
        } else {
            // Reserve tokens
            require(IERC20(token).transferFrom(user, address(this), amount), "Transfer failed");
            userBalances[user][token] += amount;
        }
    }

    function _releaseFunds(address user, address token, uint256 amount) internal {
        require(userBalances[user][token] >= amount, "Insufficient balance");
        userBalances[user][token] -= amount;

        if (token == address(0)) {
            payable(user).transfer(amount);
        } else {
            require(IERC20(token).transfer(user, amount), "Transfer failed");
        }
    }

    function _transferFunds(
        address buyer,
        address seller,
        address token,
        uint256 tokenAmount,
        uint256 ethAmount
    ) internal {
        // Transfer tokens from seller to buyer
        userBalances[seller][token] -= tokenAmount;
        require(IERC20(token).transfer(buyer, tokenAmount), "Token transfer failed");

        // Transfer ETH from buyer to seller
        userBalances[buyer][address(0)] -= ethAmount;
        payable(seller).transfer(ethAmount);
    }

    function _sortBuyOrders(address token) internal {
        // Sort buy orders by price (highest first)
        uint256[] storage orders = orderBooks[token].buyOrders;
        _quickSort(orders, 0, int256(orders.length - 1), true);
    }

    function _sortSellOrders(address token) internal {
        // Sort sell orders by price (lowest first)
        uint256[] storage orders = orderBooks[token].sellOrders;
        _quickSort(orders, 0, int256(orders.length - 1), false);
    }

    function _quickSort(uint256[] storage arr, int256 left, int256 right, bool descending) internal {
        if (left < right) {
            int256 pivotIndex = _partition(arr, left, right, descending);
            _quickSort(arr, left, pivotIndex - 1, descending);
            _quickSort(arr, pivotIndex + 1, right, descending);
        }
    }

    function _partition(uint256[] storage arr, int256 left, int256 right, bool descending) internal returns (int256) {
        uint256 pivot = orders[arr[uint256(right)]].price;
        int256 i = left - 1;

        for (int256 j = left; j < right; j++) {
            uint256 price = orders[arr[uint256(j)]].price;
            bool condition = descending ? price >= pivot : price <= pivot;
            
            if (condition) {
                i++;
                (arr[uint256(i)], arr[uint256(j)]) = (arr[uint256(j)], arr[uint256(i)]);
            }
        }
        
        (arr[uint256(i + 1)], arr[uint256(right)]) = (arr[uint256(right)], arr[uint256(i + 1)]);
        return i + 1;
    }

    function _removeFromArray(uint256[] storage array, uint256 value) internal {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == value) {
                array[i] = array[array.length - 1];
                array.pop();
                break;
            }
        }
    }

    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    // View functions
    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

    function getOrderBook(address token) external view returns (uint256[] memory buyOrders, uint256[] memory sellOrders) {
        OrderBook storage book = orderBooks[token];
        return (book.buyOrders, book.sellOrders);
    }

    function getUserOrders(address user) external view returns (uint256[] memory) {
        return userOrders[user];
    }

    function getMarketDepth(address token, uint256 levels) external view returns (
        uint256[] memory buyPrices,
        uint256[] memory buyVolumes,
        uint256[] memory sellPrices,
        uint256[] memory sellVolumes
    ) {
        OrderBook storage book = orderBooks[token];
        
        uint256 buyLevels = _min(levels, book.buyOrders.length);
        uint256 sellLevels = _min(levels, book.sellOrders.length);
        
        buyPrices = new uint256[](buyLevels);
        buyVolumes = new uint256[](buyLevels);
        sellPrices = new uint256[](sellLevels);
        sellVolumes = new uint256[](sellLevels);
        
        for (uint256 i = 0; i < buyLevels; i++) {
            Order storage order = orders[book.buyOrders[i]];
            buyPrices[i] = order.price;
            buyVolumes[i] = order.amount - order.filled;
        }
        
        for (uint256 i = 0; i < sellLevels; i++) {
            Order storage order = orders[book.sellOrders[i]];
            sellPrices[i] = order.price;
            sellVolumes[i] = order.amount - order.filled;
        }
    }

    // Admin functions
    function setTradingEngine(address _tradingEngine) external onlyOwner {
        tradingEngine = _tradingEngine;
    }

    function cleanupExpiredOrders(address token) external {
        OrderBook storage book = orderBooks[token];
        
        _cleanupExpiredOrdersArray(book.buyOrders);
        _cleanupExpiredOrdersArray(book.sellOrders);
    }

    function _cleanupExpiredOrdersArray(uint256[] storage orderArray) internal {
        for (uint256 i = orderArray.length; i > 0; i--) {
            uint256 orderId = orderArray[i - 1];
            Order storage order = orders[orderId];
            
            if (order.expiration > 0 && block.timestamp >= order.expiration) {
                order.status = OrderStatus.Expired;
                
                // Release reserved funds
                uint256 unfilledAmount = order.amount - order.filled;
                if (order.side == OrderSide.Buy) {
                    _releaseFunds(order.trader, address(0), unfilledAmount * order.price / 1e18);
                } else {
                    _releaseFunds(order.trader, order.token, unfilledAmount);
                }
                
                // Remove from array
                orderArray[i - 1] = orderArray[orderArray.length - 1];
                orderArray.pop();
                
                emit OrderExpired(orderId);
            }
        }
    }

    receive() external payable {}
}
