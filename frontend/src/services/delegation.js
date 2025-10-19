/**
 * Delegation Service
 * Creates and manages delegations with security caveats
 */

import { parseEther } from 'viem';

/**
 * Create trading delegation with caveats
 * @param {Object} smartAccount - Smart account instance
 * @param {string} delegateAddress - Address to delegate to (AI agent)
 * @param {Object} options - Delegation options
 * @returns {Promise<Object>} Signed delegation
 */
export async function createTradingDelegation(smartAccount, delegateAddress, options = {}) {
  try {
    const {
      allowedTargets = [], // DEX routers
      allowedMethods = [], // Function selectors
      maxNativeTransfer = '5', // Max MON transfer
      maxCalls = 20, // Max number of calls
    } = options;

    // For now, we'll create a simple delegation structure
    // In production, you'd use proper caveat encoding per ERC-7710
    const delegation = {
      delegate: delegateAddress,
      authority: smartAccount.address,
      caveats: {
        allowedTargets: allowedTargets.length > 0 ? allowedTargets : ['any'],
        allowedMethods: allowedMethods.length > 0 ? allowedMethods : ['any'],
        maxNativeTransfer,
        maxCalls,
      },
      timestamp: Date.now(),
    };

    console.log('Created delegation:', delegation);

    // Store delegation (in production, this would be signed and stored on-chain or off-chain)
    const signedDelegation = {
      ...delegation,
      signature: 'mock-signature-for-demo', // In production, properly sign with EIP-712
    };

    console.log('Signed delegation:', signedDelegation);

    return {
      delegation,
      signedDelegation,
      caveats: {
        allowedTargets,
        allowedMethods,
        maxNativeTransfer,
        maxCalls,
      },
    };
  } catch (error) {
    console.error('Error creating delegation:', error);
    throw error;
  }
}

/**
 * Create minimal delegation (for testing)
 * @param {Object} smartAccount - Smart account instance
 * @param {string} delegateAddress - Delegate address
 * @returns {Promise<Object>} Signed delegation
 */
export async function createMinimalDelegation(smartAccount, delegateAddress) {
  try {
    // Minimal delegation for testing
    const delegation = {
      delegate: delegateAddress,
      authority: smartAccount.address,
      caveats: {
        maxNativeTransfer: '0.1',
        maxCalls: 5,
      },
      timestamp: Date.now(),
    };

    const signedDelegation = {
      ...delegation,
      signature: 'mock-signature-for-demo',
    };

    return {
      delegation,
      signedDelegation,
      caveats: {
        maxNativeTransfer: '0.1',
        maxCalls: 5,
      },
    };
  } catch (error) {
    console.error('Error creating minimal delegation:', error);
    throw error;
  }
}

/**
 * Revoke a delegation (by creating new delegation with zero authority)
 * Note: Actual revocation depends on delegation framework implementation
 * @param {Object} smartAccount - Smart account instance
 * @param {string} delegateAddress - Address to revoke from
 */
export async function revokeDelegation(smartAccount, delegateAddress) {
  // In practice, revocation might be handled differently
  // This is a placeholder for the concept
  console.warn('Delegation revocation not yet implemented in this version');

  // Typically you would:
  // 1. Store delegations off-chain with expiry
  // 2. Use time-bounded caveats
  // 3. Implement on-chain revocation if supported

  return {
    revoked: false,
    message: 'Manual revocation pending - delegations will expire based on caveats',
  };
}

/**
 * Get delegation summary for display
 * @param {Object} delegationData - Delegation data
 * @returns {Object} Summary
 */
export function getDelegationSummary(delegationData) {
  const { caveats, delegation } = delegationData;

  return {
    delegate: delegation.to,
    delegator: delegation.from,
    permissions: {
      allowedContracts: caveats.allowedTargets || ['Any'],
      allowedFunctions: caveats.allowedMethods || ['Any'],
      maxNativeTransfer: `${caveats.maxNativeTransfer} MON`,
      maxCalls: caveats.maxCalls || 'Unlimited',
    },
    status: 'Active',
    created: Date.now(),
  };
}

export default {
  createTradingDelegation,
  createMinimalDelegation,
  revokeDelegation,
  getDelegationSummary,
};
