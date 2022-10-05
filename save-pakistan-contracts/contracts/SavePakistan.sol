// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract SavePakistan is ERC1155, Ownable {
    address public immutable treasury;
    address public immutable usdcAddress;

    using SafeERC20 for IERC20;

    uint256 public constant RATION = 0;
    uint256 public constant MEAL = 1;
    uint256 public constant TENT = 2;
    uint256 public constant HYGIENE_KIT = 3;
    uint256 public constant WATER = 4;
    uint256 public constant WATER_WHEEL = 5;

    uint256 public constant numberOfTokenTypes = 6;

    string[] currency = ["ETHER", "USDC"];
    address[] currencyAddress = [
        address(0),
        0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db
    ];

    mapping(string => uint256[]) MINT_RATE_MAPPING;

    uint256[] public ETHER_MINT_RATE = [
        1 ether,
        1 ether,
        1 ether,
        1 ether,
        1 ether,
        1 ether
    ];

    uint256[] public USDC_MINT_RATE = [
        1 ether,
        2 ether,
        3 ether,
        4 ether,
        5 ether,
        6 ether
    ];

    constructor()
        ERC1155(
            "https://ipfs.io/ipfs/bafybeia65fmu7kd3qkiu3hn4km3mgb5amrjhcwnakevgg4yxvvspqkszhe/{id}.json"
        )
    {
        treasury = 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db;
        usdcAddress = 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db;

        MINT_RATE_MAPPING["ETHER"] = ETHER_MINT_RATE;
        MINT_RATE_MAPPING["USDC"] = USDC_MINT_RATE;
    }

    function etherMint(uint256 _id, uint256 _amount) external payable {
        require(_id < numberOfTokenTypes, "Token id does not exist");
        require(
            msg.value >= (_amount * ETHER_MINT_RATE[_id]),
            "Not enough Ether sent"
        );

        _mint(msg.sender, _id, _amount, "");
    }

    function erc20Mint(
        uint256 _id,
        uint256 _volume,
        uint256 _currency
    ) external {
        require(
            _volume >= MINT_RATE_MAPPING[currency[_currency]][_id],
            "Not enough volume sent for this token type"
        );
        IERC20(currencyAddress[_currency]).safeTransferFrom(
            msg.sender,
            address(this),
            _volume
        );
    }

    function withdrawEther() external onlyOwner {
        payable(treasury).transfer(address(this).balance);
    }

    // should make this generic across all ERC20 in the currency array?
    function withdrawUSDC() external onlyOwner {
        IERC20 token = IERC20(usdcAddress);
        token.safeTransfer(treasury, getERC20Balance(usdcAddress));
    }

    /**
     * @dev Returns the ERC20 balance for this bounty address
     * @param _tokenAddress The ERC20 token address
     * @return balance The ERC20 balance for this bounty address
     */
    function getERC20Balance(address _tokenAddress)
        public
        view
        returns (uint256 balance)
    {
        IERC20 token = IERC20(_tokenAddress);
        return token.balanceOf(address(this));
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
