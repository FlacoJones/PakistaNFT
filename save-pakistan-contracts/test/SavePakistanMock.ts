import { ethers, waffle } from "hardhat";
import { deployMockContract, MockContract, MockProvider } from "ethereum-waffle";
import { ContractFactory, Wallet } from "ethers";
import { SavePakistan } from "../typechain-types";

import ISavePakistan from "../artifacts/contracts/SavePakistan.sol/SavePakistan.json";
import ITokenMock from "../artifacts/contracts/mock/TokenMock.sol/TokenMock.json";
import { expect } from "chai";

describe("SavePakistanMock", () => {
  let tokenMock: MockContract;
  let savePakistanMock: MockContract;
  // let savePakistan: SavePakistan;
  let deployer: Wallet;
  let user1: Wallet;
  let user2: Wallet;
  let signers: Wallet[];

  before(async () => {
    [deployer, user1, user2, ...signers] = new MockProvider().getWallets();

    tokenMock = await deployMockContract(deployer, ITokenMock.abi);
    savePakistanMock = await deployMockContract(deployer, ISavePakistan.abi);

    // // SavePakistan
    // const savePakistanFactory = new ContractFactory(
    //   ISavePakistan.abi,
    //   ISavePakistan.bytecode,
    //   deployer
    // );
    // savePakistan = <SavePakistan>await savePakistanFactory.deploy();
    // await savePakistan.deployed();
  });

  it("should return the mocked uri value", async () => {
    await savePakistanMock.mock.USDC_ADDR.returns(tokenMock.address);
    const usdcAddr = await savePakistanMock.USDC_ADDR();
    console.log("usdcAddr", usdcAddr);
    expect(usdcAddr).to.be.eq(tokenMock.address);
  });
});
