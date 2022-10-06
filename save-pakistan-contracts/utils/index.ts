import { BigNumber } from "ethers";

export * from "./merkle-tree";
export * from "./signature";
export * from "./time";

// This corresponds to actual values on Enum from `SavePakistan.sol`
export const TokenVariant = Object.freeze({
  RationBag: BigNumber.from("0"),
  TemporaryShelter: BigNumber.from("1"),
  HygieneKit: BigNumber.from("2"),
  PortableToilets: BigNumber.from("3"),
  Water: BigNumber.from("4"),
  WaterWheel: BigNumber.from("5"),
});
