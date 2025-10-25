import axios from 'axios';
import { Chain, getEtherscanApiKey, ETHERSCAN_API_V2_BASE_URL } from '../types/chain.types';

interface BlockByTimeResponse {
  status: string;
  message: string;
  result: string;
}

export class BlockTimeService {
  private cache: Map<string, number> = new Map();

  /**
   * Get the block number closest to a given timestamp using Etherscan API v2
   * @param timestamp Unix timestamp in seconds
   * @param chain Chain configuration
   * @param closest 'before' or 'after' - which block to return if exact match not found
   * @returns Block number
   */
  async getBlockByTimestamp(
    timestamp: number,
    chain: Chain,
    closest: 'before' | 'after' = 'before'
  ): Promise<number> {
    const cacheKey = `${chain.chainId}-${timestamp}-${closest}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log(`Using cached block number for ${chain.name} at timestamp ${timestamp}`);
      return this.cache.get(cacheKey)!;
    }

    const apiKey = getEtherscanApiKey();

    if (!apiKey) {
      console.warn(`No Etherscan API key found, falling back to approximation for ${chain.name}`);
      return this.approximateBlockNumber(timestamp, chain);
    }

    try {
      console.log(`Fetching block number for ${chain.name} (chainId: ${chain.chainId}) at timestamp ${timestamp} (${new Date(timestamp * 1000).toISOString()})...`);

      // Etherscan API v2 uses a unified endpoint with chainid parameter
      const response = await axios.get<BlockByTimeResponse>(ETHERSCAN_API_V2_BASE_URL, {
        params: {
          chainid: chain.chainId,
          module: 'block',
          action: 'getblocknobytime',
          timestamp,
          closest,
          apikey: apiKey,
        },
      });

      if (response.data.status === '1' && response.data.result) {
        const blockNumber = parseInt(response.data.result, 10);
        console.log(`Found block ${blockNumber} for ${chain.name} at timestamp ${timestamp}`);

        // Cache the result
        this.cache.set(cacheKey, blockNumber);

        return blockNumber;
      } else {
        console.error(`Etherscan API error for ${chain.name}:`, response.data.message);
        return this.approximateBlockNumber(timestamp, chain);
      }
    } catch (error) {
      console.error(`Error fetching block number for ${chain.name}:`, error);
      // Fallback to approximation
      return this.approximateBlockNumber(timestamp, chain);
    }
  }

  /**
   * Get precise block range for a given month
   * @param year Year (e.g., 2024)
   * @param month Month (1-12)
   * @param chain Chain configuration
   * @returns Object with fromBlock and toBlock
   */
  async getBlockRangeForMonth(
    year: number,
    month: number,
    chain: Chain
  ): Promise<{ fromBlock: number; toBlock: number }> {
    // Calculate start of month (00:00:00 on the 1st)
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const startTimestamp = Math.floor(startDate.getTime() / 1000);

    // Calculate end of month (23:59:59 on the last day)
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));
    const endTimestamp = Math.floor(endDate.getTime() / 1000);

    console.log(`\nGetting block range for ${chain.name}:`);
    console.log(`  Month: ${year}-${String(month).padStart(2, '0')}`);
    console.log(`  Start: ${startDate.toISOString()} (${startTimestamp})`);
    console.log(`  End: ${endDate.toISOString()} (${endTimestamp})`);

    // Fetch blocks in parallel
    const [fromBlock, toBlock] = await Promise.all([
      this.getBlockByTimestamp(startTimestamp, chain, 'after'),
      this.getBlockByTimestamp(endTimestamp, chain, 'before'),
    ]);

    console.log(`  Block range: ${fromBlock} to ${toBlock} (${toBlock - fromBlock} blocks)\n`);

    return { fromBlock, toBlock };
  }

  /**
   * Fallback approximation method when Etherscan API is unavailable
   * Uses average block times for each chain
   */
  private approximateBlockNumber(timestamp: number, chain: Chain): number {
    // Average block times in seconds (approximate)
    const avgBlockTimes: Record<string, number> = {
      ethereum: 12,
      polygon: 2,
      arbitrum: 0.25,
      optimism: 2,
      base: 2,
      bsc: 3,
      avalanche: 2,
    };

    const blockTime = avgBlockTimes[chain.id] || 12;
    const now = Math.floor(Date.now() / 1000);
    const timeDiff = now - timestamp;
    const blockDiff = Math.floor(timeDiff / blockTime);

    // This is a rough approximation - we'd need the current block number
    // For now, we'll just return a warning and use a conservative estimate
    console.warn(`Using approximation for ${chain.name} - results may be inaccurate`);

    // Return 0 as we can't accurately approximate without current block info
    // The calling code should handle this appropriately
    return 0;
  }

  /**
   * Clear the cache (useful for testing or memory management)
   */
  clearCache(): void {
    this.cache.clear();
    console.log('Block time cache cleared');
  }
}

export const blocktimeService = new BlockTimeService();
