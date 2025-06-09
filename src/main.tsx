
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeWeb3Modal } from './config/web3'

// Initialize Web3Modal before rendering the app
initializeWeb3Modal().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
}).catch((error) => {
  console.error('Failed to initialize Web3Modal:', error);
  // Render app anyway as fallback
  createRoot(document.getElementById("root")!).render(<App />);
});
