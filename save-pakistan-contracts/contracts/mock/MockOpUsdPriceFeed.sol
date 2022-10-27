// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract MockOpUsdPriceFeed {
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
        return (70942, 113589519, 1666831021, 1666831021, 18446744073709626167);
    }
}
