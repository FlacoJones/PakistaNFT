import { ethers, upgrades } from "hardhat";
import { SavePakistan } from "../typechain-types";
import { getAddress } from "ethers/lib/utils";

async function main() {
  // ERC1155
  const SavePakistan = await ethers.getContractFactory("SavePakistan");
  const savePakistan = <SavePakistan>await upgrades.upgradeProxy(
    // https://optimistic.etherscan.io/address/0xe73b33d6a88a703065e0c22e042b18fd3c4eedc5
    getAddress("0xe73b33d6a88a703065e0c22e042b18fd3c4eedc5"),
    SavePakistan
  );
  await savePakistan.deployed();

  console.log("SavePakistan contract upgraded", savePakistan.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
