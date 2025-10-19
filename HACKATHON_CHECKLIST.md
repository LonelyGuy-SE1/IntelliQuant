# Hackathon Submission Checklist

## Qualification Requirements

### ✅ MetaMask Smart Accounts Integration

- [x] **Uses MetaMask Smart Accounts**: Implementation in `frontend/src/services/smart-account.js`
  - Creates smart accounts using Hybrid implementation
  - Supports EOA signers via MetaMask
  - Uses `@metamask/delegation-toolkit`

- [x] **Delegation Toolkit SDK**: Integrated in `frontend/src/services/delegation.js`
  - Creates delegations with caveats
  - Implements security restrictions (allowedTargets, maxTransfer, limitedCalls)
  - Signs delegations for autonomous trading

- [x] **Working in Main Flow**: Smart accounts are core to the application
  - User creates smart account after connecting wallet
  - All portfolio management happens through smart account
  - Delegations enable automated rebalancing
  - Gasless transactions (with bundler configuration)

### ✅ Monad Testnet Deployment

- [x] **Chain Configuration**: `frontend/src/config/chains.js`
  - Chain ID: 10143
  - RPC URL: https://testnet-rpc.monad.xyz
  - Proper network parameters

- [x] **Contracts on Monad**: All interactions target Monad testnet
  - Smart accounts deployed on Monad
  - Tokens and DEX pools on Monad
  - Envio indexers monitor Monad chain

### ✅ Envio Integration (Bonus Requirements)

- [x] **HyperIndex Indexers**: 4 separate indexers
  - Portfolio indexer: Tracks token balances
  - DEX indexer: Monitors swap events and liquidity
  - Token metrics indexer: Aggregate health data
  - Smart money indexer: Whale tracking

- [x] **Core Functionality**: Envio powers the intelligence layer
  - Real-time portfolio data from portfolio indexer
  - Token health metrics from DEX indexer
  - Liquidity and volume data via GraphQL
  - Smart money activity monitoring

- [x] **GraphQL APIs**: Backend consumes Envio endpoints
  - `backend/services/envio-client.js` queries indexers
  - Scoring engine uses indexed data
  - Risk analysis powered by blockchain data

- [x] **HyperSync**: Configured in indexers
  - Fast historical data retrieval
  - `start_block: 0` with auto-detection
  - Production-ready configuration

## Demo Video Requirements

### Must Show

1. **MetaMask Smart Accounts**
   - [ ] Connect MetaMask wallet
   - [ ] Create smart account
   - [ ] Show smart account address
   - [ ] Create delegation with caveats
   - [ ] Execute transaction through smart account

2. **Monad Testnet**
   - [ ] Show Monad network in MetaMask
   - [ ] Display chain ID 10143
   - [ ] Show transactions on Monad explorer
   - [ ] Demonstrate testnet MON usage

3. **Envio Integration**
   - [ ] Show Envio indexer running (Hasura console)
   - [ ] Execute GraphQL query
   - [ ] Display indexed data in UI
   - [ ] Explain how Envio powers intelligence

4. **Core Features**
   - [ ] AI token health scoring (0-100)
   - [ ] Component breakdown (liquidity, stability, demand, slippage)
   - [ ] Portfolio risk analysis
   - [ ] Trading recommendations
   - [ ] Delegation creation with security caveats

## Submission Materials

### Required

- [ ] **Project Demo Video** (3-5 minutes)
  - Upload to YouTube/Loom
  - Include in submission form

- [ ] **GitHub Repository** (public)
  - All code pushed
  - README with setup instructions
  - Clear project structure

- [ ] **Live Demo** (optional but recommended)
  - Deploy frontend
  - Deploy backend
  - Use hosted Envio indexers

- [ ] **Project Description**
  - Title: IntelliQuant - AI-Powered Portfolio Management on Monad
  - Summary: AI-driven portfolio analytics with secure delegated trading using MetaMask Smart Accounts, real-time blockchain data via Envio, and high-performance execution on Monad
  - Tech Stack: MetaMask Delegation Toolkit, Envio HyperIndex, Monad Testnet, Node.js, Vite

### Optional Enhancements

- [ ] **Documentation**
  - Architecture diagrams
  - API documentation
  - User guide

- [ ] **Additional Features**
  - Passkey support for smart accounts
  - ERC-20 paymaster integration
  - Multi-signature smart accounts
  - Automated rebalancing bot

## Code Quality Checklist

### Architecture

- [x] **Modular Structure**: Separate layers
  - Data layer: Envio indexers
  - Intelligence layer: Backend services
  - Execution layer: Smart account services
  - UI layer: Frontend components

- [x] **No 10k Line Files**: All files under 500 lines
  - Services separated by concern
  - Components modular and focused
  - Clean code organization

### Security

- [x] **Delegation Caveats**: Proper restrictions
  - allowedTargets (specific DEX routers)
  - allowedMethods (function selectors)
  - maxNativeTransfer (amount limits)
  - limitedCalls (execution caps)

- [x] **Non-Custodial**: User always in control
  - Smart accounts owned by user EOA
  - Delegations are revocable
  - Transparent audit log

- [x] **Input Validation**: Proper error handling
  - Address validation
  - Amount checks
  - Transaction error handling

## Testing Checklist

### Backend

- [ ] Health check endpoint responds
- [ ] Token scoring returns valid results
- [ ] Portfolio analysis works
- [ ] Recommendations generate correctly
- [ ] GraphQL queries succeed

### Frontend

- [ ] MetaMask connection works
- [ ] Smart account creation succeeds
- [ ] UI displays data correctly
- [ ] All buttons functional
- [ ] Error messages clear

### Integration

- [ ] Envio indexers sync data
- [ ] Backend queries Envio successfully
- [ ] Frontend calls backend API
- [ ] End-to-end flow works
- [ ] Gasless transactions execute (if bundler configured)

## Judging Criteria Focus

### Innovation (25%)

**Highlight:**
- AI-powered token health scoring algorithm
- Four-component analysis (liquidity, stability, demand, slippage)
- Smart money tracking and momentum analysis
- Automated portfolio rebalancing with delegations

### Technical Implementation (25%)

**Highlight:**
- Full-stack integration (Envio → Backend → Frontend)
- MetaMask Smart Accounts with delegation framework
- Real-time blockchain indexing with Envio HyperIndex
- Monad testnet deployment for high performance

### User Experience (25%)

**Highlight:**
- Clean, intuitive dashboard UI
- Gasless transactions via paymaster
- Clear component breakdowns and explanations
- One-click portfolio analysis

### Impact & Use Case (25%)

**Highlight:**
- Solves real DeFi pain point (manual portfolio management)
- Non-custodial automation (secure & trustless)
- Transparent AI recommendations with explanations
- Accessible to both novice and advanced users

## Pre-Submission Checklist

- [ ] All code committed to Git
- [ ] README.md complete with setup instructions
- [ ] SETUP_GUIDE.md tested and accurate
- [ ] .env.example files present
- [ ] Demo video recorded and uploaded
- [ ] Live demo deployed (optional)
- [ ] Tested on fresh machine/environment
- [ ] All dependencies documented
- [ ] License file included (MIT)
- [ ] Screenshots/images added to README

## Submission Form Fields (Prepare Answers)

1. **Project Name**: IntelliQuant

2. **Tagline**: AI-Powered Portfolio Management on Monad with MetaMask Smart Accounts

3. **Description** (200 words):
```
IntelliQuant is a next-generation DeFi portfolio management platform that combines AI-powered analytics, real-time blockchain indexing, and secure delegated trading. Built on Monad testnet, it leverages MetaMask Smart Accounts for gasless, non-custodial automation.

Key features:
• AI Token Health Scoring: 0-100 scores with component breakdown (liquidity, stability, demand, slippage)
• Portfolio Risk Analysis: Drift detection, concentration risk, and smart money tracking
• Secure Delegations: Granular trading permissions with caveats (amount limits, target restrictions, call limits)
• Real-time Data: Envio HyperIndex indexers monitor DEX swaps, token transfers, and whale activity
• Gasless Execution: Paymaster-sponsored transactions for frictionless UX

IntelliQuant uses Envio's ultra-fast HyperSync to index millions of blockchain events, feeding an AI scoring engine that generates actionable recommendations. Users create MetaMask Smart Accounts, set portfolio targets, and optionally enable automated rebalancing through secure delegations. All execution happens on Monad's high-performance L1, delivering 400ms blocks and 800ms finality for responsive trading.

The platform is fully transparent, non-custodial, and user-controlled. Every AI recommendation includes detailed explanations, and all automated trades are logged with delegation metadata for complete auditability.
```

4. **Tech Stack**: MetaMask Delegation Toolkit, Envio HyperIndex, Monad Testnet, Viem, Node.js, Express, Vite, JavaScript

5. **GitHub URL**: https://github.com/yourusername/IntelliQuant

6. **Demo Video URL**: https://www.youtube.com/watch?v=...

7. **Live Demo URL** (optional): https://intelliquant.vercel.app

8. **Team Members**: [Your name(s)]

9. **Track**: Main Track + Envio Bonus

## Final Steps Before Submission

1. **Record Demo Video**
   - Follow script in SETUP_GUIDE.md
   - Show all three technologies in action
   - Keep under 5 minutes
   - Upload to YouTube (unlisted or public)

2. **Deploy Application**
   - Frontend to Vercel/Netlify
   - Backend to Railway/Render
   - Envio indexers to hosted service

3. **Test Everything One Last Time**
   - Fresh browser session
   - Connect wallet
   - Complete full user flow
   - Record any issues

4. **Submit**
   - Fill submission form completely
   - Double-check all URLs work
   - Verify video plays correctly
   - Submit before deadline

## Post-Submission

- [ ] Share on Twitter/X
- [ ] Post in hackathon Discord
- [ ] Thank sponsors (MetaMask, Monad, Envio)
- [ ] Engage with other participants
- [ ] Be responsive to judge questions

---

**Good luck! You've built a comprehensive, hackathon-winning application! 🚀**
