/**
 * Portfolio Indexer Event Handlers
 * Processes ERC-20 Transfer events to maintain user token balances
 */

import { Transfer, UserBalance, User, Token } from "generated";

/**
 * Handler for ERC-20 Transfer events
 * Updates balances for both sender and recipient
 */
Transfer.handler(async ({ event, context }) => {
  const { from, to, value } = event.params;
  const tokenAddress = event.srcAddress; // The ERC-20 contract address
  const timestamp = event.block.timestamp;
  const blockNumber = event.block.number;

  // Create transfer record
  const transferEntity: Transfer = {
    id: `${event.transaction.hash}-${event.logIndex}`,
    from: from,
    to: to,
    value: value,
    tokenAddress: tokenAddress,
    tokenName: undefined, // Could be enhanced with token name lookup
    timestamp: timestamp,
    transactionHash: event.transaction.hash,
    blockNumber: blockNumber,
  };

  context.Transfer.set(transferEntity);

  // Update or create Token entity
  let tokenEntity = await context.Token.get(tokenAddress);
  if (!tokenEntity) {
    tokenEntity = {
      id: tokenAddress,
      address: tokenAddress,
      symbol: undefined, // Could be enhanced with contract calls
      decimals: undefined,
      holderCount: 0,
      totalTransfers: 0,
      lastActivity: timestamp,
    };
  }
  tokenEntity.totalTransfers += 1;
  tokenEntity.lastActivity = timestamp;
  context.Token.set(tokenEntity);

  // Ignore mint/burn from/to zero address for balance calculations
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  // Update sender balance (if not minting)
  if (from !== ZERO_ADDRESS) {
    await updateUserBalance(
      context,
      from,
      tokenAddress,
      value,
      "subtract",
      timestamp
    );
    await updateUser(context, from, timestamp);
  }

  // Update recipient balance (if not burning)
  if (to !== ZERO_ADDRESS) {
    await updateUserBalance(
      context,
      to,
      tokenAddress,
      value,
      "add",
      timestamp
    );
    await updateUser(context, to, timestamp);
  }
});

/**
 * Updates or creates a UserBalance entity
 */
async function updateUserBalance(
  context: any,
  userAddress: string,
  tokenAddress: string,
  amount: bigint,
  operation: "add" | "subtract",
  timestamp: bigint
): Promise<void> {
  const balanceId = `${userAddress}-${tokenAddress}`;

  let userBalance = await context.UserBalance.get(balanceId);

  if (!userBalance) {
    userBalance = {
      id: balanceId,
      userAddress: userAddress,
      tokenAddress: tokenAddress,
      token: undefined, // Could add token symbol lookup
      balance: 0n,
      transferCount: 0,
      lastUpdated: timestamp,
    };
  }

  // Update balance
  if (operation === "add") {
    userBalance.balance += amount;
  } else {
    userBalance.balance -= amount;
  }

  userBalance.transferCount += 1;
  userBalance.lastUpdated = timestamp;

  context.UserBalance.set(userBalance);
}

/**
 * Updates or creates a User entity
 */
async function updateUser(
  context: any,
  userAddress: string,
  timestamp: bigint
): Promise<void> {
  let user = await context.User.get(userAddress);

  if (!user) {
    user = {
      id: userAddress,
      address: userAddress,
      totalTokens: 0,
      lastUpdated: timestamp,
    };
  }

  user.lastUpdated = timestamp;

  // Count tokens with non-zero balance
  // Note: This is a simplified count; in production you'd query UserBalance entities
  // For now we'll increment on first interaction
  context.User.set(user);
}
