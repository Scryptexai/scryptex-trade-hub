// components/WalletModal.tsx
import { useEffect } from "react"
import { useWallet } from "@/hooks/useWallet"

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export const WalletModal = ({ isOpen, onClose }: WalletModalProps) => {
  const { openConnectModal } = useWallet()

  useEffect(() => {
    if (isOpen) {
      openConnectModal()
      // Close the custom modal since Web3Modal will handle everything
      onClose()
    }
  }, [isOpen, openConnectModal, onClose])

  // Web3Modal handles all UI, so we don't render anything
  return null
}

// Alternatif: Jika Anda ingin langsung menggunakan Web3Modal tanpa wrapper
// Anda bisa menggunakan komponen ini:

export const Web3ConnectButton = () => {
  const { isConnected, address, formatAddress, disconnectWallet, openConnectModal } = useWallet()

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-text-muted">
          {formatAddress(address)}
        </span>
        <button
          onClick={disconnectWallet}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={openConnectModal}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
    >
      Connect Wallet
    </button>
  )
}