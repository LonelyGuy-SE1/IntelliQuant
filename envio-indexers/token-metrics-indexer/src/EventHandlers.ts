/**
 * Token Metrics Indexer Event Handlers
 *
 * NOTE: This indexer is intentionally minimal.
 * For the hackathon, token metrics are calculated in the backend
 * by querying the DEX indexer's GraphQL endpoint.
 *
 * The DummyContract watches WMON minimally just to satisfy Envio requirements.
 *
 * Note: DummyContract is injected by Envio (no import needed)
 */

// Dummy handler to satisfy Envio requirements
DummyContract.Transfer.handler(async ({ event, context }: any) => {
  // This is a minimal handler - metrics are calculated in backend
  // by querying DEX indexer GraphQL
});
