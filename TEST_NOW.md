# 🧪 Testing Guide - Verify Everything Works

**Status**: Code pushed to GitHub ✅  
**Envio Fix**: Import from "generated" added ✅  
**Crestal API Key**: Configured ✅

---

## 1️⃣ Check Envio Deployment (IN PROGRESS)

Go to your Envio dashboard and watch the logs. The error should be **GONE** now because we fixed:

```typescript
// OLD (BROKEN):
ERC20Token.Transfer.handler(async ({ event, context }: any) => {

// NEW (FIXED):
import { ERC20Token } from "generated";
ERC20Token.Transfer.handler(async ({ event, context }) => {
```

**Expected Result**:

- ✅ "Codegen successful"
- ✅ "Starting indexer..."
- ✅ "Syncing..." (it will start indexing Monad testnet blocks)
- ✅ GraphQL endpoint becomes available

Once you see **"Historical Sync Complete"**, copy your endpoint URL!

---

## 2️⃣ Test Crestal AI Agent

### Test via API

Open terminal and run:

```bash
cd backend
npm install
npm start
```

Then in another terminal:

```bash
curl http://localhost:3001/api/ai/test
```

**Expected Response**:

```json
{
  "success": true,
  "message": "Crestal AI Agent is working!",
  "analysis": {
    "summary": "2 tokens, 66% diversified",
    "riskLevel": "medium",
    "diversification": 66.7,
    "insights": [...],
    "recommendations": [...],
    "aiPowered": true,
    "provider": "Crestal"
  }
}
```

**If you see `aiPowered: true`** → Crestal is working! 🎉

**If you see `aiPowered: false`** → API key issue or network problem

---

## 3️⃣ Update Backend Config

Once Envio gives you the GraphQL endpoint, update `backend/.env`:

```env
# Replace this line:
ENVIO_PORTFOLIO_ENDPOINT=https://indexer.envio.dev/YOUR_INDEXER_ID/v1/graphql

# With your actual endpoint (looks like):
ENVIO_PORTFOLIO_ENDPOINT=https://indexer.envio.dev/abc123xyz/v1/graphql
```

Restart backend:

```bash
# Ctrl+C to stop, then:
npm start
```

---

## 4️⃣ Test Full Stack

### Start Frontend

```bash
cd frontend
npm run dev
```

Open: http://localhost:5173

### Testing Flow

1. **Connect Wallet**

   - Click "Connect Wallet"
   - Approve MetaMask
   - Should see your address

2. **Create Smart Account**

   - Click "Create Smart Account"
   - Sign in MetaMask
   - Should see smart account address

3. **Load Portfolio** (needs Envio endpoint configured)

   - Click "Load Portfolio"
   - Should see token balances from Envio
   - **NEW**: Should auto-show AI analysis below!

4. **Test AI Analysis**
   - After loading portfolio, scroll down
   - Look for "🤖 AI Analysis (Crestal Agent)"
   - Should show:
     - Risk level (HIGH/MEDIUM/LOW)
     - Diversification score
     - Insights
     - Recommendations

---

## 5️⃣ Verify AI Integration in UI

The portfolio page now shows:

```
┌─────────────────────────────────┐
│ Holdings                        │
│ • WMON: 1,000,000              │
│ • ETH:  500,000                │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 🤖 AI Analysis (Crestal Agent) │
│ MEDIUM RISK                     │
│                                 │
│ 2 tokens, 66% diversified       │
│                                 │
│ Diversification: 66.7%          │
│ Total Tokens: 2                 │
│ Top Holding: 66.7%              │
│                                 │
│ 💡 Insights                     │
│ • Portfolio analyzed            │
│                                 │
│ 📊 Recommendations              │
│ • Monitor allocations           │
└─────────────────────────────────┘
```

---

## 🔍 Troubleshooting

### Envio Still Failing?

Check the error message. If it says anything about:

- "Cannot find name 'ERC20Token'" → Old code cached, wait for redeploy
- "Module not found" → Check package.json has envio ^2.30.1
- Network errors → Check Monad RPC is accessible

### Crestal Not Working?

Test the API key:

```bash
curl -H "Authorization: Bearer sk-YlPzDMJbLwKoCvIBbGdYIuLsDDEsXlxsWKFSyIxSbLcCmBoK" \
  -X POST https://open.service.crestal.network/v1/conversation
```

Should return: `{"conversation_id": "..."}`

If error → API key invalid

### Frontend Not Showing AI?

Check browser console (F12):

- Look for errors in Network tab
- Check if `/portfolio/:address/analyze` endpoint returns data
- Verify `displayAIAnalysis()` function is being called

---

## ✅ Success Checklist

- [ ] Envio dashboard shows "Historical Sync Complete"
- [ ] GraphQL endpoint accessible (test in playground)
- [ ] Backend test endpoint returns `"aiPowered": true`
- [ ] Backend `.env` has correct Envio endpoint
- [ ] Frontend connects to MetaMask
- [ ] Frontend creates smart account
- [ ] Frontend loads portfolio from Envio
- [ ] Frontend shows AI analysis with Crestal badge
- [ ] AI analysis shows realistic insights

---

## 📊 What Changed

### Envio Fix

```diff
+ import { ERC20Token } from "generated";
- ERC20Token.Transfer.handler(async ({ event, context }: any) => {
+ ERC20Token.Transfer.handler(async ({ event, context }) => {
```

### Backend

- Added Crestal API key: `sk-YlPzDMJbLwKoCvIBbGdYIuLsDDEsXlxsWKFSyIxSbLcCmBoK`
- Added test endpoint: `GET /api/ai/test`

### Frontend

- `handleLoadPortfolio()` now auto-calls AI analysis
- New `displayAIAnalysis()` function shows Crestal insights
- Portfolio section shows AI badge when Crestal is used

---

## 🚀 Next Steps

1. **Wait for Envio sync** (5-15 minutes)
2. **Test Crestal** (`curl /api/ai/test`)
3. **Update backend config** with Envio endpoint
4. **Test full flow** in browser
5. **Record demo** showing:
   - Envio indexer syncing
   - Portfolio loading from Envio
   - AI analysis with "Crestal Agent" badge
   - Smart account delegations

---

**Time Saved**: ~30 minutes by fixing both issues at once!  
**Status**: Ready to deploy and test 🎯
