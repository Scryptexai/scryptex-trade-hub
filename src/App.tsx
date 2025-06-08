
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { Layout } from "@/components/layout/Layout";
import { config } from "@/config/web3";
import Dashboard from "./pages/Dashboard";
import Swap from "./pages/Swap";
import Create from "./pages/Create";
import GM from "./pages/GM";
import Bridge from "./pages/Bridge";
import Trading from "./pages/Trading";
import Airdrop from "./pages/Airdrop";
import Referrals from "./pages/Referrals";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/swap" element={<Swap />} />
              <Route path="/create" element={<Create />} />
              <Route path="/gm" element={<GM />} />
              <Route path="/bridge" element={<Bridge />} />
              <Route path="/trading" element={<Trading />} />
              <Route path="/airdrop" element={<Airdrop />} />
              <Route path="/referrals" element={<Referrals />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/support" element={<Support />} />
              <Route path="/docs" element={<Documentation />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
