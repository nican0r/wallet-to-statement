import axios from 'axios';
import { TOKEN_COINGECKO_IDS } from '../types/wallet.types';
import { format } from 'date-fns';

interface PriceCache {
  [key: string]: number;
}

export class PricingService {
  private cache: PriceCache = {};
  private readonly COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

  private getCacheKey(tokenAddress: string, date: Date): string {
    return `${tokenAddress}_${format(date, 'yyyy-MM-dd')}`;
  }

  async getHistoricalPrice(tokenAddress: string, date: Date): Promise<number> {
    const cacheKey = this.getCacheKey(tokenAddress, date);

    // Check cache first
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    const coinId = TOKEN_COINGECKO_IDS[tokenAddress];
    if (!coinId) {
      console.warn(`No CoinGecko ID found for token: ${tokenAddress}`);
      return 0;
    }

    try {
      // Use market_chart/range for more reliable historical data
      // Get data for a 24-hour window around the target date
      const targetTimestamp = Math.floor(date.getTime() / 1000);
      const fromTimestamp = targetTimestamp - 86400; // 24 hours before
      const toTimestamp = targetTimestamp + 86400; // 24 hours after

      const response = await axios.get(
        `${this.COINGECKO_BASE_URL}/coins/${coinId}/market_chart/range`,
        {
          params: {
            vs_currency: 'usd',
            from: fromTimestamp,
            to: toTimestamp,
          },
        }
      );

      // Get the price closest to our target timestamp
      const prices = response.data?.prices || [];

      if (prices.length === 0) {
        throw new Error('No price data available');
      }

      // Find the price closest to our target timestamp
      let closestPrice = prices[0];
      let minDiff = Math.abs(prices[0][0] - date.getTime());

      for (const priceData of prices) {
        const diff = Math.abs(priceData[0] - date.getTime());
        if (diff < minDiff) {
          minDiff = diff;
          closestPrice = priceData;
        }
      }

      const price = closestPrice[1] || 0;

      // Cache the result
      this.cache[cacheKey] = price;

      // Add a small delay to avoid rate limiting (free tier: 10-50 calls/minute)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return price;
    } catch (error: any) {
      console.warn(`Error fetching historical price for ${coinId} on ${format(date, 'yyyy-MM-dd')}:`, error.message);

      // If historical data fails, try to get current price as fallback
      try {
        const response = await axios.get(
          `${this.COINGECKO_BASE_URL}/simple/price`,
          {
            params: {
              ids: coinId,
              vs_currencies: 'usd',
            },
          }
        );

        const price = response.data?.[coinId]?.usd || 0;

        if (price > 0) {
          console.log(`Using current price for ${coinId}: $${price}`);
          this.cache[cacheKey] = price;
          return price;
        }

        // If still no price, return a default value
        console.warn(`No price available for ${coinId}, using 0`);
        return 0;
      } catch (fallbackError: any) {
        console.error(`Fallback price fetch also failed for ${coinId}:`, fallbackError.message);
        return 0;
      }
    }
  }

  async getMultipleHistoricalPrices(
    requests: Array<{ tokenAddress: string; date: Date }>
  ): Promise<Map<string, number>> {
    const results = new Map<string, number>();

    // Process requests sequentially to avoid rate limiting
    for (const request of requests) {
      const price = await this.getHistoricalPrice(request.tokenAddress, request.date);
      const key = this.getCacheKey(request.tokenAddress, request.date);
      results.set(key, price);
    }

    return results;
  }

  async getCurrentPrices(tokenAddresses: string[]): Promise<Map<string, number>> {
    const results = new Map<string, number>();

    const coinIds = tokenAddresses
      .map((addr) => TOKEN_COINGECKO_IDS[addr])
      .filter((id) => id);

    if (coinIds.length === 0) {
      return results;
    }

    try {
      const response = await axios.get(`${this.COINGECKO_BASE_URL}/simple/price`, {
        params: {
          ids: coinIds.join(','),
          vs_currencies: 'usd',
        },
      });

      tokenAddresses.forEach((addr) => {
        const coinId = TOKEN_COINGECKO_IDS[addr];
        if (coinId && response.data[coinId]) {
          results.set(addr, response.data[coinId].usd);
        }
      });

      return results;
    } catch (error) {
      console.error('Error fetching current prices:', error);
      return results;
    }
  }

  clearCache(): void {
    this.cache = {};
  }
}

export const pricingService = new PricingService();
