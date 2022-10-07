import { getAddress as checksumAddr } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { SavePakistan } from "../typechain-types";

// TODO: Finalize mainnet deploy script
async function main() {
  const baseURI =
    "https://ipfs.io/ipfs/bafybeihrni33k36zw6v7hv2miggpaqdnkgwe7mac6ww6enju44wqxxiqkq/";
  const TREASURY_ADDR = "0x ...";
  const USDT_ADDR = checksumAddr("0x94b008aa00579c1307b0ef2c499ad98a8ce58e58");
  const USDC_ADDR = checksumAddr("0x7f5c764cbc14f9669b88837ca1490cca17c31607");

  // ERC1155
  const SavePakistan = await ethers.getContractFactory("SavePakistan");
  const savePakistan = <SavePakistan>(
    await SavePakistan.deploy(TREASURY_ADDR, USDC_ADDR, USDT_ADDR, baseURI)
  );
  await savePakistan.deployed();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
