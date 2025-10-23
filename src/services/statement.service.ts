import { alchemyService } from './alchemy.service';
import { pricingService } from './pricing.service';
import { StatementData, StatementFormData } from '../types/statement.types';
import { Transaction, AlchemyAssetTransfer } from '../types/transaction.types';
import { Token, TokenBalance } from '../types/wallet.types';
import {
  estimateBlockFromTimestamp,
  dateToTimestamp,
  timestampToDate,
  calculateRunningBalances,
  calculateTransactionSummary,
} from '../utils/calculations';
import { parseTokenBalance } from '../utils/formatters';

export class StatementService {
  async generateStatement(formData: StatementFormData): Promise<StatementData> {
    const { accountHolder, walletAddress, statementPeriod, selectedTokens } = formData;

    // Step 1: Calculate block numbers for the date range
    const startTimestamp = dateToTimestamp(statementPeriod.startDate);
    const endTimestamp = dateToTimestamp(statementPeriod.endDate);

    const startBlock = estimateBlockFromTimestamp(startTimestamp);
    const endBlock = estimateBlockFromTimestamp(endTimestamp);

    console.log('Block range:', { startBlock, endBlock });

    // Step 2: Fetch token balances at start and end blocks
    const [openingBalances, closingBalances] = await Promise.all([
      alchemyService.getTokenBalances(walletAddress, selectedTokens, startBlock),
      alchemyService.getTokenBalances(walletAddress, selectedTokens, endBlock),
    ]);

    console.log('Fetched balances:', { openingBalances, closingBalances });

    // Step 3: Fetch historical prices for opening and closing balances
    const openingBalancesWithPrices = await this.enrichBalancesWithPrices(
      openingBalances,
      statementPeriod.startDate
    );

    const closingBalancesWithPrices = await this.enrichBalancesWithPrices(
      closingBalances,
      statementPeriod.endDate
    );

    // Step 4: Fetch transactions in the date range
    const rawTransfers = await alchemyService.getAssetTransfers(
      walletAddress,
      startBlock,
      endBlock,
      selectedTokens
    );

    console.log(`Fetched ${rawTransfers.length} transactions`);

    // Step 5: Process transactions
    const transactions = await this.processTransactions(
      rawTransfers,
      walletAddress,
      selectedTokens
    );

    // Sort transactions by timestamp
    transactions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Step 6: Calculate running balances
    const openingBalanceTotal = openingBalancesWithPrices.reduce(
      (sum, b) => sum + b.usdValue,
      0
    );

    const transactionsWithRunningBalance = calculateRunningBalances(
      transactions,
      openingBalanceTotal
    );

    // Step 7: Calculate summary
    const closingBalanceTotal = closingBalancesWithPrices.reduce(
      (sum, b) => sum + b.usdValue,
      0
    );

    const summary = calculateTransactionSummary(
      transactionsWithRunningBalance,
      openingBalanceTotal,
      closingBalanceTotal
    );

    // Step 8: Build statement data
    const statementData: StatementData = {
      accountHolder,
      walletAddress,
      statementPeriod,
      tokens: selectedTokens,
      openingBalance: {
        tokens: openingBalancesWithPrices,
        totalUsdValue: openingBalanceTotal,
      },
      closingBalance: {
        tokens: closingBalancesWithPrices,
        totalUsdValue: closingBalanceTotal,
      },
      transactions: transactionsWithRunningBalance,
      summary,
      generatedAt: new Date(),
    };

    return statementData;
  }

  private async enrichBalancesWithPrices(
    balances: TokenBalance[],
    date: Date
  ): Promise<TokenBalance[]> {
    const enrichedBalances: TokenBalance[] = [];

    for (const balance of balances) {
      const price = await pricingService.getHistoricalPrice(balance.token.address, date);
      const usdValue = balance.formattedBalance * price;

      enrichedBalances.push({
        ...balance,
        pricePerToken: price,
        usdValue,
      });
    }

    return enrichedBalances;
  }

  private async processTransactions(
    rawTransfers: AlchemyAssetTransfer[],
    walletAddress: string,
    selectedTokens: Token[]
  ): Promise<Transaction[]> {
    const transactions: Transaction[] = [];

    for (const transfer of rawTransfers) {
      try {
        // Determine token
        let token: Token | undefined;
        let value: string = '0';
        let decimals: number = 18;

        if (transfer.category === 'external') {
          // ETH transfer
          token = selectedTokens.find((t) => t.address === 'ETH');
          value = (transfer.value || 0).toString();
          decimals = 18;
        } else if (transfer.category === 'erc20' && transfer.rawContract.address) {
          // ERC20 transfer
          token = selectedTokens.find(
            (t) =>
              t.address.toLowerCase() === transfer.rawContract.address?.toLowerCase()
          );

          if (token) {
            value = transfer.rawContract.value || '0';
            decimals = token.decimals;
          }
        }

        if (!token) {
          continue;
        }

        // Parse value
        const formattedValue = parseTokenBalance(value, decimals);

        if (formattedValue === 0) {
          continue;
        }

        // Determine transaction type (credit or debit)
        const isIncoming =
          transfer.to?.toLowerCase() === walletAddress.toLowerCase();
        const type = isIncoming ? 'credit' : 'debit';

        // Get timestamp
        const timestamp = timestampToDate(
          parseInt(transfer.metadata.blockTimestamp, 16)
        );

        // Get price at transaction time
        const price = await pricingService.getHistoricalPrice(token.address, timestamp);
        const usdValue = formattedValue * price;

        transactions.push({
          hash: transfer.hash,
          blockNum: transfer.blockNum,
          timestamp,
          from: transfer.from,
          to: transfer.to || '',
          value,
          formattedValue,
          token,
          type,
          usdValue,
          pricePerToken: price,
          runningBalance: 0, // Will be calculated later
        });
      } catch (error) {
        console.error('Error processing transaction:', transfer.hash, error);
      }
    }

    return transactions;
  }
}

export const statementService = new StatementService();
