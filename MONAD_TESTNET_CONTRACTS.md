# Monad Testnet Contract Addresses

This document contains known contract addresses on Monad Testnet (Chain ID: 10143) as of 2025.

## Network Information

- **Network Name**: Monad Testnet
- **Chain ID**: 10143
- **RPC URL**: https://testnet-rpc.monad.xyz
- **Block Explorer**: https://testnet.monadexplorer.com
- **Alternative Explorer**: https://testnet.monadscan.com
- **Symbol**: MON
- **Faucet**: https://faucet.quicknode.com/monad/testnet

---

## Core Tokens

### Wrapped MON (WMON)
```
Address: 0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701
Type: WETH-style wrapped native token
Usage: Trading pairs, DEX liquidity
```

### ETH (Bridged)
```
Address: 0x836047a99e11f376522b447bffb6e3495dd0637c
Type: Bridged ETH from Sepolia
Usage: Cross-chain functionality
```

---

## Test Tokens (For Development)

These are mintable test tokens available on various DEXes:

### USDC.a (Atlantis DEX Test Token)
```
Name: USDC.a
Type: Mintable test stablecoin
Mint Cost: 0.01 testnet MON
Platform: Atlantis DEX (https://atlantis.finance)
```

### WETH.a (Atlantis DEX Test Token)
```
Name: WETH.a
Type: Mintable test ETH
Mint Cost: 0.01 testnet MON
Platform: Atlantis DEX
```

### USDT.a (Atlantis DEX Test Token)
```
Name: USDT.a
Type: Mintable test stablecoin
Mint Cost: 0.01 testnet MON
Platform: Atlantis DEX
```

### WBTC.a (Atlantis DEX Test Token)
```
Name: WBTC.a
Type: Mintable test BTC
Mint Cost: 0.01 testnet MON
Platform: Atlantis DEX
```

---

## DEX Protocols on Monad Testnet

### Uniswap V2 & V3
- **Status**: Live on Monad Testnet
- **Interface**: https://app.uniswap.org (select Monad Testnet)
- **Features**: Swap and provide liquidity
- **Deployed Factories**: V2 and V3 factories are deployed

**Example Pool Address (from GeckoTerminal):**
```
ETH/WMON Uniswap V2 Pool: 0x0b924f975f67632c1b8af61b5b63415976a88791
```

### PancakeSwap
- **Status**: Live on Monad Testnet
- **Interface**: https://pancakeswap.finance/?chain=monadTestnet
- **Blog Post**: https://blog.pancakeswap.finance/articles/pancake-swap-now-live-on-monad-testnet-faster-cheaper-smarter
- **Features**: Faster and cheaper swaps on high-performance chain

### Other DEXes

**Bean Exchange**
- Supports MON, USDC, WMON swaps

**Clober DEX**
- Limit orders: MON ↔ USDC

**Ambient Finance**
- Multi-hop swaps: MON → USDC → WETH

**Mon Bridge DEX**
- Website: https://monbridgedex.xyz
- Best swap rates aggregator

---

## How to Get Contract Addresses

### Method 1: Block Explorer
1. Visit https://testnet.monadexplorer.com
2. Search for recent transactions
3. Click on "Tokens" section
4. Find popular tokens and their addresses

### Method 2: DEX Interface
1. Go to Uniswap or PancakeSwap on Monad
2. Select a token from the dropdown
3. Click "View token info"
4. Copy the contract address

### Method 3: Developer Documentation
- **Monad Docs**: https://docs.monad.xyz
- **Canonical Contracts**: Check the "Developer Essentials" section
- **Contract Addresses**: Listed in developer documentation

### Method 4: Community Resources
- **Monad Discord**: https://discord.com/invite/monaddev
- **Ask in #dev-support** channel for specific contract addresses
- **Check pinned messages** in testnet channels

---

## Finding More DEX Pool Addresses

### Using GeckoTerminal

GeckoTerminal tracks Monad testnet pools!

**Search URL**: https://www.geckoterminal.com/monad-testnet/pools

**Example Pools Found:**
- ETH/WMON (Uniswap V2): `0x0b924f975f67632c1b8af61b5b63415976a88791`
- Nads/WMON (Uniswap V3): `0xdbecd127db2369c58e3d5bc44b8c712468e428e6`

**How to Use:**
1. Go to https://www.geckoterminal.com/monad-testnet/pools
2. Browse trending pools
3. Click on a pool to see its contract address
4. Use these addresses in your Envio indexer `config.yaml`

---

## Updating Your Indexers

### Portfolio Indexer (Token Tracking)

Edit: `envio-indexers/portfolio-indexer/config.yaml`

Replace placeholder addresses with:

```yaml
networks:
  - id: 10143  # Monad Testnet
    start_block: 0
    contracts:
      - name: ERC20Token
        address:
          - "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701"  # WMON
          - "0x836047a99e11f376522b447bffb6e3495dd0637c"  # ETH
          # Add more token addresses as you find them
```

### DEX Indexer (Swap Tracking)

Edit: `envio-indexers/dex-indexer/config.yaml`

Replace placeholder addresses with pool addresses:

```yaml
networks:
  - id: 10143
    start_block: 0
    contracts:
      - name: UniswapV2Pool
        address:
          - "0x0b924f975f67632c1b8af61b5b63415976a88791"  # ETH/WMON Uniswap V2
          # Add more pool addresses from GeckoTerminal or DEX interfaces
```

### Token Metrics Indexer

This can track the same tokens as Portfolio Indexer or specific tokens you want to analyze.

---

## Important Notes

1. **Testnet Tokens Have No Value**
   - All MON, USDC, WETH on testnet are for testing only
   - Don't confuse with mainnet addresses

2. **Addresses May Change**
   - Testnet can be reset
   - Always verify addresses before use
   - Check official sources

3. **Get Test MON First**
   - Use faucet: https://faucet.quicknode.com/monad/testnet
   - Need MON to interact with contracts
   - Bridge from Sepolia if needed

4. **Verify Contracts**
   - Use block explorer to verify contract is real
   - Check recent transactions
   - Ensure contract is active

---

## Resources

- **Monad Docs**: https://docs.monad.xyz
- **Block Explorer**: https://testnet.monadexplorer.com
- **GeckoTerminal**: https://www.geckoterminal.com/monad-testnet
- **Uniswap on Monad**: https://app.uniswap.org (select Monad Testnet network)
- **PancakeSwap on Monad**: https://pancakeswap.finance/?chain=monadTestnet
- **Monad Discord**: https://discord.com/invite/monaddev

---

## Next Steps

1. **Visit GeckoTerminal** to find active pool addresses
2. **Update your `config.yaml`** files with real addresses
3. **Test your indexers** with `npm run envio:dev`
4. **Check GraphQL console** to see if data is syncing
5. **Join Monad Discord** to ask for more addresses if needed

Happy building! 🚀
