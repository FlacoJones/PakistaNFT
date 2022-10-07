import { formatEther } from "ethers/lib/utils";
import { ethers, run } from "hardhat";
import { SavePakistan } from "../typechain-types";

async function main() {
  const [deployer] = await ethers.getSigners();
  let nonce = await deployer.getTransactionCount();
  const [network, balanceBN] = await Promise.all([
    deployer.provider?.getNetwork(),
    deployer.getBalance(),
  ]);
  console.log("deployer", deployer.address);
  console.log("balance", formatEther(balanceBN));
  console.log("network", `${network?.name} (${network?.chainId})`);

  const baseURI =
    "https://ipfs.io/ipfs/bafybeihrni33k36zw6v7hv2miggpaqdnkgwe7mac6ww6enju44wqxxiqkq/";

  // Mock Treasury
  const TreasuryMock = await ethers.getContractFactory("TreasuryMock");
  const treasuryMock = await TreasuryMock.deploy({ nonce });
  await treasuryMock.deployed();
  nonce = await deployer.getTransactionCount();
  console.log("treasuryMock", treasuryMock.address);

  // Mock USDC & USDT
  const USDCMock = await ethers.getContractFactory("USDCMock");
  const usdcMock = await USDCMock.deploy({ nonce });
  await usdcMock.deployed();
  nonce = await deployer.getTransactionCount();
  console.log("usdcMock", usdcMock.address);

  const USDTMock = await ethers.getContractFactory("USDTMock");
  const usdtMock = await USDTMock.deploy({ nonce });
  await usdtMock.deployed();
  nonce = await deployer.getTransactionCount();
  console.log("usdtMock", usdtMock.address);

  // ERC1155
  const SavePakistan = await ethers.getContractFactory("SavePakistan");
  const savePakistan = <SavePakistan>await SavePakistan.deploy(
    treasuryMock.address,
    usdcMock.address,
    usdtMock.address,
    baseURI,
    {
      nonce,
    }
  );
  await savePakistan.deployed();
  console.log("savePakistan", savePakistan.address);

  // ! verification
  await run("verify:verify", {
    address: treasuryMock.address,
    constructorArguments: [],
  });
  await run("verify:verify", {
    address: usdcMock.address,
    constructorArguments: [],
  });
  await run("verify:verify", {
    address: usdtMock.address,
    constructorArguments: [],
  });
  await run("verify:verify", {
    address: savePakistan.address,
    constructorArguments: [treasuryMock.address, usdcMock.address, usdtMock.address, baseURI],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
