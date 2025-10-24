import { Token, TokenBalance } from './wallet.types';
import { Transaction, TransactionSummary } from './transaction.types';
import { Chain } from './chain.types';

export interface AccountHolder {
  name: string;
  address: string;
}

export interface StatementPeriod {
  startDate: Date;
  endDate: Date;
}

export interface StatementFormData {
  accountHolder: AccountHolder;
  walletAddress: string;
  statementPeriod: StatementPeriod;
  selectedTokens: Token[];
  selectedChains: Chain[];
}

export interface StatementData {
  accountHolder: AccountHolder;
  walletAddress: string;
  statementPeriod: StatementPeriod;
  chains: Chain[];
  tokens: Token[];
  openingBalance: {
    tokens: TokenBalance[];
    totalUsdValue: number;
  };
  closingBalance: {
    tokens: TokenBalance[];
    totalUsdValue: number;
  };
  transactions: Transaction[];
  summary: TransactionSummary;
  generatedAt: Date;
}

export interface BlockInfo {
  blockNumber: number;
  timestamp: number;
}
