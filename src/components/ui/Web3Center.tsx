'use client';

import React, { useState, useEffect } from 'react';

import { web3Service } from '@/lib/web3Service';
import { TeamRole } from '@/types/team';
import {
  Wallet,
  TokenBalance,
  NFTHolding,
  SmartContract,
  Transaction,
  DeFiPosition,
  GovernanceProposal,
  NFTListing,
  CrossChainTransaction,
  YieldFarmingPool,
  Web3Analytics,
  Web3Security,
  Web3Stats,
  BlockchainNetwork,
  WalletType,
  TokenStandard,
  TransactionStatus,
  ContractStatus,
  NFTCategory,
  DeFiProtocol,
  StakingStatus,
  GovernanceStatus,
  AuctionStatus,
  LiquidityPoolStatus,
} from '@/types/web3';

import { Badge } from './Badge';

interface Web3CenterProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: TeamRole;
  currentUserAvatar: string;
}

export default function Web3Center({
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  currentUserRole,
  currentUserAvatar,
}: Web3CenterProps) {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'wallets'
    | 'defi'
    | 'nfts'
    | 'transactions'
    | 'governance'
    | 'security'
    | 'analytics'
  >('overview');

  // Stati per i dati
  const [web3Stats, setWeb3Stats] = useState<Web3Stats | null>(null);
  const [web3Analytics, setWeb3Analytics] = useState<Web3Analytics | null>(null);
  const [web3Security, setWeb3Security] = useState<Web3Security | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [contracts, setContracts] = useState<SmartContract[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [defiPositions, setDefiPositions] = useState<DeFiPosition[]>([]);
  const [governanceProposals, setGovernanceProposals] = useState<GovernanceProposal[]>([]);
  const [nftListings, setNftListings] = useState<NFTListing[]>([]);
  const [yieldFarms, setYieldFarms] = useState<YieldFarmingPool[]>([]);

  // Stati per filtri e ricerca
  const [searchQuery, setSearchQuery] = useState('');
  const [networkFilter, setNetworkFilter] = useState<BlockchainNetwork | ''>('');
  const [walletTypeFilter, setWalletTypeFilter] = useState<WalletType | ''>('');
  const [transactionStatusFilter, setTransactionStatusFilter] = useState<TransactionStatus | ''>(
    ''
  );
  const [defiProtocolFilter, setDefiProtocolFilter] = useState<DeFiProtocol | ''>('');

  // Stati per i modal
  const [showConnectWallet, setShowConnectWallet] = useState(false);
  const [showSendTransaction, setShowSendTransaction] = useState(false);
  const [showSwapTokens, setShowSwapTokens] = useState(false);
  const [showStakeTokens, setShowStakeTokens] = useState(false);
  const [showBridgeTokens, setShowBridgeTokens] = useState(false);
  const [showContractInteraction, setShowContractInteraction] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [selectedContract, setSelectedContract] = useState<SmartContract | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Form states
  const [connectWalletForm, setConnectWalletForm] = useState({
    type: 'metamask' as WalletType,
    network: 'ethereum' as BlockchainNetwork,
  });

  const [sendTransactionForm, setSendTransactionForm] = useState({
    to: '',
    value: '',
    gasLimit: '21000',
  });

  const [swapForm, setSwapForm] = useState({
    fromToken: 'ETH',
    toToken: 'USDC',
    amount: '',
    slippage: '0.5',
  });

  const [stakeForm, setStakeForm] = useState({
    poolId: '',
    amount: '',
    lockPeriod: '30',
  });

  const [bridgeForm, setBridgeForm] = useState({
    bridgeId: 'polygon-bridge',
    asset: 'ETH',
    amount: '',
    destinationAddress: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
      // Refresh data ogni 30 secondi
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadData = () => {
    setWeb3Stats(web3Service.generateWeb3Stats());
    setWeb3Analytics(web3Service.generateWeb3Analytics());
    setWeb3Security(web3Service.generateWeb3Security());
    setWallets(web3Service.getWallets());
    setContracts(web3Service.getContracts());
    setTransactions(web3Service.getTransactions());
    setDefiPositions(web3Service.getDeFiPositions());
    setGovernanceProposals(web3Service.getGovernanceProposals());
    setNftListings(web3Service.getNFTListings());
    setYieldFarms(web3Service.getYieldFarms());
  };

  const handleConnectWallet = async () => {
    try {
      const wallet = await web3Service.connectWallet(
        connectWalletForm.type,
        connectWalletForm.network
      );
      setWallets(prev => [...prev, wallet]);
      setConnectWalletForm({ type: 'metamask', network: 'ethereum' });
      setShowConnectWallet(false);
      console.log('Wallet connesso con successo!', wallet);
    } catch (error) {
      console.error('Errore nella connessione del wallet:', error);
    }
  };

  const handleSendTransaction = async () => {
    if (!selectedWallet) return;

    try {
      const tx = await web3Service.sendTransaction(
        selectedWallet.address,
        sendTransactionForm.to,
        sendTransactionForm.value,
        undefined,
        parseInt(sendTransactionForm.gasLimit)
      );

      setTransactions(prev => [tx, ...prev]);
      setSendTransactionForm({ to: '', value: '', gasLimit: '21000' });
      setShowSendTransaction(false);
      console.log('Transazione inviata con successo!', tx);
    } catch (error) {
      console.error("Errore nell'invio della transazione:", error);
    }
  };

  const handleSwapTokens = async () => {
    try {
      const tx = await web3Service.swapTokens(
        swapForm.fromToken,
        swapForm.toToken,
        swapForm.amount,
        parseFloat(swapForm.slippage)
      );

      setTransactions(prev => [tx, ...prev]);
      setSwapForm({ fromToken: 'ETH', toToken: 'USDC', amount: '', slippage: '0.5' });
      setShowSwapTokens(false);
      console.log('Swap eseguito con successo!', tx);
    } catch (error) {
      console.error('Errore nello swap:', error);
    }
  };

  const handleStakeTokens = async () => {
    try {
      const tx = await web3Service.stakeTokens(
        stakeForm.poolId,
        stakeForm.amount,
        parseInt(stakeForm.lockPeriod)
      );

      setTransactions(prev => [tx, ...prev]);
      setStakeForm({ poolId: '', amount: '', lockPeriod: '30' });
      setShowStakeTokens(false);
      console.log('Staking avviato con successo!', tx);
    } catch (error) {
      console.error('Errore nello staking:', error);
    }
  };

  const handleBridgeTokens = async () => {
    try {
      const bridgeTx = await web3Service.bridgeTokens(
        bridgeForm.bridgeId,
        bridgeForm.asset,
        bridgeForm.amount,
        bridgeForm.destinationAddress
      );

      console.log('Bridge avviato con successo!', bridgeTx);
      setBridgeForm({
        bridgeId: 'polygon-bridge',
        asset: 'ETH',
        amount: '',
        destinationAddress: '',
      });
      setShowBridgeTokens(false);
    } catch (error) {
      console.error('Errore nel bridge:', error);
    }
  };

  const handleVote = async (proposalId: string, choice: 'for' | 'against' | 'abstain') => {
    try {
      const tx = await web3Service.voteOnProposal(
        proposalId,
        choice,
        '50000000000000000000',
        'Vote from Web3 Center'
      );
      setTransactions(prev => [tx, ...prev]);
      loadData(); // Ricarica per aggiornare i proposal
      console.log('Voto registrato con successo!', tx);
    } catch (error) {
      console.error('Errore nel voto:', error);
    }
  };

  const getNetworkColor = (network: BlockchainNetwork) => {
    const colors = {
      ethereum: 'bg-blue-100 text-blue-800',
      polygon: 'bg-purple-100 text-purple-800',
      binance_smart_chain: 'bg-yellow-100 text-yellow-800',
      avalanche: 'bg-red-100 text-red-800',
      arbitrum: 'bg-indigo-100 text-indigo-800',
      optimism: 'bg-pink-100 text-pink-800',
      solana: 'bg-green-100 text-green-800',
      cardano: 'bg-teal-100 text-teal-800',
      polkadot: 'bg-orange-100 text-orange-800',
    };
    return colors[network] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (
    status: TransactionStatus | ContractStatus | GovernanceStatus | AuctionStatus
  ) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      reverted: 'bg-orange-100 text-orange-800',
      deployed: 'bg-green-100 text-green-800',
      verified: 'bg-blue-100 text-blue-800',
      paused: 'bg-yellow-100 text-yellow-800',
      deprecated: 'bg-gray-100 text-gray-800',
      upgrading: 'bg-purple-100 text-purple-800',
      active: 'bg-green-100 text-green-800',
      passed: 'bg-green-100 text-green-800',
      executed: 'bg-blue-100 text-blue-800',
      queued: 'bg-yellow-100 text-yellow-800',
      upcoming: 'bg-gray-100 text-gray-800',
      ended: 'bg-red-100 text-red-800',
      settled: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getWalletTypeIcon = (type: WalletType) => {
    const icons = {
      metamask: '🦊',
      wallet_connect: '🔗',
      coinbase_wallet: '🔵',
      trust_wallet: '🛡️',
      ledger: '📱',
      trezor: '🔐',
      phantom: '👻',
      solflare: '☀️',
    };
    return icons[type] || '💳';
  };

  const getProtocolIcon = (protocol: DeFiProtocol) => {
    const icons = {
      uniswap: '🦄',
      sushiswap: '🍣',
      compound: '🏛️',
      aave: '👻',
      curve: '📈',
      yearn: '🌾',
      maker_dao: '🏦',
      pancakeswap: '🥞',
    };
    return icons[protocol] || '⚡';
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString('it-IT', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTokenAmount = (amount: string, decimals: number = 18, symbol?: string) => {
    const value = parseFloat(amount) / Math.pow(10, decimals);
    return `${formatNumber(value, 4)} ${symbol || ''}`.trim();
  };

  const filteredWallets = wallets.filter(wallet => {
    const matchesQuery =
      searchQuery === '' ||
      wallet.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wallet.ensName && wallet.ensName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = walletTypeFilter === '' || wallet.type === walletTypeFilter;
    const matchesNetwork = networkFilter === '' || wallet.network === networkFilter;

    return matchesQuery && matchesType && matchesNetwork;
  });

  const filteredTransactions = transactions.filter(tx => {
    const matchesQuery =
      searchQuery === '' ||
      tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesNetwork = networkFilter === '' || tx.network === networkFilter;
    const matchesStatus = transactionStatusFilter === '' || tx.status === transactionStatusFilter;

    return matchesQuery && matchesNetwork && matchesStatus;
  });

  const filteredDeFiPositions = defiPositions.filter(position => {
    const matchesProtocol = defiProtocolFilter === '' || position.protocol === defiProtocolFilter;
    const matchesNetwork = networkFilter === '' || position.network === networkFilter;

    return matchesProtocol && matchesNetwork;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <span className="text-indigo-600 text-lg">⛓️</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Web3 & Blockchain Center</h2>
              <p className="text-sm text-gray-500">
                Centro avanzato per gestione Web3 e Blockchain
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Web3 Stats Overview */}
        {web3Stats && (
          <div className="p-6 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Wallet Connessi</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {web3Stats.connections.activeWallets}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">💳</span>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  su {web3Stats.connections.totalWallets} totali
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">TVL DeFi</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(web3Stats.defi.totalValueLocked)}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">⚡</span>
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  {web3Stats.defi.activePositions} posizioni attive
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Transazioni</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {web3Stats.transactions.successful}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600">📊</span>
                  </div>
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  {formatNumber(web3Stats.transactions.successRate)}% successo
                </p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">NFT Minted</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {web3Stats.nft.totalMinted}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600">🎨</span>
                  </div>
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  {formatCurrency(web3Stats.nft.averagePrice)} prezzo medio
                </p>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Security Score</p>
                    <p className="text-2xl font-bold text-red-900">
                      {web3Stats.security.securityScore}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600">🛡️</span>
                  </div>
                </div>
                <p className="text-xs text-red-600 mt-1">
                  {web3Stats.security.securityAlerts} alert attivi
                </p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-600 font-medium">Gas Speso</p>
                    <p className="text-2xl font-bold text-indigo-900">
                      {formatNumber(web3Stats.transactions.totalGasCost, 3)} ETH
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600">⛽</span>
                  </div>
                </div>
                <p className="text-xs text-indigo-600 mt-1">
                  {formatNumber(web3Stats.transactions.averageGasPrice)} Gwei medio
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '🎯', count: 0 },
              { id: 'wallets', label: 'Wallet', icon: '💳', count: wallets.length },
              { id: 'defi', label: 'DeFi', icon: '⚡', count: defiPositions.length },
              {
                id: 'nfts',
                label: 'NFT',
                icon: '🎨',
                count: wallets.reduce((sum, w) => sum + w.nfts.length, 0),
              },
              { id: 'transactions', label: 'Transazioni', icon: '📊', count: transactions.length },
              {
                id: 'governance',
                label: 'Governance',
                icon: '🗳️',
                count: governanceProposals.length,
              },
              {
                id: 'security',
                label: 'Security',
                icon: '🛡️',
                count: web3Security?.securityAlerts.length || 0,
              },
              { id: 'analytics', label: 'Analytics', icon: '📈', count: 0 },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <Badge className="ml-2 bg-indigo-100 text-indigo-800">{tab.count}</Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && web3Analytics && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Portfolio Overview */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Portfolio Overview</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Valore Totale</span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(web3Analytics.portfolio.totalValue)}
                        </span>
                        <div className="flex items-center text-sm">
                          <span
                            className={`${web3Analytics.portfolio.totalValueChangePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {web3Analytics.portfolio.totalValueChangePercentage >= 0 ? '↗' : '↘'}{' '}
                            {formatNumber(
                              Math.abs(web3Analytics.portfolio.totalValueChangePercentage)
                            )}
                            %
                          </span>
                          <span className="text-gray-500 ml-2">24h</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Asset Allocation</h4>
                      {web3Analytics.portfolio.assetAllocation.map(asset => (
                        <div
                          key={asset.asset}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-600">{asset.asset}</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{formatCurrency(asset.value)}</span>
                            <span className="text-gray-500">({asset.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* DeFi Performance */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">DeFi Performance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Net Worth DeFi</span>
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(web3Analytics.defi.netWorth)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Yield Guadagnato</span>
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(web3Analytics.defi.totalYieldEarned)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">APY Medio</span>
                      <span className="text-sm font-medium text-blue-600">
                        {formatNumber(web3Analytics.defi.averageApy)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Health Factor</span>
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${
                            web3Analytics.defi.healthFactor > 2
                              ? 'bg-green-500'
                              : web3Analytics.defi.healthFactor > 1.5
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                        ></div>
                        <span className="text-sm font-medium">
                          {formatNumber(web3Analytics.defi.healthFactor, 2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Network Usage */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Utilizzo Network</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {web3Analytics.portfolio.networkAllocation.map(network => (
                    <div key={network.network} className="text-center p-4 bg-gray-50 rounded-lg">
                      <Badge className={getNetworkColor(network.network)}>{network.network}</Badge>
                      <div className="mt-2">
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(network.value)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {network.percentage}% del portfolio
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Timeline</h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {Object.entries(web3Analytics.performance.returns).map(([period, value]) => (
                    <div key={period} className="text-center">
                      <div className="text-xs text-gray-500 uppercase">{period}</div>
                      <div
                        className={`text-lg font-bold ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {value >= 0 ? '+' : ''}
                        {formatNumber(value)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wallets' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Wallet Web3</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Cerca wallet..."
                  />
                  <select
                    value={walletTypeFilter}
                    onChange={e => setWalletTypeFilter(e.target.value as WalletType | '')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Tutti i tipi</option>
                    <option value="metamask">MetaMask</option>
                    <option value="wallet_connect">WalletConnect</option>
                    <option value="coinbase_wallet">Coinbase Wallet</option>
                    <option value="trust_wallet">Trust Wallet</option>
                  </select>
                  <select
                    value={networkFilter}
                    onChange={e => setNetworkFilter(e.target.value as BlockchainNetwork | '')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Tutte le network</option>
                    <option value="ethereum">Ethereum</option>
                    <option value="polygon">Polygon</option>
                    <option value="binance_smart_chain">BSC</option>
                    <option value="arbitrum">Arbitrum</option>
                  </select>
                  <button
                    onClick={() => setShowConnectWallet(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    ➕ Connetti Wallet
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredWallets.map(wallet => (
                  <div
                    key={wallet.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{getWalletTypeIcon(wallet.type)}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {formatAddress(wallet.address)}
                            </h4>
                            {wallet.ensName && (
                              <p className="text-sm text-indigo-600">{wallet.ensName}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getNetworkColor(wallet.network)}>
                              {wallet.network}
                            </Badge>
                            <div
                              className={`w-3 h-3 rounded-full ${wallet.isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                            ></div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Valore Totale</span>
                            <span className="text-lg font-bold text-gray-900">
                              {formatCurrency(wallet.usdValue)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Native Balance</span>
                            <span className="font-medium">
                              {wallet.formattedBalance}{' '}
                              {wallet.network === 'ethereum' ? 'ETH' : 'MATIC'}
                            </span>
                          </div>
                        </div>

                        {/* Token Balances */}
                        {wallet.tokenBalances.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              Token ({wallet.tokenBalances.length})
                            </h5>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {wallet.tokenBalances.map((token, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span className="text-gray-600">{token.symbol}</span>
                                  <div className="text-right">
                                    <div className="font-medium">{token.formattedBalance}</div>
                                    <div className="text-gray-500">
                                      {formatCurrency(token.usdValue)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* NFTs */}
                        {wallet.nfts.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              NFT ({wallet.nfts.length})
                            </h5>
                            <div className="flex space-x-2">
                              {wallet.nfts.slice(0, 3).map(nft => (
                                <div
                                  key={nft.tokenId}
                                  className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs"
                                >
                                  {nft.image ? (
                                    <img
                                      src={nft.image}
                                      alt={nft.name}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    '🎨'
                                  )}
                                </div>
                              ))}
                              {wallet.nfts.length > 3 && (
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500">
                                  +{wallet.nfts.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedWallet(wallet);
                            setShowSendTransaction(true);
                          }}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          💸 Invia
                        </button>
                        <button
                          onClick={() => setShowSwapTokens(true)}
                          className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          🔄 Swap
                        </button>
                        <button
                          onClick={() => setShowBridgeTokens(true)}
                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          🌉 Bridge
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                      <span>Connesso: {formatDate(wallet.connectedAt)}</span>
                      <span>Ultima attività: {formatDate(wallet.lastActivityAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'defi' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Posizioni DeFi</h3>
                <div className="flex items-center space-x-4">
                  <select
                    value={defiProtocolFilter}
                    onChange={e => setDefiProtocolFilter(e.target.value as DeFiProtocol | '')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Tutti i protocolli</option>
                    <option value="aave">Aave</option>
                    <option value="compound">Compound</option>
                    <option value="uniswap">Uniswap</option>
                    <option value="curve">Curve</option>
                  </select>
                  <select
                    value={networkFilter}
                    onChange={e => setNetworkFilter(e.target.value as BlockchainNetwork | '')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Tutte le network</option>
                    <option value="ethereum">Ethereum</option>
                    <option value="polygon">Polygon</option>
                  </select>
                  <button
                    onClick={() => setShowStakeTokens(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    ⚡ Nuovo Staking
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredDeFiPositions.map(position => (
                  <div
                    key={position.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{getProtocolIcon(position.protocol)}</span>
                          <div>
                            <h4 className="font-medium text-gray-900 capitalize">
                              {position.protocol}
                            </h4>
                            <p className="text-sm text-gray-600 capitalize">{position.type}</p>
                          </div>
                          <Badge className={getNetworkColor(position.network)}>
                            {position.network}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-500">Asset:</span>
                            <span className="ml-2 font-medium">{position.asset}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Valore:</span>
                            <span className="ml-2 font-medium">
                              {formatCurrency(position.usdValue)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">APY:</span>
                            <span className="ml-2 font-medium text-green-600">
                              {formatNumber(position.apy)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Guadagnato:</span>
                            <span className="ml-2 font-medium text-blue-600">
                              {formatCurrency(position.totalEarnedUsd)}
                            </span>
                          </div>
                        </div>

                        {/* Rewards */}
                        {position.rewards.length > 0 && (
                          <div className="mb-4 p-3 bg-green-50 rounded-lg">
                            <h5 className="text-sm font-medium text-green-900 mb-2">
                              Rewards Pending
                            </h5>
                            {position.rewards.map((reward, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-green-700">{reward.token}</span>
                                <div className="text-right">
                                  <div className="font-medium text-green-900">
                                    {formatTokenAmount(reward.amount, 18, reward.token)}
                                  </div>
                                  <div className="text-green-600">
                                    {formatCurrency(reward.usdValue)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Position specific data */}
                        {position.liquidityPoolData && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <h5 className="text-sm font-medium text-blue-900 mb-2">
                              Liquidity Pool
                            </h5>
                            <div className="text-sm text-blue-800">
                              <div>
                                Pool: {position.liquidityPoolData.token0}/
                                {position.liquidityPoolData.token1}
                              </div>
                              <div>Fee: {position.liquidityPoolData.poolFee}%</div>
                              <div>
                                Fees Earned:{' '}
                                {formatCurrency(position.liquidityPoolData.feesEarned.usdValue)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {position.canClaim && (
                          <button className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                            💰 Claim
                          </button>
                        )}
                        {position.canCompound && (
                          <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                            🔄 Compound
                          </button>
                        )}
                        {position.canWithdraw && (
                          <button className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                            📤 Withdraw
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                      <span>Entrato: {formatDate(position.enteredAt)}</span>
                      <span>Aggiornato: {formatDate(position.lastUpdateAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Transazioni Blockchain</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Cerca hash, indirizzo..."
                  />
                  <select
                    value={networkFilter}
                    onChange={e => setNetworkFilter(e.target.value as BlockchainNetwork | '')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Tutte le network</option>
                    <option value="ethereum">Ethereum</option>
                    <option value="polygon">Polygon</option>
                  </select>
                  <select
                    value={transactionStatusFilter}
                    onChange={e =>
                      setTransactionStatusFilter(e.target.value as TransactionStatus | '')
                    }
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Tutti gli stati</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredTransactions.map(tx => (
                  <div
                    key={tx.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedTransaction(tx)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="text-lg">
                            {tx.type === 'transfer' && '💸'}
                            {tx.type === 'contract_interaction' && '📋'}
                            {tx.type === 'nft_mint' && '🎨'}
                            {tx.type === 'nft_transfer' && '🖼️'}
                            {tx.type === 'defi_swap' && '🔄'}
                            {tx.type === 'staking' && '⚡'}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{tx.description}</h4>
                            <p className="text-sm text-gray-600">{formatAddress(tx.hash)}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getNetworkColor(tx.network)}>{tx.network}</Badge>
                            <Badge className={getStatusColor(tx.status)}>{tx.status}</Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Da:</span>
                            <span className="ml-2 font-medium">{formatAddress(tx.from)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">A:</span>
                            <span className="ml-2 font-medium">{formatAddress(tx.to)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Valore:</span>
                            <span className="ml-2 font-medium">
                              {formatCurrency(tx.usdValueAtTime)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Gas:</span>
                            <span className="ml-2 font-medium">
                              {tx.gasUsed?.toLocaleString() || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {tx.decodedInput && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <h5 className="text-sm font-medium text-gray-700 mb-1">
                              Decoded Input
                            </h5>
                            <div className="text-sm text-gray-600">
                              <div>
                                <strong>Method:</strong> {tx.decodedInput.methodName}
                              </div>
                              {Object.entries(tx.decodedInput.parameters).map(([key, value]) => (
                                <div key={key}>
                                  <strong>{key}:</strong> {String(value)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end space-y-2 ml-4">
                        <div className="text-right text-sm">
                          <div className="font-medium">{formatDate(tx.submittedAt)}</div>
                          {tx.confirmations > 0 && (
                            <div className="text-gray-500">{tx.confirmations} conferme</div>
                          )}
                        </div>
                        {tx.isMevProtected && (
                          <Badge className="bg-green-100 text-green-800">🛡️ MEV Protected</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'governance' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Governance & Voting</h3>

              <div className="space-y-6">
                {governanceProposals.map(proposal => (
                  <div
                    key={proposal.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{proposal.title}</h4>
                          <Badge className={getStatusColor(proposal.status)}>
                            {proposal.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{proposal.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-500">Proposer:</span>
                            <span className="ml-2 font-medium">
                              {formatAddress(proposal.proposer)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Categoria:</span>
                            <span className="ml-2 font-medium">{proposal.category}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Quorum:</span>
                            <span className="ml-2 font-medium">
                              {formatTokenAmount(proposal.quorum, 18)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Scadenza:</span>
                            <span className="ml-2 font-medium">
                              {formatDate(proposal.votingEndsAt)}
                            </span>
                          </div>
                        </div>

                        {/* Voting Results */}
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                          <h5 className="text-sm font-medium text-gray-700 mb-3">Risultati Voto</h5>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-green-600">👍 For</span>
                              <span className="font-medium">
                                {formatTokenAmount(proposal.votesFor, 18)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-red-600">👎 Against</span>
                              <span className="font-medium">
                                {formatTokenAmount(proposal.votesAgainst, 18)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">🤷 Abstain</span>
                              <span className="font-medium">
                                {formatTokenAmount(proposal.votesAbstain, 18)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* User Vote */}
                        {proposal.userVote && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-blue-900">
                                Il tuo voto:
                              </span>
                              <Badge className="bg-blue-100 text-blue-800">
                                {proposal.userVote.choice === 'for'
                                  ? '👍 For'
                                  : proposal.userVote.choice === 'against'
                                    ? '👎 Against'
                                    : '🤷 Abstain'}
                              </Badge>
                              <span className="text-sm text-blue-700">
                                {formatTokenAmount(proposal.userVote.votingPower, 18)} voting power
                              </span>
                            </div>
                            {proposal.userVote.reason && (
                              <p className="text-sm text-blue-800 mt-2">
                                "{proposal.userVote.reason}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {proposal.status === 'active' && !proposal.userVote && (
                          <>
                            <button
                              onClick={() => handleVote(proposal.id, 'for')}
                              className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                            >
                              👍 For
                            </button>
                            <button
                              onClick={() => handleVote(proposal.id, 'against')}
                              className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                            >
                              👎 Against
                            </button>
                            <button
                              onClick={() => handleVote(proposal.id, 'abstain')}
                              className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                            >
                              🤷 Abstain
                            </button>
                          </>
                        )}
                        {proposal.discussionUrl && (
                          <a
                            href={proposal.discussionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors text-center"
                          >
                            💬 Discussione
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && web3Security && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Security & Risk Analysis</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Wallet Security */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Wallet Security</h4>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Security Score</span>
                      <div className="flex items-center">
                        <div
                          className={`w-4 h-4 rounded-full mr-2 ${
                            web3Security.walletSecurity.securityScore >= 80
                              ? 'bg-green-500'
                              : web3Security.walletSecurity.securityScore >= 60
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                        ></div>
                        <span className="font-bold text-lg">
                          {web3Security.walletSecurity.securityScore}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Hardware Wallet</span>
                      <span
                        className={
                          web3Security.walletSecurity.isHardwareWallet
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {web3Security.walletSecurity.isHardwareWallet ? '✅ Sì' : '❌ No'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Multi-Signature</span>
                      <span
                        className={
                          web3Security.walletSecurity.hasMultisig
                            ? 'text-green-600'
                            : 'text-yellow-600'
                        }
                      >
                        {web3Security.walletSecurity.hasMultisig
                          ? `✅ ${web3Security.walletSecurity.signerCount} firmatari`
                          : '⚠️ No'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Token Approvals</span>
                      <span className="font-medium">
                        {web3Security.walletSecurity.tokenApprovals.length} attive
                      </span>
                    </div>
                  </div>

                  {web3Security.walletSecurity.recommendations.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <h5 className="text-sm font-medium text-yellow-900 mb-2">Raccomandazioni</h5>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        {web3Security.walletSecurity.recommendations.map((rec, index) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Transaction Security */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Transaction Security</h4>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">MEV Exposure</span>
                      <span className="font-medium">
                        {formatNumber(web3Security.transactionSecurity.mevExposure)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Front-Running</span>
                      <span className="font-medium text-orange-600">
                        {web3Security.transactionSecurity.frontRunningInstances} istanze
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sandwich Attacks</span>
                      <span className="font-medium text-red-600">
                        {web3Security.transactionSecurity.sandwichAttacks} attacchi
                      </span>
                    </div>
                  </div>

                  {web3Security.transactionSecurity.suspiciousTransactions.length > 0 && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <h5 className="text-sm font-medium text-red-900 mb-2">
                        Transazioni Sospette
                      </h5>
                      {web3Security.transactionSecurity.suspiciousTransactions.map((tx, index) => (
                        <div key={index} className="text-sm text-red-800 mb-1">
                          <div className="font-medium">{formatAddress(tx.hash)}</div>
                          <div className="text-red-600">{tx.reason}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Security Alerts */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Security Alerts</h4>

                <div className="space-y-4">
                  {web3Security.securityAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        alert.severity === 'critical'
                          ? 'bg-red-50 border-red-500'
                          : alert.severity === 'high'
                            ? 'bg-orange-50 border-orange-500'
                            : alert.severity === 'medium'
                              ? 'bg-yellow-50 border-yellow-500'
                              : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge
                              className={
                                alert.severity === 'critical'
                                  ? 'bg-red-100 text-red-800'
                                  : alert.severity === 'high'
                                    ? 'bg-orange-100 text-orange-800'
                                    : alert.severity === 'medium'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-blue-100 text-blue-800'
                              }
                            >
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <span className="text-sm font-medium">
                              {alert.type.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                          <div className="text-xs text-gray-500">
                            {formatDate(alert.createdAt)}
                            {alert.resolvedAt && ` • Risolto: ${formatDate(alert.resolvedAt)}`}
                          </div>
                        </div>
                        {alert.actionRequired && !alert.resolvedAt && (
                          <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
                            Azione Richiesta
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && web3Analytics && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Advanced Web3 Analytics</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Risk Analysis */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Risk Analysis</h4>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Portfolio Risk</span>
                      <Badge
                        className={
                          web3Analytics.risk.portfolioRisk === 'low'
                            ? 'bg-green-100 text-green-800'
                            : web3Analytics.risk.portfolioRisk === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }
                      >
                        {web3Analytics.risk.portfolioRisk.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Concentration Risk</span>
                        <span className="font-medium">
                          {formatNumber(web3Analytics.risk.concentrationRisk * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Liquidity Risk</span>
                        <span className="font-medium">
                          {formatNumber(web3Analytics.risk.liquidityRisk * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Smart Contract Risk</span>
                        <span className="font-medium">
                          {formatNumber(web3Analytics.risk.smartContractRisk * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">Risk Factors</h5>
                    {web3Analytics.risk.riskFactors.map((factor, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{factor.factor}</span>
                          <Badge
                            className={
                              factor.impact === 'low'
                                ? 'bg-green-100 text-green-800'
                                : factor.impact === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }
                          >
                            {factor.impact}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mt-1">{factor.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transaction Analytics */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Transaction Analytics</h4>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Volume Totale</span>
                      <span className="font-bold text-lg">
                        {formatCurrency(web3Analytics.transactions.totalVolume)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Gas Totale</span>
                      <span className="font-medium">
                        {formatCurrency(web3Analytics.transactions.totalGasSpent)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Activity Breakdown</h5>
                    {web3Analytics.transactions.activityBreakdown.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600 capitalize">{activity.type}</span>
                        <div className="text-right">
                          <div className="font-medium">{activity.count} tx</div>
                          <div className="text-gray-500">{formatCurrency(activity.volume)}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Network Usage</h5>
                    {web3Analytics.transactions.networkUsage.map((network, index) => (
                      <div key={index} className="flex items-center justify-between text-sm mb-1">
                        <Badge className={getNetworkColor(network.network)}>
                          {network.network}
                        </Badge>
                        <div className="text-right">
                          <div className="font-medium">{network.transactionCount} tx</div>
                          <div className="text-gray-500">
                            {formatNumber(network.gasSpent, 4)} ETH
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Connect Wallet */}
        {showConnectWallet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Connetti Wallet Web3</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo Wallet
                  </label>
                  <select
                    value={connectWalletForm.type}
                    onChange={e =>
                      setConnectWalletForm(prev => ({
                        ...prev,
                        type: e.target.value as WalletType,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="metamask">🦊 MetaMask</option>
                    <option value="wallet_connect">🔗 WalletConnect</option>
                    <option value="coinbase_wallet">🔵 Coinbase Wallet</option>
                    <option value="trust_wallet">🛡️ Trust Wallet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
                  <select
                    value={connectWalletForm.network}
                    onChange={e =>
                      setConnectWalletForm(prev => ({
                        ...prev,
                        network: e.target.value as BlockchainNetwork,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="ethereum">Ethereum</option>
                    <option value="polygon">Polygon</option>
                    <option value="binance_smart_chain">Binance Smart Chain</option>
                    <option value="arbitrum">Arbitrum</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowConnectWallet(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleConnectWallet}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                >
                  Connetti Wallet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Send Transaction */}
        {showSendTransaction && selectedWallet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Invia Transazione</h3>
              <p className="text-sm text-gray-600 mb-4">
                Da: {formatAddress(selectedWallet.address)}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Indirizzo Destinatario
                  </label>
                  <input
                    type="text"
                    value={sendTransactionForm.to}
                    onChange={e =>
                      setSendTransactionForm(prev => ({ ...prev, to: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0x..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valore (in wei)
                  </label>
                  <input
                    type="text"
                    value={sendTransactionForm.value}
                    onChange={e =>
                      setSendTransactionForm(prev => ({ ...prev, value: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="1000000000000000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gas Limit</label>
                  <input
                    type="text"
                    value={sendTransactionForm.gasLimit}
                    onChange={e =>
                      setSendTransactionForm(prev => ({ ...prev, gasLimit: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowSendTransaction(false);
                    setSelectedWallet(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSendTransaction}
                  disabled={!sendTransactionForm.to || !sendTransactionForm.value}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  Invia Transazione
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Swap Tokens */}
        {showSwapTokens && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Swap Token</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Da</label>
                    <select
                      value={swapForm.fromToken}
                      onChange={e => setSwapForm(prev => ({ ...prev, fromToken: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="ETH">ETH</option>
                      <option value="USDC">USDC</option>
                      <option value="WETH">WETH</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">A</label>
                    <select
                      value={swapForm.toToken}
                      onChange={e => setSwapForm(prev => ({ ...prev, toToken: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="USDC">USDC</option>
                      <option value="ETH">ETH</option>
                      <option value="WETH">WETH</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantità</label>
                  <input
                    type="text"
                    value={swapForm.amount}
                    onChange={e => setSwapForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="1.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slippage (%)
                  </label>
                  <input
                    type="text"
                    value={swapForm.slippage}
                    onChange={e => setSwapForm(prev => ({ ...prev, slippage: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSwapTokens(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSwapTokens}
                  disabled={!swapForm.amount}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  🔄 Swap
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
