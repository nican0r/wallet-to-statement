import { alchemyService } from './alchemy.service';
import { pricingService } from './pricing.service';
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

        // Step 3: Fetch transactions for this chain
        const latestBlock = await alchemyService.getLatestBlock(chain);
        const fromBlock = Math.max(0, latestBlock - 100000); // Go back ~14 days

        console.log(`Fetching transactions on ${chain.name} from block ${fromBlock} to ${latestBlock}...`);

        const rawTransfers = await alchemyService.getAssetTransfers(
          walletAddress,
          fromBlock,
          latestBlock,
          tokensForThisChain,
          chain
        );

        console.log(`Fetched ${rawTransfers.length} transactions on ${chain.name}`);

        // Step 3: Filter transactions by date range
        const startTime = statementPeriod.startDate.getTime();
        const endTime = statementPeriod.endDate.getTime();

        const filteredTransfers = rawTransfers.filter((transfer) => {
          const txTimestamp = parseInt(transfer.metadata.blockTimestamp, 16) * 1000;
          return txTimestamp >= startTime && txTimestamp <= endTime;
        });

        console.log(`Filtered to ${filteredTransfers.length} transactions in date range on ${chain.name}`);

        // Step 4: Process transactions for this chain
        const chainTransactions = await this.processTransactions(
          filteredTransfers,
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

    // Step 5: Enrich balances with prices
    console.log('\nEnriching balances with historical prices...');
    const closingBalancesWithPrices = await this.enrichBalancesWithPrices(
      allClosingBalances,
      statementPeriod.endDate
    );

    // Sort transactions by timestamp
    allTransactions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Step 6: Calculate opening balance by working backwards from closing balance
    const closingBalanceTotal = closingBalancesWithPrices.reduce(
      (sum, b) => sum + b.usdValue,
      0
    );

    // Calculate net change from transactions
    const totalDeposits = allTransactions
      .filter((tx) => tx.type === 'credit')
      .reduce((sum, tx) => sum + tx.usdValue, 0);

    const totalWithdrawals = allTransactions
      .filter((tx) => tx.type === 'debit')
      .reduce((sum, tx) => sum + tx.usdValue, 0);

    // Opening balance = Closing balance - deposits + withdrawals
    const openingBalanceTotal = closingBalanceTotal - totalDeposits + totalWithdrawals;

    // Create estimated opening balances (proportional to closing balances)
    const openingBalances = closingBalancesWithPrices.map((balance) => {
      const proportion = closingBalanceTotal > 0 ? balance.usdValue / closingBalanceTotal : 0;
      const estimatedOpeningValue = openingBalanceTotal * proportion;
      const estimatedOpeningTokenBalance = balance.pricePerToken > 0
        ? estimatedOpeningValue / balance.pricePerToken
        : 0;

      return {
        ...balance,
        formattedBalance: estimatedOpeningTokenBalance,
        usdValue: estimatedOpeningValue,
      };
    });

    const transactionsWithRunningBalance = calculateRunningBalances(
      allTransactions,
      openingBalanceTotal
    );

    // Step 7: Calculate summary
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

        // Get timestamp
        const timestamp = timestampToDate(
          parseInt(transfer.metadata.blockTimestamp, 16)
        );

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
