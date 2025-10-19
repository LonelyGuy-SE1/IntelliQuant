# Portfolio Indexer

Tracks ERC-20 token balances for user smart accounts on Monad testnet.

## Purpose

This indexer monitors `Transfer` events for tracked tokens to maintain real-time portfolio balances for each user.

## Setup

```bash
# Install dependencies
pnpm install

# Initialize (if not already done)
pnpx envio init

# Generate code from config
pnpm codegen

# Start development server (GraphQL at http://localhost:8081)
pnpm envio dev
```

## Configuration

Edit `config.yaml` to add token contracts you want to track.

### Example: Adding a new token

```yaml
networks:
  - id: 10143
    start_block: 0
    contracts:
      - name: USDCToken
        address: "0xYourUSDCAddress"
      - name: WETHToken
        address: "0xYourWETHAddress"
```

## Schema

### Entities

- **Transfer**: Individual transfer events
- **UserBalance**: Current balance per user per token
- **User**: Aggregated user data (total holdings, last updated)

## GraphQL Queries

### Get user portfolio

```graphql
query GetUserPortfolio($address: String!) {
  User(where: { address: { _eq: $address } }) {
    address
    totalTokens
    lastUpdated
    balances {
      token
      tokenAddress
      balance
      transferCount
    }
  }
}
```

### Get token holders

```graphql
query GetTokenHolders($tokenAddress: String!) {
  UserBalance(
    where: { tokenAddress: { _eq: $tokenAddress }, balance: { _gt: "0" } }
    order_by: { balance: desc }
  ) {
    userAddress
    balance
    transferCount
  }
}
```

### Get recent transfers

```graphql
query GetRecentTransfers($limit: Int = 10) {
  Transfer(order_by: { timestamp: desc }, limit: $limit) {
    id
    from
    to
    value
    tokenAddress
    timestamp
    transactionHash
  }
}
```

## Event Handlers

Event handlers are in `src/EventHandlers.ts`. They:
1. Record each transfer event
2. Update sender balance (decrease)
3. Update recipient balance (increase)
4. Maintain user entity with total holdings count

## Testing

1. Start the indexer: `pnpm envio dev`
2. Open Hasura console: http://localhost:8081/console
3. Run test queries in the GraphQL playground
4. Perform test transfers on Monad testnet
5. Verify real-time updates in queries

## Deployment

For production, use Envio Hosted Service:
- Push config to Envio cloud
- Set up API keys
- Update backend to use hosted GraphQL endpoint
