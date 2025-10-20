# Envio Indexer Deployment Fix - October 20, 2025

## Problems Encountered

### Issue #1: Invalid Version Errors

All 3 indexers were showing "Invalid version" errors on the Envio hosted platform.

**Root Cause**: The `package.json` files were using `"envio": "latest"` which was pulling an unstable or incompatible version.

### Issue #2: Missing schema.graphql File

After fixing the version issue, builds failed with:

```
Error: Failed cli execution Caused by: 0: Failed parsing config 1: Parsing
schema file for config 2: EE200: Failed to read schema file at schema.graphql.
Please ensure that the schema file is placed correctly in the directory. 3: No
such file or directory (os error 2)
```

**Root Cause**: The `token-metrics-indexer/schema.graphql` file was not committed to the repository.

### Issue #3: Invalid `abi` Field in config.yaml

After fixing the schema issue, builds failed with:

```
Error: Failed cli execution
Caused by:
    0: Failed parsing config
    1: EE105: Failed to deserialize config from /tmp/envio-hosted/envio-config/config.yaml
    2: contracts[0]: unknown field `abi` at line 9 column 5
```

**Root Cause**: The config.yaml files were using an old/incorrect format where the `abi` field was explicitly defined as a separate field under each contract. In Envio v2.28.2, the `abi` field is NOT supported as a top-level field within contract definitions.

### Issue #4: Reserved Keyword "type" in GraphQL Schema

After fixing the config format, the dex-indexer failed with:

```
Error: EE210: Schema contains the following reserved keywords: type
```

**Root Cause**: The `LiquidityEvent` entity in the dex-indexer's `schema.graphql` had a field named `type`, which is a reserved keyword in GraphQL. Field names cannot use GraphQL reserved words like `type`, `query`, `mutation`, etc.

### Issue #5: Missing EventHandlers.ts in Token Metrics Indexer

The token-metrics-indexer was completing codegen but failing at "Failed to apply schema" stage.

**Root Cause**: The token-metrics-indexer had no `src/EventHandlers.ts` file. Even though this indexer has empty contracts arrays and is meant to calculate metrics in the backend, Envio still requires an EventHandlers.ts file for deployment.

## Solutions Applied

### Fix #1: Pin Envio Version

Pinned the envio version to `^2.28.2` (the same version used in the working RevokeMe hackathon example: https://github.com/dhruv457457/RevokeMe).

**Files Modified:**

1. `envio-indexers/dex-indexer/package.json`
2. `envio-indexers/portfolio-indexer/package.json`
3. `envio-indexers/token-metrics-indexer/package.json`

**Change:**

```json
// BEFORE
"dependencies": {
  "envio": "latest"
}

// AFTER
"dependencies": {
  "envio": "^2.28.2"
}
```

### Fix #2: Add Missing Schema File

Created minimal `schema.graphql` for token-metrics-indexer with a placeholder entity.

**File Created:**

- `envio-indexers/token-metrics-indexer/schema.graphql`

**Content:**

```graphql
type TokenMetric @entity {
  id: ID!
}
```

### Fix #3: Remove Deprecated `abi` Field

Removed the `abi:` sections from both indexer config files. Events should be specified directly under the `events:` field without a duplicate `abi:` section.

**Files Modified:**

- `envio-indexers/dex-indexer/config.yaml`
- `envio-indexers/portfolio-indexer/config.yaml`

**Change:**

```yaml
# BEFORE (INCORRECT - causes "unknown field `abi`" error)
contracts:
  - name: ERC20Token
    handler: src/EventHandlers.ts
    events:
      - event: "Transfer(address indexed from, address indexed to, uint256 value)"
    abi:  # ❌ This field is NOT supported in Envio v2.28.2
      - event: "Transfer(address indexed from, address indexed to, uint256 value)"

# AFTER (CORRECT)
contracts:
  - name: ERC20Token
    handler: src/EventHandlers.ts
    events:
      - event: "Transfer(address indexed from, address indexed to, uint256 value)"
```

### Fix #4: Rename Reserved Keyword Field

Renamed the `type` field to `eventType` in the dex-indexer schema and handlers.

**Files Modified:**

- `envio-indexers/dex-indexer/schema.graphql`
- `envio-indexers/dex-indexer/src/EventHandlers.ts`

**Change:**

```graphql
# BEFORE (causes "reserved keywords: type" error)
type LiquidityEvent @entity {
  id: ID!
  pool: String!
  type: String!  # ❌ "type" is a reserved keyword
  ...
}

# AFTER (correct)
type LiquidityEvent @entity {
  id: ID!
  pool: String!
  eventType: String!  # ✅ Renamed to avoid reserved keyword
  ...
}
```

```typescript
// Updated in EventHandlers.ts
const liquidityEntity: LiquidityEvent = {
  eventType: "MINT",  // Changed from: type: "MINT"
  ...
};
```

### Fix #5: Add Minimal EventHandlers File

Created an empty `EventHandlers.ts` file for the token-metrics-indexer to satisfy Envio's deployment requirements.

**File Created:**

- `envio-indexers/token-metrics-indexer/src/EventHandlers.ts`

**Content:**

```typescript
/**
 * Token Metrics Indexer Event Handlers
 *
 * NOTE: This indexer is intentionally minimal.
 * For the hackathon, token metrics are calculated in the backend
 * by querying the DEX indexer's GraphQL endpoint.
 */

export {};
```

**Note:** This indexer has no contracts to index - it's designed to let the backend calculate metrics by querying the dex-indexer's GraphQL API.

## Git History

- **Commit 1**: `307b0c2` - "fix(envio): Pin envio version to ^2.28.2 to fix deployment validation errors"
- **Commit 2**: `5fc5893` - "fix(envio): Add missing schema.graphql to token-metrics-indexer"
- **Commit 3**: `a26eda8` - ~~"fix(envio): Remove deprecated 'abi' field"~~ ❌ **FAILED - only changed whitespace**
- **Commit 4**: `3acee17` - "docs(envio): Update deployment fix documentation"
- **Commit 5**: `7046edb` - "fix(envio): ACTUALLY remove deprecated 'abi' field from config.yaml" ✅ **THE REAL FIX**
- **Commit 6**: `98a375e` - "docs(envio): Clarify that commit a26eda8 failed and 7046edb is the real fix"
- **Commit 7**: `4d29690` - "fix(envio): Rename 'type' to 'eventType' in LiquidityEvent schema" ✅ **FIXES DEX INDEXER**
- **Commit 8**: `afd1955` - "docs(envio): Document reserved keyword fix for dex-indexer"
- **Commit 9**: `8db325c` - "fix(envio): Add minimal EventHandlers.ts to token-metrics-indexer" ✅ **FIXES TOKEN METRICS**
- **Commit 10**: `b0bc379` - "fix(envio): Enhance token-metrics schema with actual metric fields"
- **Commit 11**: `192d9cd` - "docs(envio): Document schema enhancement for token-metrics"
- **Commit 12**: `5c9a0ba` - "fix(envio): Add dummy contract to token-metrics config for deployment"
- **Commit 13**: `a2458da` - "fix(envio): Add missing contract imports to EventHandlers" ⚠️ **CRITICAL FIX**
- **Branch**: `envio` (pushed to origin)
- **Date**: October 20, 2025

### ⚠️ Important Note About the Failed Fix

**Commit a26eda8 DID NOT WORK!** Despite the commit message saying it removed the `abi` field, it only changed whitespace. This is why deployments continued failing with the same error even after that commit.

**Commit 7046edb is the actual working fix** that removes all `abi:` sections from config.yaml files.

## Deployment Status

The fix has been pushed to the `envio` branch which triggers automatic deployment on the Envio hosted platform.

### Expected Result:

All 3 indexers should now deploy successfully:

1. **IntelliQuant-DEX** - Indexes DEX swap and liquidity events
2. **IntelliQuant-Portfolio** - Indexes ERC-20 token transfers for portfolio tracking
3. **IntelliQuant-TokenMetrics** - Token metrics aggregation (minimal config, may still need schema.graphql)

## Notes for Future Developers

### Why "latest" Failed:

- The "latest" tag can pull breaking changes or unstable versions
- Envio's hosted platform has strict validation requirements
- Using specific version numbers ensures reproducible deployments

### Config Format Changes in Envio v2.28.2:

- **OLD FORMAT (DEPRECATED)**: Separate `abi:` field under each contract
- **NEW FORMAT (REQUIRED)**: Events listed only under `events:` field
- The `abi` field was likely used in older Envio versions but is no longer supported

### Handler Syntax Requirements:

- **INCORRECT**: `import { Transfer } from "generated"; Transfer.handler(...)`
- **CORRECT**: `import { ERC20Token, Transfer } from "generated"; ERC20Token.Transfer.handler(...)`
- The contract name MUST be imported and used to scope the event handler
- Reference: https://github.com/dhruv457457/RevokeMe/blob/main/envioIndexer/src/EventHandlers.ts
- Attempting to use `abi:` results in deserialization error: `unknown field 'abi'`

### Indexer Configuration:

- **DEX Indexer**: ✅ Has all required files (config.yaml, schema.graphql, EventHandlers.ts, package.json)
- **Portfolio Indexer**: ✅ Has all required files (config.yaml, schema.graphql, EventHandlers.ts, package.json)
- **Token Metrics Indexer**: ✅ Now has all required files (config.yaml, schema.graphql, package.json)
  - Note: Has empty contracts array - designed to query DEX indexer's GraphQL endpoint

### Git Workflow for Envio Deployments:

1. Make changes to indexer code
2. Commit to your feature branch
3. Create PR to merge into `envio` branch (recommended)
4. Or directly push to `envio` branch (will trigger deployment)
5. Monitor deployment status on https://envio.dev

### Reference Projects:

- Working Example: https://github.com/dhruv457457/RevokeMe/tree/main/envioIndexer
- Envio Docs: https://docs.envio.dev/docs/HyperIndex/overview

## Verification Steps

1. Go to https://envio.dev
2. Check the dashboard for your indexers
3. Verify deployments are no longer showing "Invalid version" errors
4. Check that indexers move from "No Deployments Found" to active deployment status

## Troubleshooting

If deployments still fail:

1. Check the Envio dashboard for specific error messages
2. Verify all required files are present in the git repo
3. Ensure config.yaml has valid contract configurations
4. Check that schema.graphql is properly defined for each indexer
5. Review Envio logs at https://docs.envio.dev/docs/HyperIndex/logging
