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

import { DummyContract } from "generated";

// Dummy handler to satisfy Envio requirements
DummyContract.Transfer.handler(async ({ event, context }: { event: any; context: any }) => {
  // This will never execute since we're watching WMON address minimally
  // Metrics are calculated in backend by querying DEX indexer GraphQL
});
