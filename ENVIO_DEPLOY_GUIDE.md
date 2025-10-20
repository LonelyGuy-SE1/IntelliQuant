# 🚀 Envio Hosted Service Deployment Guide

**CRITICAL**: This is for the $1K Envio bonus prize! Follow every step carefully.

## What You Need to Know

Envio uses **git-based deployment** like Vercel:

- You don't run `envio deploy` locally
- Push to a deployment branch → Envio auto-detects and deploys
- GitHub App integration handles everything

Your API Key: `pk-7a4dbd1aa8d5b8a7b9bb320acee0bc25deab56639c84ddf88e1b82fd2e8dc4c9`

---

## 📋 Step-by-Step Deployment

### 1️⃣ Login to Envio Platform

Go to: **https://envio.dev/app/login**

- Click "Login with GitHub"
- Authorize with your GitHub account (LonelyGuy-SE1)

### 2️⃣ Install Envio Deployments GitHub App

Once logged in:

1. Select your **organization/personal account**
2. Click **"Install GitHub App"**
3. Grant access to the **IntelliQuant** repository
   - You can grant access to all repos or just IntelliQuant

### 3️⃣ Add New Indexer in Dashboard

1. Click **"Add Indexer"** button
2. Select repository: **LonelyGuy-SE1/IntelliQuant**
3. Configure deployment settings:
   - **Config File Path**: `config.yaml`
   - **Root Directory**: `envio-indexers/portfolio-indexer`
   - **Deployment Branch**: `main` (or create `production`)
   - **Indexer Name**: `IntelliQuant Portfolio`

### 4️⃣ Push Your Code

If you haven't committed yet:

```bash
cd /c/Users/Admin/Desktop/Methuselah/Projects/IntelliQuant
git add .
git commit -m "Add portfolio indexer for Envio deployment"
git push origin main
```

If already pushed, just ensure latest code is on GitHub:

```bash
git push origin main
```

### 5️⃣ Monitor Deployment

1. Go to Envio dashboard
2. Watch the deployment progress (build logs will show)
3. Wait for **"Historical Sync Complete"** status
4. Copy your **GraphQL endpoint URL** (looks like: `https://indexer.envio.dev/xxxxx/v1/graphql`)

---

## 🔧 What Envio Will Do Automatically

When you push to your deployment branch:

1. ✅ Detects `package.json` (envio ^2.30.1, pnpm 9.10.0)
2. ✅ Installs dependencies with pnpm
3. ✅ Runs `envio codegen` to generate types
4. ✅ Validates config.yaml and schema.graphql
5. ✅ Deploys indexer to hosted infrastructure
6. ✅ Starts syncing from Monad testnet block 0
7. ✅ Provides GraphQL endpoint for queries

---

## 📊 Your Indexer Configuration

**Network**: Monad Testnet (Chain ID 10143)
**Start Block**: 0 (auto-detects first relevant block)
**Contracts**:

- WMON: `0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701`
- ETH: `0x836047a99e11f376522b447bffb6e3495dd0637c`

**Events Indexed**:

- `Transfer(address indexed from, address indexed to, uint256 value)`

**Entities Created**:

- `User` - Aggregated user data
- `UserBalance` - Per-token balances
- `Transfer` - Individual transfer events
- `Token` - Token metadata

---

## 🧪 Test Your Deployment

Once deployed, test with GraphQL query:

```graphql
query TestPortfolio {
  users(limit: 5) {
    id
    address
    totalTokens
    lastUpdated
    balances {
      tokenAddress
      balance
      transferCount
    }
  }

  transfers(limit: 10, orderBy: timestamp, orderDirection: desc) {
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

---

## 🔗 Update Backend Configuration

After deployment, update `backend/.env`:

```env
# Envio Portfolio Indexer GraphQL Endpoint
ENVIO_PORTFOLIO_ENDPOINT=https://indexer.envio.dev/YOUR_INDEXER_ID/v1/graphql

# Your HyperSync API Key (for premium features)
ENVIO_API_KEY=pk-7a4dbd1aa8d5b8a7b9bb320acee0bc25deab56639c84ddf88e1b82fd2e8dc4c9
```

---

## 🎯 Success Checklist

- [ ] Logged into Envio platform
- [ ] GitHub App installed and authorized
- [ ] Indexer configured in dashboard
- [ ] Code pushed to deployment branch
- [ ] Deployment shows "Building" status
- [ ] Deployment shows "Syncing" status
- [ ] Deployment shows "Active" status
- [ ] GraphQL endpoint accessible
- [ ] Test query returns data
- [ ] Backend .env updated with endpoint

---

## 🆘 Troubleshooting

**Build Fails**:

- Check package.json has `envio: ^2.30.1` (NOT 2.29.x)
- Ensure pnpm version is 9.10.0 in engines
- Verify config.yaml path is correct

**No Data Syncing**:

- Check Monad testnet RPC is accessible
- Verify contract addresses are correct
- Check start_block isn't too high

**GraphQL Errors**:

- Wait for "Historical Sync Complete" before querying
- Check entity names match schema.graphql

---

## 📚 Resources Used

- [Envio Hosted Service](https://docs.envio.dev/docs/HyperIndex/hosted-service)
- [Deployment Guide](https://docs.envio.dev/docs/HyperIndex/hosted-service-deployment)
- [Monad Testnet Config](https://docs.envio.dev/docs/HyperIndex/monad-testnet)
- [Configuration File](https://docs.envio.dev/docs/HyperIndex/configuration-file)

---

## ⏱️ Time Estimate

- Setup & Auth: 5 minutes
- Push & Build: 3 minutes
- Initial Sync: 5-15 minutes (depends on data volume)
- **Total**: ~20-30 minutes to live deployment

**THIS IS YOUR $1K PRIZE TICKET - DEPLOY IT NOW!** 🚀
