const hre = require("hardhat");
// const fs = require('fs');

async function main() {
  const Expense = await hre.ethers.getContractFactory("ExpenseManagement")
  const expense = await Expense.deploy();
  await expense.deployed();
  console.log("Expense Management deployed to:", expense.address);

  // fs.writeFileSync('./config.js', `export const marketplaceAddress = "${nftMarketplace.address}"`)
}

main()
  .then(() => process.exit(0))  
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

