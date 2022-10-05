import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-solhint";
import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "hardhat-abi-exporter";
import "hardhat-docgen";
import "dotenv/config";

import "./tasks";

const accounts: string[] = [`0x${process.env.PRIVATE_KEY}` || ""];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.14",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
      outputSelection: {
        "*": {
          "*": ["storageLayout"],
        },
      },
    },
  },
  abiExporter: {
    path: "./data/abi",
    runOnCompile: false,
    spacing: 2,
    pretty: true,
    clear: true,
  },
  docgen: {
    path: "./docs",
    runOnCompile: false,
    clear: true,
  },
  networks: {
    mainnet: {
      url: process.env.MAINNET_URL || "",
      accounts,
    },
    kovan: {
      url: process.env.KOVAN_URL || "",
      accounts,
    },
    goerli: {
      url: process.env.GOERLI_URL || "",
      accounts,
    },
    optimismEthereum: {
      url: process.env.OP_MAINNET_URL || "",
      accounts,
    },
    optimismGoerli: {
      url: process.env.OP_GOERLI_URL || "",
      accounts,
    },
    polygonMumbai: {
      url: process.env.POLYGON_MUMBAI_URL || "",
      accounts,
    },
  },
  gasReporter: {
    enabled: !!process.env.REPORT_GAS,
    currency: "USD",
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.MAINNET_API_KEY || "",
      kovan: process.env.MAINNET_API_KEY || "",
      goerli: process.env.MAINNET_API_KEY || "",
      optimisticEthereum: process.env.OP_MAINNET_API_KEY || "",
      optimismGoerli: process.env.OP_MAINNET_API_KEY || "",
      polygonMumbai: process.env.POLYGON_API_KEY || "",
    },
    customChains: [
      {
        chainId: 420,
        network: "optimismGoerli",
        urls: {
          apiURL: "https://blockscout.com/optimism/goerli/api",
          browserURL: "https://blockscout.com/optimism/goerli",
        },
      },
    ],
  },
};

export default config;
