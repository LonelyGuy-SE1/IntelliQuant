/**
 * MetaMask Smart Account Service
 * Creates and manages smart accounts on Monad testnet
 */

import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { createBundlerClient } from 'viem/account-abstraction';
import { Implementation, toMetaMaskSmartAccount } from '@metamask/delegation-toolkit';
import monadTestnet from '../config/chains.js';

let smartAccountInstance = null;
let publicClientInstance = null;
let bundlerClientInstance = null;

/**
 * Get public client for Monad testnet
 */
export function getPublicClient() {
  if (!publicClientInstance) {
    publicClientInstance = createPublicClient({
      chain: monadTestnet,
      transport: http(),
    });
  }
  return publicClientInstance;
}

/**
 * Get bundler client
 */
export function getBundlerClient() {
  if (!bundlerClientInstance) {
    const bundlerUrl = (typeof import !== 'undefined' && typeof import.meta !== 'undefined' && import.meta.env)
      ? import.meta.env.VITE_BUNDLER_URL
      : undefined;

    if (!bundlerUrl) {
      throw new Error('VITE_BUNDLER_URL not configured. Please set up a bundler for Monad testnet.');
    }

    bundlerClientInstance = createBundlerClient({
      client: getPublicClient(),
      transport: http(bundlerUrl),
    });
  }
  return bundlerClientInstance;
}

/**
 * Connect to MetaMask wallet
 * @returns {Promise<string>} Connected address
 */
export async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    // Switch to Monad testnet if not already
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${monadTestnet.id.toString(16)}` }],
      });
    } catch (switchError) {
      // Chain not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${monadTestnet.id.toString(16)}`,
            chainName: monadTestnet.name,
            nativeCurrency: monadTestnet.nativeCurrency,
            rpcUrls: monadTestnet.rpcUrls.default.http,
            blockExplorerUrls: [monadTestnet.blockExplorers.default.url],
          }],
        });
      } else {
        throw switchError;
      }
    }

    return accounts[0];
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
}

/**
 * Create MetaMask Smart Account
 * @param {string} ownerAddress - EOA owner address (optional, uses MetaMask if not provided)
 * @returns {Promise<Object>} Smart account instance
 */
export async function createSmartAccount(ownerAddress = null) {
  try {
    const publicClient = getPublicClient();
    let owner = ownerAddress;

    // If no owner provided, connect MetaMask
    if (!owner) {
      owner = await connectWallet();
    }

    // Create wallet client with MetaMask
    const walletClient = createWalletClient({
      account: owner,
      chain: monadTestnet,
      transport: custom(window.ethereum),
    });

    console.log('Creating smart account for owner:', owner);

    // Create smart account (Hybrid implementation)
    const smartAccount = await toMetaMaskSmartAccount({
      client: publicClient,
      implementation: Implementation.Hybrid,
      deployParams: [owner, [], [], []], // Hybrid: owner, no initial passkeys
      deploySalt: '0x', // Random salt for unique address
      signatory: { walletClient },
    });

    smartAccountInstance = smartAccount;

    console.log('Smart account created:', smartAccount.address);
    console.log('Deployed:', await isSmartAccountDeployed(smartAccount.address));

    return smartAccount;
  } catch (error) {
    console.error('Error creating smart account:', error);
    throw error;
  }
}

/**
 * Get current smart account instance
 * @returns {Object|null} Smart account
 */
export function getSmartAccount() {
  return smartAccountInstance;
}

/**
 * Check if smart account is deployed
 * @param {string} address - Smart account address
 * @returns {Promise<boolean>} True if deployed
 */
export async function isSmartAccountDeployed(address) {
  try {
    const publicClient = getPublicClient();
    const code = await publicClient.getBytecode({ address });
    return code !== undefined && code !== '0x';
  } catch (error) {
    console.error('Error checking deployment:', error);
    return false;
  }
}

/**
 * Get smart account balance
 * @param {string} address - Smart account address
 * @returns {Promise<string>} Balance in MON
 */
export async function getSmartAccountBalance(address) {
  try {
    const publicClient = getPublicClient();
    const balance = await publicClient.getBalance({ address });
    return (Number(balance) / 1e18).toFixed(4);
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw error;
  }
}

export default {
  connectWallet,
  createSmartAccount,
  getSmartAccount,
  getPublicClient,
  getBundlerClient,
  isSmartAccountDeployed,
  getSmartAccountBalance,
};
