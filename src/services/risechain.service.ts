
import { ethers } from 'ethers';

export class RiseChainService {
  private provider: ethers.JsonRpcProvider;
  private wsProvider: ethers.WebSocketProvider;
  private contracts: Record<string, ethers.Contract> = {};

  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      process.env.RISE_RPC_URL || "https://testnet.rizelabs.xyz"
    );
    
    this.wsProvider = new ethers.WebSocketProvider(
      process.env.RISE_WS_URL || "wss://testnet.rizelabs.xyz"
    );
  }

  async initializeContracts() {
    // Initialize contract instances with proper ABIs
    const bridgeABI = [
      "function bridgeETH(address destinationAddress, uint256 destinationChain) external payable",
      "function bridgeToken(address token, uint256 amount, address destinationAddress, uint256 destinationChain) external"
    ];
    
    const swapABI = [
      "function swap(tuple(address,address,uint256,uint256,address,uint256)) external payable"
    ];
    
    const tradingABI = [
      "function createToken(string,string,string,string,uint256,uint256,uint256) external payable",
      "function getNewTokens() external view returns (address[])",
      "function getTrendingTokens() external view returns (address[])"
    ];

    this.contracts.bridge = new ethers.Contract(
      process.env.RISE_BRIDGE_ADDRESS || "",
      bridgeABI,
      this.provider
    );

    this.contracts.swap = new ethers.Contract(
      process.env.RISE_SWAP_ADDRESS || "",
      swapABI,
      this.provider
    );

    this.contracts.trading = new ethers.Contract(
      process.env.RISE_TRADING_ADDRESS || "",
      tradingABI,
      this.provider
    );
  }

  async getTokenPrices() {
    // Get prices from RiseChain oracles
    const prices = {
      ETH: await this.getOraclePrice("0x7114E2537851e727678DE5a96C8eE5d0Ca14f03D"),
      USDC: await this.getOraclePrice("0x50524C5bDa18aE25C600a8b81449B9CeAeB50471"),
      USDT: await this.getOraclePrice("0x9190159b1bb78482Dca6EBaDf03ab744de0c0197"),
      DAI: await this.getOraclePrice("0xadDAEd879D549E5DBfaf3e35470C20D8C50fDed0")
    };

    return prices;
  }

  private async getOraclePrice(oracleAddress: string): Promise<number> {
    try {
      const oracleContract = new ethers.Contract(
        oracleAddress,
        ["function latest_answer() external view returns (uint256)"],
        this.provider
      );
      
      const price = await oracleContract.latest_answer();
      return parseFloat(ethers.formatUnits(price, 8));
    } catch (error) {
      console.error('Oracle price fetch failed:', error);
      return 0;
    }
  }

  async bridgeAssets(params: {
    token: string;
    amount: string;
    destinationChain: number;
    destinationAddress: string;
  }) {
    const signer = await this.provider.getSigner();
    const contract = this.contracts.bridge.connect(signer) as ethers.Contract;

    if (params.token === 'ETH') {
      return await contract.bridgeETH(
        params.destinationAddress,
        params.destinationChain,
        { value: ethers.parseEther(params.amount) }
      );
    } else {
      return await contract.bridgeToken(
        params.token,
        ethers.parseEther(params.amount),
        params.destinationAddress,
        params.destinationChain
      );
    }
  }

  async createToken(params: {
    name: string;
    symbol: string;
    description: string;
    logoUrl: string;
    initialPrice: string;
    maxSupply: string;
  }) {
    const signer = await this.provider.getSigner();
    const contract = this.contracts.trading.connect(signer) as ethers.Contract;

    return await contract.createToken(
      params.name,
      params.symbol,
      params.description,
      params.logoUrl,
      ethers.parseEther(params.initialPrice),
      ethers.parseEther('0.0001'), // price increment
      ethers.parseEther(params.maxSupply),
      { value: ethers.parseEther('0.15') } // listing fee
    );
  }

  async swapTokens(params: {
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    minAmountOut: string;
    to: string;
    deadline: number;
  }) {
    const signer = await this.provider.getSigner();
    const contract = this.contracts.swap.connect(signer) as ethers.Contract;

    const swapParams = {
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: ethers.parseEther(params.amountIn),
      minAmountOut: ethers.parseEther(params.minAmountOut),
      to: params.to,
      deadline: params.deadline
    };

    if (params.tokenIn === 'ETH') {
      return await contract.swap(swapParams, {
        value: ethers.parseEther(params.amountIn)
      });
    } else {
      return await contract.swap(swapParams);
    }
  }

  async getNewTokens() {
    return await this.contracts.trading.getNewTokens();
  }

  async getTrendingTokens() {
    return await this.contracts.trading.getTrendingTokens();
  }

  subscribeToEvents(callback: (event: any) => void) {
    // Subscribe to bridge events
    this.contracts.bridge.on('BridgeInitiated', callback);
    this.contracts.bridge.on('BridgeValidated', callback);
    this.contracts.bridge.on('BridgeExecuted', callback);

    // Subscribe to trading events
    this.contracts.trading.on('TokenCreated', callback);
    this.contracts.trading.on('TokenTraded', callback);
    this.contracts.trading.on('TokenListed', callback);
  }

  async getNetworkStats() {
    const latestBlock = await this.provider.getBlockNumber();
    const block = await this.provider.getBlock(latestBlock);
    
    return {
      blockNumber: latestBlock,
      blockTime: 3, // 3 seconds
      gasPrice: await this.provider.getFeeData(),
      timestamp: block?.timestamp || 0
    };
  }
}
