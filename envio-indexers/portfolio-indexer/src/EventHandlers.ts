import { ERC20Token } from "generated";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

ERC20Token.Transfer.handler(async ({ event, context }) => {
  const { from, to, value } = event.params;
  const tokenAddress = event.srcAddress;
  const timestamp = BigInt(event.block.timestamp);
  const blockNumber = BigInt(event.block.number);

  const transferEntity = {
    id: `${event.transaction.hash}-${event.logIndex}`,
    from: from,
    to: to,
    value: value,
    tokenAddress: tokenAddress,
    timestamp: timestamp,
    transactionHash: event.transaction.hash,
    blockNumber: blockNumber,
  };

  context.Transfer.set(transferEntity);

  let tokenEntity = await context.Token.get(tokenAddress);
  if (!tokenEntity) {
    tokenEntity = {
      id: tokenAddress,
      address: tokenAddress,
      holderCount: 0,
      totalTransfers: 0,
      lastActivity: timestamp,
    };
  }
  tokenEntity.totalTransfers += 1;
  tokenEntity.lastActivity = timestamp;
  context.Token.set(tokenEntity);

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

  if (to !== ZERO_ADDRESS) {
    await updateUserBalance(context, to, tokenAddress, value, "add", timestamp);
    await updateUser(context, to, timestamp);
  }
});

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
      balance: BigInt(0),
      transferCount: 0,
      lastUpdated: timestamp,
    };
  }

  if (operation === "add") {
    userBalance.balance = BigInt(userBalance.balance) + BigInt(amount);
  } else {
    userBalance.balance = BigInt(userBalance.balance) - BigInt(amount);
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
