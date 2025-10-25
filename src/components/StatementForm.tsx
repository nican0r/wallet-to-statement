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
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
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
      const startDate = initialData.statementPeriod.startDate;
      setSelectedMonth(String(startDate.getMonth() + 1).padStart(2, '0'));
      setSelectedYear(String(startDate.getFullYear()));
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

    // Calculate start and end dates from selected month and year
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (selectedMonth && selectedYear) {
      const year = Number(selectedYear);
      const month = Number(selectedMonth);
      startDate = new Date(year, month - 1, 1); // First day of the month
      endDate = new Date(year, month, 0); // Last day of the month
    }

    const formData = {
      accountHolderName,
      accountHolderAddress,
      walletAddress,
      startDate,
      endDate,
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
        startDate: startDate!,
        endDate: endDate!,
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
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select month</option>
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select year</option>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-sm text-gray-400 mt-4">
          Statement will be generated for the entire month
        </p>
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
