/* global ethers */
/* eslint prefer-const: "off" */

import { ContractReceipt, ContractTransaction } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { getSelectors, FacetCutAction, CHAIN_IDS } from "../utils";

// const THREE_MINUTES = 180_000;

// const verifyContract = (address: string, constructorArguments?: any[]) =>
//   run("verify:verify", {
//     address,
//     constructorArguments,
//   }).then(() => {
//     console.log(`${address} verified!`);
//   });

const verboseLog = !!process.env.VERBOSE_LOG;

// if (!process.env.VERBOSE_LOG) {
//   console.log = () => {};
// }

export async function deployDiamond() {
  const accounts = await ethers.getSigners();
  const contractOwner = accounts[0];

  const [balance, chainId, transactionCount] = await Promise.all([
    contractOwner.getBalance(),
    contractOwner.getChainId(),
    contractOwner.getTransactionCount(),
  ]);
  console.log("deploying Diamond", {
    address: contractOwner.address,
    balance: formatEther(balance),
    chainId: chainId.toString(),
    transactionCount: transactionCount.toString(),
  });

  const verifyCommands: string[] = [];

  // deploy DiamondCutFacet
  const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
  const diamondCutFacet = await DiamondCutFacet.deploy();
  await diamondCutFacet.deployed();
  console.log("DiamondCutFacet deployed:", diamondCutFacet.address);
  verifyCommands.push(
    `yarn hardhat verify --network ${network.name} ${diamondCutFacet.address}`
  );

  // deploy Diamond
  const Diamond = await ethers.getContractFactory("Diamond");
  const diamond = await Diamond.deploy(
    contractOwner.address,
    diamondCutFacet.address
  );
  await diamond.deployed();
  console.log("Diamond deployed:", diamond.address);
  verifyCommands.push(
    `yarn hardhat verify --network ${network.name} ${diamond.address} ${contractOwner.address} ${diamondCutFacet.address}`
  );

  // deploy DiamondInit
  // DiamondInit provides a function that is called when the diamond is upgraded to initialize state variables
  // Read about how the diamondCut function works here: https://eips.ethereum.org/EIPS/eip-2535#addingreplacingremoving-functions
  const DiamondInit = await ethers.getContractFactory("DiamondInit");
  const diamondInit = await DiamondInit.deploy();
  await diamondInit.deployed();
  console.log("DiamondInit deployed:", diamondInit.address);
  verifyCommands.push(
    `yarn hardhat verify --network ${network.name} ${diamondInit.address}`
  );

  // deploy facets
  console.log("");
  console.log("Deploying facets");
  const FacetNames = ["DiamondLoupeFacet", "OwnershipFacet"];
  const cut: any[] = [];
  for (const FacetName of FacetNames) {
    const Facet = await ethers.getContractFactory(FacetName);
    const facet = await Facet.deploy();
    await facet.deployed();
    console.log(`${FacetName} deployed: ${facet.address}`);
    verifyCommands.push(
      `yarn hardhat verify --network ${network.name} ${facet.address}`
    );

    cut.push({
      facetAddress: facet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facet),
    });
  }

  // upgrade diamond with facets
  console.log("");
  console.log("Diamond Cut:", cut);
  const diamondCut = await ethers.getContractAt("IDiamondCut", diamond.address);
  let tx: ContractTransaction | undefined;
  let receipt: ContractReceipt | undefined;
  // call to init function
  let functionCall = diamondInit.interface.encodeFunctionData("init");
  tx = await diamondCut.diamondCut(cut, diamondInit.address, functionCall);
  console.log("Diamond cut tx: ", tx.hash);
  receipt = await tx.wait();
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`);
  }
  console.log("Completed diamond cut");

  // setTimeout(async () => {
  //   console.log("3 minutes lapsed, verifying contracts...");
  //   await Promise.all([
  //     verifyContract(diamondInit.address),
  //     verifyContract(diamondCutFacet.address),
  //     verifyContract(diamond.address, [
  //       contractOwner.address,
  //       diamondCutFacet.address,
  //     ]),
  //     ...cut.map((facet) => verifyContract(facet.facetAddress)),
  //   ]);
  // }, THREE_MINUTES);
  if (verboseLog) {
    console.log("verifyCommands", verifyCommands.join(" && "));
  }

  return diamond.address;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  deployDiamond()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
