
import { Router } from 'express';
import { config } from '@/config/environment';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Scryptex Multi-Chain DEX API is healthy',
    timestamp: new Date().toISOString(),
    version: config.apiVersion,
    environment: config.nodeEnv,
    chains: {
      risechain: {
        chainId: config.risechain.chainId,
        rpcUrl: config.risechain.rpcUrl,
        contracts: {
          trading: config.risechain.contracts.trading,
          bridge: config.risechain.contracts.bridgeCore,
          points: config.risechain.contracts.pointsModule
        }
      },
      megaeth: {
        chainId: config.megaeth.chainId,
        rpcUrl: config.megaeth.rpcUrl,
        realtimeEnabled: config.megaeth.realtime.enabled,
        contracts: {
          trading: config.megaeth.contracts.trading,
          bridge: config.megaeth.contracts.bridgeCore,
          points: config.megaeth.contracts.pointsModule
        }
      }
    },
    features: {
      tokenCreation: true,
      pumpFunMechanism: true,
      realtimeTrading: true,
      crossChainBridge: true,
      pointsSystem: true,
      dexAggregation: true,
      validatorIntegration: true
    }
  });
});

router.get('/contracts', (req, res) => {
  res.json({
    success: true,
    contracts: {
      risechain: config.risechain.contracts,
      megaeth: config.megaeth.contracts
    }
  });
});

export default router;
