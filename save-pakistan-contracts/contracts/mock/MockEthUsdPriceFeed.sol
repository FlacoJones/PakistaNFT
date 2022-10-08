// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract MockEthUsdPriceFeed {
    constructor() {}

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (70942, 132356008734, 1665166889, 1665166889, 70942);
    }
}
