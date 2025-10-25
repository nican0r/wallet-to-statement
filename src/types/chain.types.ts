export interface Chain {
  id: string;
  name: string;
  symbol: string;
  alchemyNetwork: string;
  explorerUrl: string;
  chainId: number; // Etherscan API v2 chain ID
  isDefault: boolean;
  color: string;
}

export const SUPPORTED_CHAINS: Chain[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    alchemyNetwork: 'eth-mainnet',
    explorerUrl: 'https://etherscan.io',
    chainId: 1,
    isDefault: true,
    color: '#627EEA',
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    alchemyNetwork: 'polygon-mainnet',
    explorerUrl: 'https://polygonscan.com',
    chainId: 137,
    isDefault: true,
    color: '#8247E5',
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ARB',
    alchemyNetwork: 'arb-mainnet',
    explorerUrl: 'https://arbiscan.io',
    chainId: 42161,
    isDefault: true,
    color: '#28A0F0',
  },
  {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'OP',
    alchemyNetwork: 'opt-mainnet',
    explorerUrl: 'https://optimistic.etherscan.io',
    chainId: 10,
    isDefault: true,
    color: '#FF0420',
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'BASE',
    alchemyNetwork: 'base-mainnet',
    explorerUrl: 'https://basescan.org',
    chainId: 8453,
    isDefault: true,
    color: '#0052FF',
  },
  {
    id: 'bsc',
    name: 'BNB Chain',
    symbol: 'BNB',
    alchemyNetwork: 'bnb-mainnet',
    explorerUrl: 'https://bscscan.com',
    chainId: 56,
    isDefault: false,
    color: '#F3BA2F',
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    alchemyNetwork: 'avax-mainnet',
    explorerUrl: 'https://snowtrace.io',
    chainId: 43114,
    isDefault: false,
    color: '#E84142',
  },
];

export const DEFAULT_CHAINS = SUPPORTED_CHAINS.filter(chain => chain.isDefault);

export function getChainById(id: string): Chain | undefined {
  return SUPPORTED_CHAINS.find(chain => chain.id === id);
}

export function getAlchemyUrl(chainId: string, apiKey: string): string {
  const chain = getChainById(chainId);
  if (!chain) {
    throw new Error(`Unsupported chain: ${chainId}`);
  }
  return `https://${chain.alchemyNetwork}.g.alchemy.com/v2/${apiKey}`;
}

// Etherscan API v2 constants
export const ETHERSCAN_API_V2_BASE_URL = 'https://api.etherscan.io/v2/api';

export function getEtherscanApiKey(): string {
  return import.meta.env.VITE_ETHERSCAN_API_KEY || '';
}
