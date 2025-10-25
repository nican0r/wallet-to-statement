import { alchemyService } from './alchemy.service';
import { pricingService } from './pricing.service';
import { blocktimeService } from './blocktime.service';
import { StatementData, StatementFormData } from '../types/statement.types';
import { Transaction, AlchemyAssetTransfer } from '../types/transaction.types';
import { Token, TokenBalance, getTokensForChain } from '../types/wallet.types';
import {
  timestampToDate,
  calculateRunningBalances,
  calculateTransactionSummary,
} from '../utils/calculations';
import { parseTokenBalance } from '../utils/formatters';

export class StatementService {
  async generateStatement(formData: StatementFormData): Promise<StatementData> {
    const { accountHolder, walletAddress, statementPeriod, selectedTokens, selectedChains } = formData;

    console.log(`Fetching data from ${selectedChains.length} chain(s)...`);

    // Aggregate data from all chains
    const allClosingBalances: TokenBalance[] = [];
    const allTransactions: Transaction[] = [];

    // Process each chain
    for (const chain of selectedChains) {
      console.log(`\n--- Processing ${chain.name} ---`);

      try {
        // Step 1: Get chain-specific tokens based on user selection
        const chainTokens = getTokensForChain(chain.id);

        // Filter to only the token symbols that the user selected
        const selectedSymbols = selectedTokens.map(t => t.symbol);
        const tokensForThisChain = chainTokens.filter(t =>
          selectedSymbols.includes(t.symbol)
        );

        console.log(`Fetching balances for ${tokensForThisChain.length} tokens on ${chain.name}...`);

        // Step 2: Fetch token balances for this chain
        const chainClosingBalances = await alchemyService.getTokenBalances(
          walletAddress,
          tokensForThisChain,
          chain
        );

        // Add chain info to each balance
        const balancesWithChain = chainClosingBalances.map(balance => ({
          ...balance,
          chain,
        }));

        allClosingBalances.push(...balancesWithChain);
        console.log(`Fetched ${chainClosingBalances.length} token balances on ${chain.name}`);

        // Step 3: Get precise block range for the statement period using Etherscan API
        const year = statementPeriod.startDate.getFullYear();
        const month = statementPeriod.startDate.getMonth() + 1;

        const { fromBlock, toBlock } = await blocktimeService.getBlockRangeForMonth(
          year,
          month,
          chain
        );

        // Fallback to approximation if Etherscan API failed (returned 0)
        let actualFromBlock = fromBlock;
        let actualToBlock = toBlock;

        if (fromBlock === 0 || toBlock === 0) {
          console.warn(`Using fallback block range for ${chain.name}`);
          const latestBlock = await alchemyService.getLatestBlock(chain);
          actualFromBlock = Math.max(0, latestBlock - 100000); // Go back ~14 days
          actualToBlock = latestBlock;
        }

        console.log(`Fetching transactions on ${chain.name} from block ${actualFromBlock} to ${actualToBlock}...`);

        const rawTransfers = await alchemyService.getAssetTransfers(
          walletAddress,
          actualFromBlock,
          actualToBlock,
          tokensForThisChain,
          chain
        );

        console.log(`Fetched ${rawTransfers.length} transactions on ${chain.name}`);

        // Step 4: Process transactions for this chain
        const chainTransactions = await this.processTransactions(
          rawTransfers,
          walletAddress,
          tokensForThisChain,
          chain
        );

        allTransactions.push(...chainTransactions);
      } catch (error) {
        console.error(`Error processing ${chain.name}:`, error);
        // Continue with other chains even if one fails
      }
    }

    console.log(`\nTotal balances across all chains: ${allClosingBalances.length}`);
    console.log(`Total transactions across all chains: ${allTransactions.length}`);

    // Step 5: Enrich closing balances with end-of-month prices
    console.log('\nEnriching closing balances with end-of-month prices...');
    const closingBalancesWithPrices = await this.enrichBalancesWithPrices(
      allClosingBalances,
      statementPeriod.endDate
    );

    // Step 6: Fetch opening balances with start-of-month prices
    console.log('Fetching opening balances with start-of-month prices...');
    const openingBalances = await this.getOpeningBalances(
      allClosingBalances,
      allTransactions,
      statementPeriod.startDate
    );

    // Step 7: Calculate unrealized gains/losses
    console.log('Calculating unrealized gains/losses...');
    const unrealizedGainLossTransactions = this.calculateUnrealizedGainLoss(
      openingBalances,
      closingBalancesWithPrices,
      statementPeriod.endDate
    );

    // Add unrealized gains/losses to transaction list
    const allTransactionsWithUnrealized = [...allTransactions, ...unrealizedGainLossTransactions];

    // Sort transactions by timestamp
    allTransactionsWithUnrealized.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Step 8: Calculate totals
    const closingBalanceTotal = closingBalancesWithPrices.reduce(
      (sum, b) => sum + b.usdValue,
      0
    );

    const openingBalanceTotal = openingBalances.reduce(
      (sum, b) => sum + b.usdValue,
      0
    );

    const transactionsWithRunningBalance = calculateRunningBalances(
      allTransactionsWithUnrealized,
      openingBalanceTotal
    );

    // Step 9: Calculate summary
    const summary = calculateTransactionSummary(
      transactionsWithRunningBalance,
      openingBalanceTotal,
      closingBalanceTotal
    );

    // Step 10: Build statement data
    const statementData: StatementData = {
      accountHolder,
      walletAddress,
      statementPeriod,
      chains: selectedChains,
      tokens: selectedTokens,
      openingBalance: {
        tokens: openingBalances,
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
      const price = await pricingService.getHistoricalPrice(balance.token.coingeckoId, date);
      const usdValue = balance.formattedBalance * price;

      enrichedBalances.push({
        ...balance,
        pricePerToken: price,
        usdValue,
      });
    }

    return enrichedBalances;
  }

  private async getOpeningBalances(
    closingBalances: TokenBalance[],
    transactions: Transaction[],
    startDate: Date
  ): Promise<TokenBalance[]> {
    const openingBalances: TokenBalance[] = [];

    for (const closingBalance of closingBalances) {
      // Calculate the token quantity at the start of the period
      // by subtracting credits and adding back debits from the closing balance
      const tokenTransactions = transactions.filter(
        (tx) =>
          tx.token.symbol === closingBalance.token.symbol &&
          tx.chain?.id === closingBalance.chain?.id
      );

      let openingTokenQuantity = closingBalance.formattedBalance;

      for (const tx of tokenTransactions) {
        if (tx.type === 'credit') {
          // Subtract incoming transfers to get opening balance
          openingTokenQuantity -= tx.formattedValue;
        } else if (tx.type === 'debit') {
          // Add back outgoing transfers to get opening balance
          openingTokenQuantity += tx.formattedValue;
        }
      }

      // Get the price at the start of the period
      const startPrice = await pricingService.getHistoricalPrice(
        closingBalance.token.coingeckoId,
        startDate
      );

      const openingUsdValue = openingTokenQuantity * startPrice;

      openingBalances.push({
        ...closingBalance,
        formattedBalance: openingTokenQuantity,
        usdValue: openingUsdValue,
        pricePerToken: startPrice,
      });
    }

    return openingBalances;
  }

  private calculateUnrealizedGainLoss(
    openingBalances: TokenBalance[],
    closingBalances: TokenBalance[],
    endDate: Date
  ): Transaction[] {
    const unrealizedTransactions: Transaction[] = [];

    for (const openingBalance of openingBalances) {
      const closingBalance = closingBalances.find(
        (cb) =>
          cb.token.symbol === openingBalance.token.symbol &&
          cb.chain?.id === openingBalance.chain?.id
      );

      if (!closingBalance) continue;

      // For the same token quantity, calculate the USD value change
      const tokenQuantity = openingBalance.formattedBalance;
      const openingUsdValue = tokenQuantity * openingBalance.pricePerToken;
      const closingUsdValue = tokenQuantity * closingBalance.pricePerToken;
      const unrealizedGainLoss = closingUsdValue - openingUsdValue;

      // Only create a transaction if there's a meaningful change (> $0.01)
      if (Math.abs(unrealizedGainLoss) < 0.01) continue;

      const isGain = unrealizedGainLoss > 0;

      unrealizedTransactions.push({
        hash: `unrealized-${openingBalance.token.symbol}-${openingBalance.chain?.id || 'unknown'}`,
        blockNum: 'N/A',
        timestamp: endDate,
        from: isGain ? 'Market Appreciation' : 'Market Depreciation',
        to: isGain ? 'Market Appreciation' : 'Market Depreciation',
        value: '0',
        formattedValue: 0,
        token: openingBalance.token,
        chain: openingBalance.chain!,
        type: isGain ? 'unrealized_gain' : 'unrealized_loss',
        usdValue: Math.abs(unrealizedGainLoss),
        pricePerToken: closingBalance.pricePerToken,
        runningBalance: 0,
        isUnrealized: true,
      });
    }

    return unrealizedTransactions;
  }

  private async processTransactions(
    rawTransfers: AlchemyAssetTransfer[],
    walletAddress: string,
    selectedTokens: Token[],
    chain: any
  ): Promise<Transaction[]> {
    const transactions: Transaction[] = [];

    for (const transfer of rawTransfers) {
      try {
        // Determine token
        let token: Token | undefined;
        let value: string = '0';
        let decimals: number = 18;

        if (transfer.category === 'external') {
          // Native token transfer (ETH, MATIC, etc.)
          token = selectedTokens.find((t) => t.address === 'NATIVE');
          value = (transfer.value || 0).toString();
          decimals = token?.decimals || 18;
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

        // Get timestamp - handle multiple formats (hex, decimal, or ISO string)
        let timestamp: Date;
        if (!transfer.metadata?.blockTimestamp) {
          timestamp = new Date();
        } else {
          const blockTimestamp = transfer.metadata.blockTimestamp;

          // Check the format of the timestamp
          if (blockTimestamp.includes('T') || blockTimestamp.includes('-')) {
            // ISO 8601 date string format (e.g., "2025-06-08T15:24:23.000Z")
            timestamp = new Date(blockTimestamp);
          } else if (blockTimestamp.startsWith('0x')) {
            // Hexadecimal Unix timestamp
            const timestampValue = parseInt(blockTimestamp, 16);
            timestamp = timestampToDate(timestampValue);
          } else {
            // Decimal Unix timestamp
            const timestampValue = parseInt(blockTimestamp, 10);
            timestamp = timestampToDate(timestampValue);
          }

          // Validate the timestamp is reasonable
          if (timestamp.getFullYear() < 2015 || isNaN(timestamp.getTime())) {
            timestamp = new Date(); // Fallback to current date
          }
        }

        // Get price at transaction time
        const price = await pricingService.getHistoricalPrice(token.coingeckoId, timestamp);
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
          chain,
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
