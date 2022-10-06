import { ethers, waffle } from "hardhat";
import { deployMockContract, MockContract, MockProvider } from "ethereum-waffle";
import { BigNumber, ContractFactory, utils, Wallet } from "ethers";
import { SavePakistan } from "../typechain-types";
import { assert, expect } from "chai";

import ISavePakistan from "../artifacts/contracts/SavePakistan.sol/SavePakistan.json";
import ITreasuryMock from "../artifacts/contracts/mock/TreasuryMock.sol/TreasuryMock.json";
import IUSDCMock from "../artifacts/contracts/mock/USDCMock.sol/USDCMock.json";
import IUSDTMock from "../artifacts/contracts/mock/USDTMock.sol/USDTMock.json";
import { TokenVariant } from "../utils";

describe("SavePakistanMock", () => {
  let usdcMock: MockContract;
  let usdtMock: MockContract;
  let treasuryMock: MockContract;
  let savePakistanMock: MockContract;
  let deployer: Wallet;
  let user1: Wallet;
  let user2: Wallet;
  let signers: Wallet[];

  before(async () => {
    [deployer, user1, user2, ...signers] = new MockProvider().getWallets();

    // deploy mock contracts
    usdcMock = await deployMockContract(deployer, IUSDCMock.abi);
    usdtMock = await deployMockContract(deployer, IUSDTMock.abi);
    savePakistanMock = await deployMockContract(deployer, ISavePakistan.abi);
    treasuryMock = await deployMockContract(deployer, ITreasuryMock.abi);
  });

  it("should return the mocked USDC_ADDR value", async () => {
    await savePakistanMock.mock.USDC_ADDR.returns(usdcMock.address);
    const usdcAddr = await savePakistanMock.USDC_ADDR();

    expect(usdcAddr).to.be.eq(usdcMock.address);
  });

  it("should return the mocked USDT_ADDR value", async () => {
    await savePakistanMock.mock.USDT_ADDR.returns(usdtMock.address);
    const usdtAddr = await savePakistanMock.USDT_ADDR();

    expect(usdtAddr).to.be.eq(usdtMock.address);
  });

  it("should return the mocked TREASURY_ADDR value", async () => {
    await savePakistanMock.mock.TREASURY_ADDR.returns(treasuryMock.address);
    const treasuryAddr = await savePakistanMock.TREASURY_ADDR();

    expect(treasuryAddr).to.be.eq(treasuryMock.address);
  });

  it("should return the mocked contract addresses for USDT & USDC", async () => {
    const addresses = await Promise.all([
      savePakistanMock.USDT_ADDR(),
      savePakistanMock.USDC_ADDR(),
      savePakistanMock.TREASURY_ADDR(),
    ]);
    assert.sameMembers(addresses, [usdtMock.address, usdcMock.address, treasuryMock.address]);
  });

  it("should mint a token when mintByPayingEth is called", async () => {
    await savePakistanMock.mock.mintByPayingEth
      .withArgs(TokenVariant.RationBag, BigNumber.from("1"))
      .returns(undefined);
    await savePakistanMock.mock.getTokenVariantRemainingSupply.returns(BigNumber.from(5));
    await savePakistanMock.mock.getTokenVariantMaxSupply.returns(BigNumber.from(5_000));
    await savePakistanMock.mock.getTokenVariantEtherMintRate.returns(utils.parseEther("0.30"));

    const tx = await savePakistanMock.mintByPayingEth(TokenVariant.RationBag, BigNumber.from("1"));
    await tx.wait();
  });
});
