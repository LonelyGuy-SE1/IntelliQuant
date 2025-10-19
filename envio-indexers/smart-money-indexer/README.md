# Smart Money Indexer

Tracks whale and smart money addresses.

## Purpose

Monitors specific addresses (whales, successful traders) for:
- Large transfers
- Significant swaps
- Position changes

## Setup

```bash
pnpm install
pnpm codegen
pnpm envio dev  # GraphQL at http://localhost:8084
```

## Configuration

Maintain a list of tracked addresses in config or database.

## GraphQL Queries

```graphql
query GetSmartMoneyActivity($since: BigInt!) {
  SmartMoneyEvent(
    where: { timestamp: { _gte: $since } }
    order_by: { timestamp: desc }
  ) {
    id
    address
    type  # "TRANSFER" | "SWAP"
    token
    amount
    timestamp
  }
}
```

## Note

For hackathon, you can filter portfolio/DEX indexer data by whale addresses in the backend instead of running a separate indexer.
