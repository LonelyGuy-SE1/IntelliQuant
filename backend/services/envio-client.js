/**
 * Envio GraphQL Client
 * Queries Envio indexers for blockchain data
 */

import { GraphQLClient, gql } from "graphql-request";
import dotenv from "dotenv";

dotenv.config();

// Initialize GraphQL clients for each indexer
const portfolioClient = new GraphQLClient(
  process.env.ENVIO_PORTFOLIO_ENDPOINT || "http://localhost:8080/v1/graphql"
);
const dexClient = new GraphQLClient(
  process.env.ENVIO_DEX_ENDPOINT || "http://localhost:8080/v1/graphql"
);

/**
 * Get user portfolio balances
 * @param {string} address - User smart account address
 * @returns {Promise<Object>} Portfolio data
 */
export async function getUserPortfolio(address) {
  const query = gql`
    query GetUserPortfolio($address: String!) {
      UserBalance(
        where: { userAddress: { _eq: $address }, balance: { _gt: "0" } }
      ) {
        id
        userAddress
        tokenAddress
        token
        balance
        transferCount
        lastUpdated
      }
    }
  `;

  try {
    const data = await portfolioClient.request(query, {
      address: address.toLowerCase(),
    });

    // Format response
    if (!data.UserBalance || data.UserBalance.length === 0) {
      return {
        address,
        balances: [],
        totalTokens: 0,
      };
    }

    return {
      address,
      balances: data.UserBalance,
      totalTokens: data.UserBalance.length,
      lastUpdated: Math.max(
        ...data.UserBalance.map((b) => Number(b.lastUpdated))
      ),
    };
  } catch (error) {
    console.error("Error fetching portfolio:", error.message);
    throw error;
  }
}

/**
 * Get pool data for a specific token pair
 * @param {string} poolAddress - DEX pool address
 * @returns {Promise<Object>} Pool statistics
 */
export async function getPoolData(poolAddress) {
  const query = gql`
    query GetPoolData($poolAddress: String!) {
      Pool(where: { address: { _eq: $poolAddress } }) {
        address
        token0
        token1
        reserve0
        reserve1
        sqrtPriceX96
        tick
        liquidity
        totalSwaps
        volume0
        volume1
        lastUpdated
      }
    }
  `;

  try {
    const data = await dexClient.request(query, {
      poolAddress: poolAddress.toLowerCase(),
    });
    return data.Pool[0] || null;
  } catch (error) {
    console.error("Error fetching pool data:", error.message);
    throw error;
  }
}

/**
 * Get 24h volume for a pool
 * @param {string} poolAddress - Pool address
 * @returns {Promise<Object>} Volume statistics
 */
export async function get24hVolume(poolAddress) {
  const oneDayAgo = BigInt(Math.floor(Date.now() / 1000) - 86400);

  const query = gql`
    query Get24hVolume($poolAddress: String!, $since: BigInt!) {
      SwapEvent_aggregate(
        where: { pool: { _eq: $poolAddress }, timestamp: { _gte: $since } }
      ) {
        aggregate {
          count
          sum {
            amount0In
            amount1In
            amount0Out
            amount1Out
          }
        }
      }
    }
  `;

  try {
    const data = await dexClient.request(query, {
      poolAddress: poolAddress.toLowerCase(),
      since: oneDayAgo.toString(),
    });

    const agg = data.SwapEvent_aggregate.aggregate;

    return {
      swapCount: agg.count || 0,
      volume0:
        BigInt(agg.sum?.amount0In || 0) + BigInt(agg.sum?.amount0Out || 0),
      volume1:
        BigInt(agg.sum?.amount1In || 0) + BigInt(agg.sum?.amount1Out || 0),
    };
  } catch (error) {
    console.error("Error fetching 24h volume:", error.message);
    return { swapCount: 0, volume0: 0n, volume1: 0n };
  }
}

/**
 * Get recent swaps for a pool
 * @param {string} poolAddress - Pool address
 * @param {number} limit - Number of swaps to return
 * @returns {Promise<Array>} Recent swap events
 */
export async function getRecentSwaps(poolAddress, limit = 50) {
  const query = gql`
    query GetRecentSwaps($poolAddress: String!, $limit: Int!) {
      SwapEvent(
        where: { pool: { _eq: $poolAddress } }
        order_by: { timestamp: desc }
        limit: $limit
      ) {
        id
        sender
        recipient
        to
        amount0In
        amount1In
        amount0Out
        amount1Out
        timestamp
        transactionHash
      }
    }
  `;

  try {
    const data = await dexClient.request(query, {
      poolAddress: poolAddress.toLowerCase(),
      limit,
    });
    return data.SwapEvent || [];
  } catch (error) {
    console.error("Error fetching recent swaps:", error.message);
    return [];
  }
}

/**
 * Get hourly snapshots for analytics
 * @param {string} poolAddress - Pool address
 * @param {number} hours - Number of hours to look back
 * @returns {Promise<Array>} Hourly snapshot data
 */
export async function getPoolSnapshots(poolAddress, hours = 24) {
  const hoursAgo = BigInt(Math.floor(Date.now() / 1000) - hours * 3600);

  const query = gql`
    query GetPoolSnapshots($poolAddress: String!, $since: BigInt!) {
      PoolHourlySnapshot(
        where: { pool: { _eq: $poolAddress }, timestamp: { _gte: $since } }
        order_by: { timestamp: asc }
      ) {
        timestamp
        volume0
        volume1
        swapCount
        reserve0
        reserve1
        liquidityV3
        sqrtPriceX96
      }
    }
  `;

  try {
    const data = await dexClient.request(query, {
      poolAddress: poolAddress.toLowerCase(),
      since: hoursAgo.toString(),
    });
    return data.PoolHourlySnapshot || [];
  } catch (error) {
    console.error("Error fetching pool snapshots:", error.message);
    return [];
  }
}

/**
 * Get all pools containing a specific token
 * @param {string} tokenAddress - Token address
 * @returns {Promise<Array>} List of pools
 */
export async function getTokenPools(tokenAddress) {
  const query = gql`
    query GetTokenPools($tokenAddress: String!) {
      Pool(
        where: {
          _or: [
            { token0: { _eq: $tokenAddress } }
            { token1: { _eq: $tokenAddress } }
          ]
        }
      ) {
        address
        token0
        token1
        reserve0
        reserve1
        liquidity
        totalSwaps
        volume0
        volume1
        lastUpdated
      }
    }
  `;

  try {
    const data = await dexClient.request(query, {
      tokenAddress: tokenAddress.toLowerCase(),
    });
    return data.Pool || [];
  } catch (error) {
    console.error("Error fetching token pools:", error.message);
    return [];
  }
}

/**
 * Get large transfers (whale activity)
 * @param {string} tokenAddress - Token to monitor
 * @param {string} minAmount - Minimum transfer amount (in wei)
 * @param {number} limit - Number of transfers to return
 * @returns {Promise<Array>} Large transfer events
 */
export async function getLargeTransfers(
  tokenAddress,
  minAmount = "1000000000000000000000",
  limit = 100
) {
  const query = gql`
    query GetLargeTransfers(
      $tokenAddress: String!
      $minAmount: BigInt!
      $limit: Int!
    ) {
      Transfer(
        where: {
          tokenAddress: { _eq: $tokenAddress }
          value: { _gte: $minAmount }
        }
        order_by: { timestamp: desc }
        limit: $limit
      ) {
        id
        from
        to
        value
        timestamp
        transactionHash
      }
    }
  `;

  try {
    const data = await portfolioClient.request(query, {
      tokenAddress: tokenAddress.toLowerCase(),
      minAmount,
      limit,
    });
    return data.Transfer || [];
  } catch (error) {
    console.error("Error fetching large transfers:", error.message);
    return [];
  }
}

export default {
  getUserPortfolio,
  getPoolData,
  get24hVolume,
  getRecentSwaps,
  getPoolSnapshots,
  getTokenPools,
  getLargeTransfers,
};
