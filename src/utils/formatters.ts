import { format } from 'date-fns';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatTokenAmount(amount: number, decimals: number = 4): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatWalletAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatDate(date: Date): string {
  return format(date, 'MMM dd, yyyy');
}

export function formatDateTime(date: Date): string {
  return format(date, 'MMM dd, yyyy HH:mm:ss');
}

export function parseTokenBalance(rawBalance: string, decimals: number): number {
  const balanceBigInt = BigInt(rawBalance);
  const divisor = BigInt(10 ** decimals);
  const wholePart = balanceBigInt / divisor;
  const fractionalPart = balanceBigInt % divisor;

  const fractionalString = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalString.slice(0, 8); // Keep 8 decimal places

  return parseFloat(`${wholePart}.${trimmedFractional}`);
}

export function formatBlockNumber(blockNum: string): number {
  if (blockNum.startsWith('0x')) {
    return parseInt(blockNum, 16);
  }
  return parseInt(blockNum, 10);
}
