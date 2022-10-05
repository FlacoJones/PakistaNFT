import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { SavePakistan } from "../typechain-types";

describe("SavePakistan", () => {
  let savePakistan: SavePakistan;
  let deployer: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let signers: SignerWithAddress[];

  before(async () => {
    [deployer, user1, user2, ...signers] = await ethers.getSigners();

    const SavePakistan = await ethers.getContractFactory("SavePakistan");
    savePakistan = <SavePakistan>await SavePakistan.deploy();
    savePakistan.deployed();
  });

  it("should mint", async () => {
    // 
  });
});
