
import { createConfig, http } from 'wagmi'
import { sepolia, mainnet } from 'wagmi/chains'
import { walletConnect, metaMask, injected } from 'wagmi/connectors'

const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID' // Replace with your actual project ID

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    metaMask(),
    walletConnect({ projectId }),
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

export const chains = [
  { id: "sepolia", name: "Sepolia", status: "active" },
  { id: "risechain", name: "RiseChain", status: "active" },
  { id: "megaeth", name: "MegaETH", status: "active" },
  { id: "pharos", name: "Pharos", status: "active" },
];
