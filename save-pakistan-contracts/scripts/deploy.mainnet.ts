import { getAddress as checksumAddr } from "ethers/lib/utils";
import { ethers, upgrades } from "hardhat";
import { SavePakistan } from "../typechain-types";

async function main() {
  // const baseURI =
  //   "https://ipfs.io/ipfs/bafybeihrni33k36zw6v7hv2miggpaqdnkgwe7mac6ww6enju44wqxxiqkq/";

  // const _treasuryAddr = "undefined"; // TODO: Put treasury address metadata here
  const _usdcAddr = checksumAddr("0x7f5c764cbc14f9669b88837ca1490cca17c31607");
  const _usdtAddr = checksumAddr("0x94b008aa00579c1307b0ef2c499ad98a8ce58e58");
  const _optimismTokenAddr = checksumAddr("0x4200000000000000000000000000000000000042");
  const _priceFeed = checksumAddr("0x13e3Ee699D1909E989722E753853AE30b17e08c5");
  const _opPriceFeed = checksumAddr("0x0D276FC14719f9292D5C1eA2198673d1f4269246");
  const _baseURI = "ipfs://bafybeibz43jalkxvprgovpimvuf5hdoqqqokb2jadkbaez6tqx3xx5ljdy"; // TODO: Put metadata baseURI here

  // ERC1155
  const SavePakistan = await ethers.getContractFactory("SavePakistan");
  const savePakistan = <SavePakistan>(
    await upgrades.deployProxy(SavePakistan, [
      // _treasuryAddr,
      _usdcAddr,
      _usdtAddr,
      _optimismTokenAddr,
      _priceFeed,
      _opPriceFeed,
      _baseURI,
    ])
  );

  await savePakistan.deployed();
  console.log("SavePakistan contract deployed", savePakistan.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
