// Mock Solidity block.timestamp
// https://ethereum.stackexchange.com/questions/15596/how-can-i-mock-the-time-for-solidity-tests

import { ethers, BigNumberish } from "ethers";

// https://www.unixtimestamp.com/index.php
export const BLOCK_ONE_SECOND = 1000;
export const BLOCK_ONE_MINUTE = 60000;
export const BLOCK_ONE_HOUR = 3600000;
export const BLOCK_ONE_DAY = 86400000;
export const BLOCK_ONE_WEEK = 604800000;
export const BLOCK_ONE_MONTH = 2678400000;
export const BLOCK_ONE_YEAR = 31536000000;

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class TimeUtil {
  public static async now(provider: ethers.providers.JsonRpcProvider): Promise<number> {
    const blockNumber = await provider.getBlockNumber();
    const [block] = await Promise.all([provider.getBlock(blockNumber)]);
    const now = TimeFormat.fromTimestamp(block.timestamp);
    return now;
  }
}

export class TimeFormat {
  public static fromTimestamp(timestamp: number): number {
    return Math.floor(timestamp * 1000);
  }

  public static fromBigNumber(timestmap: BigNumberish): number {
    return Math.floor(Number(timestmap.toString()) / 1000);
  }
}
