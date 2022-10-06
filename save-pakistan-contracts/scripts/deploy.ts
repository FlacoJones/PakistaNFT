/* global ethers */
/* eslint prefer-const: "off" */

import { constants, ContractReceipt, ContractTransaction, utils } from "ethers";
import { formatEther, getAddress as checksumAddr } from "ethers/lib/utils";
import { ethers, network } from "hardhat";

const constructor = {
  Mainnet: {
    Treasury: checksumAddr(
      "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58" // TODO: Replace with SavePakistan multi-sig wallet address
    ),
    USDT: checksumAddr("0x94b008aa00579c1307b0ef2c499ad98a8ce58e58"),
    USDC: checksumAddr("0x7f5c764cbc14f9669b88837ca1490cca17c31607"),
  },
  Testnet: {
    Treasury: "0x",
    USDT: "0x",
    USDC: "0x",
  },
};

async function main() {}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
