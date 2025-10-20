# 🚀 QUICK START - Deploy Envio NOW

## Your Mission: Get $1K Envio Prize

**Time Remaining**: 3-4 hours  
**API Key**: `pk-7a4dbd1aa8d5b8a7b9bb320acee0bc25deab56639c84ddf88e1b82fd2e8dc4c9`

---

## ⚡ 5-Minute Deployment

### Step 1: Login to Envio
👉 **Go to**: https://envio.dev/app/login

- Login with GitHub
- Select your account/org

### Step 2: Install GitHub App
- Click **"Install GitHub App"**
- Grant access to **IntelliQuant** repo

### Step 3: Add Indexer
Click **"Add Indexer"**, then configure:

```
Repository: LonelyGuy-SE1/IntelliQuant
Config File: config.yaml
Root Directory: envio-indexers/portfolio-indexer
Deployment Branch: envio
Name: IntelliQuant Portfolio
```

### Step 4: Automatic Deployment
✅ **Your code is already pushed to GitHub!**

Envio will automatically:
- Detect the push
- Build the indexer
- Start syncing Monad testnet data
- Provide GraphQL endpoint

### Step 5: Get Your Endpoint
Once deployed, copy the GraphQL endpoint (looks like):
```
https://indexer.envio.dev/xxxxx/v1/graphql
```

### Step 6: Update Backend
Open `backend/.env` and replace:
```env
ENVIO_PORTFOLIO_ENDPOINT=https://indexer.envio.dev/YOUR_ID/v1/graphql
CRESTAL_API_KEY=your_crestal_key_here
```

---

## 🧪 Test It Works

Use Envio's GraphQL playground to test:

```graphql
query {
  users(limit: 5) {
    address
    totalTokens
    balances {
      tokenAddress
      balance
    }
  }
}
```

---

## ✅ What's Ready

- ✅ Portfolio indexer configured for Monad testnet
- ✅ Tracking WMON & ETH tokens
- ✅ Schema defined (User, UserBalance, Transfer, Token)
- ✅ Event handlers written
- ✅ Package.json with correct versions (envio ^2.30.1, pnpm 9.10.0)
- ✅ Code pushed to GitHub (envio branch)
- ✅ Backend services cleaned (no mock data)
- ✅ Crestal AI integration ready

---

## 📁 Your Indexer Location

```
IntelliQuant/
└── envio-indexers/
    └── portfolio-indexer/
        ├── config.yaml          ← Network & contract config
        ├── schema.graphql       ← Entity definitions
        ├── package.json         ← Dependencies
        └── src/
            └── EventHandlers.ts ← Business logic
```

---

## 🎯 After Deployment

1. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Full Flow**:
   - Connect MetaMask
   - View portfolio (should load from Envio)
   - Get AI insights (Crestal)

---

## 📚 Full Guide

See **ENVIO_DEPLOY_GUIDE.md** for detailed instructions.

---

## 🆘 Help

**Build fails?** Check package.json has envio ^2.30.1 (NOT 2.29.x)  
**No data?** Wait for "Historical Sync Complete" status  
**GraphQL errors?** Verify endpoint URL is correct in backend/.env

---

**NOW GO GET THAT $1K! 💰**
