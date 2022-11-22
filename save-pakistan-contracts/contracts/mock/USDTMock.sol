// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDTMock is ERC20 {
    constructor() ERC20("Tether USD", "USDT") {
        _mint(address(this), 1_000_000 ether);
        _mint(msg.sender, 1_000_000 ether);
    }

    function mintTo(address account, uint256 amount) external {
        _mint(account, amount);
    }
}
