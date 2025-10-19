# IntelliQuant - AI Portfolio Management on Monad

AI-powered portfolio management with MetaMask Smart Accounts on Monad testnet.

## Quick Start

### 1. Install Envio CLI
```bash
npm install -g envio
```

### 2. Start Portfolio Indexer
```bash
cd envio-indexers/portfolio-indexer
pnpm run dev
```
Opens at: http://localhost:8080

### 3. Start DEX Indexer (New Terminal)
```bash
cd envio-indexers/dex-indexer
pnpm run dev
```
Opens at: http://localhost:8081

### 4. Start Backend (New Terminal)
```bash
cd backend
npm install
npm run dev
```
Runs on: http://localhost:3000

### 5. Start Frontend (New Terminal)
```bash
cd frontend
npm install
npm run dev
```
**Open:** http://localhost:5173

## Tech Stack

- **MetaMask Smart Accounts** - Delegation Toolkit for gasless transactions
- **Envio HyperIndex** - Real-time blockchain indexing on Monad
- **Monad Testnet** - High-performance EVM L1 (Chain ID: 10143)
- **Vite + JavaScript** - Fast frontend development
- **Node.js + Express** - Backend API with AI scoring

## Features

✅ AI Token Health Scoring (0-100)
✅ Portfolio Risk Analysis
✅ Delegated Trading with Caveats
✅ Gasless Transactions
✅ Real-time Blockchain Data

## Project Structure

```
IntelliQuant/
├── envio-indexers/          # 3 Envio indexers
│   ├── portfolio-indexer/   # Tracks token balances
│   ├── dex-indexer/         # Tracks DEX swaps
│   └── token-metrics-indexer/  # Token health metrics
├── backend/                 # Node.js API + AI scoring
└── frontend/                # Vite frontend
```

## Hackathon

Built for **MetaMask Smart Accounts x Monad x Envio Hackathon**

## Resources

- [MetaMask Delegation Toolkit](https://docs.metamask.io/delegation-toolkit)
- [Monad Docs](https://docs.monad.xyz)
- [Envio Docs](https://docs.envio.dev)

---

**Repository:** https://github.com/LonelyGuy-SE1/IntelliQuant
