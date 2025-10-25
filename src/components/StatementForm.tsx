import React, { useState, useEffect } from 'react';
import { Input, TextArea } from './ui/Input';
import { Button } from './ui/Button';
import { SUPPORTED_TOKENS } from '../types/wallet.types';
import { StatementFormData } from '../types/statement.types';
import { validateStatementForm } from '../utils/validators';
import { format } from 'date-fns';
import { ChainSelector } from './ChainSelector';
import { Chain, DEFAULT_CHAINS } from '../types/chain.types';

interface StatementFormProps {
  onSubmit: (data: StatementFormData) => void;
  loading?: boolean;
  initialData?: StatementFormData;
}

export const StatementForm: React.FC<StatementFormProps> = ({ onSubmit, loading = false, initialData }) => {
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountHolderAddress, setAccountHolderAddress] = useState('');
  const [accountName, setAccountName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedTokens, setSelectedTokens] = useState<string[]>(['ETH']);
  const [selectedChains, setSelectedChains] = useState<Chain[]>(DEFAULT_CHAINS);
  const [errors, setErrors] = useState<string[]>([]);

  // Initialize form with previous data if available
  useEffect(() => {
    if (initialData) {
      setAccountHolderName(initialData.accountHolder.name);
      setAccountHolderAddress(initialData.accountHolder.address);
      setAccountName(initialData.accountHolder.accountName || '');
      setWalletAddress(initialData.walletAddress);
      setStartDate(format(initialData.statementPeriod.startDate, 'yyyy-MM-dd'));
      setEndDate(format(initialData.statementPeriod.endDate, 'yyyy-MM-dd'));
      setSelectedTokens(initialData.selectedTokens.map(t => t.address));
      setSelectedChains(initialData.selectedChains);
    }
  }, [initialData]);

  const handleTokenToggle = (tokenAddress: string) => {
    setSelectedTokens((prev) =>
      prev.includes(tokenAddress)
        ? prev.filter((t) => t !== tokenAddress)
        : [...prev, tokenAddress]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      accountHolderName,
      accountHolderAddress,
      walletAddress,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      selectedTokens: SUPPORTED_TOKENS.filter((t) => selectedTokens.includes(t.address)),
    };

    const validation = validateStatementForm(formData as any);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);

    const statementFormData: StatementFormData = {
      accountHolder: {
        name: accountHolderName,
        address: accountHolderAddress,
        accountName: accountName || undefined,
      },
      walletAddress,
      statementPeriod: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      selectedTokens: SUPPORTED_TOKENS.filter((t) => selectedTokens.includes(t.address)),
      selectedChains,
    };

    onSubmit(statementFormData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6">Account Information</h2>

        <div className="space-y-4">
          <Input
            label="Account Name"
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="e.g., Adv Plus Banking"
            disabled={loading}
          />

          <Input
            label="Account Holder Name"
            type="text"
            value={accountHolderName}
            onChange={(e) => setAccountHolderName(e.target.value)}
            placeholder="John Doe"
            disabled={loading}
          />

          <TextArea
            label="Account Holder Address"
            value={accountHolderAddress}
            onChange={(e) => setAccountHolderAddress(e.target.value)}
            placeholder="123 Main Street&#10;City, State 12345&#10;Country"
            rows={3}
            disabled={loading}
          />

          <Input
            label="Wallet Address"
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="0x..."
            disabled={loading}
          />
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6">Statement Period</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={loading}
          />

          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <ChainSelector
          selectedChains={selectedChains}
          onChange={setSelectedChains}
          disabled={loading}
        />
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Select Tokens to Track</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SUPPORTED_TOKENS.map((token) => (
            <label
              key={token.address}
              className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedTokens.includes(token.address)
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                checked={selectedTokens.includes(token.address)}
                onChange={() => handleTokenToggle(token.address)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                disabled={loading}
              />
              <div>
                <div className="font-semibold text-white">{token.symbol}</div>
                <div className="text-xs text-gray-400">{token.name}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <h3 className="text-red-500 font-semibold mb-2">Please fix the following errors:</h3>
          <ul className="list-disc list-inside text-red-400 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        className="w-full"
      >
        Generate Statement
      </Button>
    </form>
  );
};
