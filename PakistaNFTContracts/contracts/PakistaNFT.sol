// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PakistaNFT is ERC1155, Ownable {
    address public immutable treasury;

    uint256 public constant RATION = 0;
    uint256 public constant MEAL = 1;
    uint256 public constant TENT = 2;
    uint256 public constant HYGIENE_KIT = 3;
    uint256 public constant WATER = 4;
    uint256 public constant WATER_WHEEL = 5;

    uint256 public constant numberOfTokenTypes = 6;

    uint256[] public MINT_RATE = [
        1 ether,
        1 ether,
        1 ether,
        1 ether,
        1 ether,
        1 ether
    ];

    constructor()
        ERC1155(
            "https://ipfs.io/ipfs/bafybeia65fmu7kd3qkiu3hn4km3mgb5amrjhcwnakevgg4yxvvspqkszhe/{id}.json"
        )
    {
        treasury = 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db;
    }

    function mint(
        address to,
        uint256 id,
        uint256 amount
    ) external payable {
        require(id < numberOfTokenTypes, "Token id does not exist");
        require(msg.value >= (amount * MINT_RATE[id]), "Not enough ether sent");
        _mint(to, id, amount, "");
    }

    function withdrawEther() external onlyOwner {
        payable(treasury).transfer(address(this).balance);
    }

    function uri(uint256 _tokenid)
        public
        pure
        override
        returns (string memory)
    {
        return
            string(
                abi.encodePacked(
                    "https://ipfs.io/ipfs/bafybeia65fmu7kd3qkiu3hn4km3mgb5amrjhcwnakevgg4yxvvspqkszhe/",
                    Strings.toString(_tokenid),
                    ".json"
                )
            );
    }
}
