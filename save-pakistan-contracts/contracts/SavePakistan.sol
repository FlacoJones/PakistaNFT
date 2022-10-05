// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {ERC1155, IERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControl, IAccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";

/// @title SavePakistan - The very first NFT collection that binds to real world < ... >
/// @author Andrew O'Brien, Carlo Miguel Dy
/// @notice <description for Save Pakistan NFT>
/// @dev <any relevant developer explainiation>
contract SavePakistan is ERC1155, ERC1155Supply, AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Counters for Counters.Counter;

    enum TokenVariant {
        RationBag,
        TemporaryShelter,
        HygieneKit,
        PortableToilets,
        Water,
        WaterWheel
    }

    /// @notice Keeps track of tokens corresponding to a tokenId
    Counters.Counter private _tokenCounter;

    /// @notice The treasury address for SavePakistan to receive all payments
    address public constant TREASURY_ADDR = 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db; // TODO: Replace with real treasury address from the team

    /// @notice The USDC token address
    /// @dev See https://optimistic.etherscan.io/token/0x7f5c764cbc14f9669b88837ca1490cca17c31607
    address public constant USDC_ADDR = 0x7F5c764cBc14f9669B88837ca1490cCa17c31607;

    /// @notice The USDT token address
    /// @dev See https://optimistic.etherscan.io/token/0x94b008aa00579c1307b0ef2c499ad98a8ce58e58
    address public constant USDT_ADDR = 0x94b008aA00579c1307B0EF2c499aD98a8ce58e58;

    /// @notice Interface for USDC
    IERC20 private usdc = IERC20(USDC_ADDR);

    /// @notice Interface for USDT
    IERC20 private usdt = IERC20(USDT_ADDR);

    /// @notice The mapping that holds the supported tokens that this contract will receive
    mapping(address => bool) private _tokenAddrToSupported;

    /// @notice The mapping that binds an identifier to a minting rate
    mapping(address => uint256[]) private _tokenAddrToRates;

    /// @notice Mapping that holds the max supply allocation for each token variant
    mapping(TokenVariant => uint256) private _tokenVariantToMaxSupply;

    /// @notice Mapping that holds the minting count for each token variant
    mapping(TokenVariant => uint256) private _tokenVariantToMintCount;

    /// @notice Mapping that holds the token variant of a tokenId
    mapping(uint256 => TokenVariant) private _tokenIdToTokenVariant;

    // TODO: Verify with Andrew O'Brien regarding ether mint rates as they change overtime
    // TODO: Better approach to putting up sale price in Ether
    /// ? how do we ensure the amount of ether value matches the $ value?
    /// @notice The minting rates for native ether
    uint256[6] public ETHER_MINT_RATE = [
        0.30 ether, // Ration Bag // ! this is a placeholder value, to be replaced
        0.199 ether, // Temporary Shelter // ! this is a placeholder value, to be replaced
        0.10 ether, // Hygiene Kit // ! this is a placeholder value, to be replaced
        0.65 ether, // Portable Toilets // ! this is a placeholder value, to be replaced
        0.00035 ether, // Clean and Safe Water // ! this is a placeholder value, to be replaced
        0.25 ether // H2O Wheel // ! this is a placeholder value, to be replaced
    ];

    /// @notice The minting rates for USDC token
    uint256[6] public USDC_MINT_RATE = [
        uint256(30 * 10**6), // Ration Bag
        uint256(100 * 10**6), // Temporary Shelter
        uint256(10 * 10**6), // Hygiene Kit
        uint256(65 * 10**6), // Portable Toilets
        uint256(0.0035 * 10**6), // Clean and Safe Water
        uint256(25 * 10**6) // H2O Wheel
    ];

    /// @notice The minting rates for USDT token
    uint256[6] public USDT_MINT_RATE = [
        uint256(30 * 10**18), // Ration Bag
        uint256(100 * 10**18), // Temporary Shelter
        uint256(10 * 10**18), // Hygiene Kit
        uint256(65 * 10**18), // Portable Toilets
        uint256(0.0035 * 10**18), // Clean and Safe Water
        uint256(25 * 10**18) // H2O Wheel
    ];

    event MintByPayingEth(TokenVariant indexed tokenVariant, address indexed minter, uint256 quantity, uint256 tokenId);
    event MintByPayingToken(
        TokenVariant indexed tokenVariant,
        address indexed minter,
        uint256 quantity,
        uint256 amount,
        address tokenAddr,
        uint256 tokenId
    );

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "SavePakistan: Only an Admin can call this function.");
        _;
    }

    constructor() ERC1155("") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, TREASURY_ADDR);

        // defining the supported tokens
        _tokenAddrToSupported[USDC_ADDR] = true;
        _tokenAddrToSupported[USDT_ADDR] = true;

        // supported token rates
        _tokenAddrToRates[USDC_ADDR] = USDC_MINT_RATE;
        _tokenAddrToRates[USDT_ADDR] = USDT_MINT_RATE;

        // defining the max supply for each token variants
        _tokenVariantToMaxSupply[TokenVariant.RationBag] = uint256(5_000);
        _tokenVariantToMaxSupply[TokenVariant.TemporaryShelter] = uint256(1_000);
        _tokenVariantToMaxSupply[TokenVariant.HygieneKit] = uint256(5_000);
        _tokenVariantToMaxSupply[TokenVariant.PortableToilets] = uint256(1_000);
        _tokenVariantToMaxSupply[TokenVariant.Water] = uint256(5_000_000);
        _tokenVariantToMaxSupply[TokenVariant.WaterWheel] = uint256(5_000);
    }

    /// @notice Function to receive Ether when `msg.data` must be empty
    receive() external payable {}

    /// @notice Fallback function is called when `msg.data` is not empty
    fallback() external payable {}

    /**
     * @notice Withdraws all ether balance to the designated treasury address.
     */
    function withdrawEther() external onlyAdmin {
        (bool sent, bytes memory data) = payable(address(TREASURY_ADDR)).call{value: address(this).balance}("");
        require(sent, "SavePakistan: Failed to send Ether to treasury.");
    }

    /**
     * @notice Withdraws all tokens to treasury.
     */
    function withdrawTokens() external onlyAdmin {
        usdc.safeTransfer(TREASURY_ADDR, usdc.balanceOf(address(this)));
        usdt.safeTransfer(TREASURY_ADDR, usdt.balanceOf(address(this)));
    }

    /**
     * @notice Mints a token by purchasing using ether.
     * @param _tokenVariant Identifies the type of token to mint.
     * @param _quantity The quantity of tokens to be minted.
     *
     * Emits {MintByPayingEth} event.
     */
    function mintByPayingEth(TokenVariant _tokenVariant, uint256 _quantity) external payable nonReentrant {
        require(
            _quantity < getTokenVariantRemainingSupply(_tokenVariant),
            "SavePakistan: The requested quantity to purchase is beyond the remaining supply."
        );
        require(
            _quantity < getTokenVariantMaxSupply(_tokenVariant),
            "SavePakistan: The requested quantity to purchase is beyond the max supply."
        );

        uint256 rate = getTokenVariantEtherMintRate(_tokenVariant);
        uint256 amount = _quantity * rate;
        require(msg.value >= amount, "SavePakistan: Not enough Ether sent.");

        // send ether to treasury
        (bool sent, bytes memory data) = payable(address(this)).call{value: msg.value}("");
        require(sent, "SavePakistan: Failed to send Ether.");

        _tokenCounter.increment();
        uint256 tokenId = _tokenCounter.current();

        _tokenVariantToMintCount[_tokenVariant] += _quantity;
        _tokenIdToTokenVariant[tokenId] = _tokenVariant;

        _mint(msg.sender, tokenId, _quantity, "");

        emit MintByPayingEth(_tokenVariant, msg.sender, _quantity, tokenId);
    }

    /**
     * @notice Mints a token by purchasing using ERC20 token.
     * @param _tokenVariant Identifies the type of token to mint.
     * @param _tokenAddr <to be defined>
     * @param _quantity The quantity of tokens to be minted.
     *
     * Emits {MintByPayingToken} event.
     */
    function mintByPayingToken(
        TokenVariant _tokenVariant,
        address _tokenAddr,
        uint256 _quantity
    ) external nonReentrant {
        require(_tokenAddrToSupported[_tokenAddr], "SavePakistan: This token is not supported.");
        require(
            _quantity < getTokenVariantRemainingSupply(_tokenVariant),
            "SavePakistan: The requested quantity to purchase is beyond the remaining supply."
        );
        require(
            _quantity < getTokenVariantMaxSupply(_tokenVariant),
            "SavePakistan: The requested quantity to purchase is beyond the max supply."
        );

        uint256[] memory rates = _tokenAddrToRates[_tokenAddr];
        uint256 rate = rates[uint256(_tokenVariant)];
        uint256 amount = _quantity * rate;
        require(amount >= rate, "SavePakistan: Not enough volume sent for this token variant.");

        IERC20(_tokenAddr).safeTransferFrom(msg.sender, address(this), amount);

        _tokenCounter.increment();
        uint256 tokenId = _tokenCounter.current();

        _tokenVariantToMintCount[_tokenVariant] += _quantity;
        _tokenIdToTokenVariant[tokenId] = _tokenVariant;

        _mint(msg.sender, tokenId, _quantity, "");

        emit MintByPayingToken(_tokenVariant, msg.sender, _quantity, amount, _tokenAddr, tokenId);
    }

    /**
     * @notice Gets the supply minted for a token variant.
     * @param _tokenVariant The token variant corresponds to a real world item.
     */
    function getTokenVariantSupply(TokenVariant _tokenVariant) public view returns (uint256) {
        return _tokenVariantToMintCount[_tokenVariant];
    }

    /**
     * @notice Gets the remaining supply for a token variant.
     * @param _tokenVariant The token variant corresponds to a real world item.
     */
    function getTokenVariantRemainingSupply(TokenVariant _tokenVariant) public view returns (uint256) {
        return getTokenVariantMaxSupply(_tokenVariant) - _tokenVariantToMintCount[_tokenVariant];
    }

    /**
     * @notice Gets the max supply for a token variant.
     * @param _tokenVariant The token variant corresponds to a real world item.
     */
    function getTokenVariantMaxSupply(TokenVariant _tokenVariant) public view returns (uint256) {
        return _tokenVariantToMaxSupply[_tokenVariant];
    }

    /**
     * @notice Gets the mint rate for a token variant in Ether.
     * @param _tokenVariant The token variant corresponds to a real world item.
     */
    function getTokenVariantEtherMintRate(TokenVariant _tokenVariant) public view returns (uint256) {
        return ETHER_MINT_RATE[uint256(_tokenVariant)];
    }

    /**
     * @notice Gets the mint rate for a token variant in Ether.
     * @param _tokenVariant The token variant corresponds to a real world item.
     * @param _tokenAddr A supported token to receive payment in contract.
     */
    function getTokenVariantMintRate(TokenVariant _tokenVariant, address _tokenAddr) public view returns (uint256) {
        uint256[] memory rates = _tokenAddrToRates[_tokenAddr];
        return rates[uint256(_tokenVariant)];
    }

    /**
     * @notice Gets the mint rate for a supported token address.
     * @param _tokenAddr A supported token to receive payment in contract.
     */
    function getTokenAddrMintRate(address _tokenAddr) public view returns (uint256[] memory) {
        return _tokenAddrToRates[_tokenAddr];
    }

    /**
     * @notice Checks if the given token address is supported.
     * @param _tokenAddr An arbitrary token address.
     */
    function getTokenAddrSupported(address _tokenAddr) public view returns (bool) {
        return _tokenAddrToSupported[_tokenAddr];
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControl, ERC1155) returns (bool) {
        return
            interfaceId == type(IAccessControl).interfaceId ||
            interfaceId == type(IERC1155).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {ERC1155-uri}.
     */
    function uri(uint256 _tokenId) public view override returns (string memory) {
        TokenVariant tokenVariant = _tokenIdToTokenVariant[_tokenId];
        string memory baseURI = "https://ipfs.io/ipfs/bafybeia65fmu7kd3qkiu3hn4km3mgb5amrjhcwnakevgg4yxvvspqkszhe/";
        string memory tokenURI = Strings.toString(uint256(tokenVariant));
        return string(abi.encodePacked(baseURI, tokenURI, ".json"));
    }

    /**
     * @notice This override disables transferring of tokens to any arbitrary address.
     * @dev See {ERC1155-_beforeTokenTransfer}.
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override(ERC1155, ERC1155Supply) {
        if (from != address(0) && to != address(0)) {
            require(false, "SavePakistan: Not allowed to transfer a token from/to arbitrary address.");
        }

        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    /**
     * @dev See {ERC1155-_burn}.
     */
    function _burn(
        address from,
        uint256 id,
        uint256 amount
    ) internal virtual override {
        require(false, "SavePakistan: Not allowed to burn a token.");
        super._burn(from, id, amount);
    }
}
