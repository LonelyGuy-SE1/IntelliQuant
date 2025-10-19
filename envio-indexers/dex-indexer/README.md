# DEX Indexer

Tracks DEX swap events and liquidity operations on Monad testnet.

## Purpose

This indexer monitors:
- Swap events (trades)
- Liquidity adds (Mint events)
- Liquidity removes (Burn events)
- Pool statistics

## Setup

```bash
pnpm install
pnpm codegen
pnpm envio dev  # GraphQL at http://localhost:8082
```

## Configuration

Edit `config.yaml` to add DEX pools/routers you want to track.

### Supported DEX Types

- Uniswap V2 style (constant product AMM)
- Uniswap V3 style (concentrated liquidity)

### Example: Adding pools

```yaml
networks:
  - id: 10143
    start_block: 0
    contracts:
      - name: UniswapV2Pool
        address:
          - "0xPool1Address"
          - "0xPool2Address"
```

## Schema

### Entities

- **SwapEvent**: Individual swap transactions
- **LiquidityEvent**: Mint/Burn events
- **Pool**: Aggregated pool statistics
- **PoolSnapshot**: Hourly/daily snapshots for analytics

## GraphQL Queries

### Get pool swaps

```graphql
query GetPoolSwaps($poolAddress: String!, $limit: Int = 100) {
  SwapEvent(
    where: { pool: { _eq: $poolAddress } }
    order_by: { timestamp: desc }
    limit: $limit
  ) {
    id
    sender
    recipient
    amount0In
    amount1In
    amount0Out
    amount1Out
    pool
    timestamp
  }
}
```

### Get 24h volume

```graphql
query Get24hVolume($poolAddress: String!, $since: BigInt!) {
  SwapEvent_aggregate(
    where: {
      pool: { _eq: $poolAddress }
      timestamp: { _gte: $since }
    }
  ) {
    aggregate {
      count
      sum {
        amount0In
        amount1In
      }
    }
  }
}
```

### Get liquidity changes

```graphql
query GetLiquidityEvents($poolAddress: String!) {
  LiquidityEvent(
    where: { pool: { _eq: $poolAddress } }
    order_by: { timestamp: desc }
    limit: 50
  ) {
    id
    type  # "MINT" or "BURN"
    sender
    amount0
    amount1
    liquidity
    timestamp
  }
}
```

## Event Handlers

Handlers process:
1. Swap events → Update pool statistics, record trade
2. Mint events → Track liquidity additions
3. Burn events → Track liquidity removals
4. Compute derived metrics (volume, liquidity depth)

## Testing

1. Deploy or find existing DEX on Monad testnet
2. Update `config.yaml` with pool addresses
3. Start indexer: `pnpm envio dev`
4. Execute test swaps
5. Query GraphQL to verify data
