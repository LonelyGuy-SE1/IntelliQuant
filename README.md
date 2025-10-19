# IntelliQuant - AI-Powered Portfolio Management on Monad

IntelliQuant is a next-generation DeFi portfolio management platform built for the MetaMask Smart Accounts Hackathon. It combines real-time blockchain indexing (Envio), AI-powered analytics, and secure delegated trading (MetaMask Smart Accounts) on Monad testnet.

## Features

- **AI Token Health Scoring**: 0-100 score with component breakdown (liquidity, volatility, demand, slippage)
- **Portfolio Risk Analysis**: Drift detection, concentration risk, and automated rebalancing suggestions
- **Smart Money Tracking**: Whale activity monitoring and momentum-based recommendations
- **Delegated Trading**: Non-custodial automation with granular security caveats
- **Gasless Transactions**: Sponsored gas via paymaster for frictionless UX
- **Real-time Data**: Envio HyperIndex for ultra-fast blockchain event indexing

## Architecture

```
┌─────────────────┐
│   Frontend UI   │  (HTML/CSS/JS + Vite)
│  - Dashboard    │  - MetaMask Smart Accounts
│  - Delegations  │  - Gasless Transactions
└────────┬────────┘
         │
┌────────▼────────┐
│  Backend API    │  (Node.js + Express)
│  - Scoring      │  - AI Analytics
│  - Risk Engine  │  - Recommendations
└────────┬────────┘
         │
┌────────▼────────┐
│ Envio Indexers  │  (GraphQL APIs)
│  - Portfolio    │  - Token Metrics
│  - DEX Events   │  - Smart Money
└────────┬────────┘
         │
┌────────▼────────┐
│ Monad Testnet   │  (Chain ID: 10143)
│  - Smart Accts  │  - DEX Protocols
│  - Delegations  │  - ERC-20 Tokens
└─────────────────┘
```

## Tech Stack

- **Blockchain**: Monad Testnet (EVM L1)
- **Indexing**: Envio HyperIndex + HyperSync
- **Smart Accounts**: MetaMask Delegation Toolkit
- **Backend**: Node.js, Express
- **Frontend**: Vite, vanilla JavaScript
- **APIs**: GraphQL (Envio), REST (Backend)

## Project Structure

```
IntelliQuant/
├── envio-indexers/          # 4 separate indexer projects
├── backend/                 # Intelligence & API layer
└── frontend/                # UI & smart account integration
```

## Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- MetaMask wallet
- Monad testnet MON tokens

## Setup Instructions

### 1. Environment Setup

Install Envio CLI globally:
```bash
npm install -g envio
```

### 2. Set Up Envio Indexers

Navigate to each indexer and initialize:

```bash
# Portfolio Indexer
cd envio-indexers/portfolio-indexer
pnpm install
pnpm envio dev  # Starts GraphQL endpoint at http://localhost:8080

# Repeat for dex-indexer, token-metrics-indexer, smart-money-indexer
```

### 3. Set Up Backend

```bash
cd backend
npm install
cp .env.example .env  # Configure environment variables
npm run dev  # Starts API at http://localhost:3000
```

### 4. Set Up Frontend

```bash
cd frontend
npm install
npm run dev  # Starts at http://localhost:5173
```

## Configuration

### Monad Testnet Details

- Chain ID: **10143**
- RPC URL: `https://testnet-rpc.monad.xyz`
- Explorer: https://testnet.monadexplorer.com
- Currency: MON

### Environment Variables

Backend `.env`:
```
PORT=3000
ENVIO_PORTFOLIO_ENDPOINT=http://localhost:8081/v1/graphql
ENVIO_DEX_ENDPOINT=http://localhost:8082/v1/graphql
ENVIO_METRICS_ENDPOINT=http://localhost:8083/v1/graphql
ENVIO_SMARTMONEY_ENDPOINT=http://localhost:8084/v1/graphql
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
```

Frontend `.env`:
```
VITE_API_URL=http://localhost:3000
VITE_BUNDLER_URL=https://your-bundler-url.com
VITE_PAYMASTER_URL=https://your-paymaster-url.com
VITE_MONAD_CHAIN_ID=10143
```

## How It Works

### 1. Data Ingestion (Envio)

Four indexers monitor Monad testnet:
- **Portfolio**: Tracks ERC-20 balances per smart account
- **DEX**: Indexes swap events, liquidity changes
- **Token Metrics**: Computes liquidity, volume, slippage
- **Smart Money**: Monitors whale addresses

### 2. Intelligence Layer (Backend)

AI scoring engine analyzes:
- Token health (0-100 score)
- Portfolio drift vs. targets
- Risk concentration
- Smart money momentum

Generates trade recommendations with justifications.

### 3. Execution (MetaMask Smart Accounts)

Users create smart accounts and grant delegations:
- Restricted to specific DEX routers
- Capped trade sizes
- Token allowlists
- Time-windowed execution

AI agent redeems delegations for autonomous rebalancing (optional).

### 4. User Experience (Frontend)

- Connect MetaMask wallet
- Deploy smart account (gasless)
- Set portfolio targets
- View AI recommendations
- Enable/disable auto-trading
- Review audit log

## Hackathon Requirements Checklist

- [x] Uses MetaMask Smart Accounts via Delegation Toolkit
- [x] Deployed on Monad Testnet (chain ID 10143)
- [x] Working demo with Smart Accounts in main flow
- [x] Envio integration (4 HyperIndex indexers + GraphQL APIs)
- [x] Real-time blockchain data powering core functionality

## Development Workflow

### Testing Envio Indexers

```bash
cd envio-indexers/portfolio-indexer
pnpm envio dev
# Visit http://localhost:8080/console for GraphQL playground
```

Example query:
```graphql
query GetPortfolio {
  User(where: {address: {_eq: "0x..."}}) {
    address
    balance
    holdings {
      token
      amount
    }
  }
}
```

### Testing Backend API

```bash
curl http://localhost:3000/api/tokens/0xTokenAddress/score
curl http://localhost:3000/api/portfolio/0xSmartAccountAddress
curl http://localhost:3000/api/recommendations
```

### Testing Smart Accounts

Open frontend at `http://localhost:5173`:
1. Connect MetaMask
2. Create smart account
3. Check account status (deployed/counterfactual)
4. Send test transaction (gasless)

## Security Features

- Minimal delegation scopes (allowlisted targets, methods, amounts)
- Time-bounded permissions
- Revocable delegations
- Transparent audit log
- Non-custodial (user always in control)

## Demo Video Script

1. **Introduction**: Show IntelliQuant dashboard
2. **Connect Wallet**: MetaMask on Monad testnet
3. **Create Smart Account**: Deploy via gasless transaction
4. **View Intelligence**: Token health scores, portfolio analysis
5. **Create Delegation**: Set trading constraints and caveats
6. **Auto-Rebalance**: Toggle automation, show recommendation execution
7. **Audit Log**: Review transparent trade history
8. **Delegation Management**: Revoke permissions

## Troubleshooting

**Envio indexer not syncing?**
- Check Monad RPC connection in `config.yaml`
- Verify contract addresses are correct
- Ensure `start_block` is set appropriately

**Smart account creation failing?**
- Confirm bundler URL supports Monad testnet
- Check paymaster configuration
- Verify MetaMask is on Monad network

**GraphQL queries timing out?**
- Ensure Envio indexers are running (`pnpm envio dev`)
- Check port conflicts (default: 8080, 8081, 8082, 8083, 8084)

## Resources

- [MetaMask Delegation Toolkit Docs](https://docs.metamask.io/delegation-toolkit)
- [Envio Documentation](https://docs.envio.dev)
- [Monad Developer Docs](https://docs.monad.xyz)
- [Hackathon Resources](https://hackquest.io/monad-metamask-envio)

## License

MIT

## Team

Built for MetaMask Smart Accounts x Monad x Envio Hackathon

---

**IntelliQuant**: Where AI meets DeFi automation, securely and transparently.
