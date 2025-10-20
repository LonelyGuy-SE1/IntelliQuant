# IntelliQuant - ENVIO DEPLOYMENT GUIDE

## PRIORITY: Get Envio Working for $1K Prize

### Step 1: Deploy Portfolio Indexer (30 min)

```bash
cd envio-indexers/portfolio-indexer
pnpm install
```

**Test locally first:**
```bash
envio dev
```

**Deploy to hosted service:**
```bash
envio deploy
```

You'll get endpoint like:
```
https://indexer.envio.dev/YOUR-ID/v1/graphql
```

### Step 2: Update Backend .env

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
PORT=3001
CRESTAL_API_KEY=your_key_here
ENVIO_PORTFOLIO_ENDPOINT=https://indexer.envio.dev/YOUR-ID/v1/graphql
ENVIO_DEX_ENDPOINT=http://localhost:8080/v1/graphql
CORS_ORIGIN=http://localhost:5173
```

### Step 3: Start Backend

```bash
cd backend
npm install
npm start
```

### Step 4: Start Frontend

```bash
cd frontend
npm install
npm run dev
```

### Step 5: Test Flow

1. Open http://localhost:5173
2. Connect MetaMask
3. Create Smart Account
4. Click "Load Portfolio"
5. Should fetch REAL data from Envio!

## Troubleshooting Envio

### Indexer not syncing?
```bash
cd envio-indexers/portfolio-indexer
envio dev
# Watch logs for "Syncing..." messages
```

### No data showing?
- Check if tokens exist on Monad testnet
- Verify contract addresses in config.yaml
- Test GraphQL endpoint directly

### Test GraphQL directly:
```bash
curl -X POST https://indexer.envio.dev/YOUR-ID/v1/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ User { address totalTokens } }"}'
```

## For Crestal Integration

Get API key, then:
```bash
cd backend
# Update .env
CRESTAL_API_KEY=your_actual_key
```

Restart backend - AI will now use Crestal!

## Files Structure (Cleaned Up)

```
backend/
  services/
    ai-crestal.js       ✅ Crestal Agent integration
    ai-analysis.js      ✅ Portfolio analysis
    envio-client.js     ✅ Envio GraphQL queries
    scoring-engine.js   ✅ Token health scoring
    recommendations.js  ✅ AI recommendations
    
envio-indexers/
  portfolio-indexer/    ✅ Tracks token balances
    config.yaml
    schema.graphql
    src/EventHandlers.ts
```

## What Got Removed

- ❌ All useless .md files
- ❌ Mock data (no fake shit)
- ❌ OpenRouter (not using)
- ❌ Old IntentKit code (replaced with Crestal)

## You Have 3-4 Hours

**Priority Order:**
1. **Deploy Envio Portfolio Indexer** (30-60 min) - THIS GETS YOU $1K
2. **Get backend talking to Envio** (10 min)
3. **Test frontend loads real data** (10 min)
4. **Add Crestal API key** (5 min)
5. **Record demo video** (30 min)

GO GET THAT $1K! 🚀
