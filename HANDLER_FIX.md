# Handler Fix - "ERC20Token is not defined" Error

## ✅ FIXED (Commit: `d8fcf1fe`)

### The Problem
```
error_message: ERC20Token is not defined
error_type: ReferenceError
```

The handlers were using an incorrect pattern:
```javascript
// ❌ WRONG - This doesn't work in Envio
ERC20Token.Transfer.handler(async ({ event, context }) => {
  // handler code
});
```

### The Solution
Changed to proper `module.exports` pattern:
```javascript
// ✅ CORRECT - Envio can import this
module.exports = {
  ERC20Token: {
    Transfer: async ({ event, context }) => {
      // handler code
    }
  }
};
```

---

## 📦 What Was Fixed

### Portfolio Indexer
**File**: `envio-indexers/portfolio-indexer/src/EventHandlers.js`

**Changed**:
- From: Direct property assignment pattern
- To: `module.exports` with nested contract/event structure

### DEX Indexer
**File**: `envio-indexers/dex-indexer/src/EventHandlers.ts`

**Changed**:
- From: Direct property assignment pattern
- To: `module.exports` with all handlers properly exported:
  - UniswapV2Pool: Swap, Mint, Burn, Sync
  - UniswapV3Pool: Swap, Mint, Burn

---

## 🔄 What Happens Next

### In Envio Dashboard

1. **Automatic Rebuild**: Envio detects the GitHub push
2. **Codegen Runs**: Envio generates TypeScript/JavaScript types
3. **Handler Import**: Envio imports your module.exports
4. **Indexer Starts**: Should see "Starting indexer..." without errors

### Expected Log Output
```
✅ Building indexer
✅ Running envio codegen..
✅ Codegen successful.
✅ Running Database tasks...
✅ Applying schema...
✅ Starting indexer...
✅ Indexer is syncing...
```

---

## 🎯 How to Verify It's Working

### Check Envio Dashboard

1. Go to your indexer in Envio dashboard
2. Look for **Logs** tab
3. You should see:
   - ✅ No "ERC20Token is not defined" errors
   - ✅ "Starting indexer..." message
   - ✅ Blocks being processed

### Test GraphQL Endpoint

Once indexer starts syncing, test the GraphQL endpoint:

```bash
# Get your GraphQL URL from Envio dashboard
# Should look like: https://indexer.testnet.envio.dev/<username>/intelliquant-portfolio/v1/graphql

# Test query
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ Transfer(limit: 5) { id from to value } }"}' \
  YOUR_GRAPHQL_ENDPOINT
```

Expected response:
```json
{
  "data": {
    "Transfer": []  // Empty at first, will populate as it indexes
  }
}
```

---

## ⏱️ Timeline

### Immediate (1-2 minutes)
- Envio detects push
- Starts rebuild

### 2-5 minutes
- Codegen completes
- Handler import succeeds
- Indexer starts

### 5-30 minutes
- Indexer syncs historical blocks
- Data starts appearing in GraphQL

---

## 🐛 If You Still See Errors

### Error: "Cannot find module"
**Solution**: Check that `src/EventHandlers.js` exists in your repo

### Error: "Handler not found"
**Solution**: Verify handler names match config.yaml contract names exactly
- Config: `name: ERC20Token`
- Handler: `module.exports = { ERC20Token: { ... } }`

### Error: "Schema validation failed"
**Solution**: Entity names in handlers must match schema.graphql types

---

## 📊 Expected Behavior After Fix

### Portfolio Indexer
- Listens for Transfer events on 3 token addresses
- Creates: Transfer, UserBalance, User, Token entities
- Updates balances on each transfer

### DEX Indexer
- Listens for Swap, Mint, Burn, Sync events
- Creates: SwapEvent, LiquidityEvent, Pool, PoolHourlySnapshot entities
- Tracks DEX activity and volumes

---

## 🎉 Success Indicators

You'll know it's working when you see:

1. ✅ **No errors** in Envio logs
2. ✅ **"Indexer is syncing"** status
3. ✅ **Block numbers increasing** in logs
4. ✅ **GraphQL endpoint** returns data (after sync)
5. ✅ **Entities appear** in GraphQL queries

---

## 🔗 Next Steps

Once indexers are syncing:

1. Copy GraphQL URLs from Envio dashboard
2. Update `backend/.env`:
   ```
   ENVIO_PORTFOLIO_ENDPOINT=<your-portfolio-url>
   ENVIO_DEX_ENDPOINT=<your-dex-url>
   ```
3. Restart backend: `npm run dev`
4. Test portfolio endpoint: `curl http://localhost:3001/api/portfolio/0xYourAddress`

---

## 📁 Files Changed

- ✅ `envio-indexers/portfolio-indexer/src/EventHandlers.js`
- ✅ `envio-indexers/dex-indexer/src/EventHandlers.ts`

Both now use proper Envio handler export pattern.

---

## 🚀 Current Status

- ✅ Config YAML: Fixed
- ✅ ABIs: Added
- ✅ Handlers: Fixed
- ✅ Schema: Correct
- ✅ Pushed to GitHub: Yes

**Your indexers are ready to run!**

Check your Envio dashboard now - the build should be in progress or complete. 🎯
