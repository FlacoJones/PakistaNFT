import { MockContract, MockContractFactory, smock } from "@defi-wonderland/smock";
import { SavePakistan, SavePakistan__factory } from "../typechain-types";
import chai, { expect } from "chai";
import { TokenVariant } from "../utils";
import { BigNumber } from "ethers";

chai.should();
chai.use(smock.matchers);

describe("Smock: SavePakistan", () => {
  let savePakistanFactory: MockContractFactory<SavePakistan__factory>;
  let savePakistan: MockContract<SavePakistan>;

  before(async () => {
    savePakistanFactory = await smock.mock<SavePakistan__factory>("SavePakistan");

    savePakistan = await savePakistanFactory.deploy();
    console.log("savePakistanMock.address", savePakistan.address, "...");
  });

  it("should make it", async () => {
    console.log("savePakistanMock.address", savePakistan.address, "...");
    savePakistan.mintByPayingEth
      .whenCalledWith(TokenVariant.HygieneKit, BigNumber.from("1"))
      .returns(undefined);
  });

  // it("should mock the shit out of it", async () => {
  //   savePakistanMock.USDC_ADDR.returns("carlo");

  //   const usdcAddr = await savePakistanMock.USDC_ADDR();
  //   console.log("usdcAddr", usdcAddr);
  // });

  // it("should call getters", async () => {
  //   expect(await mock.count()).to.equal(1);
  // });

  // it("should call methods", async () => {
  //   await mock.add(10);
  //   expect(await mock.count()).to.equal(11);
  // });

  // it("should be able to override returns", async () => {
  //   mock.count.returns(123);
  //   expect(await mock.count()).to.equal(123);
  // });

  // it("should be able to override a function that reverts", async () => {
  //   mock.doRevert.returns(true);
  //   expect(await mock.doRevert()).to.equal(true);
  // });

  // it("should be able to check function calls", async () => {
  //   await mock.add(10);
  //   expect(mock.add).to.be.calledOnceWith(10);
  // });
});
