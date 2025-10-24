import axios from 'axios';
import { Token, TokenBalance } from '../types/wallet.types';
import { AlchemyAssetTransfersResponse, AlchemyAssetTransfer } from '../types/transaction.types';
import { parseTokenBalance, formatBlockNumber } from '../utils/formatters';
import { decimalToHex } from '../utils/calculations';
import { Chain, getAlchemyUrl } from '../types/chain.types';

const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;

interface AlchemyTokenBalance {
  contractAddress: string;
  tokenBalance: string;
}

interface AlchemyTokenBalancesResponse {
  address: string;
  tokenBalances: AlchemyTokenBalance[];
}

interface BlockResponse {
  jsonrpc: string;
  id: number;
  result: {
    number: string;
    timestamp: string;
  };
}

export class AlchemyService {
  private async makeRequest(method: string, params: any[], chain: Chain) {
    try {
      const url = getAlchemyUrl(chain.id, ALCHEMY_API_KEY);
      const response = await axios.post(url, {
        jsonrpc: '2.0',
        id: 1,
        method,
        params,
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Alchemy API error for ${chain.name}:`, error);
      throw error;
    }
  }

  async getBlockByNumber(blockNumber: string, chain: Chain): Promise<any> {
    return this.makeRequest('eth_getBlockByNumber', [blockNumber, false], chain);
  }

  async getLatestBlock(chain: Chain): Promise<number> {
    const response = await this.makeRequest('eth_blockNumber', [], chain);
    return formatBlockNumber(response.result);
  }

  async getTokenBalances(
    walletAddress: string,
    tokens: Token[],
    chain: Chain,
    blockNumber?: number
  ): Promise<TokenBalance[]> {
    const tokenAddresses = tokens
      .filter((t) => t.address !== 'ETH')
      .map((t) => t.address);

    const blockTag = blockNumber ? decimalToHex(blockNumber) : 'latest';

    // Get ERC20 token balances
    const tokenBalancesResponse = await this.makeRequest('alchemy_getTokenBalances', [
      walletAddress,
      tokenAddresses,
    ], chain);

    const balances: TokenBalance[] = [];

    // Get ETH balance if ETH is in the selected tokens
    const ethToken = tokens.find((t) => t.address === 'ETH');
    if (ethToken) {
      const ethBalanceResponse = await this.makeRequest('eth_getBalance', [
        walletAddress,
        blockTag,
      ], chain);

      const ethBalance = ethBalanceResponse.result;
      const formattedEthBalance = parseTokenBalance(
        parseInt(ethBalance, 16).toString(),
        18
      );

      balances.push({
        token: ethToken,
        balance: parseInt(ethBalance, 16).toString(),
        formattedBalance: formattedEthBalance,
        usdValue: 0, // Will be filled by pricing service
        pricePerToken: 0, // Will be filled by pricing service
      });
    }

    // Process ERC20 token balances
    for (const tokenBalance of tokenBalancesResponse.result.tokenBalances) {
      const token = tokens.find(
        (t) => t.address.toLowerCase() === tokenBalance.contractAddress.toLowerCase()
      );

      if (token && tokenBalance.tokenBalance) {
        const balance = parseInt(tokenBalance.tokenBalance, 16).toString();
        const formattedBalance = parseTokenBalance(balance, token.decimals);

        if (formattedBalance > 0) {
          balances.push({
            token,
            balance,
            formattedBalance,
            usdValue: 0, // Will be filled by pricing service
            pricePerToken: 0, // Will be filled by pricing service
          });
        }
      }
    }

    return balances;
  }

  async getAssetTransfers(
    walletAddress: string,
    fromBlock: number,
    toBlock: number,
    tokens: Token[],
    chain: Chain
  ): Promise<AlchemyAssetTransfer[]> {
    const allTransfers: AlchemyAssetTransfer[] = [];
    let pageKey: string | undefined;

    const categories = ['external', 'erc20'];
    const contractAddresses = tokens
      .filter((t) => t.address !== 'ETH')
      .map((t) => t.address.toLowerCase());

    do {
      const params: any = {
        fromBlock: decimalToHex(fromBlock),
        toBlock: decimalToHex(toBlock),
        category: categories,
        withMetadata: true,
        excludeZeroValue: true,
        maxCount: '0x3e8', // 1000 in hex
      };

      // Add both fromAddress and toAddress to get incoming and outgoing
      const requests = [
        { ...params, fromAddress: walletAddress },
        { ...params, toAddress: walletAddress },
      ];

      if (pageKey) {
        requests[0].pageKey = pageKey;
      }

      for (const request of requests) {
        const response: AlchemyAssetTransfersResponse = await this.makeRequest(
          'alchemy_getAssetTransfers',
          [request],
          chain
        );

        if (response.result && response.result.transfers) {
          // Filter transfers for selected tokens
          const filteredTransfers = response.result.transfers.filter((transfer) => {
            // Include ETH transfers (category: 'external')
            if (transfer.category === 'external') {
              return tokens.some((t) => t.address === 'ETH');
            }

            // Include ERC20 transfers for selected tokens
            if (transfer.category === 'erc20' && transfer.rawContract.address) {
              return contractAddresses.includes(
                transfer.rawContract.address.toLowerCase()
              );
            }

            return false;
          });

          allTransfers.push(...filteredTransfers);
          pageKey = response.result.pageKey;
        }
      }
    } while (pageKey);

    // Remove duplicates based on transaction hash
    const uniqueTransfers = Array.from(
      new Map(allTransfers.map((tx) => [tx.hash, tx])).values()
    );

    return uniqueTransfers;
  }

  async getBlockTimestamp(blockNumber: number, chain: Chain): Promise<number> {
    const response = await this.getBlockByNumber(decimalToHex(blockNumber), chain);
    return parseInt(response.result.timestamp, 16);
  }
}

export const alchemyService = new AlchemyService();
