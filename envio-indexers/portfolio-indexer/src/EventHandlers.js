const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";// Portfolio Indexer Event HandlersERC20Token.Transfer.handler(async ({ event, context }) => {



ERC20Token.Transfer.handler(async ({ event, context }) => {// Processes ERC-20 Transfer events to maintain user token balances  const { from, to, value } = event.params;

  const { from, to, value } = event.params;

  const tokenAddress = event.srcAddress;  const tokenAddress = event.srcAddress;

  const timestamp = BigInt(event.block.timestamp);

  const blockNumber = BigInt(event.block.number);const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";  const timestamp = event.block.timestamp;



  const transferEntity = {  const blockNumber = event.block.number;

    id: `${event.transaction.hash}-${event.logIndex}`,

    from: from,// Main Transfer event handler

    to: to,

    value: value,ERC20Token.Transfer.handler(async ({ event, context }) => {  const transferEntity = {

    tokenAddress: tokenAddress,

    timestamp: timestamp,  const { from, to, value } = event.params;    id: `${event.transaction.hash}-${event.logIndex}`,

    transactionHash: event.transaction.hash,

    blockNumber: blockNumber,  const tokenAddress = event.srcAddress;    from,

  };

  const timestamp = BigInt(event.block.timestamp);    to,

  context.Transfer.set(transferEntity);

  const blockNumber = BigInt(event.block.number);    value,

  let tokenEntity = await context.Token.get(tokenAddress);

  if (!tokenEntity) {    tokenAddress,

    tokenEntity = {

      id: tokenAddress,  // Create transfer record    timestamp,

      address: tokenAddress,

      holderCount: 0,  const transferEntity = {    transactionHash: event.transaction.hash,

      totalTransfers: 0,

      lastActivity: timestamp,    id: `${event.transaction.hash}-${event.logIndex}`,    blockNumber,

    };

  }    from: from,  };

  tokenEntity.totalTransfers += 1;

  tokenEntity.lastActivity = timestamp;    to: to,

  context.Token.set(tokenEntity);

    value: value,  context.Transfer.set(transferEntity);

  if (from !== ZERO_ADDRESS) {

    await updateUserBalance(context, from, tokenAddress, value, "subtract", timestamp);    tokenAddress: tokenAddress,

    await updateUser(context, from, timestamp);

  }    timestamp: timestamp,  let tokenEntity = await context.Token.get(tokenAddress);



  if (to !== ZERO_ADDRESS) {    transactionHash: event.transaction.hash,  if (!tokenEntity) {

    await updateUserBalance(context, to, tokenAddress, value, "add", timestamp);

    await updateUser(context, to, timestamp);    blockNumber: blockNumber,    tokenEntity = {

  }

});  };      id: tokenAddress,



async function updateUserBalance(context, userAddress, tokenAddress, amount, operation, timestamp) {      address: tokenAddress,

  const balanceId = `${userAddress}-${tokenAddress}`;

  let userBalance = await context.UserBalance.get(balanceId);  context.Transfer.set(transferEntity);      symbol: undefined,



  if (!userBalance) {      decimals: undefined,

    userBalance = {

      id: balanceId,  // Update or create Token entity      holderCount: 0,

      userAddress: userAddress,

      tokenAddress: tokenAddress,  let tokenEntity = await context.Token.get(tokenAddress);      totalTransfers: 0,

      balance: BigInt(0),

      transferCount: 0,  if (!tokenEntity) {      lastActivity: timestamp,

      lastUpdated: timestamp,

    };    tokenEntity = {    };

  }

      id: tokenAddress,  }

  if (operation === "add") {

    userBalance.balance = BigInt(userBalance.balance) + BigInt(amount);      address: tokenAddress,  tokenEntity.totalTransfers += 1;

  } else {

    userBalance.balance = BigInt(userBalance.balance) - BigInt(amount);      holderCount: 0,  tokenEntity.lastActivity = timestamp;

  }

      totalTransfers: 0,  context.Token.set(tokenEntity);

  userBalance.transferCount += 1;

  userBalance.lastUpdated = timestamp;      lastActivity: timestamp,

  context.UserBalance.set(userBalance);

}    };  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";



async function updateUser(context, userAddress, timestamp) {  }

  let user = await context.User.get(userAddress);

  tokenEntity.totalTransfers += 1;  if (from !== ZERO_ADDRESS) {

  if (!user) {

    user = {  tokenEntity.lastActivity = timestamp;    await updateUserBalance(

      id: userAddress,

      address: userAddress,  context.Token.set(tokenEntity);      context,

      totalTokens: 0,

      lastUpdated: timestamp,      from,

    };

  }  // Update sender balance (if not minting)      tokenAddress,



  user.lastUpdated = timestamp;  if (from !== ZERO_ADDRESS) {      value,

  context.User.set(user);

}    await updateUserBalance(context, from, tokenAddress, value, "subtract", timestamp);      "subtract",


    await updateUser(context, from, timestamp);      timestamp

  }    );

    await updateUser(context, from, timestamp);

  // Update recipient balance (if not burning)  }

  if (to !== ZERO_ADDRESS) {

    await updateUserBalance(context, to, tokenAddress, value, "add", timestamp);  if (to !== ZERO_ADDRESS) {

    await updateUser(context, to, timestamp);    await updateUserBalance(context, to, tokenAddress, value, "add", timestamp);

  }    await updateUser(context, to, timestamp);

});  }

});

// Helper function to update user token balance

async function updateUserBalance(async function updateUserBalance(

  context,  context,

  userAddress,  userAddress,

  tokenAddress,  tokenAddress,

  amount,  amount,

  operation,  operation,

  timestamp  timestamp

) {) {

  const balanceId = `${userAddress}-${tokenAddress}`;  const balanceId = `${userAddress}-${tokenAddress}`;

  let userBalance = await context.UserBalance.get(balanceId);  let userBalance = await context.UserBalance.get(balanceId);



  if (!userBalance) {  if (!userBalance) {

    userBalance = {    userBalance = {

      id: balanceId,      id: balanceId,

      userAddress: userAddress,      userAddress,

      tokenAddress: tokenAddress,      tokenAddress,

      balance: BigInt(0),      balance: 0n,

      transferCount: 0,      transferCount: 0,

      lastUpdated: timestamp,      lastUpdated: timestamp,

    };    };

  }  }



  if (operation === "add") {  if (operation === "add") {

    userBalance.balance = BigInt(userBalance.balance) + BigInt(amount);    userBalance.balance += amount;

  } else {  } else {

    userBalance.balance = BigInt(userBalance.balance) - BigInt(amount);    userBalance.balance -= amount;

  }  }



  userBalance.transferCount += 1;  userBalance.transferCount += 1;

  userBalance.lastUpdated = timestamp;  userBalance.lastUpdated = timestamp;

  context.UserBalance.set(userBalance);  context.UserBalance.set(userBalance);

}}



// Helper function to update user metadataasync function updateUser(context, userAddress, timestamp) {

async function updateUser(context, userAddress, timestamp) {  let user = await context.User.get(userAddress);

  let user = await context.User.get(userAddress);

  if (!user) {

  if (!user) {    user = {

    user = {      id: userAddress,

      id: userAddress,      address: userAddress,

      address: userAddress,      totalTokens: 0,

      totalTokens: 0,      lastUpdated: timestamp,

      lastUpdated: timestamp,    };

    };  }

  }

  user.lastUpdated = timestamp;

  user.lastUpdated = timestamp;  context.User.set(user);

  context.User.set(user);}

}
