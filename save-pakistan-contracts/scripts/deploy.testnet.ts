import { formatEther } from "ethers/lib/utils";
import { ethers, network, run } from "hardhat";
import { SavePakistan } from "../typechain-types";

async function main() {
  const [deployer] = await ethers.getSigners();

  let nonce = await deployer.getTransactionCount();

  const [balanceBN] = await Promise.all([deployer.getBalance()]);

  console.log("deployer", deployer.address);
  console.log("balance", formatEther(balanceBN));
  console.log("network", network.name);

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

  const OPMock = await ethers.getContractFactory("OPMock");
  const oPMock = await USDTMock.deploy({ nonce });
  await oPMock.deployed();
  nonce = await deployer.getTransactionCount();
  console.log("oPMock", oPMock.address);

  const MockEthUsdPriceFeed = await ethers.getContractFactory("MockEthUsdPriceFeed");
  const mockEthUsdPriceFeed = await MockEthUsdPriceFeed.deploy({ nonce });
  await mockEthUsdPriceFeed.deployed();
  nonce = await deployer.getTransactionCount();
  console.log("mockEthUsdPriceFeed", mockEthUsdPriceFeed.address);

  const MockOpUsdPriceFeed = await ethers.getContractFactory("MockOpUsdPriceFeed");
  const mockOpUsdPriceFeed = await MockOpUsdPriceFeed.deploy({ nonce });
  await mockOpUsdPriceFeed.deployed();
  nonce = await deployer.getTransactionCount();
  console.log("mockOpUsdPriceFeed", mockOpUsdPriceFeed.address);

  // ERC1155 implementation
  const SavePakistanImplementation = await ethers.getContractFactory("SavePakistan");
  const savePakistanImplementation = <SavePakistan>(
    await SavePakistanImplementation.deploy({ nonce })
  );
  await savePakistanImplementation.deployed();
  nonce = await deployer.getTransactionCount();
  console.log("savePakistanImplementation", savePakistanImplementation.address);

  // Deploy SavePakistanProxy
  const SavePakistanProxy = await ethers.getContractFactory("SavePakistanProxy");
  let savePakistan = (<unknown>(
    await SavePakistanProxy.deploy(savePakistanImplementation.address, [], { nonce })
  )) as SavePakistan;
  await savePakistan.deployed();
  nonce = await deployer.getTransactionCount();

  // Attach the SavePakistan ABI to the SavePakistanProxy address to send method calls to the delegatecall
  savePakistan = await SavePakistanImplementation.attach(savePakistan.address);
  await savePakistan.initialize(
    treasuryMock.address,
    usdcMock.address,
    usdtMock.address,
    oPMock.address,
    mockEthUsdPriceFeed.address,
    mockOpUsdPriceFeed.address,
    baseURI
  );
  nonce = await deployer.getTransactionCount();
  console.log("savePakistan", savePakistan.address);

  // ! verification
  if (network.name != "local") {
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
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
