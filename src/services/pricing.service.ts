import axios from 'axios';
import { format } from 'date-fns';

interface PriceCache {
  [key: string]: number;
}

export class PricingService {
  private cache: PriceCache = {};
  private readonly COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

  private getCacheKey(coingeckoId: string, date: Date): string {
    return `${coingeckoId}_${format(date, 'yyyy-MM-dd')}`;
  }

  async getHistoricalPrice(coingeckoId: string, date: Date): Promise<number> {
    if (!coingeckoId) {
      console.warn(`No CoinGecko ID provided`);
      return 0;
    }

    const cacheKey = this.getCacheKey(coingeckoId, date);

    // Check cache first
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    try {
      // Use market_chart/range for more reliable historical data
      // Get data for a 24-hour window around the target date
      const targetTimestamp = Math.floor(date.getTime() / 1000);
      const fromTimestamp = targetTimestamp - 86400; // 24 hours before
      const toTimestamp = targetTimestamp + 86400; // 24 hours after

      const response = await axios.get(
        `${this.COINGECKO_BASE_URL}/coins/${coingeckoId}/market_chart/range`,
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
      console.warn(`Error fetching historical price for ${coingeckoId} on ${format(date, 'yyyy-MM-dd')}:`, error.message);

      // If historical data fails, try to get current price as fallback
      try {
        const response = await axios.get(
          `${this.COINGECKO_BASE_URL}/simple/price`,
          {
            params: {
              ids: coingeckoId,
              vs_currencies: 'usd',
            },
          }
        );

        const price = response.data?.[coingeckoId]?.usd || 0;

        if (price > 0) {
          console.log(`Using current price for ${coingeckoId}: $${price}`);
          this.cache[cacheKey] = price;
          return price;
        }

        // If still no price, return a default value
        console.warn(`No price available for ${coingeckoId}, using 0`);
        return 0;
      } catch (fallbackError: any) {
        console.error(`Fallback price fetch also failed for ${coingeckoId}:`, fallbackError.message);
        return 0;
      }
    }
  }

  async getMultipleHistoricalPrices(
    requests: Array<{ coingeckoId: string; date: Date }>
  ): Promise<Map<string, number>> {
    const results = new Map<string, number>();

    // Process requests sequentially to avoid rate limiting
    for (const request of requests) {
      const price = await this.getHistoricalPrice(request.coingeckoId, request.date);
      const key = this.getCacheKey(request.coingeckoId, request.date);
      results.set(key, price);
    }

    return results;
  }

  async getCurrentPrices(coingeckoIds: string[]): Promise<Map<string, number>> {
    const results = new Map<string, number>();

    const validIds = coingeckoIds.filter((id) => id);

    if (validIds.length === 0) {
      return results;
    }

    try {
      const response = await axios.get(`${this.COINGECKO_BASE_URL}/simple/price`, {
        params: {
          ids: validIds.join(','),
          vs_currencies: 'usd',
        },
      });

      validIds.forEach((coinId) => {
        if (response.data[coinId]) {
          results.set(coinId, response.data[coinId].usd);
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
