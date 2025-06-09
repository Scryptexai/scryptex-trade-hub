
import { Request, Response } from 'express';
import { config } from '@/config/environment';
import { CustomError } from '@/middleware/errorHandler';

export class ContractController {
  async getChainContracts(req: Request, res: Response): Promise<void> {
    const { chainId } = req.params;
    const chainIdNum = parseInt(chainId);

    if (!chainIdNum) {
      throw new CustomError('Invalid chain ID', 400);
    }

    let contracts;

    switch (chainIdNum) {
      case config.risechain.chainId:
        contracts = {
          chainId: chainIdNum,
          chainName: 'RiseChain',
          rpcUrl: config.risechain.rpcUrl,
          contracts: config.risechain.contracts
        };
        break;
      case config.megaeth.chainId:
        contracts = {
          chainId: chainIdNum,
          chainName: 'MegaETH',
          rpcUrl: config.megaeth.rpcUrl,
          wsUrl: config.megaeth.wsUrl,
          contracts: config.megaeth.contracts,
          realtimeFeatures: config.megaeth.realtime
        };
        break;
      default:
        throw new CustomError(`Unsupported chain ID: ${chainIdNum}`, 400);
    }

    res.status(200).json({
      success: true,
      data: contracts
    });
  }

  async getContractInfo(req: Request, res: Response): Promise<void> {
    const { chainId, contractType } = req.params;
    const chainIdNum = parseInt(chainId);

    if (!chainIdNum) {
      throw new CustomError('Invalid chain ID', 400);
    }

    let contractAddress;
    let chainConfig;

    switch (chainIdNum) {
      case config.risechain.chainId:
        chainConfig = config.risechain;
        contractAddress = (chainConfig.contracts as any)[contractType];
        break;
      case config.megaeth.chainId:
        chainConfig = config.megaeth;
        contractAddress = (chainConfig.contracts as any)[contractType];
        break;
      default:
        throw new CustomError(`Unsupported chain ID: ${chainIdNum}`, 400);
    }

    if (!contractAddress) {
      throw new CustomError(`Contract type '${contractType}' not found for chain ${chainIdNum}`, 404);
    }

    res.status(200).json({
      success: true,
      data: {
        chainId: chainIdNum,
        contractType,
        address: contractAddress,
        rpcUrl: chainConfig.rpcUrl
      }
    });
  }

  async getContractABI(req: Request, res: Response): Promise<void> {
    const { chainId, contractType } = req.params;
    
    // This would return the actual contract ABI
    // For now, return basic ABIs for common contract types
    const basicABIs: Record<string, any[]> = {
      tokenFactory: [
        "function createToken(string name, string symbol, string description, string logoUrl, uint256 initialPrice, uint256 maxSupply) external payable returns (address)",
        "event TokenCreated(address indexed token, address indexed creator, string name, string symbol)"
      ],
      trading: [
        "function buyTokens(address tokenAddress, uint256 minTokens, uint256 deadline) external payable",
        "function sellTokens(address tokenAddress, uint256 tokenAmount, uint256 minEth, uint256 deadline) external",
        "event TokensPurchased(address indexed buyer, address indexed token, uint256 ethAmount, uint256 tokenAmount)",
        "event TokensSold(address indexed seller, address indexed token, uint256 tokenAmount, uint256 ethAmount)"
      ],
      swapRouter: [
        "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) external returns (uint256[] amounts)",
        "function swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) external payable returns (uint256[] amounts)"
      ],
      bridgeCore: [
        "function initiateBridge(address token, uint256 amount, uint256 destinationChain, address recipient) external payable",
        "event BridgeInitiated(address indexed token, uint256 amount, uint256 indexed destinationChain, address indexed recipient, bytes32 transferId)"
      ]
    };

    const abi = basicABIs[contractType];
    
    if (!abi) {
      throw new CustomError(`ABI not found for contract type: ${contractType}`, 404);
    }

    res.status(200).json({
      success: true,
      data: {
        contractType,
        chainId: parseInt(chainId),
        abi
      }
    });
  }
}
