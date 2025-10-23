import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { StatementData } from '../types/statement.types';
import { BankStatementPDF } from './PDFDocument/BankStatementPDF';
import { Button } from './ui/Button';
import { formatCurrency, formatDate, formatTokenAmount } from '../utils/formatters';
import { Download } from 'lucide-react';

interface StatementPreviewProps {
  data: StatementData;
  onBack: () => void;
}

export const StatementPreview: React.FC<StatementPreviewProps> = ({ data, onBack }) => {
  const fileName = `statement_${data.walletAddress.slice(0, 8)}_${formatDate(
    data.statementPeriod.startDate
  ).replace(/\s/g, '_')}.pdf`;

  const handleDownload = async () => {
    const blob = await pdf(<BankStatementPDF data={data} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Statement Generated</h1>
            <p className="text-gray-400">
              Review your statement below and download when ready
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            Download PDF
          </button>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
          <div>
            <span className="font-semibold">Account Holder:</span>{' '}
            {data.accountHolder.name}
          </div>
          <div>
            <span className="font-semibold">Wallet:</span> {data.walletAddress}
          </div>
          <div className="md:col-span-2">
            <span className="font-semibold">Address:</span> {data.accountHolder.address}
          </div>
          <div className="md:col-span-2">
            <span className="font-semibold">Period:</span>{' '}
            {formatDate(data.statementPeriod.startDate)} to{' '}
            {formatDate(data.statementPeriod.endDate)}
          </div>
        </div>
      </div>

      {/* Balance Summary */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">Balance Summary</h2>

        <div className="space-y-4">
          <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-white">Opening Balance</span>
              <span className="text-2xl font-bold text-white">
                {formatCurrency(data.openingBalance.totalUsdValue)}
              </span>
            </div>
            <div className="space-y-1 text-sm text-gray-300">
              {data.openingBalance.tokens.map((token) => (
                <div key={token.token.symbol} className="flex justify-between">
                  <span>
                    {formatTokenAmount(token.formattedBalance)} {token.token.symbol}
                  </span>
                  <span>{formatCurrency(token.usdValue)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-500/10 p-4 rounded-lg border border-green-500">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-white">Closing Balance</span>
              <span className="text-2xl font-bold text-white">
                {formatCurrency(data.closingBalance.totalUsdValue)}
              </span>
            </div>
            <div className="space-y-1 text-sm text-gray-300">
              {data.closingBalance.tokens.map((token) => (
                <div key={token.token.symbol} className="flex justify-between">
                  <span>
                    {formatTokenAmount(token.formattedBalance)} {token.token.symbol}
                  </span>
                  <span>{formatCurrency(token.usdValue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">Activity Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(data.summary.totalDeposits)}
            </div>
            <div className="text-sm text-gray-400">Total Deposits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {formatCurrency(data.summary.totalWithdrawals)}
            </div>
            <div className="text-sm text-gray-400">Total Withdrawals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {data.summary.transactionCount}
            </div>
            <div className="text-sm text-gray-400">Transactions</div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${
                data.summary.netChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {formatCurrency(data.summary.netChange)}
            </div>
            <div className="text-sm text-gray-400">Net Change</div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">
          Transaction History ({data.transactions.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-700 text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">Debit</th>
                <th className="px-4 py-3 text-right">Credit</th>
                <th className="px-4 py-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {data.transactions.map((tx, index) => (
                <tr key={tx.hash} className={index % 2 === 0 ? 'bg-gray-750' : ''}>
                  <td className="px-4 py-3 text-gray-300">
                    {formatDate(tx.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {tx.type === 'credit' ? 'Received' : 'Sent'}{' '}
                    {formatTokenAmount(tx.formattedValue, 4)} {tx.token.symbol}
                  </td>
                  <td className="px-4 py-3 text-right text-red-400">
                    {tx.type === 'debit' ? formatCurrency(tx.usdValue) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-green-400">
                    {tx.type === 'credit' ? formatCurrency(tx.usdValue) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-white font-semibold">
                    {formatCurrency(tx.runningBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="secondary" onClick={onBack} className="flex-1">
          Generate Another Statement
        </Button>
        <Button variant="primary" onClick={handleDownload} className="flex-1">
          <Download className="inline mr-2" size={20} />
          Download PDF
        </Button>
      </div>
    </div>
  );
};
