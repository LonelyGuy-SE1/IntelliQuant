/**
 * Token Metrics Indexer Event Handlers
 * 
 * NOTE: This indexer is intentionally minimal.
 * For the hackathon, token metrics are calculated in the backend
 * by querying the DEX indexer's GraphQL endpoint.
 * 
 * The DummyContract is required for Envio deployment but won't
 * actually index any events (0x0 address doesn't emit events).
 */

// Dummy handler to satisfy Envio requirements
DummyContract.Transfer.handler(async ({ event, context }) => {
  // This will never execute since we're watching 0x0 address
  // Metrics are calculated in backend by querying DEX indexer GraphQL
});
