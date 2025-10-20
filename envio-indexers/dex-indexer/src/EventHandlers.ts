/**
 * DEX Indexer Event Handlers
 * Processes swap and liquidity events from DEX pools
 *
 * Note: UniswapV2Pool and UniswapV3Pool are injected by Envio (no imports needed)
 */

/**
 * Handler for Uniswap V2 Swap events
 */
UniswapV2Pool.Swap.handler(async ({ event, context }: any) => {
  const { sender, amount0In, amount1In, amount0Out, amount1Out, to } =
    event.params;
  const poolAddress = event.srcAddress;
  const timestamp = event.block.timestamp;

  // Create swap record
  const swapEntity = {
    id: `${event.transaction.hash}-${event.logIndex}`,
    pool: poolAddress,
    sender: sender,
    recipient: undefined,
    to: to,
    amount0In: amount0In,
    amount1In: amount1In,
    amount0Out: amount0Out,
    amount1Out: amount1Out,
    sqrtPriceX96: undefined,
    liquidity: undefined,
    tick: undefined,
    timestamp: timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  };

  context.SwapEvent.set(swapEntity);

  // Update pool statistics
  await updatePoolStats(
    context,
    poolAddress,
    amount0In > 0n ? amount0In : amount0Out,
    amount1In > 0n ? amount1In : amount1Out,
    "swap",
    timestamp
  );

  // Update hourly snapshot
  await updateHourlySnapshot(
    context,
    poolAddress,
    amount0In > 0n ? amount0In : amount0Out,
    amount1In > 0n ? amount1In : amount1Out,
    timestamp
  );
});

/**
 * Handler for Uniswap V2 Mint events (liquidity add)
 */
UniswapV2Pool.Mint.handler(async ({ event, context }: any) => {
  const { sender, amount0, amount1 } = event.params;
  const poolAddress = event.srcAddress;
  const timestamp = event.block.timestamp;

  const liquidityEntity = {
    id: `${event.transaction.hash}-${event.logIndex}`,
    pool: poolAddress,
    eventType: "MINT",
    sender: sender,
    owner: undefined,
    to: undefined,
    amount0: amount0,
    amount1: amount1,
    liquidity: undefined,
    tickLower: undefined,
    tickUpper: undefined,
    timestamp: timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  };

  context.LiquidityEvent.set(liquidityEntity);

  await updatePoolStats(context, poolAddress, 0n, 0n, "liquidity", timestamp);
});

/**
 * Handler for Uniswap V2 Burn events (liquidity remove)
 */
UniswapV2Pool.Burn.handler(async ({ event, context }: any) => {
  const { sender, amount0, amount1, to } = event.params;
  const poolAddress = event.srcAddress;
  const timestamp = event.block.timestamp;

  const liquidityEntity = {
    id: `${event.transaction.hash}-${event.logIndex}`,
    pool: poolAddress,
    eventType: "BURN",
    sender: sender,
    owner: undefined,
    to: to,
    amount0: amount0,
    amount1: amount1,
    liquidity: undefined,
    tickLower: undefined,
    tickUpper: undefined,
    timestamp: timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  };

  context.LiquidityEvent.set(liquidityEntity);

  await updatePoolStats(context, poolAddress, 0n, 0n, "liquidity", timestamp);
});

/**
 * Handler for Uniswap V2 Sync events (reserve updates)
 */
UniswapV2Pool.Sync.handler(async ({ event, context }: any) => {
  const { reserve0, reserve1 } = event.params;
  const poolAddress = event.srcAddress;
  const timestamp = event.block.timestamp;

  // Record sync event
  const syncEntity = {
    id: `${event.transaction.hash}-${event.logIndex}`,
    pool: poolAddress,
    reserve0: BigInt(reserve0),
    reserve1: BigInt(reserve1),
    timestamp: timestamp,
    blockNumber: event.block.number,
  };

  context.SyncEvent.set(syncEntity);

  // Update pool reserves
  let pool = await context.Pool.get(poolAddress);
  if (!pool) {
    pool = createDefaultPool(poolAddress, timestamp);
  }

  pool.reserve0 = BigInt(reserve0);
  pool.reserve1 = BigInt(reserve1);
  pool.lastUpdated = timestamp;

  context.Pool.set(pool);
});

/**
 * Handler for Uniswap V3 Swap events
 */
UniswapV3Pool.Swap.handler(async ({ event, context }: any) => {
  const { sender, recipient, amount0, amount1, sqrtPriceX96, liquidity, tick } =
    event.params;
  const poolAddress = event.srcAddress;
  const timestamp = event.block.timestamp;

  // Convert V3 int256 to absolute values
  const abs0 = amount0 < 0n ? -amount0 : amount0;
  const abs1 = amount1 < 0n ? -amount1 : amount1;

  const swapEntity = {
    id: `${event.transaction.hash}-${event.logIndex}`,
    pool: poolAddress,
    sender: sender,
    recipient: recipient,
    to: undefined,
    amount0In: amount0 > 0n ? amount0 : 0n,
    amount1In: amount1 > 0n ? amount1 : 0n,
    amount0Out: amount0 < 0n ? abs0 : 0n,
    amount1Out: amount1 < 0n ? abs1 : 0n,
    sqrtPriceX96: sqrtPriceX96,
    liquidity: liquidity,
    tick: Number(tick),
    timestamp: timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  };

  context.SwapEvent.set(swapEntity);

  // Update pool with V3 state
  let pool = await context.Pool.get(poolAddress);
  if (!pool) {
    pool = createDefaultPool(poolAddress, timestamp);
  }

  pool.sqrtPriceX96 = sqrtPriceX96;
  pool.tick = Number(tick);
  pool.liquidity = liquidity;
  pool.totalSwaps += 1;
  pool.volume0 += abs0;
  pool.volume1 += abs1;
  pool.lastUpdated = timestamp;

  context.Pool.set(pool);

  await updateHourlySnapshot(context, poolAddress, abs0, abs1, timestamp);
});

/**
 * Updates pool statistics
 */
async function updatePoolStats(
  context: any,
  poolAddress: string,
  volume0: bigint,
  volume1: bigint,
  eventType: "swap" | "liquidity",
  timestamp: bigint
): Promise<void> {
  let pool = await context.Pool.get(poolAddress);

  if (!pool) {
    pool = createDefaultPool(poolAddress, timestamp);
  }

  if (eventType === "swap") {
    pool.totalSwaps += 1;
    pool.volume0 += volume0;
    pool.volume1 += volume1;
  } else {
    pool.totalLiquidityEvents += 1;
  }

  pool.lastUpdated = timestamp;

  context.Pool.set(pool);
}

/**
 * Creates a default pool entity
 */
function createDefaultPool(poolAddress: string, timestamp: bigint) {
  return {
    id: poolAddress,
    address: poolAddress,
    token0: undefined,
    token1: undefined,
    reserve0: undefined,
    reserve1: undefined,
    sqrtPriceX96: undefined,
    tick: undefined,
    liquidity: undefined,
    totalSwaps: 0,
    totalLiquidityEvents: 0,
    volume0: 0n,
    volume1: 0n,
    lastUpdated: timestamp,
  };
}

/**
 * Updates hourly snapshot for volume tracking
 */
async function updateHourlySnapshot(
  context: any,
  poolAddress: string,
  volume0: bigint,
  volume1: bigint,
  timestamp: bigint
): Promise<void> {
  // Round timestamp to hour
  const hourTimestamp = (timestamp / 3600n) * 3600n;
  const snapshotId = `${poolAddress}-${hourTimestamp}`;

  let snapshot = await context.PoolHourlySnapshot.get(snapshotId);

  if (!snapshot) {
    snapshot = {
      id: snapshotId,
      pool: poolAddress,
      timestamp: hourTimestamp,
      volume0: 0n,
      volume1: 0n,
      swapCount: 0,
      reserve0: undefined,
      reserve1: undefined,
      liquidityV3: undefined,
      sqrtPriceX96: undefined,
      tick: undefined,
    };
  }

  snapshot.volume0 += volume0;
  snapshot.volume1 += volume1;
  snapshot.swapCount += 1;

  context.PoolHourlySnapshot.set(snapshot);
}
