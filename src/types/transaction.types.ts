import { Token } from './wallet.types';
import { Chain } from './chain.types';

export type TransactionType = 'credit' | 'debit' | 'unrealized_gain' | 'unrealized_loss';

export interface Transaction {
  hash: string;
  blockNum: string;
  timestamp: Date;
  from: string;
  to: string;
  value: string; // Raw value
  formattedValue: number; // Formatted value
  token: Token;
  chain: Chain;
  type: TransactionType; // credit (incoming), debit (outgoing), unrealized_gain, or unrealized_loss
  usdValue: number;
  pricePerToken: number;
  runningBalance: number; // Running balance after this transaction in USD
  isUnrealized?: boolean; // Flag to indicate if this is an unrealized gain/loss
}

export interface AlchemyAssetTransfer {
  blockNum: string;
  hash: string;
  from: string;
  to: string | null;
  value: number | null;
  erc721TokenId: string | null;
  erc1155Metadata: any | null;
  tokenId: string | null;
  asset: string | null;
  category: string;
  rawContract: {
    value: string | null;
    address: string | null;
    decimal: string | null;
  };
  metadata: {
    blockTimestamp: string;
  };
}

export interface AlchemyAssetTransfersResponse {
  jsonrpc: string;
  id: number;
  result: {
    transfers: AlchemyAssetTransfer[];
    pageKey?: string;
  };
}

export interface TransactionSummary {
  totalDeposits: number;
  totalWithdrawals: number;
  transactionCount: number;
  netChange: number;
}
