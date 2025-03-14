require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

console.log("DEBUG: Loaded PRIVATE_KEY:", process.env.PRIVATE_KEY);
console.log("DEBUG: Loaded ALCHEMY_API_KEY:", process.env.ALCHEMY_API_KEY);
console.log("DEBUG: Loaded ETHERSCAN_API_KEY:", process.env.ETHERSCAN_API_KEY);

if (!process.env.PRIVATE_KEY) {
  throw new Error("❌ PRIVATE_KEY is missing from .env file!");
}
if (!process.env.ALCHEMY_API_KEY) {
  throw new Error("❌ ALCHEMY_API_KEY is missing from .env file!");
}
if (!process.env.ETHERSCAN_API_KEY) {
  throw new Error("❌ ETHERSCAN_API_KEY is missing from .env file!");
}

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
      },
      {
        version: "0.8.28",
      },
    ],
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: [process.env.PRIVATE_KEY] // Optional, default accounts are already loaded
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
