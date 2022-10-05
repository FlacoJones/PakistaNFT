import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, utils } from "ethers";
import { ethers } from "hardhat";
import { SavePakistan } from "../typechain-types";

enum TokenVariant {
  RationBag = "0",
  TemporaryShelter = "1",
  HygieneKit = "2",
  PortableToilets = "3",
  Water = "4",
  WaterWheel = "5",
}

describe("SavePakistan", () => {
  const provider = ethers.getDefaultProvider();
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

    const etherBalance = await provider.getBalance(savePakistan.address);
    console.log("savePakistan contract initial etherBalance", utils.formatEther(etherBalance));
  });

  it("should mint when caller is user1", async () => {
    const contract = savePakistan.connect(user1);

    const etherMintRate = await contract.getTokenVariantEtherMintRate(
      BigNumber.from(TokenVariant.RationBag)
    );
    console.log("etherMintRate", utils.formatEther(etherMintRate));

    const tx = await contract.mintByPayingEth(
      BigNumber.from(TokenVariant.RationBag),
      BigNumber.from("1"),
      {
        value: etherMintRate,
      }
    );
    expect(tx.value).to.be.eq(etherMintRate);
    await tx.wait();

    const etherBalance = await provider.getBalance(savePakistan.address);
    console.log("etherBalance", utils.formatEther(etherBalance));

    expect(etherBalance).to.be.eq(utils.parseEther("1"));
  });
});
