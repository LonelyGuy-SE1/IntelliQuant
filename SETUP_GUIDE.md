# IntelliQuant Setup Guide

Complete guide to getting IntelliQuant running for the hackathon.

## Prerequisites

1. **Node.js 18+** installed
2. **MetaMask** browser extension
3. **Monad testnet MON tokens** (get from faucet)
4. **Terminal** with npm/pnpm installed

## Quick Start (5 Steps)

### Step 1: Install Dependencies

```bash
# Portfolio Indexer
cd envio-indexers/portfolio-indexer
pnpm install

# DEX Indexer
cd ../dex-indexer
pnpm install

# Backend
cd ../../backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Configure Envio Indexers

**Important**: Before running indexers, you need actual token and DEX addresses from Monad testnet.

#### Option A: Use Existing Monad DEX/Tokens

1. Find deployed DEX contracts on Monad testnet
2. Update addresses in `envio-indexers/*/config.yaml`

#### Option B: Deploy Your Own (for testing)

1. Deploy simple ERC-20 tokens to Monad testnet
2. Deploy a Uniswap V2 fork or similar DEX
3. Update config files with your addresses

**Update Portfolio Indexer Config:**

Edit `envio-indexers/portfolio-indexer/config.yaml`:

```yaml
networks:
  - id: 10143
    start_block: 0
    contracts:
      - name: ERC20Token
        address:
          - "0xYourTokenAddress1"
          - "0xYourTokenAddress2"
```

**Update DEX Indexer Config:**

Edit `envio-indexers/dex-indexer/config.yaml`:

```yaml
networks:
  - id: 10143
    start_block: 0
    contracts:
      - name: UniswapV2Pool
        address:
          - "0xYourPoolAddress1"
```

### Step 3: Start Envio Indexers

Open **two separate terminals**:

**Terminal 1 - Portfolio Indexer:**
```bash
cd envio-indexers/portfolio-indexer
pnpm codegen
pnpm envio dev
# GraphQL available at http://localhost:8081/console
```

**Terminal 2 - DEX Indexer:**
```bash
cd envio-indexers/dex-indexer
pnpm codegen
pnpm envio dev
# GraphQL available at http://localhost:8082/console
```

**Verify indexers are running:**
- Open http://localhost:8081/console (Portfolio)
- Open http://localhost:8082/console (DEX)
- Try a simple GraphQL query in each console

### Step 4: Start Backend API

**Terminal 3:**

```bash
cd backend

# Create .env file
cp .env.example .env

# Edit .env - should work with defaults if indexers are running locally
# ENVIO_PORTFOLIO_ENDPOINT=http://localhost:8081/v1/graphql
# ENVIO_DEX_ENDPOINT=http://localhost:8082/v1/graphql

# Start server
npm run dev
# API available at http://localhost:3000
```

**Test backend:**
```bash
curl http://localhost:3000/health
```

### Step 5: Start Frontend

**Terminal 4:**

```bash
cd frontend

# Create .env file
cp .env.example .env

# Edit .env and configure:
# VITE_API_URL=http://localhost:3000
# VITE_BUNDLER_URL=<your-bundler-url>  # See Bundler Setup below
# VITE_PAYMASTER_URL=<your-paymaster-url>

# Start frontend
npm run dev
# Opens at http://localhost:5173
```

## Critical Configuration: Bundler & Paymaster

For gasless transactions to work, you **must** configure a bundler and paymaster that support Monad testnet.

### Option 1: Use Pimlico (if they support Monad)

1. Sign up at https://pimlico.io
2. Get API key
3. Check if Monad testnet (chain ID 10143) is supported
4. Update frontend `.env`:

```env
VITE_BUNDLER_URL=https://api.pimlico.io/v2/10143/rpc?apikey=YOUR_API_KEY
VITE_PAYMASTER_URL=https://api.pimlico.io/v2/10143/rpc?apikey=YOUR_API_KEY
```

### Option 2: Use Another Provider

Check these providers for Monad testnet support:
- Alchemy Account Abstraction
- Biconomy
- Stackup

### Option 3: For Hackathon Demo (Without Bundler)

If bundler is not available for Monad testnet, you can:

1. **Demo without gasless transactions**: Remove paymaster requirements
2. **Modify smart-account.js** to use regular transactions
3. **Focus on**: Token scoring, portfolio analysis, and delegation creation (which don't require bundler)

## Testing the Application

### 1. Connect Wallet

1. Open http://localhost:5173
2. Click "Connect MetaMask"
3. Approve connection
4. MetaMask should switch to Monad testnet

### 2. Create Smart Account

1. Click "Create Smart Account"
2. Sign the transaction in MetaMask
3. Smart account address will be displayed
4. Initially shows "Counterfactual" (not deployed yet)

### 3. Test Token Health Scoring

1. Enter token addresses (from your Monad testnet tokens) in the Token Health Scores section
2. Click "Analyze Tokens"
3. View AI-generated scores with component breakdown

**Example tokens to test** (use your deployed addresses):
```
0xYourToken1Address, 0xYourToken2Address
```

### 4. Test Portfolio Loading

1. Send some tokens to your smart account address
2. Click "Load My Portfolio"
3. View your token holdings
4. Click "Analyze Risk" for drift and concentration analysis

### 5. Test Delegations

1. Enter a delegate address (can use your own EOA for testing)
2. Set max transfer amount and max calls
3. Click "Create Delegation" or "Create Test Delegation"
4. View the signed delegation

### 6. Test Recommendations

1. Enter token addresses
2. Click "Get Recommendations"
3. View AI-generated BUY/SELL recommendations with confidence scores

### 7. Test Gasless Transactions (if bundler configured)

1. Enter recipient address
2. Enter small amount (e.g., 0.001 MON)
3. Click "Send Gasless Transaction"
4. Verify transaction completes without gas payment

## Troubleshooting

### Envio Indexers Not Syncing

**Problem**: No data in GraphQL console

**Solutions**:
1. Check contract addresses in `config.yaml` are correct
2. Verify contracts are deployed on Monad testnet
3. Check `start_block` is not too high
4. Look at terminal logs for errors
5. Try `pnpm codegen` again

### Backend API Errors

**Problem**: API returns errors

**Solutions**:
1. Ensure Envio indexers are running
2. Check GraphQL endpoints in `.env`
3. Test GraphQL endpoints directly in browser
4. Check backend logs in terminal

### Frontend Can't Connect

**Problem**: MetaMask errors or connection fails

**Solutions**:
1. Ensure MetaMask is installed
2. Add Monad testnet to MetaMask manually if needed:
   - Chain ID: 10143
   - RPC: https://testnet-rpc.monad.xyz
   - Symbol: MON
3. Get testnet tokens from Monad faucet

### Smart Account Creation Fails

**Problem**: "Bundler not configured" error

**Solutions**:
1. Verify bundler URL in frontend `.env`
2. Check if bundler supports Monad testnet
3. For demo, comment out bundler requirements temporarily
4. Use regular wallet transactions instead

### No Token Scores Returned

**Problem**: Scores show 0 or error

**Solutions**:
1. Ensure DEX pools exist for the tokens
2. Check DEX indexer is syncing pool data
3. Verify pool addresses in DEX indexer config
4. Generate some swap volume on the pools

## Demo Video Script

For your hackathon submission video:

1. **Introduction (30s)**
   - Show IntelliQuant dashboard
   - Explain: AI portfolio management on Monad with MetaMask Smart Accounts

2. **Connect & Setup (45s)**
   - Connect MetaMask
   - Create Smart Account
   - Show smart account address and status

3. **AI Intelligence (60s)**
   - Analyze token health scores
   - Show component breakdown (liquidity, stability, demand, slippage)
   - Demonstrate portfolio risk analysis

4. **Delegations & Security (60s)**
   - Create trading delegation
   - Show security caveats (max transfer, max calls, allowed targets)
   - Explain non-custodial automation

5. **Gasless Transactions (45s)**
   - Send test transaction
   - Show it completes without gas payment
   - Explain paymaster sponsorship

6. **Conclusion (30s)**
   - Recap: Envio for data, AI for intelligence, MetaMask Smart Accounts for execution
   - Show architecture diagram
   - Thank judges

## Deployment (Optional)

### Backend Deployment

Deploy to any Node.js hosting:
- Heroku
- Railway
- Render
- Fly.io

Update backend `.env` with hosted Envio endpoints.

### Frontend Deployment

```bash
cd frontend
npm run build
# Deploy 'dist' folder to:
# - Vercel
# - Netlify
# - GitHub Pages
```

Update `.env` with production API URL.

### Envio Deployment

Use Envio Hosted Service:
1. Push indexers to Envio cloud
2. Get hosted GraphQL endpoints
3. Update backend `.env` with hosted URLs

## Key Files Reference

- **Envio Configs**: `envio-indexers/*/config.yaml`
- **Backend Env**: `backend/.env`
- **Frontend Env**: `frontend/.env`
- **Chain Config**: `frontend/src/config/chains.js`
- **Smart Accounts**: `frontend/src/services/smart-account.js`
- **Delegations**: `frontend/src/services/delegation.js`

## Support Resources

- **Envio Docs**: https://docs.envio.dev
- **MetaMask Delegation Toolkit**: https://docs.metamask.io/delegation-toolkit
- **Monad Docs**: https://docs.monad.xyz
- **Hackathon Discord**: Join for live support

## Success Checklist

- [ ] Envio indexers running and syncing data
- [ ] Backend API responding to health check
- [ ] Frontend loads without errors
- [ ] MetaMask connects to Monad testnet
- [ ] Smart account can be created
- [ ] Token scores display correctly
- [ ] Delegations can be created
- [ ] (Optional) Gasless transactions work

Good luck with your hackathon submission!
