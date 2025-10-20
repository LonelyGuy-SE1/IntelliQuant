/**
 * Portfolio Indexer Event Handlers
 * Processes ERC-20 Transfer events to maintain user token balances
 */

module.exports = {
  ERC20Token: {
    Transfer: {
      handler: async ({ event, context }) => {
  const { from, to, value } = event.params;
  const tokenAddress = event.srcAddress;
  const timestamp = event.block.timestamp;
  const blockNumber = event.block.number;

  // Create transfer record
  const transferEntity = {
    id: `${event.transaction.hash}-${event.logIndex}`,
    from: from,
    to: to,
    value: value,
    tokenAddress: tokenAddress,
    tokenName: undefined,
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
      symbol: undefined,
      decimals: undefined,
      holderCount: 0,
      totalTransfers: 0,
      lastActivity: timestamp,
    };
  }
  tokenEntity.totalTransfers += 1;
  tokenEntity.lastActivity = timestamp;
  context.Token.set(tokenEntity);

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  // Update sender balance (if not minting)
  if (from !== ZERO_ADDRESS) {
    await updateUserBalance(context, from, tokenAddress, value, "subtract", timestamp);
    await updateUser(context, from, timestamp);
  }

  // Update recipient balance (if not burning)
  if (to !== ZERO_ADDRESS) {
    await updateUserBalance(context, to, tokenAddress, value, "add", timestamp);
    await updateUser(context, to, timestamp);
  }
      },
    },
  },
};

async function updateUserBalance(
  context,
  userAddress,
  tokenAddress,
  amount,
  operation,
  timestamp
) {
  const balanceId = `${userAddress}-${tokenAddress}`;
  let userBalance = await context.UserBalance.get(balanceId);

  if (!userBalance) {
    userBalance = {
      id: balanceId,
      userAddress: userAddress,
      tokenAddress: tokenAddress,
      token: undefined,
      balance: 0n,
      transferCount: 0,
      lastUpdated: timestamp,
    };
  }

  if (operation === "add") {
    userBalance.balance += amount;
  } else {
    userBalance.balance -= amount;
  }

  userBalance.transferCount += 1;
  userBalance.lastUpdated = timestamp;
  context.UserBalance.set(userBalance);
}

async function updateUser(context, userAddress, timestamp) {
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
  context.User.set(user);
}
