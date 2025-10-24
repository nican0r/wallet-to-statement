import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { StatementData } from '../../types/statement.types';
import { formatCurrency, formatDate, formatTokenAmount } from '../../utils/formatters';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#000',
    color: '#fff',
    padding: 5,
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#ddd',
    padding: 5,
    fontSize: 8,
  },
  tableRowAlt: {
    backgroundColor: '#f9f9f9',
  },
  col1: { width: '15%' },
  col2: { width: '35%' },
  col3: { width: '15%', textAlign: 'right' },
  col4: { width: '15%', textAlign: 'right' },
  col5: { width: '20%', textAlign: 'right' },
  balanceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 5,
  },
  balanceLabel: {
    fontWeight: 'bold',
  },
  balanceValue: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  tokenBalance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingHorizontal: 10,
    fontSize: 9,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  summaryLabel: {
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
    borderTop: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
});

interface BankStatementPDFProps {
  data: StatementData;
}

export const BankStatementPDF: React.FC<BankStatementPDFProps> = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>CRYPTO WALLET STATEMENT</Text>
          <Text style={styles.subtitle}>
            Generated on {formatDate(data.generatedAt)}
          </Text>
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Account Holder:</Text>
            <Text style={styles.value}>{data.accountHolder.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{data.accountHolder.address}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Wallet Address:</Text>
            <Text style={styles.value}>{data.walletAddress}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Networks:</Text>
            <Text style={styles.value}>
              {data.chains.map(c => c.name).join(', ')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Statement Period:</Text>
            <Text style={styles.value}>
              {formatDate(data.statementPeriod.startDate)} to{' '}
              {formatDate(data.statementPeriod.endDate)}
            </Text>
          </View>
        </View>

        {/* Balance Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Balance Summary</Text>

          <View style={styles.balanceBox}>
            <Text style={styles.balanceLabel}>Opening Balance:</Text>
            <Text style={styles.balanceValue}>
              {formatCurrency(data.openingBalance.totalUsdValue)}
            </Text>
          </View>

          {data.openingBalance.tokens.map((token, idx) => (
            <View key={`open-${token.token.symbol}-${idx}`} style={styles.tokenBalance}>
              <Text>
                {formatTokenAmount(token.formattedBalance)} {token.token.symbol}
                {token.chain && ` (${token.chain.name})`}
              </Text>
              <Text>{formatCurrency(token.usdValue)}</Text>
            </View>
          ))}

          <View style={[styles.balanceBox, { marginTop: 10 }]}>
            <Text style={styles.balanceLabel}>Closing Balance:</Text>
            <Text style={styles.balanceValue}>
              {formatCurrency(data.closingBalance.totalUsdValue)}
            </Text>
          </View>

          {data.closingBalance.tokens.map((token, idx) => (
            <View key={`close-${token.token.symbol}-${idx}`} style={styles.tokenBalance}>
              <Text>
                {formatTokenAmount(token.formattedBalance)} {token.token.symbol}
                {token.chain && ` (${token.chain.name})`}
              </Text>
              <Text>{formatCurrency(token.usdValue)}</Text>
            </View>
          ))}
        </View>

        {/* Transaction Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Date</Text>
              <Text style={styles.col2}>Description</Text>
              <Text style={styles.col3}>Debit</Text>
              <Text style={styles.col4}>Credit</Text>
              <Text style={styles.col5}>Balance</Text>
            </View>

            {data.transactions.map((tx, index) => (
              <View
                key={tx.hash}
                style={[styles.tableRow, index % 2 === 0 ? styles.tableRowAlt : {}]}
              >
                <Text style={styles.col1}>{formatDate(tx.timestamp)}</Text>
                <Text style={styles.col2}>
                  {tx.type === 'credit' ? 'Received' : 'Sent'}{' '}
                  {formatTokenAmount(tx.formattedValue, 4)} {tx.token.symbol}
                  {' '}({tx.chain.name})
                </Text>
                <Text style={styles.col3}>
                  {tx.type === 'debit' ? formatCurrency(tx.usdValue) : '-'}
                </Text>
                <Text style={styles.col4}>
                  {tx.type === 'credit' ? formatCurrency(tx.usdValue) : '-'}
                </Text>
                <Text style={styles.col5}>{formatCurrency(tx.runningBalance)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Activity Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Deposits:</Text>
            <Text>{formatCurrency(data.summary.totalDeposits)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Withdrawals:</Text>
            <Text>{formatCurrency(data.summary.totalWithdrawals)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Number of Transactions:</Text>
            <Text>{data.summary.transactionCount}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Net Change:</Text>
            <Text
              style={{
                color: data.summary.netChange >= 0 ? 'green' : 'red',
                fontWeight: 'bold',
              }}
            >
              {formatCurrency(data.summary.netChange)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            This statement is generated from blockchain data via Alchemy API.
          </Text>
          <Text>
            Historical prices sourced from CoinGecko. Past performance does not guarantee
            future results.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
