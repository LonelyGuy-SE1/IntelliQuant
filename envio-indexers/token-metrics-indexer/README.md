# Token Metrics Indexer

Aggregates DEX data to compute token health metrics.

## Purpose

Consumes data from DEX indexer to calculate:
- Liquidity depth (TVL in pools)
- 24h trading volume
- Transaction frequency
- Slippage estimates

## Setup

```bash
pnpm install
pnpm codegen
pnpm envio dev  # GraphQL at http://localhost:8083
```

## Note

This indexer can reuse the DEX indexer's data and add computed metrics. Alternatively, implement as a backend service that queries the DEX indexer's GraphQL endpoint.

For simplicity in the hackathon, you may combine this logic with the backend scoring engine instead of running a separate indexer.

## GraphQL Queries

```graphql
query GetTokenMetrics($tokenAddress: String!) {
  TokenMetrics(where: { address: { _eq: $tokenAddress } }) {
    address
    liquidity
    volume24h
    txCount24h
    lastUpdated
  }
}
```
