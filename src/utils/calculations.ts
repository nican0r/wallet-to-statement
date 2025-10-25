import { Transaction, TransactionSummary } from '../types/transaction.types';

export function calculateRunningBalances(
  transactions: Transaction[],
  openingBalanceUsd: number
): Transaction[] {
  let runningBalance = openingBalanceUsd;

  return transactions.map((tx) => {
    if (tx.type === 'credit' || tx.type === 'unrealized_gain') {
      runningBalance += tx.usdValue;
    } else if (tx.type === 'debit' || tx.type === 'unrealized_loss') {
      runningBalance -= tx.usdValue;
    }

    return {
      ...tx,
      runningBalance,
    };
  });
}

export function calculateTransactionSummary(
  transactions: Transaction[],
  openingBalanceUsd: number,
  closingBalanceUsd: number
): TransactionSummary {
  // Deposits include actual credits AND unrealized gains
  const totalDeposits = transactions
    .filter((tx) => tx.type === 'credit' || tx.type === 'unrealized_gain')
    .reduce((sum, tx) => sum + tx.usdValue, 0);

  // Withdrawals include actual debits AND unrealized losses
  const totalWithdrawals = transactions
    .filter((tx) => tx.type === 'debit' || tx.type === 'unrealized_loss')
    .reduce((sum, tx) => sum + tx.usdValue, 0);

  const netChange = closingBalanceUsd - openingBalanceUsd;

  // Count only real transactions (exclude unrealized)
  const realTransactionCount = transactions.filter((tx) => !tx.isUnrealized).length;

  return {
    totalDeposits,
    totalWithdrawals,
    transactionCount: realTransactionCount,
    netChange,
  };
}

export function dateToTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

export function timestampToDate(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

// Approximate block number from timestamp
// Ethereum blocks are roughly 12 seconds apart
export function estimateBlockFromTimestamp(timestamp: number): number {
  // Genesis block timestamp: 1438269973 (Jul 30, 2015)
  // Genesis block number: 0
  const GENESIS_TIMESTAMP = 1438269973;
  const GENESIS_BLOCK = 0;
  const AVG_BLOCK_TIME = 12; // seconds

  const timeDiff = timestamp - GENESIS_TIMESTAMP;
  const blockDiff = Math.floor(timeDiff / AVG_BLOCK_TIME);

  return GENESIS_BLOCK + blockDiff;
}

export function hexToDecimal(hex: string): number {
  return parseInt(hex, 16);
}

export function decimalToHex(decimal: number): string {
  return '0x' + decimal.toString(16);
}
