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
          <Text style={styles.title}>WALLET STATEMENT</Text>
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
            <Text style={styles.label}>Statement Period:</Text>
            <Text style={styles.value}>
              {formatDate(data.statementPeriod.startDate)} to{' '}
              {formatDate(data.statementPeriod.endDate)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={{ width: '30%' }}>Your Accounts</Text>
              <Text style={{ width: '45%' }}>Account</Text>
              <Text style={{ width: '25%', textAlign: 'right' }}>Ending Balance</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={{ width: '30%', fontWeight: 'bold' }}>
                {data.accountHolder.accountName || 'Crypto Wallet'}
              </Text>
              <Text style={{ width: '45%' }}>{data.walletAddress}</Text>
              <Text style={{ width: '25%', textAlign: 'right', fontWeight: 'bold' }}>
                {formatCurrency(data.closingBalance.totalUsdValue)}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#d32f2f' }]}>Account Summary</Text>
          <View style={styles.summaryRow}>
            <Text>Beginning balance on {formatDate(data.statementPeriod.startDate)}</Text>
            <Text>{formatCurrency(data.openingBalance.totalUsdValue)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Deposits and other additions</Text>
            <Text>{formatCurrency(data.summary.totalDeposits)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Withdrawals and other subtractions</Text>
            <Text>-{formatCurrency(data.summary.totalWithdrawals)}</Text>
          </View>
          <View style={[styles.summaryRow, { borderTop: 2, borderTopColor: '#000', marginTop: 5, paddingTop: 8 }]}>
            <Text style={styles.summaryLabel}>
              Ending balance on {formatDate(data.statementPeriod.endDate)}
            </Text>
            <Text style={styles.balanceValue}>
              {formatCurrency(data.closingBalance.totalUsdValue)}
            </Text>
          </View>
        </View>

        {/* Deposits and Other Additions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#d32f2f' }]}>Deposits and other additions</Text>
          <View style={styles.table}>
            <View style={[styles.tableHeader, { backgroundColor: 'transparent', color: '#000', borderBottom: 2, borderBottomColor: '#000' }]}>
              <Text style={{ width: '20%', color: '#000' }}>Date</Text>
              <Text style={{ width: '60%', color: '#000' }}>Description</Text>
              <Text style={{ width: '20%', textAlign: 'right', color: '#000' }}>Amount</Text>
            </View>
            {data.transactions.filter(tx => tx.type === 'credit').length > 0 ? (
              data.transactions
                .filter(tx => tx.type === 'credit')
                .map((tx) => (
                  <View key={tx.hash} style={styles.tableRow}>
                    <Text style={{ width: '20%' }}>{formatDate(tx.timestamp)}</Text>
                    <Text style={{ width: '60%' }}>
                      Received {formatTokenAmount(tx.formattedValue, 4)} {tx.token.symbol} from {tx.from}
                    </Text>
                    <Text style={{ width: '20%', textAlign: 'right' }}>
                      {formatCurrency(tx.usdValue)}
                    </Text>
                  </View>
                ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={{ width: '100%', textAlign: 'center', fontStyle: 'italic', color: '#999' }}>
                  No deposits during this period
                </Text>
              </View>
            )}
            <View style={[styles.tableRow, { borderTop: 2, borderTopColor: '#000', fontWeight: 'bold' }]}>
              <Text style={{ width: '80%', fontWeight: 'bold', color: '#1976d2' }}>
                Total deposits and other additions
              </Text>
              <Text style={{ width: '20%', textAlign: 'right', fontWeight: 'bold', color: '#1976d2' }}>
                {formatCurrency(data.summary.totalDeposits)}
              </Text>
            </View>
          </View>
        </View>

        {/* Withdrawals and Other Subtractions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#d32f2f' }]}>Withdrawals and other subtractions</Text>
          <View style={styles.table}>
            <View style={[styles.tableHeader, { backgroundColor: 'transparent', color: '#000', borderBottom: 2, borderBottomColor: '#000' }]}>
              <Text style={{ width: '20%', color: '#000' }}>Date</Text>
              <Text style={{ width: '60%', color: '#000' }}>Description</Text>
              <Text style={{ width: '20%', textAlign: 'right', color: '#000' }}>Amount</Text>
            </View>
            {data.transactions.filter(tx => tx.type === 'debit').length > 0 ? (
              data.transactions
                .filter(tx => tx.type === 'debit')
                .map((tx) => (
                  <View key={tx.hash} style={styles.tableRow}>
                    <Text style={{ width: '20%' }}>{formatDate(tx.timestamp)}</Text>
                    <Text style={{ width: '60%' }}>
                      Sent {formatTokenAmount(tx.formattedValue, 4)} {tx.token.symbol} to {tx.to}
                    </Text>
                    <Text style={{ width: '20%', textAlign: 'right' }}>
                      {formatCurrency(tx.usdValue)}
                    </Text>
                  </View>
                ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={{ width: '100%', textAlign: 'center', fontStyle: 'italic', color: '#999' }}>
                  No withdrawals during this period
                </Text>
              </View>
            )}
            <View style={[styles.tableRow, { borderTop: 2, borderTopColor: '#000', fontWeight: 'bold' }]}>
              <Text style={{ width: '80%', fontWeight: 'bold', color: '#1976d2' }}>
                Total withdrawals and other subtractions
              </Text>
              <Text style={{ width: '20%', textAlign: 'right', fontWeight: 'bold', color: '#1976d2' }}>
                {formatCurrency(data.summary.totalWithdrawals)}
              </Text>
            </View>
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
