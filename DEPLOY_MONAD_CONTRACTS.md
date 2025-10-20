# Monad Testnet Contract Deployment Guide

## CRITICAL: Envio Needs Real Contract Addresses

Envio cannot index until you have ACTUAL deployed contracts on Monad testnet. The current config uses a placeholder address.

## Option 1: Deploy Test ERC20 (RECOMMENDED for Demo)

### 1. Simple ERC20 Contract

Create `contracts/TestToken.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor() ERC20("Test Token", "TEST") {
        _mint(msg.sender, 1000000 * 10**18);
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
```

### 2. Deploy to Monad Testnet

Using Hardhat:

```javascript
// hardhat.config.js
module.exports = {
  networks: {
    monadTestnet: {
      url: "https://testnet-rpc.monad.xyz",
      chainId: 10143,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
```

Deploy:

```bash
npx hardhat run scripts/deploy.js --network monadTestnet
```

### 3. Update Envio Config

Once deployed, update `envio-indexers/portfolio-indexer/config.yaml`:

```yaml
contracts:
  - name: ERC20Token
    address:
      - "0xYOUR_DEPLOYED_TOKEN_ADDRESS_HERE"
```

## Option 2: Find Existing Monad Testnet Tokens

Check Monad testnet explorer:

- https://testnet.monadexplorer.com/
- https://testnet.monadscan.com/

Look for:

1. Any ERC20 tokens already deployed
2. DEX tokens (WMON, WETH, etc.)
3. Faucet tokens

Once found, add their addresses to config.yaml.

## Option 3: Deploy MultiToken System (BEST for Demo)

Deploy multiple tokens to show portfolio diversity:

```solidity
// Deploy 3-5 different test tokens
contract TokenA is ERC20 { ... }
contract TokenB is ERC20 { ... }
contract TokenC is ERC20 { ... }
```

Then add all addresses to config:

```yaml
address:
  - "0xTokenA..."
  - "0xTokenB..."
  - "0xTokenC..."
```

## Testing Without Deployment (NOT RECOMMENDED)

If you MUST demo without deployment, you can:

1. Use mock data generators in backend
2. Skip Envio entirely
3. Hard-code sample portfolio data

But this won't win hackathon prizes.

## Current Status

❌ Config uses placeholder: `0x1111...`  
⏳ Need to deploy actual contracts  
🎯 Once deployed, Envio will index automatically

## Quick Deploy Script

```bash
# 1. Install dependencies
cd contracts
npm install @openzeppelin/contracts hardhat

# 2. Deploy
npx hardhat run scripts/deploy.js --network monadTestnet

# 3. Copy deployed address
# 4. Update config.yaml
# 5. Push to GitHub
# 6. Envio will rebuild automatically
```

## Next Steps

1. **Deploy at least 1 ERC20 token to Monad testnet**
2. Update `config.yaml` with real address
3. Push changes to GitHub
4. Check Envio dashboard for successful sync
5. Test GraphQL queries

Without this, Envio will NEVER work.
