// Tipi per il sistema di Advanced Blockchain & Web3 Integration

export type BlockchainNetwork =
  | 'ethereum'
  | 'polygon'
  | 'binance_smart_chain'
  | 'avalanche'
  | 'arbitrum'
  | 'optimism'
  | 'solana'
  | 'cardano'
  | 'polkadot';

export type TokenStandard = 'ERC20' | 'ERC721' | 'ERC1155' | 'BEP20' | 'SPL' | 'ADA' | 'DOT';

export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'cancelled' | 'reverted';

export type ContractStatus = 'deployed' | 'verified' | 'paused' | 'deprecated' | 'upgrading';

export type WalletType =
  | 'metamask'
  | 'wallet_connect'
  | 'coinbase_wallet'
  | 'trust_wallet'
  | 'ledger'
  | 'trezor'
  | 'phantom'
  | 'solflare';

export type NFTCategory =
  | 'real_estate'
  | 'property_deed'
  | 'rental_agreement'
  | 'investment_certificate'
  | 'membership'
  | 'utility'
  | 'collectible';

export type DeFiProtocol =
  | 'uniswap'
  | 'sushiswap'
  | 'compound'
  | 'aave'
  | 'curve'
  | 'yearn'
  | 'maker_dao'
  | 'pancakeswap';

export type StakingStatus = 'active' | 'pending' | 'unstaking' | 'completed' | 'slashed';

export type GovernanceStatus = 'active' | 'passed' | 'failed' | 'cancelled' | 'executed' | 'queued';

export type AuctionStatus = 'upcoming' | 'active' | 'ended' | 'cancelled' | 'settled';

export type LiquidityPoolStatus = 'active' | 'paused' | 'migrated' | 'deprecated';

export type OracleStatus = 'active' | 'stale' | 'error' | 'updating';

export type CrossChainStatus = 'pending' | 'bridging' | 'completed' | 'failed' | 'refunded';

export interface Wallet {
  id: string;
  address: string;
  type: WalletType;
  network: BlockchainNetwork;

  // Balance info
  nativeBalance: string; // in wei/lamports
  formattedBalance: string; // formatted with decimals
  usdValue: number;

  // Token balances
  tokenBalances: TokenBalance[];

  // NFT holdings
  nfts: NFTHolding[];

  // Connection status
  isConnected: boolean;
  isActive: boolean;

  // Metadata
  ensName?: string;
  avatar?: string;

  // Security
  isMultisig: boolean;
  signers?: string[];

  // Timeline
  connectedAt: Date;
  lastActivityAt: Date;

  // Preferences
  preferences: {
    defaultNetwork: BlockchainNetwork;
    gasSettings: 'slow' | 'standard' | 'fast' | 'custom';
    slippageTolerance: number; // percentage
    autoApprove: boolean;
  };
}

export interface TokenBalance {
  contractAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string; // in smallest unit
  formattedBalance: string;
  usdValue: number;
  logoUri?: string;

  // Token metadata
  standard: TokenStandard;
  network: BlockchainNetwork;

  // Price info
  pricePerToken: number;
  priceChange24h: number;
  marketCap?: number;

  // DeFi info
  isStaked: boolean;
  stakedAmount?: string;
  rewards?: string;

  // Permissions
  allowances: Array<{
    spender: string;
    amount: string;
    spenderName?: string;
  }>;
}

export interface NFTHolding {
  tokenId: string;
  contractAddress: string;
  name: string;
  description?: string;
  image?: string;
  animationUrl?: string;
  externalUrl?: string;

  // Metadata
  attributes: Array<{
    traitType: string;
    value: string | number;
    displayType?: string;
  }>;

  // Collection info
  collectionName: string;
  collectionSlug: string;

  // Ownership
  owner: string;
  tokenStandard: TokenStandard;
  network: BlockchainNetwork;

  // Market data
  floorPrice?: number;
  lastSalePrice?: number;
  estimatedValue?: number;

  // Real estate specific
  category: NFTCategory;
  realEstateData?: RealEstateNFTData;

  // Utility
  isStaked: boolean;
  stakingRewards?: string;
  unlockDate?: Date;

  // Timeline
  mintedAt: Date;
  acquiredAt: Date;
  lastTransferAt: Date;
}

export interface RealEstateNFTData {
  // Property details
  propertyId: string;
  propertyType: 'residential' | 'commercial' | 'industrial' | 'land';
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };

  // Physical attributes
  size: number; // square meters
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  yearBuilt?: number;

  // Valuation
  currentValuation: number;
  lastAppraisal: Date;
  appreciationRate: number; // annual percentage

  // Ownership
  ownershipPercentage: number; // for fractional ownership
  totalShares: number;

  // Legal
  deedHash: string;
  legalDescription: string;
  zoning: string;
  taxId: string;

  // Income
  rentalIncome?: {
    monthlyRent: number;
    occupancyRate: number;
    leaseEndDate?: Date;
  };

  // Documents
  documents: Array<{
    type: 'deed' | 'survey' | 'inspection' | 'insurance' | 'tax_record';
    ipfsHash: string;
    uploadedAt: Date;
  }>;
}

export interface SmartContract {
  id: string;
  address: string;
  name: string;
  description: string;
  network: BlockchainNetwork;

  // Contract info
  abi: any[];
  bytecode?: string;
  sourceCode?: string;

  // Deployment
  deployedAt: Date;
  deployedBy: string;
  deploymentTxHash: string;
  blockNumber: number;

  // Status
  status: ContractStatus;
  isVerified: boolean;
  isProxy: boolean;
  implementationAddress?: string;

  // Functionality
  functions: ContractFunction[];
  events: ContractEvent[];

  // Usage stats
  totalTransactions: number;
  uniqueUsers: number;
  totalValueLocked?: number;

  // Security
  auditReports: Array<{
    auditor: string;
    reportUrl: string;
    auditedAt: Date;
    score: number;
    issues: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      status: 'open' | 'acknowledged' | 'fixed';
    }>;
  }>;

  // Governance
  isGovernanceEnabled: boolean;
  governanceToken?: string;

  // Metadata
  tags: string[];
  category: string;

  // Timeline
  createdAt: Date;
  updatedAt: Date;
  lastInteractionAt: Date;
}

export interface ContractFunction {
  name: string;
  signature: string;
  inputs: Array<{
    name: string;
    type: string;
    description?: string;
  }>;
  outputs: Array<{
    name: string;
    type: string;
    description?: string;
  }>;

  // Properties
  stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable';
  visibility: 'public' | 'external' | 'internal' | 'private';

  // Usage
  callCount: number;
  gasUsage: {
    min: number;
    max: number;
    average: number;
  };

  // Documentation
  description?: string;
  examples?: string[];
}

export interface ContractEvent {
  name: string;
  signature: string;
  inputs: Array<{
    name: string;
    type: string;
    indexed: boolean;
  }>;

  // Usage
  emissionCount: number;
  lastEmittedAt?: Date;

  // Documentation
  description?: string;
}

export interface Transaction {
  id: string;
  hash: string;
  network: BlockchainNetwork;

  // Basic info
  from: string;
  to: string;
  value: string; // in wei
  gasLimit: number;
  gasUsed?: number;
  gasPrice: string; // in wei
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;

  // Status
  status: TransactionStatus;
  blockNumber?: number;
  blockHash?: string;
  transactionIndex?: number;
  confirmations: number;

  // Data
  input?: string;
  logs?: TransactionLog[];

  // Metadata
  type:
    | 'transfer'
    | 'contract_interaction'
    | 'contract_deployment'
    | 'nft_mint'
    | 'nft_transfer'
    | 'defi_swap'
    | 'staking';
  description: string;

  // Decoded data
  decodedInput?: {
    methodName: string;
    parameters: Record<string, any>;
  };

  // Value tracking
  usdValueAtTime: number;
  currentUsdValue: number;

  // Timeline
  submittedAt: Date;
  confirmedAt?: Date;

  // Error handling
  error?: string;
  revertReason?: string;

  // MEV protection
  isMevProtected: boolean;
  flashbotBundle?: string;
}

export interface TransactionLog {
  address: string;
  topics: string[];
  data: string;

  // Decoded
  eventName?: string;
  decodedData?: Record<string, any>;

  // Context
  logIndex: number;
  blockNumber: number;
  transactionHash: string;
}

export interface DeFiPosition {
  id: string;
  protocol: DeFiProtocol;
  network: BlockchainNetwork;
  type: 'lending' | 'borrowing' | 'liquidity_providing' | 'yield_farming' | 'staking';

  // Position details
  asset: string;
  amount: string;
  usdValue: number;

  // Rewards
  rewards: Array<{
    token: string;
    amount: string;
    usdValue: number;
    apr: number;
  }>;

  // Risk metrics
  healthFactor?: number;
  liquidationPrice?: number;
  collateralizationRatio?: number;

  // Performance
  totalEarned: number;
  totalEarnedUsd: number;
  apy: number;
  impermanentLoss?: number;

  // Timeline
  enteredAt: Date;
  lastUpdateAt: Date;

  // Actions available
  canWithdraw: boolean;
  canClaim: boolean;
  canCompound: boolean;

  // Position specific data
  liquidityPoolData?: LiquidityPoolPosition;
  stakingData?: StakingPosition;
  lendingData?: LendingPosition;
}

export interface LiquidityPoolPosition {
  poolAddress: string;
  token0: string;
  token1: string;
  token0Amount: string;
  token1Amount: string;
  lpTokens: string;

  // Pool info
  poolFee: number;
  totalLiquidity: number;
  volume24h: number;

  // Position performance
  feesEarned: {
    token0: string;
    token1: string;
    usdValue: number;
  };
}

export interface StakingPosition {
  validatorAddress?: string;
  delegatedAmount: string;
  rewards: string;

  // Staking details
  stakingPeriod?: number; // in days
  lockEndDate?: Date;
  slashingRisk: number; // percentage

  // Validator info
  validatorInfo?: {
    name: string;
    commission: number;
    uptime: number;
    totalStaked: string;
  };
}

export interface LendingPosition {
  suppliedAssets: Array<{
    asset: string;
    amount: string;
    apy: number;
  }>;

  borrowedAssets: Array<{
    asset: string;
    amount: string;
    apy: number;
  }>;

  // Risk metrics
  borrowLimit: number;
  borrowLimitUsed: number;
  liquidationThreshold: number;
}

export interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  proposer: string;

  // Voting
  votingPower: string;
  votesFor: string;
  votesAgainst: string;
  votesAbstain: string;
  quorum: string;

  // Status
  status: GovernanceStatus;

  // Timeline
  createdAt: Date;
  votingStartsAt: Date;
  votingEndsAt: Date;
  executionEta?: Date;
  executedAt?: Date;

  // Execution
  actions: Array<{
    target: string;
    signature: string;
    calldata: string;
    value: string;
  }>;

  // User interaction
  userVote?: {
    choice: 'for' | 'against' | 'abstain';
    votingPower: string;
    reason?: string;
    votedAt: Date;
  };

  // Metadata
  category: string;
  tags: string[];
  discussionUrl?: string;

  // Impact assessment
  estimatedImpact: {
    financial: number;
    risk: 'low' | 'medium' | 'high';
    affectedUsers: number;
  };
}

export interface NFTMarketplace {
  id: string;
  name: string;
  network: BlockchainNetwork;
  contractAddress: string;

  // Marketplace info
  totalVolume: number;
  totalSales: number;
  activeListings: number;

  // Fees
  marketplaceFee: number; // percentage
  royaltyFee: number; // percentage

  // Supported standards
  supportedStandards: TokenStandard[];

  // Features
  features: {
    auctions: boolean;
    offers: boolean;
    bundles: boolean;
    fractionalOwnership: boolean;
    crossChain: boolean;
  };

  // Statistics
  stats: {
    volume24h: number;
    volume7d: number;
    volume30d: number;
    floorPrice: number;
    averagePrice: number;
    uniqueTraders: number;
  };
}

export interface NFTListing {
  id: string;
  tokenId: string;
  contractAddress: string;
  marketplace: string;

  // Listing details
  seller: string;
  price: string;
  currency: string;

  // Auction details
  isAuction: boolean;
  auctionEndTime?: Date;
  currentBid?: string;
  bidder?: string;
  reservePrice?: string;

  // Status
  status: AuctionStatus;

  // Offers
  offers: Array<{
    bidder: string;
    amount: string;
    currency: string;
    expiresAt: Date;
    status: 'active' | 'accepted' | 'rejected' | 'expired';
  }>;

  // Timeline
  listedAt: Date;
  expiresAt?: Date;
  soldAt?: Date;

  // Metadata
  nftMetadata: NFTHolding;
}

export interface CrossChainBridge {
  id: string;
  name: string;
  sourceNetwork: BlockchainNetwork;
  destinationNetwork: BlockchainNetwork;

  // Bridge info
  contractAddresses: {
    source: string;
    destination: string;
  };

  // Supported assets
  supportedAssets: Array<{
    sourceToken: string;
    destinationToken: string;
    minAmount: string;
    maxAmount: string;
    fee: number; // percentage
  }>;

  // Security
  securityModel: 'validator_set' | 'optimistic' | 'zero_knowledge' | 'federated';
  validators: string[];

  // Performance
  averageBridgeTime: number; // in minutes
  successRate: number; // percentage
  totalVolume: number;

  // Status
  isActive: boolean;
  maintenanceMode: boolean;
}

export interface CrossChainTransaction {
  id: string;
  bridgeId: string;

  // Transaction details
  sourceNetwork: BlockchainNetwork;
  destinationNetwork: BlockchainNetwork;
  asset: string;
  amount: string;

  // Addresses
  sender: string;
  recipient: string;

  // Transaction hashes
  sourceTxHash: string;
  destinationTxHash?: string;

  // Status
  status: CrossChainStatus;

  // Timeline
  initiatedAt: Date;
  completedAt?: Date;
  estimatedCompletionTime: Date;

  // Fees
  bridgeFee: string;
  gasFees: {
    source: string;
    destination?: string;
  };

  // Progress tracking
  confirmations: {
    required: number;
    current: number;
  };

  // Error handling
  error?: string;
  refundTxHash?: string;
}

export interface PriceOracle {
  id: string;
  name: string;
  network: BlockchainNetwork;
  contractAddress: string;

  // Oracle info
  assetPairs: Array<{
    base: string;
    quote: string;
    price: string;
    lastUpdated: Date;
    confidence: number;
  }>;

  // Status
  status: OracleStatus;

  // Performance
  updateFrequency: number; // in seconds
  deviation: number; // percentage from market price
  uptime: number; // percentage

  // Data sources
  dataSources: string[];
  aggregationMethod: 'median' | 'mean' | 'weighted_average';

  // Security
  isDecentralized: boolean;
  nodeCount?: number;

  // Usage
  totalQueries: number;
  subscribedContracts: string[];
}

export interface YieldFarmingPool {
  id: string;
  name: string;
  protocol: DeFiProtocol;
  network: BlockchainNetwork;

  // Pool details
  stakingToken: string;
  rewardTokens: string[];
  totalStaked: string;
  totalRewards: string;

  // APY calculation
  apy: number;
  baseApy: number;
  bonusApy: number;

  // Pool mechanics
  lockPeriod?: number; // in days
  vestingPeriod?: number; // in days
  multipliers: Array<{
    duration: number; // in days
    multiplier: number;
  }>;

  // Status
  status: LiquidityPoolStatus;

  // Timeline
  startDate: Date;
  endDate?: Date;

  // User position
  userPosition?: {
    stakedAmount: string;
    pendingRewards: string;
    lockEndDate?: Date;
    multiplier: number;
  };
}

export interface Web3Analytics {
  // Portfolio metrics
  portfolio: {
    totalValue: number;
    totalValueChange24h: number;
    totalValueChangePercentage: number;

    // Asset breakdown
    assetAllocation: Array<{
      asset: string;
      value: number;
      percentage: number;
      change24h: number;
    }>;

    // Network breakdown
    networkAllocation: Array<{
      network: BlockchainNetwork;
      value: number;
      percentage: number;
    }>;
  };

  // DeFi metrics
  defi: {
    totalDeposited: number;
    totalBorrowed: number;
    netWorth: number;
    totalYieldEarned: number;
    averageApy: number;

    // Protocol breakdown
    protocolBreakdown: Array<{
      protocol: DeFiProtocol;
      value: number;
      apy: number;
      risk: 'low' | 'medium' | 'high';
    }>;

    // Position health
    healthFactor: number;
    liquidationRisk: 'low' | 'medium' | 'high';
  };

  // NFT metrics
  nft: {
    totalValue: number;
    totalCount: number;
    floorValueSum: number;

    // Collection breakdown
    collectionBreakdown: Array<{
      collection: string;
      count: number;
      floorPrice: number;
      totalValue: number;
    }>;

    // Category breakdown
    categoryBreakdown: Array<{
      category: NFTCategory;
      count: number;
      value: number;
    }>;
  };

  // Transaction metrics
  transactions: {
    totalCount: number;
    totalGasSpent: number;
    totalVolume: number;

    // Activity breakdown
    activityBreakdown: Array<{
      type: string;
      count: number;
      volume: number;
    }>;

    // Network usage
    networkUsage: Array<{
      network: BlockchainNetwork;
      transactionCount: number;
      gasSpent: number;
    }>;
  };

  // Performance metrics
  performance: {
    totalReturn: number;
    totalReturnPercentage: number;
    bestPerformingAsset: string;
    worstPerformingAsset: string;

    // Time-based returns
    returns: {
      '24h': number;
      '7d': number;
      '30d': number;
      '90d': number;
      '1y': number;
      all_time: number;
    };
  };

  // Risk metrics
  risk: {
    portfolioRisk: 'low' | 'medium' | 'high';
    concentrationRisk: number;
    liquidityRisk: number;
    smartContractRisk: number;

    // Risk factors
    riskFactors: Array<{
      factor: string;
      impact: 'low' | 'medium' | 'high';
      description: string;
    }>;
  };

  // Timeline
  generatedAt: Date;
  dataAsOf: Date;
}

export interface Web3Security {
  // Wallet security
  walletSecurity: {
    isHardwareWallet: boolean;
    hasMultisig: boolean;
    signerCount?: number;

    // Permission analysis
    tokenApprovals: Array<{
      spender: string;
      spenderName?: string;
      token: string;
      amount: string;
      risk: 'low' | 'medium' | 'high';
      lastUsed?: Date;
    }>;

    // Security score
    securityScore: number; // 0-100
    recommendations: string[];
  };

  // Contract interactions
  contractSecurity: {
    interactedContracts: Array<{
      address: string;
      name?: string;
      isVerified: boolean;
      auditStatus: 'audited' | 'unaudited' | 'unknown';
      riskScore: number;
      lastInteraction: Date;
    }>;

    // Risk assessment
    highRiskContracts: string[];
    unverifiedContracts: string[];
  };

  // Transaction security
  transactionSecurity: {
    suspiciousTransactions: Array<{
      hash: string;
      risk: 'medium' | 'high';
      reason: string;
      timestamp: Date;
    }>;

    // MEV analysis
    mevExposure: number; // percentage of transactions
    frontRunningInstances: number;
    sandwichAttacks: number;
  };

  // Alerts
  securityAlerts: Array<{
    id: string;
    type: 'approval' | 'suspicious_transaction' | 'high_risk_contract' | 'price_manipulation';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    actionRequired: boolean;
    createdAt: Date;
    resolvedAt?: Date;
  }>;
}

export interface Web3Config {
  // Network settings
  networks: Array<{
    chainId: number;
    name: string;
    rpcUrl: string;
    blockExplorerUrl: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    isTestnet: boolean;
  }>;

  // Default settings
  defaultNetwork: BlockchainNetwork;
  defaultSlippage: number;
  defaultGasLimit: number;

  // Feature flags
  features: {
    enableDeFi: boolean;
    enableNFTs: boolean;
    enableGovernance: boolean;
    enableCrossChain: boolean;
    enableAnalytics: boolean;
    enableSecurity: boolean;
  };

  // API keys
  apiKeys: {
    alchemy?: string;
    infura?: string;
    moralis?: string;
    covalent?: string;
    thegraph?: string;
  };

  // Security settings
  security: {
    requireConfirmation: boolean;
    maxTransactionValue: number;
    enableMevProtection: boolean;
    autoRevokeApprovals: boolean;
  };

  // UI preferences
  ui: {
    theme: 'light' | 'dark' | 'auto';
    currency: 'USD' | 'EUR' | 'ETH' | 'BTC';
    showTestnets: boolean;
    showSmallBalances: boolean;
    groupByProtocol: boolean;
  };
}

export interface Web3Stats {
  // Connection stats
  connections: {
    totalWallets: number;
    activeWallets: number;
    networksUsed: number;

    // Wallet breakdown
    walletBreakdown: Record<WalletType, number>;

    // Network breakdown
    networkBreakdown: Record<BlockchainNetwork, number>;
  };

  // Transaction stats
  transactions: {
    total: number;
    successful: number;
    failed: number;
    pending: number;

    // Volume
    totalVolume: number;
    averageValue: number;

    // Gas usage
    totalGasUsed: number;
    totalGasCost: number;
    averageGasPrice: number;
  };

  // DeFi stats
  defi: {
    totalValueLocked: number;
    activePositions: number;
    totalYieldEarned: number;
    averageApy: number;

    // Protocol usage
    protocolUsage: Record<
      DeFiProtocol,
      {
        users: number;
        tvl: number;
        volume: number;
      }
    >;
  };

  // NFT stats
  nft: {
    totalMinted: number;
    totalTraded: number;
    totalVolume: number;
    averagePrice: number;

    // Category breakdown
    categoryStats: Record<
      NFTCategory,
      {
        count: number;
        volume: number;
        averagePrice: number;
      }
    >;
  };

  // Security stats
  security: {
    securityScore: number;
    activeApprovals: number;
    revokedApprovals: number;
    securityAlerts: number;

    // Risk breakdown
    riskBreakdown: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
  };

  // Performance
  performance: {
    averageResponseTime: number;
    successRate: number;
    uptime: number;

    // API performance
    apiPerformance: Record<
      string,
      {
        calls: number;
        averageLatency: number;
        errorRate: number;
      }
    >;
  };

  // Timeline
  generatedAt: Date;
  period: string;
}
