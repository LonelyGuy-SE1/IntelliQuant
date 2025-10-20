/**
 * IntelliQuant Main Application
 * Modern UI with navigation, custom modals, and toast notifications
 */

import smartAccountService from "./services/smart-account.js";
import delegationService from "./services/delegation.js";
import transactionService from "./services/transactions.js";
import api from "./utils/api.js";
import {
  showModal,
  showToast,
  showSuccess,
  showError,
  showInfo,
  showLoading,
  hideLoading,
  navigateToSection,
} from "./utils/ui-helpers.js";

// Application State
const state = {
  eoaAddress: null,
  smartAccount: null,
  isConnected: false,
};

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  console.log("🤖 IntelliQuant initializing...");
  setupEventListeners();
  setupNavigation();
});

// ========== NAVIGATION ==========
function setupNavigation() {
  // Sidebar navigation
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const section = item.dataset.section;
      navigateToSection(section);
    });
  });

  // Quick action buttons
  document.querySelectorAll(".action-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.dataset.section;
      navigateToSection(section);
    });
  });

  // Mobile menu toggle
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");

  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 1024) {
      if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove("active");
      }
    }
  });
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
  // Wallet Connection
  const connectWalletTopBtn = document.getElementById("connectWalletTopBtn");
  if (connectWalletTopBtn) {
    connectWalletTopBtn.addEventListener("click", handleConnect);
  }

  // Disconnect button
  const disconnectBtn = document.getElementById("disconnectBtn");
  if (disconnectBtn) {
    disconnectBtn.addEventListener("click", handleDisconnect);
  }

  // Smart Account
  const createSmartAccountBtn = document.getElementById(
    "createSmartAccountBtn"
  );
  if (createSmartAccountBtn) {
    createSmartAccountBtn.addEventListener("click", handleCreateSmartAccount);
  }

  const refreshBalanceBtn = document.getElementById("refreshBalanceBtn");
  if (refreshBalanceBtn) {
    refreshBalanceBtn.addEventListener("click", handleRefreshBalance);
  }

  // Token Analysis
  const analyzeTokensBtn = document.getElementById("analyzeTokensBtn");
  if (analyzeTokensBtn) {
    analyzeTokensBtn.addEventListener("click", handleAnalyzeTokens);
  }

  // Portfolio
  const loadPortfolioBtn = document.getElementById("loadPortfolioBtn");
  if (loadPortfolioBtn) {
    loadPortfolioBtn.addEventListener("click", handleLoadPortfolio);
  }

  // Delegations
  const createDelegationBtn = document.getElementById("createDelegationBtn");
  if (createDelegationBtn) {
    createDelegationBtn.addEventListener("click", handleCreateDelegation);
  }

  const createMinimalDelegationBtn = document.getElementById(
    "createMinimalDelegationBtn"
  );
  if (createMinimalDelegationBtn) {
    createMinimalDelegationBtn.addEventListener(
      "click",
      handleCreateMinimalDelegation
    );
  }

  // Recommendations
  const getRecommendationsBtn = document.getElementById(
    "getRecommendationsBtn"
  );
  if (getRecommendationsBtn) {
    getRecommendationsBtn.addEventListener("click", handleGetRecommendations);
  }

  // Transactions
  const sendTestTxBtn = document.getElementById("sendTestTxBtn");
  if (sendTestTxBtn) {
    sendTestTxBtn.addEventListener("click", handleSendTestTransaction);
  }
}

// ========== WALLET CONNECTION ==========
async function handleConnect() {
  try {
    showLoading("Connecting to MetaMask...");

    const address = await smartAccountService.connectWallet();

    state.eoaAddress = address;
    state.isConnected = true;

    updateUI();
    hideLoading();
    showSuccess("Connected to MetaMask!");
  } catch (error) {
    hideLoading();
    showError("Failed to connect: " + error.message);
    console.error("Connection error:", error);
  }
}

async function handleDisconnect() {
  const confirmed = await showModal(
    "Disconnect Wallet",
    "Are you sure you want to disconnect your wallet?",
    { confirmText: "Disconnect" }
  );

  if (confirmed) {
    state.eoaAddress = null;
    state.smartAccount = null;
    state.isConnected = false;
    updateUI();
    showInfo("Wallet disconnected");
  }
}

function updateUI() {
  const connectWalletTopBtn = document.getElementById("connectWalletTopBtn");
  const disconnectBtn = document.getElementById("disconnectBtn");
  const walletInfo = document.getElementById("walletInfo");
  const walletAddressDisplay = document.getElementById("walletAddressDisplay");
  const eoaAddressDisplay = document.getElementById("eoaAddressDisplay");
  const createSmartAccountBtn = document.getElementById(
    "createSmartAccountBtn"
  );
  const refreshBalanceBtn = document.getElementById("refreshBalanceBtn");

  if (state.isConnected && state.eoaAddress) {
    // Hide connect button, show wallet info
    connectWalletTopBtn.style.display = "none";
    walletInfo.style.display = "flex";
    disconnectBtn.style.display = "inline-flex";

    // Display addresses
    const shortAddress = `${state.eoaAddress.slice(
      0,
      6
    )}...${state.eoaAddress.slice(-4)}`;
    walletAddressDisplay.textContent = shortAddress;
    eoaAddressDisplay.textContent = state.eoaAddress;

    // Enable smart account creation
    createSmartAccountBtn.disabled = false;
    refreshBalanceBtn.disabled = false;
  } else {
    // Show connect button, hide wallet info
    connectWalletTopBtn.style.display = "inline-flex";
    walletInfo.style.display = "none";
    disconnectBtn.style.display = "none";

    // Reset displays
    eoaAddressDisplay.textContent = "Not connected";

    // Disable buttons
    createSmartAccountBtn.disabled = true;
    refreshBalanceBtn.disabled = true;
  }
}

// ========== SMART ACCOUNT ==========
async function handleCreateSmartAccount() {
  if (!state.isConnected) {
    showError("Please connect your wallet first");
    return;
  }

  try {
    showLoading("Creating Smart Account...");

    const smartAccount = await smartAccountService.createSmartAccount(
      state.eoaAddress
    );
    state.smartAccount = smartAccount;

    const smartAccountDisplay = document.getElementById("smartAccountDisplay");
    const balanceDisplay = document.getElementById("balanceDisplay");

    smartAccountDisplay.textContent = smartAccount.address;

    // Get balance
    const balance = await smartAccountService.getSmartAccountBalance(
      smartAccount.address
    );
    balanceDisplay.textContent = `${balance} MON`;

    hideLoading();
    showSuccess("Smart Account created successfully!");
  } catch (error) {
    hideLoading();
    showError("Failed to create smart account: " + error.message);
    console.error("Smart account error:", error);
  }
}

async function handleRefreshBalance() {
  if (!state.smartAccount) {
    showError("Create a smart account first");
    return;
  }

  try {
    const balance = await smartAccountService.getSmartAccountBalance(
      state.smartAccount.address
    );
    document.getElementById("balanceDisplay").textContent = `${balance} MON`;
    showSuccess("Balance refreshed");
  } catch (error) {
    showError("Failed to refresh balance: " + error.message);
  }
}

// ========== TOKEN ANALYSIS ==========
async function handleAnalyzeTokens() {
  const input = document.getElementById("tokenAddressesInput").value.trim();

  if (!input) {
    showError("Please enter token addresses");
    return;
  }

  const tokens = input
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t);

  if (tokens.length === 0) {
    showError("No valid token addresses");
    return;
  }

  try {
    showLoading("Analyzing tokens with AI...");

    // Direct Crestal analysis for each token
    const { crestalAI } = await import("./config/crestal.js");
    const results = [];

    for (const tokenAddress of tokens) {
      const prompt = `Analyze this ERC-20 token contract on Monad testnet:
      
Contract Address: ${tokenAddress}
Chain: Monad Testnet (Chain ID: 10143)

Provide analysis on:
1. Token legitimacy and safety
2. Potential risks or red flags
3. Recommendation (buy/hold/avoid)

Be concise and actionable.`;

      const result = await crestalAI.sendMessage(
        prompt,
        "tokenAnalysis",
        { contractAddress: tokenAddress },
        `token_${tokenAddress}`
      );

      results.push({
        token: tokenAddress,
        analysis: result.success ? result.response : "Analysis failed",
        score: result.success ? 75 : 0, // Placeholder score
      });
    }

    displayTokenScores(results);
    hideLoading();
    showSuccess(`Analyzed ${tokens.length} token(s)`);
  } catch (error) {
    hideLoading();
    showError("Failed to analyze tokens: " + error.message);
    console.error("Token analysis error:", error);
  }
}

function displayTokenScores(scores) {
  const container = document.getElementById("tokenScoresResults");

  if (!scores || scores.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; color: var(--text-muted);">No scores available</p>';
    return;
  }

  container.innerHTML = scores
    .map(
      (score) => `
    <div class="card" style="margin-bottom: 1rem;">
      <div class="card-header">
        <h3 style="font-family: var(--font-mono); font-size: 0.9rem;">${
          score.token || "Token"
        }</h3>
        <span class="badge ${getScoreBadgeClass(score.score)}">${
        score.score || 0
      }/100</span>
      </div>
      <div class="card-body">
        <div style="white-space: pre-wrap; font-size: 0.9rem; line-height: 1.6;">
          ${score.analysis || score.explanation || "Analysis pending..."}
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

function getScoreBadgeClass(score) {
  if (score >= 70) return "badge-green";
  return "badge";
}

// ========== PORTFOLIO ==========
async function handleLoadPortfolio() {
  if (!state.isConnected || !state.eoaAddress) {
    showError("Please connect your wallet first");
    return;
  }

  try {
    showLoading("Loading portfolio from Envio...");

    // Query Envio GraphQL directly for user's token balances
    const address = state.smartAccount
      ? state.smartAccount.address
      : state.eoaAddress;

    const response = await api.get(`/portfolio/${address}`);
    const portfolio = response.data;

    displayPortfolio(portfolio);

    // Auto-load AI analysis using Crestal directly
    try {
      showLoading("Analyzing with AI...");

      // Direct Crestal call - bypass backend
      const { crestalAI } = await import("./config/crestal.js");
      const result = await crestalAI.analyzePortfolio(address, portfolio);

      if (result.success) {
        displayAIAnalysis({ analysis: result.response });
      }
    } catch (aiError) {
      console.error("AI analysis error:", aiError);
    }

    hideLoading();
    showSuccess("Portfolio loaded");
  } catch (error) {
    hideLoading();
    showError("Failed to load portfolio: " + error.message);
    console.error("Portfolio error:", error);
  }
}

function displayPortfolio(portfolio) {
  const container = document.getElementById("portfolioResults");

  if (!portfolio || !portfolio.balances || portfolio.balances.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; color: var(--text-muted);">No holdings found</p>';
    return;
  }

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3>Holdings</h3>
      </div>
      <div class="card-body">
        ${portfolio.balances
          .map(
            (balance) => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--bg-secondary); border-radius: 0.5rem; margin-bottom: 0.75rem;">
            <div>
              <div style="font-family: var(--font-mono); color: var(--text-primary);">${
                balance.token || balance.tokenAddress
              }</div>
              <div style="font-size: 0.875rem; color: var(--text-secondary);">${
                balance.tokenAddress
              }</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 1.125rem; font-weight: 600; color: var(--accent-green);">${
                balance.balance
              }</div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
    <div id="aiAnalysisContainer"></div>
  `;
}

function displayAIAnalysis(analysis) {
  const container = document.getElementById("aiAnalysisContainer");

  if (!container) return;

  const riskColor =
    analysis.riskLevel === "high"
      ? "var(--accent-red)"
      : analysis.riskLevel === "medium"
      ? "var(--accent-yellow)"
      : "var(--accent-green)";

  container.innerHTML = `
    <div class="card" style="margin-top: 1rem; border-left: 3px solid var(--accent-purple);">
      <div class="card-header">
        <h3>🤖 AI Analysis ${
          analysis.aiPowered ? "(Crestal Agent)" : "(Rule-based)"
        }</h3>
        <span class="badge" style="background: ${riskColor};">${analysis.riskLevel.toUpperCase()} RISK</span>
      </div>
      <div class="card-body">
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">${
          analysis.summary
        }</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
          <div class="info-group">
            <label>Diversification</label>
            <div class="balance-display">${analysis.diversification.toFixed(
              1
            )}%</div>
          </div>
          <div class="info-group">
            <label>Total Tokens</label>
            <div class="balance-display">${analysis.metrics.totalTokens}</div>
          </div>
          ${
            analysis.metrics.topHolding
              ? `
            <div class="info-group">
              <label>Top Holding</label>
              <div class="balance-display">${analysis.metrics.topHolding.percentage.toFixed(
                1
              )}%</div>
            </div>
          `
              : ""
          }
        </div>

        <div style="margin-bottom: 1.5rem;">
          <h4 style="color: var(--text-primary); margin-bottom: 0.75rem;">💡 Insights</h4>
          ${analysis.insights
            .map(
              (insight) => `
            <div style="padding: 0.75rem; background: var(--bg-secondary); border-radius: 0.5rem; margin-bottom: 0.5rem;">
              ${insight}
            </div>
          `
            )
            .join("")}
        </div>

        <div>
          <h4 style="color: var(--text-primary); margin-bottom: 0.75rem;">📊 Recommendations</h4>
          ${analysis.recommendations
            .map(
              (rec) => `
            <div style="padding: 0.75rem; background: var(--bg-secondary); border-radius: 0.5rem; margin-bottom: 0.5rem; border-left: 2px solid var(--accent-green);">
              ${rec}
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

// ========== DELEGATIONS ==========
async function handleCreateDelegation() {
  if (!state.smartAccount) {
    showError("Create a smart account first");
    return;
  }

  const delegateAddress = document
    .getElementById("delegateAddress")
    .value.trim();
  const maxTransfer = document.getElementById("maxTransfer").value;
  const maxCalls = document.getElementById("maxCalls").value;

  if (!delegateAddress) {
    showError("Please enter delegate address");
    return;
  }

  try {
    showLoading("Creating delegation...");

    const result = await delegationService.createTradingDelegation(
      state.smartAccount,
      delegateAddress,
      {
        maxNativeTransfer: maxTransfer,
        maxCalls: parseInt(maxCalls),
      }
    );

    displayDelegationResult(result);
    hideLoading();
    showSuccess("Delegation created!");
  } catch (error) {
    hideLoading();
    showError("Failed to create delegation: " + error.message);
    console.error("Delegation error:", error);
  }
}

async function handleCreateMinimalDelegation() {
  if (!state.smartAccount) {
    showError("Create a smart account first");
    return;
  }

  const delegateAddress = document
    .getElementById("delegateAddress")
    .value.trim();

  if (!delegateAddress) {
    showError("Please enter delegate address");
    return;
  }

  try {
    showLoading("Creating minimal delegation...");

    const result = await delegationService.createMinimalDelegation(
      state.smartAccount,
      delegateAddress
    );

    displayDelegationResult(result);
    hideLoading();
    showSuccess("Test delegation created!");
  } catch (error) {
    hideLoading();
    showError("Failed to create delegation: " + error.message);
  }
}

function displayDelegationResult(result) {
  const container = document.getElementById("delegationResults");

  container.innerHTML = `
    <div class="card" style="margin-top: 1.5rem;">
      <div class="card-header">
        <h3>Delegation Created</h3>
        <span class="badge badge-green">Active</span>
      </div>
      <div class="card-body">
        <div class="info-group">
          <label>Delegate</label>
          <div class="address-display">${result.delegation.delegate}</div>
        </div>
        <div class="info-group">
          <label>Authority</label>
          <div class="address-display">${result.delegation.authority}</div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem;">
          <div class="info-group">
            <label>Max Transfer</label>
            <div class="balance-display">${result.caveats.maxNativeTransfer} MON</div>
          </div>
          <div class="info-group">
            <label>Max Calls</label>
            <div class="balance-display">${result.caveats.maxCalls}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ========== AI RECOMMENDATIONS ==========
async function handleGetRecommendations() {
  const input = document.getElementById("recommendTokensInput").value.trim();

  if (!input) {
    showError("Please enter token addresses");
    return;
  }

  const tokens = input
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t);

  try {
    showLoading("Generating AI recommendations...");

    const response = await api.post("/recommendations", { tokens, limit: 5 });
    const recommendations = response.data;

    displayRecommendations(recommendations);
    hideLoading();
    showSuccess("Recommendations generated");
  } catch (error) {
    hideLoading();
    showError("Failed to generate recommendations: " + error.message);
  }
}

function displayRecommendations(recommendations) {
  const container = document.getElementById("recommendationsResults");

  if (!recommendations || recommendations.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; color: var(--text-muted);">No recommendations available</p>';
    return;
  }

  container.innerHTML = recommendations
    .map(
      (rec, index) => `
    <div class="card" style="margin-bottom: 1rem;">
      <div class="card-header">
        <h3>Recommendation #${index + 1}</h3>
        <span class="badge badge-green">${rec.action || "BUY"}</span>
      </div>
      <div class="card-body">
        <p>${rec.reason || "AI-powered recommendation"}</p>
        ${
          rec.token
            ? `
          <div class="info-group">
            <label>Token</label>
            <div class="address-display">${rec.token}</div>
          </div>
        `
            : ""
        }
      </div>
    </div>
  `
    )
    .join("");
}

// ========== TRANSACTIONS ==========
async function handleSendTestTransaction() {
  if (!state.smartAccount) {
    showError("Create a smart account first");
    return;
  }

  const recipient = document.getElementById("testRecipient").value.trim();
  const amount = document.getElementById("testAmount").value;

  if (!recipient) {
    showError("Please enter recipient address");
    return;
  }

  const confirmed = await showModal(
    "Send Transaction",
    `Send ${amount} MON to ${recipient}?`,
    { confirmText: "Send" }
  );

  if (!confirmed) return;

  try {
    showLoading("Sending transaction...");

    const result = await transactionService.sendGaslessTransaction(
      state.smartAccount,
      recipient,
      amount
    );

    const container = document.getElementById("transactionResults");
    container.innerHTML = `
      <div class="card" style="margin-top: 1.5rem;">
        <div class="card-header">
          <h3>Transaction Sent</h3>
          <span class="badge badge-green">Success</span>
        </div>
        <div class="card-body">
          <div class="info-group">
            <label>Transaction Hash</label>
            <div class="address-display">${result.hash || "Pending..."}</div>
          </div>
        </div>
      </div>
    `;

    hideLoading();
    showSuccess("Transaction sent!");
  } catch (error) {
    hideLoading();
    showError("Failed to send transaction: " + error.message);
  }
}

// Make functions available globally for debugging
window.IntelliQuant = {
  state,
  handleConnect,
  handleDisconnect,
  navigateToSection,
};
