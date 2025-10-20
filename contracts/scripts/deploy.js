const hre = require("hardhat");

async function main() {
  console.log("Deploying Test Tokens to Monad Testnet...");

  // Deploy 3 test tokens for portfolio diversity
  const tokens = [
    { name: "Wrapped MON", symbol: "WMON", supply: 1000000 },
    { name: "Test ETH", symbol: "TETH", supply: 500000 },
    { name: "USD Coin", symbol: "USDC", supply: 2000000 },
  ];

  const deployed = [];

  for (const token of tokens) {
    console.log(`\nDeploying ${token.name} (${token.symbol})...`);

    const TestToken = await hre.ethers.getContractFactory("TestToken");
    const testToken = await TestToken.deploy(
      token.name,
      token.symbol,
      token.supply
    );

    await testToken.waitForDeployment();
    const address = await testToken.getAddress();

    console.log(`✅ ${token.symbol} deployed to: ${address}`);
    deployed.push({ ...token, address });
  }

  console.log("\n========================================");
  console.log("DEPLOYMENT COMPLETE!");
  console.log("========================================\n");

  console.log("📋 UPDATE YOUR config.yaml WITH THESE ADDRESSES:\n");
  console.log("contracts:");
  console.log("  - name: ERC20Token");
  console.log("    address:");
  deployed.forEach((t) => {
    console.log(`      - "${t.address}" # ${t.symbol}`);
  });

  console.log("\n💾 Save these addresses!");

  // Save to file
  const fs = require("fs");
  fs.writeFileSync(
    "deployed-addresses.json",
    JSON.stringify(deployed, null, 2)
  );

  console.log("✅ Addresses saved to deployed-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
