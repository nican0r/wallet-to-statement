export interface Chain {
  id: string;
  name: string;
  symbol: string;
  alchemyNetwork: string;
  explorerUrl: string;
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
    isDefault: true,
    color: '#627EEA',
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    alchemyNetwork: 'polygon-mainnet',
    explorerUrl: 'https://polygonscan.com',
    isDefault: true,
    color: '#8247E5',
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ARB',
    alchemyNetwork: 'arb-mainnet',
    explorerUrl: 'https://arbiscan.io',
    isDefault: true,
    color: '#28A0F0',
  },
  {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'OP',
    alchemyNetwork: 'opt-mainnet',
    explorerUrl: 'https://optimistic.etherscan.io',
    isDefault: true,
    color: '#FF0420',
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'BASE',
    alchemyNetwork: 'base-mainnet',
    explorerUrl: 'https://basescan.org',
    isDefault: true,
    color: '#0052FF',
  },
  {
    id: 'bsc',
    name: 'BNB Chain',
    symbol: 'BNB',
    alchemyNetwork: 'bnb-mainnet',
    explorerUrl: 'https://bscscan.com',
    isDefault: false,
    color: '#F3BA2F',
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    alchemyNetwork: 'avax-mainnet',
    explorerUrl: 'https://snowtrace.io',
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
