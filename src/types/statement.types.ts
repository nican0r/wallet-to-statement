import { Token, TokenBalance } from './wallet.types';
import { Transaction, TransactionSummary } from './transaction.types';

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
}

export interface StatementData {
  accountHolder: AccountHolder;
  walletAddress: string;
  statementPeriod: StatementPeriod;
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
