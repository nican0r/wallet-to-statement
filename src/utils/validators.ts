export function isValidEthereumAddress(address: string): boolean {
  // Check if it's a valid Ethereum address format
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return startDate < endDate;
}

export function validateStatementForm(data: {
  accountHolderName: string;
  accountHolderAddress: string;
  walletAddress: string;
  startDate: Date | null;
  endDate: Date | null;
  selectedTokens: any[];
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.accountHolderName?.trim()) {
    errors.push('Account holder name is required');
  }

  if (!data.accountHolderAddress?.trim()) {
    errors.push('Account holder address is required');
  }

  if (!data.walletAddress?.trim()) {
    errors.push('Wallet address is required');
  } else if (!isValidEthereumAddress(data.walletAddress)) {
    errors.push('Invalid Ethereum wallet address format');
  }

  if (!data.startDate) {
    errors.push('Start date is required');
  }

  if (!data.endDate) {
    errors.push('End date is required');
  }

  if (data.startDate && data.endDate && !isValidDateRange(data.startDate, data.endDate)) {
    errors.push('End date must be after start date');
  }

  if (!data.selectedTokens || data.selectedTokens.length === 0) {
    errors.push('At least one token must be selected');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
