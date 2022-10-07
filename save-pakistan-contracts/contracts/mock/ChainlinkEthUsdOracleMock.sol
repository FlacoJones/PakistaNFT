// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract ChainlinkEthUsdOracleMock {
    constructor() {}

    function latestAnswer() external view returns (int256) {
        return 132480000000;
    }
}
