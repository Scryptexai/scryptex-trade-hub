
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize Web3Modal before rendering the app
import './config/web3'

createRoot(document.getElementById("root")!).render(<App />);
