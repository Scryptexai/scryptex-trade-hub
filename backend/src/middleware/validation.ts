
import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { CustomError } from './errorHandler';
import { VALIDATION_PATTERNS } from '@/utils/constants';

// Validation middleware to handle validation results
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));
    
    throw new CustomError(`Validation failed: ${errorMessages.map(e => e.message).join(', ')}`, 400);
  }
  
  next();
};

// Common validation rules
export const validateWalletAddress = body('walletAddress')
  .matches(VALIDATION_PATTERNS.ETHEREUM_ADDRESS)
  .withMessage('Invalid Ethereum wallet address format');

export const validateTransactionHash = param('txHash')
  .matches(VALIDATION_PATTERNS.TRANSACTION_HASH)
  .withMessage('Invalid transaction hash format');

export const validateTokenAddress = param('address')
  .matches(VALIDATION_PATTERNS.ETHEREUM_ADDRESS)
  .withMessage('Invalid token address format');

export const validateAmount = body('amount')
  .isNumeric()
  .withMessage('Amount must be a number')
  .custom((value) => {
    if (parseFloat(value) <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    return true;
  });

export const validateChainId = body('chainId')
  .isInt({ min: 1 })
  .withMessage('Chain ID must be a positive integer');

// Trading validation
export const validateTradeParams = [
  body('tokenAddress').matches(VALIDATION_PATTERNS.ETHEREUM_ADDRESS).withMessage('Invalid token address'),
  body('ethAmount').optional().isNumeric().withMessage('ETH amount must be numeric'),
  body('tokenAmount').optional().isNumeric().withMessage('Token amount must be numeric'),
  body('minTokens').optional().isNumeric().withMessage('Min tokens must be numeric'),
  body('minEth').optional().isNumeric().withMessage('Min ETH must be numeric'),
  handleValidationErrors
];

// Bridge validation
export const validateBridgeParams = [
  body('token').matches(VALIDATION_PATTERNS.ETHEREUM_ADDRESS).withMessage('Invalid token address'),
  body('amount').isNumeric().withMessage('Amount must be numeric').custom((value) => {
    if (parseFloat(value) <= 0) throw new Error('Amount must be greater than 0');
    return true;
  }),
  body('destinationChain').isInt({ min: 1 }).withMessage('Invalid destination chain'),
  body('recipient').matches(VALIDATION_PATTERNS.ETHEREUM_ADDRESS).withMessage('Invalid recipient address'),
  handleValidationErrors
];

// Token creation validation
export const validateTokenCreation = [
  body('name').isLength({ min: 1, max: 50 }).withMessage('Token name must be 1-50 characters'),
  body('symbol').matches(VALIDATION_PATTERNS.TOKEN_SYMBOL).withMessage('Invalid token symbol format'),
  body('description').isLength({ min: 1, max: 500 }).withMessage('Description must be 1-500 characters'),
  body('logoUrl').optional().isURL().withMessage('Logo URL must be valid'),
  body('initialPrice').isNumeric().withMessage('Initial price must be numeric'),
  handleValidationErrors
];

// Swap validation
export const validateSwapParams = [
  body('tokenIn').matches(VALIDATION_PATTERNS.ETHEREUM_ADDRESS).withMessage('Invalid tokenIn address'),
  body('tokenOut').matches(VALIDATION_PATTERNS.ETHEREUM_ADDRESS).withMessage('Invalid tokenOut address'),
  body('amountIn').isNumeric().withMessage('AmountIn must be numeric'),
  body('minAmountOut').isNumeric().withMessage('MinAmountOut must be numeric'),
  handleValidationErrors
];

// Authentication validation
export const validateWalletSignature = [
  body('walletAddress').matches(VALIDATION_PATTERNS.ETHEREUM_ADDRESS).withMessage('Invalid wallet address'),
  body('signature').isLength({ min: 132, max: 132 }).withMessage('Invalid signature format'),
  body('message').isLength({ min: 1 }).withMessage('Message is required'),
  handleValidationErrors
];

// Pagination validation
export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// User profile validation
export const validateProfileUpdate = [
  body('username').optional().isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must not exceed 500 characters'),
  body('twitterHandle').optional().matches(/^@?[A-Za-z0-9_]{1,15}$/).withMessage('Invalid Twitter handle'),
  body('discordHandle').optional().isLength({ min: 2, max: 32 }).withMessage('Invalid Discord handle'),
  handleValidationErrors
];
