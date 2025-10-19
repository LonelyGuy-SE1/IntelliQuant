# ✅ Setup Complete!

## What's Ready

✅ **3 Envio indexers** (portfolio, dex, token-metrics)
✅ **Real Monad addresses** configured
✅ **4th indexer removed** from GitHub
✅ **Clean README** - only essential docs
✅ **Envio branch** created for hosted service

---

## 🚀 How to Run Locally

### DON'T use `npm install` - use `pnpm run dev`!

**Terminal 1 - Portfolio Indexer:**
```bash
cd envio-indexers/portfolio-indexer
pnpm run dev
```
Opens at: http://localhost:8080

**Terminal 2 - DEX Indexer:**
```bash
cd envio-indexers/dex-indexer
pnpm run dev
```
Opens at: http://localhost:8081

**Terminal 3 - Backend:**
```bash
cd backend
npm install
npm run dev
```
Runs on: http://localhost:3000

**Terminal 4 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```
**Open:** http://localhost:5173

---

## 🌐 Envio Hosted Service Setup

### Step 1: Create Indexer on Envio

Go to: https://envio.dev/app/hosted-service

Click "Create Indexer" → Choose "Deploy from Git"

### Step 2: Configure Settings

**GitHub Repository:**
```
https://github.com/LonelyGuy-SE1/IntelliQuant
```

**Git Release Branch:**
```
envio
```

**Indexer Directory** (for portfolio indexer):
```
envio-indexers/portfolio-indexer
```

**Config File:**
```
config.yaml
```

**Auto Deploy:** ✅ Enable

### Step 3: Create Second Indexer (DEX)

Repeat above but use:

**Indexer Directory:**
```
envio-indexers/dex-indexer
```

### Step 4: Update Backend .env

After indexers deploy, Envio gives you URLs like:
```
https://indexer.bigdevenergy.link/YOUR_ID/v1/graphql
```

Update `backend/.env`:
```bash
ENVIO_PORTFOLIO_ENDPOINT=https://indexer.bigdevenergy.link/YOUR_PORTFOLIO_ID/v1/graphql
ENVIO_DEX_ENDPOINT=https://indexer.bigdevenergy.link/YOUR_DEX_ID/v1/graphql
```

---

## 📋 What Changed

### Removed:
- ❌ `smart-money-indexer` (4th indexer)
- ❌ `BEGINNER_SETUP_GUIDE.md`
- ❌ `MONAD_TESTNET_CONTRACTS.md`
- ❌ `PROJECT_STATUS.md`

### Kept:
- ✅ `README.md` (simplified)
- ✅ `SETUP_COMPLETE.md` (this file)
- ✅ `HACKATHON_CHECKLIST.md`

### Fixed:
- ✅ Use `pnpm run dev` not `npm install`
- ✅ Created `envio` branch for hosted service
- ✅ 3 indexers total (hackathon requirement)

---

## ⚠️ Important

**For Envio indexers:** Use `pnpm run dev`
**For backend/frontend:** Use `npm install` then `npm run dev`

The indexers will auto-install dependencies when you run `pnpm run dev`!

---

## 🎯 Next Steps

1. **Run locally** (4 terminals above)
2. **Deploy to Envio** (hosted service instructions above)
3. **Test the app** at http://localhost:5173
4. **Submit to hackathon!**

**GitHub:** https://github.com/LonelyGuy-SE1/IntelliQuant
