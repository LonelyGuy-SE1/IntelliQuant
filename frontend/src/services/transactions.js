/**
 * Transaction Service
 * Handles gasless transactions via bundler and paymaster
 */

import { parseEther } from 'viem';
import { getBundlerClient } from './smart-account.js';

/**
 * Send gasless transaction
 * @param {Object} smartAccount - Smart account instance
 * @param {Object} call - Transaction call { to, value, data }
 * @returns {Promise<Object>} Transaction receipt
 */
export async function sendGaslessTransaction(smartAccount, call) {
  try {
    const bundlerClient = getBundlerClient();

    console.log('Sending gasless transaction:', call);

    // Send user operation (gasless)
    const hash = await bundlerClient.sendUserOperation({
      account: smartAccount,
      calls: [call],
    });

    console.log('User operation hash:', hash);

    // Wait for receipt
    const receipt = await bundlerClient.waitForUserOperationReceipt({ hash });

    console.log('Transaction receipt:', receipt);

    return {
      hash,
      receipt,
      success: true,
    };
  } catch (error) {
    console.error('Error sending gasless transaction:', error);
    throw error;
  }
}

/**
 * Send native token transfer (gasless)
 * @param {Object} smartAccount - Smart account instance
 * @param {string} to - Recipient address
 * @param {string} amount - Amount in MON (string)
 * @returns {Promise<Object>} Transaction result
 */
export async function sendNativeTransfer(smartAccount, to, amount) {
  const call = {
    to: to,
    value: parseEther(amount),
    data: '0x',
  };

  return await sendGaslessTransaction(smartAccount, call);
}

/**
 * Execute swap on DEX (example)
 * @param {Object} smartAccount - Smart account instance
 * @param {string} dexRouter - DEX router address
 * @param {string} calldata - Encoded swap calldata
 * @returns {Promise<Object>} Transaction result
 */
export async function executeSwap(smartAccount, dexRouter, calldata) {
  const call = {
    to: dexRouter,
    value: 0n,
    data: calldata,
  };

  return await sendGaslessTransaction(smartAccount, call);
}

/**
 * Batch execute multiple calls (gasless)
 * @param {Object} smartAccount - Smart account instance
 * @param {Array} calls - Array of calls
 * @returns {Promise<Object>} Transaction result
 */
export async function executeBatch(smartAccount, calls) {
  try {
    const bundlerClient = getBundlerClient();

    console.log('Executing batch transaction:', calls);

    const hash = await bundlerClient.sendUserOperation({
      account: smartAccount,
      calls: calls,
    });

    const receipt = await bundlerClient.waitForUserOperationReceipt({ hash });

    return {
      hash,
      receipt,
      success: true,
    };
  } catch (error) {
    console.error('Error executing batch:', error);
    throw error;
  }
}

export default {
  sendGaslessTransaction,
  sendNativeTransfer,
  executeSwap,
  executeBatch,
};
