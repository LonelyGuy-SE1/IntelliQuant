/**
 * Chain Configurations
 * Monad Testnet and other chains
 */

export const monadTestnet = {
  id: 10143,
  name: "Monad Testnet",
  network: "monad-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Monad",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: [
        import.meta.env.VITE_MONAD_RPC_URL || "https://testnet-rpc.monad.xyz",
      ],
    },
    public: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet.monadexplorer.com",
    },
  },
  testnet: true,
};

export const SUPPORTED_CHAINS = [monadTestnet];

export default monadTestnet;
