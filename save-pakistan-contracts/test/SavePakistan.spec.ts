import { SavePakistan, TreasuryMock, USDCMock, USDTMock, MockEthUsdPriceFeed } from "../typechain-types";
import { formatEther, formatUnits } from "ethers/lib/utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, constants, utils } from "ethers";
import { assert, expect } from "chai";
import { ethers } from "hardhat";

// This corresponds to actual values on Enum from `SavePakistan.sol`
const Variant = {
  RationBag: BigNumber.from("0"),
  TemporaryShelter: BigNumber.from("1"),
  HygieneKit: BigNumber.from("2"),
  PortableToilets: BigNumber.from("3"),
  Water: BigNumber.from("4"),
  WaterWheel: BigNumber.from("5"),
};

// TODO: Write more unit tests to test out the validation requirements on minting
describe("Spec: SavePakistan", () => {
  const provider = ethers.provider;
  let savePakistan: SavePakistan;
  let treasuryMock: TreasuryMock;
  let usdcMock: USDCMock;
  let usdtMock: USDTMock;
  let wethMock: USDTMock;
  let mockEthUsdPriceFeed: MockEthUsdPriceFeed;
  let deployer: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let signers: SignerWithAddress[];

  beforeEach(async () => {
    [deployer, user1, user2, ...signers] = await ethers.getSigners();

    const baseURI =
      "https://ipfs.io/ipfs/bafybeihrni33k36zw6v7hv2miggpaqdnkgwe7mac6ww6enju44wqxxiqkq/";

    // Mock Treasury
    const TreasuryMock = await ethers.getContractFactory("TreasuryMock");
    treasuryMock = await TreasuryMock.deploy();
    await treasuryMock.deployed();

    // Mock USDC & USDT
    const [USDCMock, USDTMock, WETHMock, MockEthUsdPriceFeed] = await Promise.all([
      ethers.getContractFactory("USDCMock"),
      ethers.getContractFactory("USDTMock"),
      ethers.getContractFactory("USDTMock"),
      ethers.getContractFactory("MockEthUsdPriceFeed"),
    ]);
    [usdcMock, usdtMock, wethMock, mockEthUsdPriceFeed] = await Promise.all([
      USDCMock.deploy(),
      USDTMock.deploy(),
      WETHMock.deploy(),
      MockEthUsdPriceFeed.deploy()
    ]);
    await Promise.all([usdcMock.deployed(), usdtMock.deployed(), wethMock.deployed(), mockEthUsdPriceFeed.deployed()]);

    // ERC1155
    const SavePakistan = await ethers.getContractFactory("SavePakistan");
    savePakistan = <SavePakistan>(
      await SavePakistan.deploy(treasuryMock.address, usdcMock.address, usdtMock.address, mockEthUsdPriceFeed.address, baseURI)
    );
    await savePakistan.deployed();

    // check initial Ether balance
    const etherBalance = await provider.getBalance(savePakistan.address);
    console.log("savePakistan contract initial etherBalance", utils.formatEther(etherBalance));
  });

  describe("ETH/USD Price Feed", () => {
    it('should return latest price', async () => {
      const price = await savePakistan.getLatestPrice();
      expect(price).to.be.eq(132356008734);
    })

    describe.only('getVariantEtherMintRate', () => {
      it('should return correct wei price for RationBag', async () => {
        const rationBagEtherPrice = await savePakistan.getVariantEtherMintRate(Variant.RationBag);
        expect(rationBagEtherPrice).to.be.eq(BigNumber.from('22675736961451247'));
      })

      it('should return correct wei price for TemporaryShelter', async () => {
        const rationBagEtherPrice = await savePakistan.getVariantEtherMintRate(Variant.TemporaryShelter);
        expect(rationBagEtherPrice).to.be.eq(BigNumber.from('75585789871504157'));
      })

      it('should return correct wei price for HygieneKit', async () => {
        const rationBagEtherPrice = await savePakistan.getVariantEtherMintRate(Variant.HygieneKit);
        expect(rationBagEtherPrice).to.be.eq(BigNumber.from('7558578987150415'));
      })

      it('should return correct wei price for PortableToilets', async () => {
        const rationBagEtherPrice = await savePakistan.getVariantEtherMintRate(Variant.PortableToilets);
        expect(rationBagEtherPrice).to.be.eq(BigNumber.from('49130763416477702'));
      })

      it('should return correct wei price for Water', async () => {
        const rationBagEtherPrice = await savePakistan.getVariantEtherMintRate(Variant.Water);
        expect(rationBagEtherPrice).to.be.eq(BigNumber.from('2267573696145124'));
      })

      it('should return correct wei price for WaterWheel', async () => {
        const rationBagEtherPrice = await savePakistan.getVariantEtherMintRate(Variant.WaterWheel);
        expect(rationBagEtherPrice).to.be.eq(BigNumber.from('18896447467876039'));
      })
    })
  })

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

  describe("- mintWithEth", () => {
    it("should mint when quantity is 1 and sends correct amount of ether", async () => {
      const contract = savePakistan.connect(user1);

      const etherMintRate = await contract.getVariantEtherMintRate(BigNumber.from("3"));
      const quantity = BigNumber.from("1");
      const msgValue = etherMintRate.mul(quantity);

      const tx = await contract.mintWithEth(Variant.PortableToilets, quantity, {
        value: msgValue,
      });
      expect(tx.value).to.be.eq(etherMintRate);
      await tx.wait();
    });

    it("should mint when quantity is 5 and sends correct amount of ether", async () => {
      const contract = savePakistan.connect(user1);

      const etherMintRate = await contract.getVariantEtherMintRate(BigNumber.from("4"));
      const quantity = BigNumber.from("5");
      const msgValue = etherMintRate.mul(quantity);

      const tx = await contract.mintWithEth(Variant.Water, quantity, {
        value: msgValue,
      });
      expect(tx.value).to.be.eq(msgValue);
      await tx.wait();
    });
  });

  describe("- mintWithToken", () => {
    it("should revert when given token address is not supported", async () => {
      const contract = savePakistan.connect(user1);

      await expect(
        contract.mintWithToken(Variant.HygieneKit, wethMock.address, "1")
      ).to.be.revertedWith("SavePakistan: This token is not supported.");
    });

    it("should revert when attempting to mint more than the remaining supply", async () => {
      const contract = savePakistan.connect(user1);
      const maxSupply = await contract.getVariantMaxSupply(Variant.HygieneKit);
      const usdcPrice = await contract.getVariantMintRate(Variant.HygieneKit, usdcMock.address);

      // mint USDC to user1
      let tx = await usdcMock.mintTo(user1.address, BigNumber.from(10_000_000));
      await tx.wait();

      // approve allowance
      tx = await usdcMock.connect(user1).approve(contract.address, usdcPrice);
      await tx.wait();

      // mint 1 token
      tx = await contract.mintWithToken(Variant.HygieneKit, usdcMock.address, "1");
      await tx.wait();

      const remainingSupply = await contract.getVariantRemainingSupply(Variant.HygieneKit);

      console.log("maxSupply", maxSupply.toString());
      console.log("remainingSupply", remainingSupply.toString());
      console.log("usdcPrice", usdcPrice.toString());

      // attempt to mint more than the max supply
      await expect(
        contract.mintWithToken(Variant.HygieneKit, usdcMock.address, maxSupply.add("1"))
      ).to.be.revertedWith(
        "SavePakistan: The requested quantity to purchase is beyond the remaining supply."
      );
    });

    it("should mint with quantity 1 and send the correct amount of token", async () => {
      let tx = await usdcMock.mintTo(user1.address, utils.parseUnits("5000", 6));
      await tx.wait();

      const usdcMintRate = await savePakistan.USDC_MINT_RATE(Variant.TemporaryShelter);
      const balanceBN = await usdcMock.balanceOf(user1.address);

      tx = await usdcMock.connect(user1).approve(savePakistan.address, usdcMintRate);
      await tx.wait();

      tx = await savePakistan
        .connect(user1)
        .mintWithToken(Variant.TemporaryShelter, usdcMock.address, BigNumber.from("1"));
      await tx.wait();

      const currentBalanceBN = await usdcMock.balanceOf(user1.address);
      console.log("currentBalanceBN", utils.formatUnits(currentBalanceBN, 6));

      expect(currentBalanceBN).to.be.eq(balanceBN.sub(usdcMintRate));
    });

    it("should mint with quantity 5 and send the correct amount of token", async () => {
      let tx = await usdcMock.mintTo(user1.address, utils.parseUnits("5000", 6));
      await tx.wait();

      const usdcMintRate = await savePakistan.USDC_MINT_RATE(Variant.TemporaryShelter);
      const balanceBN = await usdcMock.balanceOf(user1.address);
      const quantity = BigNumber.from("5");

      tx = await usdcMock.connect(user1).approve(savePakistan.address, usdcMintRate.mul(quantity));
      await tx.wait();

      tx = await savePakistan
        .connect(user1)
        .mintWithToken(Variant.TemporaryShelter, usdcMock.address, quantity);
      await tx.wait();

      const currentBalanceBN = await usdcMock.balanceOf(user1.address);
      console.log("currentBalanceBN", utils.formatUnits(currentBalanceBN, 6));

      expect(currentBalanceBN).to.be.eq(balanceBN.sub(usdcMintRate.mul(quantity)));
    });

    it("should revert mint when user has no USDC balance", async () => {
      const usdcMintRate = await savePakistan.USDC_MINT_RATE(Variant.TemporaryShelter);
      const quantity = BigNumber.from("5");

      let tx = await usdcMock
        .connect(user2)
        .approve(savePakistan.address, usdcMintRate.mul(quantity));
      await tx.wait();

      await expect(
        savePakistan
          .connect(user2)
          .mintWithToken(Variant.TemporaryShelter, usdcMock.address, quantity)
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
      let tx = await usdcMock.mintTo(savePakistan.address, utils.parseUnits("5000", 6));
      await tx.wait();

      tx = await usdtMock.mintTo(savePakistan.address, utils.parseUnits("5000", 18));
      await tx.wait();

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

  describe("- _beforeTokenTransfer", () => {
    it("should not allow token transfers to any arbitrary address", async () => {
      const contract = savePakistan.connect(user1);

      const ethPrice = await contract.getVariantEtherMintRate(Variant.RationBag);

      let tx = await contract.mintWithEth(Variant.RationBag, "1", {
        value: ethPrice,
      });
      await tx.wait();

      await expect(
        contract.safeTransferFrom(user1.address, user2.address, "1", "1", constants.HashZero)
      ).to.be.revertedWith(
        "SavePakistan: Not allowed to transfer a token from/to arbitrary address."
      );
    });
  });

  // ! no burn() function exposed in the contract
  describe("- _burn", () => {
    // it("should not allow token burning", async () => {
    //   const contract = savePakistan.connect(user1);
    //   const ethPrice = await contract.getVariantEtherMintRate(Variant.RationBag);
    //   let tx = await contract.mintWithEth(Variant.RationBag, "1", {
    //     value: ethPrice,
    //   });
    //   await tx.wait();
    //   await expect(
    //     contract.burn(user1.address, user2.address, "1", "1", constants.HashZero)
    //   ).to.be.revertedWith("SavePakistan: Not allowed to burn a token.");
    // });
  });
});
