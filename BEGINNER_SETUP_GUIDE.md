# IntelliQuant - Super Simple Setup Guide for Beginners

**Welcome!** This guide will walk you through setting up IntelliQuant step by step. Don't worry if you're new to this - we'll explain everything!

---

## What You Need First (Prerequisites)

Before starting, install these on your computer:

1. **Node.js** (version 18 or higher)
   - Go to https://nodejs.org
   - Download and install the LTS version
   - Open a terminal and type `node --version` to check it works
   - You should see something like `v18.x.x` or higher

2. **Git** (for version control)
   - Go to https://git-scm.com
   - Download and install
   - Type `git --version` to check

3. **VS Code** (code editor)
   - Go to https://code.visualstudio.com
   - Download and install

4. **MetaMask Browser Extension**
   - Go to https://metamask.io
   - Install the browser extension
   - Create a wallet if you don't have one

---

## Why "Go Live" Doesn't Work

**Important!** You CAN'T use VS Code's "Go Live" button because:
- This project uses **Vite** (a build tool)
- Vite needs to compile/bundle your code before it runs
- "Go Live" only works for simple HTML files

**Instead, you'll use**: `npm run dev` (explained below)

---

## Step-by-Step Setup

### Step 1: Open the Project

1. Open VS Code
2. Click `File` → `Open Folder`
3. Navigate to `C:\Users\Admin\Desktop\Methuselah\Projects\IntelliQuant`
4. Click "Select Folder"

---

### Step 2: Setup Envio Indexers (THE TRICKY PART - SIMPLIFIED!)

**What are Envio Indexers?**
Think of them as "data collectors" that watch the blockchain and save interesting events (like token transfers, trades, etc.) to a database. You can then query this data super fast!

**We have 3 indexers:**
1. **Portfolio Indexer** - Tracks what tokens you own
2. **DEX Indexer** - Tracks trades on decentralized exchanges
3. **Token Metrics Indexer** - Tracks token health data (liquidity, volume, etc.)

#### 2.1 Install Envio CLI Globally

Open a **new terminal** in VS Code (Terminal → New Terminal) and run:

```bash
npm install -g envio
```

**What this does:** Installs the Envio command-line tool on your computer so you can use `envio` commands anywhere.

**Check it worked:**
```bash
envio --version
```

#### 2.2 Setup Portfolio Indexer

This indexer tracks ERC-20 token transfers to know what tokens each wallet holds.

**Steps:**

1. **Navigate to the portfolio indexer:**
   ```bash
   cd envio-indexers/portfolio-indexer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **What's inside?**
   - `config.yaml` - Tells Envio what contracts to watch
   - `schema.graphql` - Defines what data to save
   - `src/EventHandlers.ts` - Code that processes events

4. **IMPORTANT: Update Token Addresses**

   Open `envio-indexers/portfolio-indexer/config.yaml`

   You'll see placeholder addresses like:
   ```yaml
   address:
     - "0x0000000000000000000000000000000000000001"  # Placeholder
   ```

   **You need to replace these with REAL Monad testnet token addresses!**

   Where to find them:
   - Monad testnet explorer: https://testnet.monadexplorer.com
   - Ask in Monad Discord for test token addresses
   - Check Monad docs: https://docs.monad.xyz

   **Example (when you find real addresses):**
   ```yaml
   address:
     - "0xREAL_USDC_ADDRESS_HERE"
     - "0xREAL_WMON_ADDRESS_HERE"
   ```

5. **Start the indexer** (when addresses are ready):
   ```bash
   npm run envio:dev
   ```

   Or:
   ```bash
   pnpm envio dev
   ```

   **What happens:**
   - Envio starts syncing blockchain data
   - A GraphQL playground opens at http://localhost:8080/console
   - You can query your data here!

6. **Keep it running!** Don't close this terminal. Open a new one for the next indexer.

#### 2.3 Setup DEX Indexer

This tracks swaps (trades) on decentralized exchanges.

**Steps:**

1. **Open a NEW terminal** (don't close the portfolio-indexer one!)

2. **Navigate:**
   ```bash
   cd envio-indexers/dex-indexer
   ```

3. **Install:**
   ```bash
   npm install
   ```

4. **Update DEX Pool Addresses**

   Open `envio-indexers/dex-indexer/config.yaml`

   Replace placeholder addresses with REAL Monad testnet DEX pool addresses:
   ```yaml
   address:
     - "0xREAL_DEX_POOL_ADDRESS_1"
     - "0xREAL_DEX_POOL_ADDRESS_2"
   ```

   **Where to find DEX addresses:**
   - Check if PancakeSwap, Uniswap, or other DEXes deployed on Monad testnet
   - Monad Discord community
   - Monad testnet docs

5. **Start:**
   ```bash
   npm run envio:dev
   ```

   This opens on a **different port** (8081)

6. **Keep it running!**

#### 2.4 Setup Token Metrics Indexer

This aggregates token health data.

**Steps:**

1. **Open a NEW terminal**

2. **Navigate:**
   ```bash
   cd envio-indexers/token-metrics-indexer
   ```

3. **Install:**
   ```bash
   npm install
   ```

4. **Update config** (similar to above)

5. **Start:**
   ```bash
   npm run envio:dev
   ```

   Opens on port 8082

---

**Important Notes for Envio:**

- **All 3 indexers must be running at the same time!**
- Each one uses a different terminal window
- If you close a terminal, that indexer stops
- Don't worry if syncing takes time - Envio is fast but initial sync can take a few minutes

**Troubleshooting:**
- **"Cannot find module"** → Run `npm install` in that indexer's folder
- **Port already in use** → Kill the process: `npx kill-port 8080` (or 8081, 8082)
- **Syncing forever** → Check if contract addresses are correct

---

### Step 3: Setup Backend API

The backend provides AI scoring and analytics.

**Steps:**

1. **Open a NEW terminal**

2. **Navigate:**
   ```bash
   cd backend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Create environment file:**
   ```bash
   copy .env.example .env
   ```

   (On Mac/Linux use `cp` instead of `copy`)

5. **Edit `.env` file:**

   Open `backend/.env` and check these values:
   ```
   PORT=3000
   ENVIO_PORTFOLIO_ENDPOINT=http://localhost:8080/v1/graphql
   ENVIO_DEX_ENDPOINT=http://localhost:8081/v1/graphql
   ENVIO_METRICS_ENDPOINT=http://localhost:8082/v1/graphql
   MONAD_RPC_URL=https://testnet-rpc.monad.xyz
   ```

6. **Start the backend:**
   ```bash
   npm run dev
   ```

   The API runs on http://localhost:3000

7. **Keep it running!**

---

### Step 4: Setup Frontend (THE PART THAT SHOWS IN BROWSER)

**This is why "Go Live" didn't work!**

**Steps:**

1. **Open a NEW terminal**

2. **Navigate:**
   ```bash
   cd frontend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Create environment file:**
   ```bash
   copy .env.example .env
   ```

5. **Edit `frontend/.env`:**
   ```
   VITE_API_URL=http://localhost:3000
   VITE_MONAD_CHAIN_ID=10143
   VITE_BUNDLER_URL=https://your-bundler-url.com
   VITE_PAYMASTER_URL=https://your-paymaster-url.com
   ```

   **Note:** Bundler and Paymaster URLs are optional for testing. We'll address this later.

6. **Start the dev server:**
   ```bash
   npm run dev
   ```

   **What happens:**
   - Vite compiles your code
   - Opens on http://localhost:5173
   - Any changes you make auto-refresh!

7. **Open in browser:**

   Go to: http://localhost:5173

   You should see the IntelliQuant interface!

---

## What Should Be Running?

At this point, you should have **5 terminal windows** open:

1. Portfolio Indexer (port 8080)
2. DEX Indexer (port 8081)
3. Token Metrics Indexer (port 8082)
4. Backend API (port 3000)
5. Frontend Dev Server (port 5173)

---

## Testing the Application

### Test 1: Connect Wallet

1. Open http://localhost:5173
2. Click "Connect Wallet"
3. MetaMask should pop up
4. **Make sure you're on Monad Testnet!**
   - Network Name: Monad Testnet
   - Chain ID: 10143
   - RPC URL: https://testnet-rpc.monad.xyz

   If you don't see Monad, add it manually in MetaMask.

5. Approve the connection

### Test 2: Create Smart Account

1. After connecting, click "Create Smart Account"
2. This creates a MetaMask Smart Account on Monad
3. You should see your smart account address displayed

### Test 3: Check Envio Data

1. Open http://localhost:8080/console (Portfolio Indexer)
2. Try a GraphQL query:
   ```graphql
   query {
     Transfer(limit: 10) {
       id
       from
       to
       value
     }
   }
   ```
3. You should see token transfer data (if there are any on Monad testnet)

---

## Common Issues and Fixes

### Issue: "Module not found"
**Fix:** Run `npm install` in that folder

### Issue: "Port already in use"
**Fix:**
```bash
npx kill-port 8080
# Or whichever port is stuck
```

### Issue: "Cannot connect to MetaMask"
**Fix:**
- Make sure MetaMask is installed
- Check you're on Monad Testnet (Chain ID 10143)
- Try refreshing the page

### Issue: "No data in Envio"
**Fix:**
- Check if contract addresses in `config.yaml` are correct
- Make sure there's activity on those contracts
- Wait a bit - syncing takes time

### Issue: Frontend shows blank page
**Fix:**
- Check browser console (F12) for errors
- Make sure `npm run dev` is running
- Try http://localhost:5173 (not file://)

---

## Next Steps: Real Monad Testnet Addresses

**This is the most important part!**

You need to find REAL Monad testnet contract addresses:

1. **Join Monad Discord:** https://discord.com/invite/monaddev
   - Ask for testnet token addresses
   - Ask for DEX pool addresses

2. **Check Monad Docs:** https://docs.monad.xyz
   - Look for deployed contracts
   - Check testnet section

3. **Use Monad Explorer:** https://testnet.monadexplorer.com
   - Browse recent transactions
   - Find popular contracts

4. **Update your indexers:**
   - Replace all `0x000...` placeholder addresses
   - Restart each indexer after updating

---

## Preparing for GitHub

Once everything works:

1. **Create `.gitignore`** (already exists, but check it):
   ```
   node_modules/
   .env
   dist/
   ```

2. **Initialize Git** (if not done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: IntelliQuant hackathon project"
   ```

3. **Create GitHub repo:**
   - Go to https://github.com
   - Click "New Repository"
   - Name: IntelliQuant
   - Make it **Public**
   - Don't initialize with README (you already have one)

4. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/IntelliQuant.git
   git branch -M main
   git push -u origin main
   ```

---

## Quick Reference

**Start Everything (after first setup):**

Terminal 1:
```bash
cd envio-indexers/portfolio-indexer
npm run envio:dev
```

Terminal 2:
```bash
cd envio-indexers/dex-indexer
npm run envio:dev
```

Terminal 3:
```bash
cd envio-indexers/token-metrics-indexer
npm run envio:dev
```

Terminal 4:
```bash
cd backend
npm run dev
```

Terminal 5:
```bash
cd frontend
npm run dev
```

**Stop Everything:**
Press `Ctrl + C` in each terminal

---

## Need Help?

- **Monad:** https://discord.com/invite/monaddev
- **Envio:** https://discord.com/invite/envio
- **MetaMask:** https://docs.metamask.io/delegation-toolkit

---

## Summary

1. ✅ Install Node.js, Git, VS Code, MetaMask
2. ✅ Setup 3 Envio indexers (portfolio, dex, metrics)
3. ✅ Find REAL Monad testnet contract addresses
4. ✅ Update `config.yaml` files with real addresses
5. ✅ Start all indexers (3 terminals)
6. ✅ Start backend API (1 terminal)
7. ✅ Start frontend dev server (1 terminal)
8. ✅ Test in browser at http://localhost:5173
9. ✅ Push to GitHub when done

**You've got this!** 🚀
