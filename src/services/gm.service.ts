
import { ethers } from 'ethers';
import { useWallet } from '@/hooks/useWallet';

const GM_CONTRACT_ABI = [
  "function sendGM(string memory message) external payable",
  "function getUserStats(address user) external view returns (uint256 streak, uint256 lastGM, uint256 total)",
  "function getGMHistory(uint256 limit) external view returns (tuple(address user, uint256 timestamp, string message, uint256 chainId)[])",
  "event GMSent(address indexed user, uint256 timestamp, string message, uint256 streak, uint256 chainId)"
];

// Contract addresses for different chains
const GM_CONTRACT_ADDRESSES = {
  11155111: "0x0000000000000000000000000000000000000000", // Sepolia - Replace with actual address
  7569: "0x0000000000000000000000000000000000000000",     // Rise Chain - Replace with actual address
  6342: "0x0000000000000000000000000000000000000000",     // MegaETH - Replace with actual address
  688688: "0x0000000000000000000000000000000000000000",   // Pharos - Replace with actual address
};

export class GMService {
  private getContract(chainId: number, signer?: ethers.Signer) {
    const contractAddress = GM_CONTRACT_ADDRESSES[chainId as keyof typeof GM_CONTRACT_ADDRESSES];
    if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error(`GM contract not deployed on chain ${chainId}`);
    }
    
    if (signer) {
      return new ethers.Contract(contractAddress, GM_CONTRACT_ABI, signer);
    }
    
    // For read-only operations, use a provider
    const provider = new ethers.JsonRpcProvider(this.getRpcUrl(chainId));
    return new ethers.Contract(contractAddress, GM_CONTRACT_ABI, provider);
  }
  
  private getRpcUrl(chainId: number): string {
    const rpcUrls = {
      11155111: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      7569: "https://testnet-rpc.risechain.tech",
      6342: "https://6342.rpc.thirdweb.com",
      688688: "https://testnet.dplabs-internal.com",
    };
    
    return rpcUrls[chainId as keyof typeof rpcUrls] || "";
  }
  
  async sendGM(chainId: number, message: string, signer: ethers.Signer) {
    try {
      const contract = this.getContract(chainId, signer);
      const tx = await contract.sendGM(message, {
        value: ethers.parseEther("0.001") // 0.001 ETH fee
      });
      
      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };
    } catch (error) {
      console.error('Error sending GM:', error);
      throw error;
    }
  }
  
  async getUserStats(chainId: number, userAddress: string) {
    try {
      const contract = this.getContract(chainId);
      const [streak, lastGM, total] = await contract.getUserStats(userAddress);
      
      return {
        streak: Number(streak),
        lastGM: Number(lastGM),
        total: Number(total)
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return { streak: 0, lastGM: 0, total: 0 };
    }
  }
  
  async getGMHistory(chainId: number, limit: number = 10) {
    try {
      const contract = this.getContract(chainId);
      const history = await contract.getGMHistory(limit);
      
      return history.map((record: any) => ({
        user: record.user,
        timestamp: Number(record.timestamp),
        message: record.message,
        chainId: Number(record.chainId)
      }));
    } catch (error) {
      console.error('Error getting GM history:', error);
      return [];
    }
  }
}

export const gmService = new GMService();
