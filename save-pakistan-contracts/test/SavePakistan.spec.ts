import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, utils } from "ethers";
import { ethers } from "hardhat";
import { SavePakistan, TreasuryMock, USDCMock, USDTMock } from "../typechain-types";

// This corresponds to actual values on Enum from `SavePakistan.sol`
const TokenVariant = {
  RationBag: BigNumber.from("0"),
  TemporaryShelter: BigNumber.from("1"),
  HygieneKit: BigNumber.from("2"),
  PortableToilets: BigNumber.from("3"),
  Water: BigNumber.from("4"),
  WaterWheel: BigNumber.from("5"),
};

// TODO: Write more unit tests to test out the validation requirements on minting
// TODO: Write unit test to test out withdrawing Ether and ERC20 tokens to treasury
// TODO: Write unit test to assert if the USDC & USDT mint rates are in correct value in USD
describe("SavePakistan", () => {
  const provider = ethers.getDefaultProvider();
  let savePakistan: SavePakistan;
  let treasuryMock: TreasuryMock;
  let usdcMock: USDCMock;
  let usdtMock: USDTMock;
  let deployer: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let signers: SignerWithAddress[];

  before(async () => {
    [deployer, user1, user2, ...signers] = await ethers.getSigners();

    const baseURI =
      "https://ipfs.io/ipfs/bafybeihrni33k36zw6v7hv2miggpaqdnkgwe7mac6ww6enju44wqxxiqkq/";

    // Mock Treasury
    const TreasuryMock = await ethers.getContractFactory("TreasuryMock");
    treasuryMock = await TreasuryMock.deploy();
    await treasuryMock.deployed();

    // Mock USDC & USDT
    const [USDCMock, USDTMock] = await Promise.all([
      ethers.getContractFactory("USDCMock"),
      ethers.getContractFactory("USDTMock"),
    ]);
    [usdcMock, usdtMock] = await Promise.all([USDCMock.deploy(), USDTMock.deploy()]);
    await Promise.all([usdcMock.deployed(), usdtMock.deployed()]);

    // ERC1155
    const SavePakistan = await ethers.getContractFactory("SavePakistan");
    savePakistan = <SavePakistan>(
      await SavePakistan.deploy(treasuryMock.address, usdcMock.address, usdtMock.address, baseURI)
    );
    await savePakistan.deployed();

    // check initial Ether balance
    const etherBalance = await provider.getBalance(savePakistan.address);
    console.log("savePakistan contract initial etherBalance", utils.formatEther(etherBalance));
  });

  it("should query ETHER_MINT_RATE", async () => {
    const ETHER_MINT_RATE = await savePakistan.ETHER_MINT_RATE("0");
    console.log("ETHER_MINT_RATE", utils.formatEther(ETHER_MINT_RATE));
  });

  it("should mint when quantity is 1 and sends correct amount of ether", async () => {
    const contract = savePakistan.connect(user1);

    const etherMintRate = await contract.getTokenVariantEtherMintRate(BigNumber.from("0"));
    const quantity = BigNumber.from("1");
    const msgValue = etherMintRate.mul(quantity);

    const tx = await contract.mintByPayingEth(TokenVariant.PortableToilets, quantity, {
      value: msgValue,
    });
    expect(tx.value).to.be.eq(etherMintRate);
    await tx.wait();
  });

  it("should mint when quantity is 5 and sends correct amount of ether", async () => {
    const contract = savePakistan.connect(user1);

    const etherMintRate = await contract.getTokenVariantEtherMintRate(BigNumber.from("4"));
    const quantity = BigNumber.from("5");
    const msgValue = etherMintRate.mul(quantity);

    const tx = await contract.mintByPayingEth(TokenVariant.Water, quantity, {
      value: msgValue,
    });
    expect(tx.value).to.be.eq(msgValue);
    await tx.wait();
  });

  it("should return token URIs for specified tokens", async () => {
    const tokenURIs = await Promise.all([savePakistan.uri("1"), savePakistan.uri("2")]);
    console.log("tokenURIs", tokenURIs);
  });
});
