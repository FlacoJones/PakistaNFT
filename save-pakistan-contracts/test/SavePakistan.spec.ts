import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { BigNumber, utils } from "ethers";
import { formatEther, formatUnits } from "ethers/lib/utils";
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
describe("Spec: SavePakistan", () => {
  const provider = ethers.provider;
  let savePakistan: SavePakistan;
  let treasuryMock: TreasuryMock;
  let usdcMock: USDCMock;
  let usdtMock: USDTMock;
  let wethMock: USDTMock;
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
    const [USDCMock, USDTMock, WETHMock] = await Promise.all([
      ethers.getContractFactory("USDCMock"),
      ethers.getContractFactory("USDTMock"),
      ethers.getContractFactory("USDTMock"),
    ]);
    [usdcMock, usdtMock, wethMock] = await Promise.all([
      USDCMock.deploy(),
      USDTMock.deploy(),
      WETHMock.deploy(),
    ]);
    await Promise.all([usdcMock.deployed(), usdtMock.deployed(), wethMock.deployed()]);

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

  // TODO: When the mocking or Oracle has been setup, should write unit test for it
  describe("- ETHER_MINT_RATE", () => {
    it("should query ETHER_MINT_RATE", async () => {
      const ETHER_MINT_RATE = await savePakistan.ETHER_MINT_RATE("0");
      console.log("ETHER_MINT_RATE", utils.formatEther(ETHER_MINT_RATE));
    });
  });

  describe("- USDC_MINT_RATE", () => {
    it("should return the correct mint rates of 6 decimal places", async () => {
      const decimals = 6;
      const usdcMintRates = await Promise.all([
        savePakistan.USDC_MINT_RATE("0"),
        savePakistan.USDC_MINT_RATE("1"),
        savePakistan.USDC_MINT_RATE("2"),
        savePakistan.USDC_MINT_RATE("3"),
        savePakistan.USDC_MINT_RATE("4"),
        savePakistan.USDC_MINT_RATE("5"),
      ]);
      const expectedUsdcMintRates = [
        utils.parseUnits("30", decimals), // $30
        utils.parseUnits("100", decimals), // $100
        utils.parseUnits("10", decimals), // $10
        utils.parseUnits("65", decimals), // $65
        utils.parseUnits("0.0035", decimals), // $0.0035
        utils.parseUnits("25", decimals), // $25
      ];
      console.log(
        "usdcMintRates",
        usdcMintRates.map((mintRate) => utils.formatUnits(mintRate, decimals))
      );
      console.log(
        "expectedUsdcMintRates",
        expectedUsdcMintRates.map((mintRate) => utils.formatUnits(mintRate, decimals))
      );
      assert.sameMembers(
        usdcMintRates.map((mintRate) => utils.formatUnits(mintRate, decimals)),
        expectedUsdcMintRates.map((mintRate) => utils.formatUnits(mintRate, decimals))
      );
    });
  });

  describe("- USDT_MINT_RATE", () => {
    it("should return the correct mint rates of 18 decimal places", async () => {
      const decimals = 18;
      const usdtMintRates = await Promise.all([
        savePakistan.USDT_MINT_RATE("0"),
        savePakistan.USDT_MINT_RATE("1"),
        savePakistan.USDT_MINT_RATE("2"),
        savePakistan.USDT_MINT_RATE("3"),
        savePakistan.USDT_MINT_RATE("4"),
        savePakistan.USDT_MINT_RATE("5"),
      ]);
      const expectedUsdtMintRates = [
        utils.parseUnits("30", decimals), // $30
        utils.parseUnits("100", decimals), // $100
        utils.parseUnits("10", decimals), // $10
        utils.parseUnits("65", decimals), // $65
        utils.parseUnits("0.0035", decimals), // $0.0035
        utils.parseUnits("25", decimals), // $25
      ];
      console.log(
        "usdtMintRates",
        usdtMintRates.map((mintRate) => utils.formatUnits(mintRate, decimals))
      );
      console.log(
        "expectedUsdtMintRates",
        expectedUsdtMintRates.map((mintRate) => utils.formatUnits(mintRate, decimals))
      );
      assert.sameMembers(
        usdtMintRates.map((mintRate) => utils.formatUnits(mintRate, decimals)),
        expectedUsdtMintRates.map((mintRate) => utils.formatUnits(mintRate, decimals))
      );
    });
  });

  describe("- mintByPayingEth", () => {
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
  });

  describe("- mintByPayingToken", () => {
    before(async () => {
      let tx = await usdcMock.mintTo(user1.address, utils.parseUnits("5000", 6));
      await tx.wait();
    });

    it("should mint with quantity 1 and send the correct amount of token", async () => {
      const usdcMintRate = await savePakistan.USDC_MINT_RATE(TokenVariant.TemporaryShelter);
      const balanceBN = await usdcMock.balanceOf(user1.address);

      let tx = await usdcMock.connect(user1).approve(savePakistan.address, usdcMintRate);
      await tx.wait();

      tx = await savePakistan
        .connect(user1)
        .mintByPayingToken(TokenVariant.TemporaryShelter, usdcMock.address, BigNumber.from("1"));
      await tx.wait();

      const currentBalanceBN = await usdcMock.balanceOf(user1.address);
      console.log("currentBalanceBN", utils.formatUnits(currentBalanceBN, 6));

      expect(currentBalanceBN).to.be.eq(balanceBN.sub(usdcMintRate));
    });

    it("should mint with quantity 5 and send the correct amount of token", async () => {
      const usdcMintRate = await savePakistan.USDC_MINT_RATE(TokenVariant.TemporaryShelter);
      const balanceBN = await usdcMock.balanceOf(user1.address);
      const quantity = BigNumber.from("5");

      let tx = await usdcMock
        .connect(user1)
        .approve(savePakistan.address, usdcMintRate.mul(quantity));
      await tx.wait();

      tx = await savePakistan
        .connect(user1)
        .mintByPayingToken(TokenVariant.TemporaryShelter, usdcMock.address, quantity);
      await tx.wait();

      const currentBalanceBN = await usdcMock.balanceOf(user1.address);
      console.log("currentBalanceBN", utils.formatUnits(currentBalanceBN, 6));

      expect(currentBalanceBN).to.be.eq(balanceBN.sub(usdcMintRate.mul(quantity)));
    });

    it("should revert mint when user has no USDC balance", async () => {
      const usdcMintRate = await savePakistan.USDC_MINT_RATE(TokenVariant.TemporaryShelter);
      const quantity = BigNumber.from("5");

      let tx = await usdcMock
        .connect(user2)
        .approve(savePakistan.address, usdcMintRate.mul(quantity));
      await tx.wait();

      await expect(
        savePakistan
          .connect(user2)
          .mintByPayingToken(TokenVariant.TemporaryShelter, usdcMock.address, quantity)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });

  describe("- withdrawEther", () => {
    it("should revert when caller is not admin", async () => {
      await expect(savePakistan.connect(user1).withdrawEther()).to.be.revertedWith(
        "SavePakistan: Only an Admin can call this function."
      );
    });

    it("should withdraw ether to treasury", async () => {
      const [prevTreasuryBalance, prevSavePakistanBalance] = await Promise.all([
        provider.getBalance(treasuryMock.address),
        provider.getBalance(savePakistan.address),
      ]);
      console.log("prevTreasuryBalance", formatEther(prevTreasuryBalance));
      console.log("prevSavePakistanBalance", formatEther(prevSavePakistanBalance));

      await expect(savePakistan.connect(deployer).withdrawEther()).to.be.not.reverted;

      const [curTreasuryBalance, curSavePakistanBalance] = await Promise.all([
        provider.getBalance(treasuryMock.address),
        provider.getBalance(savePakistan.address),
      ]);
      console.log("curTreasuryBalance", formatEther(curTreasuryBalance));
      console.log("curSavePakistanBalance", formatEther(curSavePakistanBalance));

      expect(prevTreasuryBalance).to.be.eq(BigNumber.from(0));
      expect(curSavePakistanBalance).to.be.eq(BigNumber.from(0));
      expect(curTreasuryBalance).to.be.eq(prevSavePakistanBalance);
    });
  });

  describe("- withdrawTokens", () => {
    it("should revert when caller is not admin", async () => {
      await expect(savePakistan.connect(user1).withdrawTokens()).to.be.revertedWith(
        "SavePakistan: Only an Admin can call this function."
      );
    });

    it("should withdraw tokens to treasury", async () => {
      const [
        prevTreasuryUsdcBalance,
        prevSavePakistanUsdcBalance,
        prevTreasuryUsdtBalance,
        prevSavePakistanUsdtBalance,
        usdcDecimals,
        usdtDecimals,
      ] = await Promise.all([
        usdcMock.balanceOf(treasuryMock.address),
        usdcMock.balanceOf(savePakistan.address),

        usdtMock.balanceOf(treasuryMock.address),
        usdtMock.balanceOf(savePakistan.address),

        usdcMock.decimals(),
        usdtMock.decimals(),
      ]);
      console.log("prevTreasuryUsdcBalance", formatUnits(prevTreasuryUsdcBalance, usdcDecimals));
      console.log(
        "prevSavePakistanUsdcBalance",
        formatUnits(prevSavePakistanUsdcBalance, usdcDecimals)
      );
      console.log("prevTreasuryUsdtBalance", formatUnits(prevTreasuryUsdtBalance, usdtDecimals));
      console.log(
        "prevSavePakistanUsdtBalance",
        formatUnits(prevSavePakistanUsdtBalance, usdtDecimals)
      );

      await expect(savePakistan.connect(deployer).withdrawTokens()).to.be.not.reverted;

      const [
        curTreasuryUsdcBalance,
        curSavePakistanUsdcBalance,
        curTreasuryUsdtBalance,
        curSavePakistanUsdtBalance,
      ] = await Promise.all([
        usdcMock.balanceOf(treasuryMock.address),
        usdcMock.balanceOf(savePakistan.address),

        usdtMock.balanceOf(treasuryMock.address),
        usdtMock.balanceOf(savePakistan.address),
      ]);
      console.log("curTreasuryUsdcBalance", formatUnits(curTreasuryUsdcBalance, usdcDecimals));
      console.log(
        "curSavePakistanUsdcBalance",
        formatUnits(curSavePakistanUsdcBalance, usdcDecimals)
      );
      console.log("curTreasuryUsdtBalance", formatUnits(curTreasuryUsdtBalance, usdtDecimals));
      console.log(
        "curSavePakistanUsdtBalance",
        formatUnits(curSavePakistanUsdtBalance, usdtDecimals)
      );

      expect(prevTreasuryUsdcBalance).to.be.eq(utils.parseUnits("0", usdcDecimals));
      expect(prevTreasuryUsdtBalance).to.be.eq(utils.parseUnits("0", usdtDecimals));
      expect(curTreasuryUsdcBalance).to.be.eq(prevSavePakistanUsdcBalance);
      expect(curTreasuryUsdtBalance).to.be.eq(prevSavePakistanUsdtBalance);
      expect(curSavePakistanUsdcBalance).to.be.eq(utils.parseUnits("0", usdcDecimals));
      expect(curSavePakistanUsdtBalance).to.be.eq(utils.parseUnits("0", usdtDecimals));
    });
  });

  describe("- uri", () => {
    it("should return token URIs for specified tokens", async () => {
      const tokenURIs = await Promise.all([savePakistan.uri("1"), savePakistan.uri("2")]);
      console.log("tokenURIs", tokenURIs);
    });
  });
});
