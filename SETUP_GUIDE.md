# IntelliQuant Setup Guide

## Current Project Status ✅

### What's Working
- ✅ **Frontend UI**: Complete interface with navigation, dashboard, portfolio views
- ✅ **Crestal AI Integration**: AI chatbox in frontend for portfolio analysis
- ✅ **Smart Account Service**: MetaMask Smart Account creation with Hybrid implementation
- ✅ **Backend API**: Express server with token scoring, portfolio analysis routes
- ✅ **Indexer Configs**: Fixed and ready for deployment

### What Needs Setup
- ⏳ **Envio Indexers**: Need to be deployed to Envio hosted service
- ⏳ **Delegation Implementation**: Use proper ERC-7710 delegations
- ⏳ **Portfolio Rebalancing**: Execute trades via delegations
- ⏳ **Bundler Configuration**: Need bundler URL for gasless transactions

---

## Step 1: Deploy Envio Indexers (CRITICAL)

### Option A: Use Envio Hosted Service (Recommended)

1. **Sign up for Envio**: Visit https://envio.dev/app/

2. **Create New Indexer** for each project:
   - Portfolio Indexer
   - DEX Indexer

3. **Deploy via GitHub**:
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Deploy indexers"
   git push origin main
   ```

4. **Connect GitHub repo** in Envio dashboard:
   - Select your repo
   - Envio will detect the `envio-indexers/*/config.yaml` files
   - Click "Deploy"

5. **Get GraphQL Endpoints**:
   After deployment, you'll get URLs like:
   ```
   https://indexer.testnet.envio.dev/<your-username>/intelliquant-portfolio/v1/graphql
   https://indexer.testnet.envio.dev/<your-username>/intelliquant-dex/v1/graphql
   ```

6. **Update Backend .env**:
   ```bash
   cd backend
   cp .env.example .env
   ```

   Edit `.env`:
   ```
   PORT=3001
   ENVIO_PORTFOLIO_ENDPOINT=https://indexer.testnet.envio.dev/<your-username>/intelliquant-portfolio/v1/graphql
   ENVIO_DEX_ENDPOINT=https://indexer.testnet.envio.dev/<your-username>/intelliquant-dex/v1/graphql
   CRESTAL_API_KEY=your_crestal_api_key_here
   MONAD_RPC_URL=https://testnet-rpc.monad.xyz
   CORS_ORIGIN=http://localhost:5173
   ```

### Option B: Local Development (Linux/Mac/WSL only)

Envio CLI doesn't work on Windows. Use WSL:

```bash
# Install WSL first (Windows only)
wsl --install

# Inside WSL:
npm install -g envio
cd envio-indexers/portfolio-indexer
pnpm install
pnpm envio dev
```

---

## Step 2: Configure MetaMask Smart Accounts

### Get a Bundler URL

**Option 1: Use Pimlico** (Recommended)
1. Sign up at https://www.pimlico.io/
2. Create an API key
3. Get bundler URL for Monad testnet (chain ID 10143)

**Option 2: Self-hosted Bundler**
- Deploy your own bundler using https://github.com/eth-infinitism/bundler

### Update Frontend .env

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```
VITE_API_URL=http://localhost:3001
VITE_BUNDLER_URL=https://api.pimlico.io/v2/10143/rpc?apikey=YOUR_PIMLICO_KEY
VITE_MONAD_CHAIN_ID=10143
VITE_CRESTAL_API_KEY=your_crestal_api_key
```

---

## Step 3: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

---

## Step 4: Run the Application

### Start Backend
```bash
cd backend
npm run dev
```

Backend will run on http://localhost:3001

### Start Frontend
```bash
cd frontend
npm run dev
```

Frontend will run on http://localhost:5173

---

## Step 5: Test the Flow

### 1. Connect Wallet
- Open http://localhost:5173
- Click "Connect Wallet"
- Approve MetaMask connection
- Ensure you're on Monad testnet

### 2. Create Smart Account
- Click "Create Smart Account" on dashboard
- Wait for transaction to complete
- Smart account address will be displayed

### 3. Get Monad Testnet Tokens
- Visit https://monad-testnet.com/faucet (if available)
- Or request tokens in Monad Discord

### 4. Analyze Tokens
- Go to "Token Analysis" section
- Enter token addresses (comma-separated):
  ```
  0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701,0x836047a99e11f376522b447bffb6e3495dd0637c
  ```
- Click "Analyze Tokens"

### 5. View Portfolio
- Go to "Portfolio" section
- Click "Load Portfolio"
- View your token holdings (from Envio indexer)

### 6. Create Delegation
- Go to "Delegations" section
- Enter delegate address (AI agent address)
- Set max transfer amount and calls
- Click "Create Delegation"

### 7. Test Gasless Transaction
- Go to "Transactions" section
- Enter recipient address
- Enter amount (e.g., 0.001 MON)
- Click "Send Gasless Transaction"

---

## Troubleshooting

### Indexer Issues
**Problem**: "Portfolio empty" or "No data"
**Solution**:
- Check Envio dashboard for indexing status
- Verify contract addresses exist on Monad testnet
- Check start_block is not too recent

### Smart Account Creation Fails
**Problem**: "Transaction failed"
**Solution**:
- Ensure you have MON tokens in your EOA wallet
- Check bundler URL is correct
- Try with a different bundler

### Delegation Not Working
**Problem**: "Delegation failed"
**Solution**:
- Ensure smart account is deployed first
- Check delegate address is valid
- Verify you're on Monad testnet

### API Connection Errors
**Problem**: "Backend not responding"
**Solution**:
- Check backend is running (`npm run dev`)
- Verify CORS_ORIGIN matches frontend URL
- Check ENVIO endpoints are accessible

---

## Next Steps for Hackathon

### Must-Have Features
1. ✅ Smart Account Creation
2. ✅ Token Health Scoring
3. ⏳ **Working Envio Indexers** (deploy to hosted service)
4. ⏳ **Proper Delegation** (implement ERC-7710 delegations)
5. ⏳ **Portfolio Rebalancing** (execute trades via delegations)

### Nice-to-Have
- Historical portfolio charts
- Smart money tracking
- Automated rebalancing scheduler
- Mobile responsive UI improvements

---

## Deployment Checklist

Before submitting to hackathon:

- [ ] Envio indexers deployed and syncing
- [ ] Backend deployed (use Vercel/Railway/Render)
- [ ] Frontend deployed (use Vercel/Netlify)
- [ ] Demo video recorded showing:
  - Wallet connection
  - Smart account creation
  - Token analysis with AI
  - Delegation creation
  - Gasless transaction
- [ ] GitHub repo updated with README
- [ ] All env variables documented

---

## Resources

- MetaMask Delegation Toolkit: https://docs.metamask.io/delegation-toolkit
- Envio Docs: https://docs.envio.dev
- Monad Developer Docs: https://docs.monad.xyz
- Crestal AI API: https://open.service.crestal.network/v1/redoc

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check backend logs
3. Verify all env variables are set
4. Test on Monad testnet explorer
5. Ask in Monad/Envio Discord

Good luck with the hackathon! 🚀
