# IntelliQuant - Complete Development Roadmap

## CRITICAL PATH TO WORKING DEMO

### Phase 1: Deploy Contracts (15-30 minutes) ⏰ BLOCKING EVERYTHING

**Status:** 🔴 NOT DONE - Envio cannot work without this

**Steps:**

```bash
# 1. Navigate to contracts directory
cd contracts

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Add your Monad testnet private key

# 4. Get MON testnet tokens
# Visit Monad faucet or Discord

# 5. Deploy test tokens
npm run deploy

# 6. Copy deployed addresses

# 7. Update envio-indexers/portfolio-indexer/config.yaml
# Replace placeholder with REAL addresses

# 8. Push to GitHub
git add .
git commit -m "config: Update with deployed contract addresses"
git push origin envio

# 9. Check Envio dashboard
# Should see "Historical Sync Complete" within 5 minutes
```

**Why This Matters:**

- Envio WILL NOT work with fake addresses
- All portfolio tracking depends on this
- Token metrics require real transfers
- AI analysis needs actual data

---

### Phase 2: Smart Account & Delegation System (1-2 hours)

**Status:** ⚠️ Partially implemented, needs completion

**Current State:**

- ✅ Smart account creation working
- ✅ Basic delegation UI exists
- ❌ Delegation execution NOT implemented
- ❌ Caveat system incomplete
- ❌ No actual trade automation

**Tasks:**

#### 2.1 Complete Delegation Creation

File: `frontend/src/services/delegation.js`

- [ ] Implement proper caveat encoding
- [ ] Add allowance caveats (max amount per trade)
- [ ] Add time-based caveats (expiry)
- [ ] Add target address restrictions (only approved DEX)
- [ ] Test delegation signing

#### 2.2 Build Trade Executor

File: `frontend/src/services/trade-executor.js` (CREATE)

```javascript
// Redeem delegations to execute trades on user's behalf
export async function executeTrade(delegation, tradeParams) {
  // 1. Validate caveats
  // 2. Build swap transaction
  // 3. Redeem delegation
  // 4. Execute trade
  // 5. Record in audit log
}
```

#### 2.3 Create Delegation Manager UI

File: `frontend/src/components/delegation-manager.js` (CREATE)

- [ ] List active delegations
- [ ] Show remaining allowances
- [ ] Revoke delegation button
- [ ] Delegation history

#### 2.4 Build Audit Log

File: `frontend/src/components/audit-log.js` (CREATE)

- [ ] Show all automated trades
- [ ] Display gas used
- [ ] Show delegation used
- [ ] Filter by date/token

---

### Phase 3: Automated Portfolio Rebalancer (2-3 hours)

**Status:** ❌ Core feature NOT implemented

**Required Components:**

#### 3.1 Rebalance Engine

File: `backend/services/rebalance-engine.js` (CREATE)

```javascript
// Calculate trades needed to reach target allocation
export function calculateRebalanceTrades(currentPortfolio, targetAllocation) {
  // 1. Get current positions
  // 2. Calculate drift from target
  // 3. Generate optimal trades
  // 4. Minimize trade count
  // 5. Account for slippage
  // 6. Return trade list
}
```

#### 3.2 Auto-Rebalance Monitor

File: `backend/services/rebalance-monitor.js` (CREATE)

```javascript
// Continuously check if rebalancing needed
export class RebalanceMonitor {
  async checkAllUsers() {
    // For each user with auto-rebalance enabled:
    // 1. Get current portfolio
    // 2. Compare to target
    // 3. If drift > threshold, trigger rebalance
    // 4. Execute trades via delegation
    // 5. Send notification
  }
}
```

#### 3.3 Rebalance UI

File: `frontend/src/components/rebalancer.js` (CREATE)

- [ ] Set target allocations (e.g., 40% WMON, 30% USDC, 30% TETH)
- [ ] Set drift threshold (e.g., 5% drift triggers rebalance)
- [ ] Enable/disable auto-rebalance toggle
- [ ] Preview rebalance trades
- [ ] Manual rebalance button

---

### Phase 4: DEX Integration (1-2 hours)

**Status:** ❌ NOT implemented - critical for trades

**Required:**

#### 4.1 Find Monad DEX

Options:

- Check if Uniswap V2/V3 deployed on Monad testnet
- Check Monad docs for testnet DEXs
- Deploy simple AMM if none exist

#### 4.2 DEX Router Integration

File: `frontend/src/services/dex-router.js` (CREATE)

```javascript
export class DEXRouter {
  async getQuote(tokenIn, tokenOut, amountIn) {
    // Get expected output amount
  }

  async executSwap(tokenIn, tokenOut, amountIn, minOut, deadline) {
    // Execute swap transaction
  }
}
```

#### 4.3 Slippage Protection

- [ ] Calculate price impact
- [ ] Set max slippage (e.g., 1%)
- [ ] Show warnings for high slippage

---

### Phase 5: Token Metrics & Analysis (1 hour)

**Status:** ⚠️ Basic AI analysis works, needs data

**Depends On:** Phase 1 (Envio working)

**Tasks:**

#### 5.1 Token Metrics Calculator

File: `backend/services/token-metrics.js` (EXISTS, needs update)

- [ ] Fetch transfer data from Envio
- [ ] Calculate holder concentration
- [ ] Calculate trading volume
- [ ] Detect whale movements
- [ ] Generate health score (0-100)

#### 5.2 Enhanced AI Prompts

File: `frontend/src/config/crestal.js` (EXISTS, enhance)

- [ ] Include actual token metrics in prompt
- [ ] Add historical price data (if available)
- [ ] Include holder analysis
- [ ] Format for clear recommendations

---

### Phase 6: Risk Monitoring (1 hour)

**Status:** ❌ NOT implemented

**Tasks:**

#### 6.1 Risk Dashboard

File: `frontend/src/components/risk-dashboard.js` (CREATE)

- [ ] Show portfolio concentration risk
- [ ] Display Sharpe ratio (if price data available)
- [ ] Show max drawdown
- [ ] Alert on high-risk positions

#### 6.2 Risk Alerts

File: `backend/services/risk-alerts.js` (CREATE)

```javascript
// Monitor for risk conditions
export class RiskMonitor {
  async checkRisks(userAddress) {
    // 1. Check concentration (>50% in one token = HIGH RISK)
    // 2. Check token health scores
    // 3. Check whale movements
    // 4. Send alerts if needed
  }
}
```

---

### Phase 7: Gasless Transactions (30 minutes)

**Status:** ⚠️ Partially working, needs paymaster

**Required:**

#### 7.1 Configure Paymaster

File: `frontend/src/config/paymaster.js` (CREATE)

- [ ] Set up paymaster URL
- [ ] Configure gas sponsorship rules
- [ ] Test gasless transactions

#### 7.2 Update Transaction Flow

File: `frontend/src/services/transactions.js` (UPDATE)

- [ ] Use paymaster for all smart account txs
- [ ] Fallback to user-paid gas if needed
- [ ] Show "gasless" badge in UI

---

### Phase 8: Polish & Testing (1-2 hours)

**Tasks:**

#### 8.1 Error Handling

- [ ] Add try-catch everywhere
- [ ] Show user-friendly error messages
- [ ] Log errors to console
- [ ] Add loading states

#### 8.2 UI/UX Improvements

- [ ] Add animations
- [ ] Improve mobile responsive
- [ ] Add tooltips
- [ ] Better color scheme

#### 8.3 Testing

- [ ] Test smart account creation
- [ ] Test delegation creation
- [ ] Test auto-rebalancing
- [ ] Test with multiple tokens
- [ ] Test error cases

---

## TOTAL ESTIMATED TIME

- **Minimum (core features):** 6-8 hours
- **Full implementation:** 10-15 hours
- **With testing & polish:** 15-20 hours

---

## PRIORITY ORDER

1. **PHASE 1** (Deploy Contracts) - MUST DO FIRST ⏰
2. **PHASE 4** (DEX Integration) - Needed for trades
3. **PHASE 2** (Delegations) - Core hackathon feature
4. **PHASE 3** (Auto-Rebalance) - Main value prop
5. **PHASE 5** (Token Metrics) - Enhances AI
6. **PHASE 6** (Risk Monitoring) - Nice to have
7. **PHASE 7** (Gasless Tx) - UX improvement
8. **PHASE 8** (Polish) - Demo readiness

---

## IMMEDIATE NEXT STEPS

**Right Now:**

1. **Deploy Contracts** (30 min)

   ```bash
   cd contracts
   npm install
   # Add private key to .env
   npm run deploy
   # Update config.yaml with addresses
   git push
   ```

2. **Verify Envio Works** (5 min)

   - Check dashboard for "Historical Sync Complete"
   - Test GraphQL queries
   - Confirm data is indexing

3. **Build Delegation System** (2 hours)

   - Complete caveat encoding
   - Build trade executor
   - Add delegation manager UI

4. **Implement Auto-Rebalancer** (3 hours)

   - Build rebalance engine
   - Create monitoring system
   - Add UI controls

5. **Polish for Demo** (1 hour)
   - Test everything
   - Record demo video
   - Write submission

---

## WHAT'S CURRENTLY WORKING

✅ Smart account creation
✅ MetaMask integration  
✅ Basic delegation UI
✅ Crestal AI integration
✅ Token analysis (AI-powered)
✅ Portfolio display
✅ Chatbot interface

---

## WHAT'S BROKEN/MISSING

❌ Envio indexer (needs real contracts)
❌ Delegation execution
❌ Trade automation
❌ Portfolio rebalancing
❌ DEX integration
❌ Risk monitoring
❌ Audit logging
❌ Gasless transactions (needs paymaster)

---

## SUCCESS CRITERIA

**For Hackathon Prizes:**

**Best AI Agent ($1000-$1500):**

- ✅ Crestal AI integration
- ✅ Token analysis
- ❌ Auto-trading via delegations (NEEDED!)
- ❌ Portfolio rebalancing (NEEDED!)

**Best Use of Envio ($1000 bonus):**

- ❌ Working indexer (BLOCKED by contracts)
- ❌ Real-time data feeding app
- ❌ GraphQL queries in use

**Best On-Chain Automation ($1000-$1500):**

- ✅ Delegation system started
- ❌ Automated execution (NEEDED!)
- ❌ Rebalancing logic (NEEDED!)

---

**BOTTOM LINE:**

Everything depends on **deploying those contracts** (Phase 1). Without that, Envio doesn't work, and without Envio data, the AI can't analyze real portfolios.

**START WITH PHASE 1 NOW!** 🚀
