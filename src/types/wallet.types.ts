import { Chain } from './chain.types';

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logo?: string;
  coingeckoId: string;
}

export interface TokenBalance {
  token: Token;
  balance: string; // Raw balance as string to handle big numbers
  formattedBalance: number; // Formatted balance as number
  usdValue: number;
  pricePerToken: number;
  chain?: Chain; // Optional chain field for multi-chain support
}

export interface WalletData {
  address: string;
  tokens: Token[];
  openingBalance: TokenBalance[];
  closingBalance: TokenBalance[];
}

// Chain-specific token configurations
export const CHAIN_TOKENS: Record<string, Token[]> = {
  // Ethereum Mainnet
  ethereum: [
    {
      address: 'NATIVE',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      coingeckoId: 'ethereum',
    },
    {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      coingeckoId: 'usd-coin',
    },
    {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      coingeckoId: 'tether',
    },
    {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      coingeckoId: 'dai',
    },
    {
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8,
      coingeckoId: 'wrapped-bitcoin',
    },
    {
      address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      symbol: 'LINK',
      name: 'Chainlink',
      decimals: 18,
      coingeckoId: 'chainlink',
    },
    {
      address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
      symbol: 'AAVE',
      name: 'Aave',
      decimals: 18,
      coingeckoId: 'aave',
    },
    {
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      symbol: 'UNI',
      name: 'Uniswap',
      decimals: 18,
      coingeckoId: 'uniswap',
    },
  ],

  // Polygon
  polygon: [
    {
      address: 'NATIVE',
      symbol: 'MATIC',
      name: 'Polygon',
      decimals: 18,
      coingeckoId: 'matic-network',
    },
    {
      address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      coingeckoId: 'usd-coin',
    },
    {
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      coingeckoId: 'tether',
    },
    {
      address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      coingeckoId: 'dai',
    },
    {
      address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8,
      coingeckoId: 'wrapped-bitcoin',
    },
    {
      address: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
      symbol: 'LINK',
      name: 'Chainlink',
      decimals: 18,
      coingeckoId: 'chainlink',
    },
    {
      address: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
      symbol: 'AAVE',
      name: 'Aave',
      decimals: 18,
      coingeckoId: 'aave',
    },
  ],

  // Arbitrum
  arbitrum: [
    {
      address: 'NATIVE',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      coingeckoId: 'ethereum',
    },
    {
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      coingeckoId: 'usd-coin',
    },
    {
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      coingeckoId: 'tether',
    },
    {
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      coingeckoId: 'dai',
    },
    {
      address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8,
      coingeckoId: 'wrapped-bitcoin',
    },
    {
      address: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
      symbol: 'LINK',
      name: 'Chainlink',
      decimals: 18,
      coingeckoId: 'chainlink',
    },
  ],

  // Optimism
  optimism: [
    {
      address: 'NATIVE',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      coingeckoId: 'ethereum',
    },
    {
      address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      coingeckoId: 'usd-coin',
    },
    {
      address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      coingeckoId: 'tether',
    },
    {
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      coingeckoId: 'dai',
    },
    {
      address: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8,
      coingeckoId: 'wrapped-bitcoin',
    },
    {
      address: '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa87',
      symbol: 'LINK',
      name: 'Chainlink',
      decimals: 18,
      coingeckoId: 'chainlink',
    },
  ],

  // Base
  base: [
    {
      address: 'NATIVE',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      coingeckoId: 'ethereum',
    },
    {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      coingeckoId: 'usd-coin',
    },
    {
      address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      coingeckoId: 'dai',
    },
  ],

  // BNB Chain
  bsc: [
    {
      address: 'NATIVE',
      symbol: 'BNB',
      name: 'BNB',
      decimals: 18,
      coingeckoId: 'binancecoin',
    },
    {
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 18,
      coingeckoId: 'usd-coin',
    },
    {
      address: '0x55d398326f99059fF775485246999027B3197955',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 18,
      coingeckoId: 'tether',
    },
    {
      address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      coingeckoId: 'dai',
    },
  ],

  // Avalanche
  avalanche: [
    {
      address: 'NATIVE',
      symbol: 'AVAX',
      name: 'Avalanche',
      decimals: 18,
      coingeckoId: 'avalanche-2',
    },
    {
      address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      coingeckoId: 'usd-coin',
    },
    {
      address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      coingeckoId: 'tether',
    },
    {
      address: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      coingeckoId: 'dai',
    },
  ],
};

// Legacy support - default to Ethereum tokens
export const SUPPORTED_TOKENS: Token[] = CHAIN_TOKENS.ethereum;

// Helper function to get tokens for a specific chain
export function getTokensForChain(chainId: string): Token[] {
  return CHAIN_TOKENS[chainId] || CHAIN_TOKENS.ethereum;
}

// Helper function to get all unique token symbols across all chains
export function getAllUniqueTokenSymbols(): string[] {
  const symbols = new Set<string>();
  Object.values(CHAIN_TOKENS).forEach(tokens => {
    tokens.forEach(token => symbols.add(token.symbol));
  });
  return Array.from(symbols);
}
