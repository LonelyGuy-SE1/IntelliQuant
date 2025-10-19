/**
 * IntelliQuant Main Application
 * Integrates MetaMask Smart Accounts, Envio data, and AI analytics
 */

import smartAccountService from './services/smart-account.js';
import delegationService from './services/delegation.js';
import transactionService from './services/transactions.js';
import api from './utils/api.js';

// Application State
const state = {
  eoaAddress: null,
  smartAccount: null,
  isConnected: false,
};

// DOM Elements
const elements = {
  connectBtn: document.getElementById('connectBtn'),
  connectWalletBtn: document.getElementById('connectWalletBtn'),
  connectSection: document.getElementById('connectSection'),
  accountSection: document.getElementById('accountSection'),
  scoresSection: document.getElementById('scoresSection'),
  portfolioSection: document.getElementById('portfolioSection'),
  delegationsSection: document.getElementById('delegationsSection'),
  recommendationsSection: document.getElementById('recommendationsSection'),
  testTransactionSection: document.getElementById('testTransactionSection'),
  loadingOverlay: document.getElementById('loadingOverlay'),
  loadingMessage: document.getElementById('loadingMessage'),
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  console.log('IntelliQuant initializing...');
  setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
  // Connection
  elements.connectBtn.addEventListener('click', handleConnect);
  elements.connectWalletBtn.addEventListener('click', handleConnect);

  // Smart Account
  document.getElementById('createSmartAccountBtn').addEventListener('click', handleCreateSmartAccount);
  document.getElementById('refreshBalanceBtn').addEventListener('click', handleRefreshBalance);

  // Token Scores
  document.getElementById('analyzeTokensBtn').addEventListener('click', handleAnalyzeTokens);

  // Portfolio
  document.getElementById('loadPortfolioBtn').addEventListener('click', handleLoadPortfolio);
  document.getElementById('analyzeRiskBtn').addEventListener('click', handleAnalyzeRisk);

  // Delegations
  document.getElementById('createDelegationBtn').addEventListener('click', handleCreateDelegation);
  document.getElementById('createMinimalDelegationBtn').addEventListener('click', handleCreateMinimalDelegation);

  // Recommendations
  document.getElementById('getRecommendationsBtn').addEventListener('click', handleGetRecommendations);

  // Test Transaction
  document.getElementById('sendTestTxBtn').addEventListener('click', handleSendTestTransaction);
}

// Connect Wallet
async function handleConnect() {
  try {
    showLoading('Connecting to MetaMask...');

    const address = await smartAccountService.connectWallet();

    state.eoaAddress = address;
    state.isConnected = true;

    updateUI();

    hideLoading();
    showSuccess('Connected successfully!');
  } catch (error) {
    hideLoading();
    showError('Failed to connect: ' + error.message);
  }
}

// Create Smart Account
async function handleCreateSmartAccount() {
  if (!state.isConnected) {
    showError('Please connect wallet first');
    return;
  }

  try {
    showLoading('Creating Smart Account...');

    const smartAccount = await smartAccountService.createSmartAccount(state.eoaAddress);

    state.smartAccount = smartAccount;

    document.getElementById('smartAccountAddress').textContent = smartAccount.address;

    // Check deployment
    const isDeployed = await smartAccountService.isSmartAccountDeployed(smartAccount.address);
    document.getElementById('deploymentStatus').textContent = isDeployed ? 'Deployed' : 'Counterfactual';
    document.getElementById('deploymentStatus').className = isDeployed ? 'value text-success' : 'value text-warning';

    // Get balance
    const balance = await smartAccountService.getSmartAccountBalance(smartAccount.address);
    document.getElementById('accountBalance').textContent = `${balance} MON`;

    hideLoading();
    showSuccess('Smart Account created!');
  } catch (error) {
    hideLoading();
    showError('Failed to create smart account: ' + error.message);
  }
}

// Refresh Balance
async function handleRefreshBalance() {
  if (!state.smartAccount) {
    showError('Create smart account first');
    return;
  }

  try {
    const balance = await smartAccountService.getSmartAccountBalance(state.smartAccount.address);
    document.getElementById('accountBalance').textContent = `${balance} MON`;
    showSuccess('Balance refreshed');
  } catch (error) {
    showError('Failed to refresh balance: ' + error.message);
  }
}

// Analyze Tokens
async function handleAnalyzeTokens() {
  const input = document.getElementById('tokenAddressesInput').value.trim();

  if (!input) {
    showError('Please enter token addresses');
    return;
  }

  const tokens = input.split(',').map(t => t.trim()).filter(t => t);

  if (tokens.length === 0) {
    showError('No valid token addresses provided');
    return;
  }

  try {
    showLoading('Analyzing tokens...');

    const response = await api.getMultipleTokenScores(tokens);

    displayTokenScores(response.data);

    hideLoading();
  } catch (error) {
    hideLoading();
    showError('Failed to analyze tokens: ' + error.message);
  }
}

// Display Token Scores
function displayTokenScores(scores) {
  const resultsDiv = document.getElementById('tokenScoresResults');
  resultsDiv.innerHTML = '';

  if (!scores || scores.length === 0) {
    resultsDiv.innerHTML = '<p>No results found</p>';
    return;
  }

  for (const scoreData of scores) {
    const card = document.createElement('div');
    card.className = 'result-card';

    const scoreClass = scoreData.score >= 70 ? 'score-high' : scoreData.score >= 40 ? 'score-medium' : 'score-low';

    card.innerHTML = `
      <div class="result-header">
        <span class="result-title">${scoreData.address.substring(0, 10)}...</span>
        <span class="score-badge ${scoreClass}">${scoreData.score}/100</span>
      </div>
      <div class="result-details">${scoreData.explanation || 'No explanation available'}</div>
      ${scoreData.components ? `
        <div class="component-scores">
          <div class="component-score">
            <div class="label">Liquidity</div>
            <div class="value">${scoreData.components.liquidity}</div>
          </div>
          <div class="component-score">
            <div class="label">Stability</div>
            <div class="value">${scoreData.components.stability}</div>
          </div>
          <div class="component-score">
            <div class="label">Demand</div>
            <div class="value">${scoreData.components.demand}</div>
          </div>
          <div class="component-score">
            <div class="label">Slippage</div>
            <div class="value">${scoreData.components.slippage}</div>
          </div>
        </div>
      ` : ''}
    `;

    resultsDiv.appendChild(card);
  }
}

// Load Portfolio
async function handleLoadPortfolio() {
  if (!state.smartAccount) {
    showError('Create smart account first');
    return;
  }

  try {
    showLoading('Loading portfolio...');

    const response = await api.getUserPortfolio(state.smartAccount.address);

    displayPortfolio(response.data);

    hideLoading();
  } catch (error) {
    hideLoading();
    showError('Failed to load portfolio: ' + error.message);
  }
}

// Display Portfolio
function displayPortfolio(portfolio) {
  const resultsDiv = document.getElementById('portfolioResults');
  resultsDiv.innerHTML = '';

  if (!portfolio || !portfolio.balances || portfolio.balances.length === 0) {
    resultsDiv.innerHTML = '<p>No tokens found in portfolio. Add some tokens to get started!</p>';
    return;
  }

  const html = `
    <h3>Holdings</h3>
    <p>Total Tokens: ${portfolio.totalTokens}</p>
    <div style="margin-top: 1rem;">
      ${portfolio.balances.map(balance => `
        <div class="result-card">
          <div class="result-header">
            <span class="result-title">Token: ${balance.tokenAddress.substring(0, 10)}...</span>
            <span class="value">${(Number(balance.balance) / 1e18).toFixed(4)}</span>
          </div>
          <div class="result-details">Transfers: ${balance.transferCount}</div>
        </div>
      `).join('')}
    </div>
  `;

  resultsDiv.innerHTML = html;
}

// Analyze Risk
async function handleAnalyzeRisk() {
  if (!state.smartAccount) {
    showError('Create smart account first');
    return;
  }

  try {
    showLoading('Analyzing portfolio risk...');

    const response = await api.analyzePortfolio(state.smartAccount.address, {});

    displayRiskAnalysis(response.data);

    hideLoading();
  } catch (error) {
    hideLoading();
    showError('Failed to analyze risk: ' + error.message);
  }
}

// Display Risk Analysis
function displayRiskAnalysis(analysis) {
  const resultsDiv = document.getElementById('portfolioResults');

  const html = `
    <h3>Risk Analysis</h3>
    <div class="status-grid">
      <div class="status-item">
        <span class="label">Drift</span>
        <span class="value">${(analysis.drift * 100).toFixed(1)}%</span>
      </div>
      <div class="status-item">
        <span class="label">Flags</span>
        <span class="value">${analysis.flags.join(', ') || 'None'}</span>
      </div>
    </div>
    <div style="margin-top: 1rem;">
      <h4>Suggestions:</h4>
      <ul class="features-list">
        ${analysis.suggestions.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>
  `;

  resultsDiv.innerHTML = html;
}

// Create Delegation
async function handleCreateDelegation() {
  if (!state.smartAccount) {
    showError('Create smart account first');
    return;
  }

  const delegateAddress = document.getElementById('delegateAddress').value.trim();
  const maxTransfer = document.getElementById('maxTransfer').value;
  const maxCalls = parseInt(document.getElementById('maxCalls').value);

  if (!delegateAddress) {
    showError('Please enter delegate address');
    return;
  }

  try {
    showLoading('Creating delegation...');

    const result = await delegationService.createTradingDelegation(
      state.smartAccount,
      delegateAddress,
      {
        maxNativeTransfer: maxTransfer,
        maxCalls: maxCalls,
      }
    );

    displayDelegation(result);

    hideLoading();
    showSuccess('Delegation created successfully!');
  } catch (error) {
    hideLoading();
    showError('Failed to create delegation: ' + error.message);
  }
}

// Create Minimal Delegation
async function handleCreateMinimalDelegation() {
  if (!state.smartAccount) {
    showError('Create smart account first');
    return;
  }

  const delegateAddress = document.getElementById('delegateAddress').value.trim() || state.eoaAddress;

  try {
    showLoading('Creating test delegation...');

    const result = await delegationService.createMinimalDelegation(state.smartAccount, delegateAddress);

    displayDelegation(result);

    hideLoading();
    showSuccess('Test delegation created!');
  } catch (error) {
    hideLoading();
    showError('Failed to create delegation: ' + error.message);
  }
}

// Display Delegation
function displayDelegation(delegationData) {
  const resultsDiv = document.getElementById('delegationResults');

  const html = `
    <h3>Delegation Created</h3>
    <div class="status-grid">
      <div class="status-item">
        <span class="label">Delegate</span>
        <span class="value">${delegationData.delegation.to}</span>
      </div>
      <div class="status-item">
        <span class="label">Max Transfer</span>
        <span class="value">${delegationData.caveats.maxNativeTransfer} MON</span>
      </div>
      <div class="status-item">
        <span class="label">Max Calls</span>
        <span class="value">${delegationData.caveats.maxCalls}</span>
      </div>
    </div>
    <div style="margin-top: 1rem; padding: 1rem; background: var(--dark-bg); border-radius: 0.5rem; overflow-wrap: break-word;">
      <p style="color: var(--text-secondary); font-size: 0.85rem;">Signed Delegation (store securely):</p>
      <code style="color: var(--primary-color); font-size: 0.75rem;">${JSON.stringify(delegationData.signedDelegation).substring(0, 200)}...</code>
    </div>
  `;

  resultsDiv.innerHTML = html;
}

// Get Recommendations
async function handleGetRecommendations() {
  const input = document.getElementById('recommendTokensInput').value.trim();

  if (!input) {
    showError('Please enter token addresses');
    return;
  }

  const tokens = input.split(',').map(t => t.trim()).filter(t => t);

  try {
    showLoading('Generating recommendations...');

    const response = await api.getRecommendations(tokens, 5);

    displayRecommendations(response.data);

    hideLoading();
  } catch (error) {
    hideLoading();
    showError('Failed to get recommendations: ' + error.message);
  }
}

// Display Recommendations
function displayRecommendations(recommendations) {
  const resultsDiv = document.getElementById('recommendationsResults');
  resultsDiv.innerHTML = '';

  if (!recommendations || recommendations.length === 0) {
    resultsDiv.innerHTML = '<p>No recommendations available</p>';
    return;
  }

  for (const rec of recommendations) {
    const card = document.createElement('div');
    card.className = 'result-card';

    const actionClass = rec.action === 'BUY' ? 'text-success' : 'text-danger';

    card.innerHTML = `
      <div class="result-header">
        <span class="result-title">${rec.token.substring(0, 10)}...</span>
        <span class="value ${actionClass}">${rec.action} (${rec.confidence}%)</span>
      </div>
      <div class="result-details">
        Health Score: ${rec.healthScore}/100
      </div>
      <div style="margin-top: 0.5rem;">
        <strong>Reasons:</strong>
        <ul class="features-list">
          ${rec.reasons.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>
    `;

    resultsDiv.appendChild(card);
  }
}

// Send Test Transaction
async function handleSendTestTransaction() {
  if (!state.smartAccount) {
    showError('Create smart account first');
    return;
  }

  const recipient = document.getElementById('testRecipient').value.trim();
  const amount = document.getElementById('testAmount').value;

  if (!recipient) {
    showError('Please enter recipient address');
    return;
  }

  try {
    showLoading('Sending gasless transaction...');

    const result = await transactionService.sendNativeTransfer(state.smartAccount, recipient, amount);

    displayTransactionResult(result);

    hideLoading();
    showSuccess('Transaction sent successfully!');
  } catch (error) {
    hideLoading();
    showError('Transaction failed: ' + error.message);
  }
}

// Display Transaction Result
function displayTransactionResult(result) {
  const resultsDiv = document.getElementById('transactionResults');

  const html = `
    <h3>Transaction Successful</h3>
    <div class="status-item">
      <span class="label">Hash</span>
      <span class="value">${result.hash}</span>
    </div>
    <p style="color: var(--text-success); margin-top: 1rem;">Transaction was sponsored (gasless)!</p>
  `;

  resultsDiv.innerHTML = html;
}

// Update UI
function updateUI() {
  if (state.isConnected) {
    elements.connectSection.classList.add('hidden');
    elements.accountSection.classList.remove('hidden');
    elements.scoresSection.classList.remove('hidden');
    elements.portfolioSection.classList.remove('hidden');
    elements.delegationsSection.classList.remove('hidden');
    elements.recommendationsSection.classList.remove('hidden');
    elements.testTransactionSection.classList.remove('hidden');

    elements.connectBtn.textContent = `${state.eoaAddress.substring(0, 6)}...${state.eoaAddress.substring(38)}`;

    document.getElementById('eoaAddress').textContent = state.eoaAddress;
  }
}

// UI Utilities
function showLoading(message = 'Loading...') {
  elements.loadingMessage.textContent = message;
  elements.loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
  elements.loadingOverlay.classList.add('hidden');
}

function showSuccess(message) {
  console.log('✓ Success:', message);
  // Could add a toast notification here
}

function showError(message) {
  console.error('✗ Error:', message);
  alert(message); // Simple alert for now
}
