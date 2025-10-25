import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { StatementData } from '../types/statement.types';
import { BankStatementPDF } from './PDFDocument/BankStatementPDF';
import { Button } from './ui/Button';
import { formatCurrency, formatDate, formatTokenAmount } from '../utils/formatters';
import { Download, ExternalLink } from 'lucide-react';

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

  const handlePreviewInNewTab = async () => {
    const blob = await pdf(<BankStatementPDF data={data} />).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Note: URL is not revoked immediately to allow the new tab to load
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
          <div className="flex gap-3">
            <button
              onClick={handlePreviewInNewTab}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink size={20} />
              Preview
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={20} />
              Download PDF
            </button>
          </div>
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

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-700 text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left border-b border-gray-600">Your Accounts</th>
                <th className="px-4 py-3 text-left border-b border-gray-600">Account</th>
                <th className="px-4 py-3 text-right border-b border-gray-600">Ending Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700">
                <td className="px-4 py-3 text-white font-medium">
                  {data.accountHolder.accountName || 'Crypto Wallet'}
                </td>
                <td className="px-4 py-3 text-gray-300">{data.walletAddress}</td>
                <td className="px-4 py-3 text-right text-white font-semibold">
                  {formatCurrency(data.closingBalance.totalUsdValue)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Summary */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-red-600 mb-4">Account Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-700">
            <span className="text-gray-300">Beginning balance on {formatDate(data.statementPeriod.startDate)}</span>
            <span className="text-white font-semibold">{formatCurrency(data.openingBalance.totalUsdValue)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-700">
            <span className="text-gray-300">Deposits and other additions</span>
            <span className="text-green-400 font-semibold">{formatCurrency(data.summary.totalDeposits)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-700">
            <span className="text-gray-300">Withdrawals and other subtractions</span>
            <span className="text-red-400 font-semibold">-{formatCurrency(data.summary.totalWithdrawals)}</span>
          </div>
          <div className="flex justify-between py-3 pt-4 border-t-2 border-blue-500">
            <span className="text-lg font-bold text-white">Ending balance on {formatDate(data.statementPeriod.endDate)}</span>
            <span className="text-lg font-bold text-blue-400">{formatCurrency(data.closingBalance.totalUsdValue)}</span>
          </div>
        </div>
      </div>

      {/* Deposits and Other Additions */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-red-600 mb-4">Deposits and other additions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-600">
                <th className="px-4 py-3 text-left text-gray-300 font-normal">Date</th>
                <th className="px-4 py-3 text-left text-gray-300 font-normal">Description</th>
                <th className="px-4 py-3 text-right text-gray-300 font-normal">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.filter(tx => tx.type === 'credit').length > 0 ? (
                data.transactions
                  .filter(tx => tx.type === 'credit')
                  .map((tx) => (
                    <tr key={tx.hash} className="border-b border-gray-700">
                      <td className="px-4 py-3 text-gray-300">
                        {formatDate(tx.timestamp)}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        Received {formatTokenAmount(tx.formattedValue, 4)} {tx.token.symbol} from {tx.from}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300">
                        {formatCurrency(tx.usdValue)}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr className="border-b border-gray-700">
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500 italic">
                    No deposits during this period
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-600">
                <td colSpan={2} className="px-4 py-3 text-left font-bold text-blue-400">
                  Total deposits and other additions
                </td>
                <td className="px-4 py-3 text-right font-bold text-blue-400">
                  {formatCurrency(data.summary.totalDeposits)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Withdrawals and Other Subtractions */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-red-600 mb-4">Withdrawals and other subtractions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-600">
                <th className="px-4 py-3 text-left text-gray-300 font-normal">Date</th>
                <th className="px-4 py-3 text-left text-gray-300 font-normal">Description</th>
                <th className="px-4 py-3 text-right text-gray-300 font-normal">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.filter(tx => tx.type === 'debit').length > 0 ? (
                data.transactions
                  .filter(tx => tx.type === 'debit')
                  .map((tx) => (
                    <tr key={tx.hash} className="border-b border-gray-700">
                      <td className="px-4 py-3 text-gray-300">
                        {formatDate(tx.timestamp)}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        Sent {formatTokenAmount(tx.formattedValue, 4)} {tx.token.symbol} to {tx.to}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300">
                        {formatCurrency(tx.usdValue)}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr className="border-b border-gray-700">
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500 italic">
                    No withdrawals during this period
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-600">
                <td colSpan={2} className="px-4 py-3 text-left font-bold text-blue-400">
                  Total withdrawals and other subtractions
                </td>
                <td className="px-4 py-3 text-right font-bold text-blue-400">
                  {formatCurrency(data.summary.totalWithdrawals)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="secondary" onClick={onBack} className="flex-1">
          Generate Another Statement
        </Button>
        <Button variant="secondary" onClick={handlePreviewInNewTab} className="flex-1">
          <ExternalLink className="inline mr-2" size={20} />
          Preview
        </Button>
        <Button variant="primary" onClick={handleDownload} className="flex-1">
          <Download className="inline mr-2" size={20} />
          Download PDF
        </Button>
      </div>
    </div>
  );
};
