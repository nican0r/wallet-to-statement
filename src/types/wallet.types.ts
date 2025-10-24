import { Chain } from './chain.types';

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logo?: string;
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

export const SUPPORTED_TOKENS: Token[] = [
  {
    address: 'ETH',
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
  },
  {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  },
  {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
  },
  {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
  },
  {
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
  },
  {
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    symbol: 'LINK',
    name: 'Chainlink',
    decimals: 18,
  },
  {
    address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    symbol: 'AAVE',
    name: 'Aave',
    decimals: 18,
  },
  {
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    symbol: 'UNI',
    name: 'Uniswap',
    decimals: 18,
  },
];

// Mapping for CoinGecko API
export const TOKEN_COINGECKO_IDS: Record<string, string> = {
  'ETH': 'ethereum',
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 'usd-coin',
  '0xdAC17F958D2ee523a2206206994597C13D831ec7': 'tether',
  '0x6B175474E89094C44Da98b954EedeAC495271d0F': 'dai',
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': 'wrapped-bitcoin',
  '0x514910771AF9Ca656af840dff83E8264EcF986CA': 'chainlink',
  '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9': 'aave',
  '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984': 'uniswap',
};
