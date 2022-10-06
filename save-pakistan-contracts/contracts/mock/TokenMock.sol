// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenMock is ERC20 {
    constructor() ERC20("Mock ERC20", "ME20") {
        _mint(address(this), 1_000_000);
        _mint(msg.sender, 1_000_000);
    }

    function mintTo(address account, uint256 amount) external {
        _mint(account, amount);
    }
}
