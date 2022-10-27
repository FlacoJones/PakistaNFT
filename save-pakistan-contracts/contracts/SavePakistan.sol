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
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/// @title SavePakistan
///
/// is an initiative being co-ordinated by individuals
/// from Tayaba - who have already supported 30,000+ people since the crisis began.
/// and Unchain Fund - who raised $10M for humanitarian aid in Ukraine earlier this year including
/// a $2.5M donation from Vitalik- to save thousands of lives in Pakistan and get critical support
/// to those who need it NOW!!
///
/// @author Andrew O'Brien, Carlo Miguel Dy
/// @notice ERC1155 sale contract
contract SavePakistan is ERC1155, ERC1155Supply, AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Counters for Counters.Counter;

    enum Variant {
        RationBag,
        TemporaryShelter,
        HygieneKit,
        PortableToilets,
        Water,
        WaterWheel
    }

    /// @notice The baseURI of the stored metadata
    string public baseURI;

    /// @notice The treasury address for SavePakistan to receive all payments
    address public immutable treasuryAddr;

    /// @notice The USDC token address
    /// @dev See https://optimistic.etherscan.io/token/0x7f5c764cbc14f9669b88837ca1490cca17c31607
    address public immutable usdcAddr;

    /// @notice The USDT token address
    /// @dev See https://optimistic.etherscan.io/token/0x94b008aa00579c1307b0ef2c499ad98a8ce58e58
    address public immutable usdtAddr;

    /// @notice The Optimism token address
    /// @dev See https://optimistic.etherscan.io/token/0x4200000000000000000000000000000000000042
    address public immutable optimismTokenAddr;

    /// @notice The Chainlink OP/USD Price Oracle address
    /// @dev See https://optimistic.etherscan.io/address/0x0D276FC14719f9292D5C1eA2198673d1f4269246
    AggregatorV3Interface public immutable opPriceFeed;

    /// @notice The Chainlink ETH/USD Price Oracle address
    /// @dev See https://optimistic.etherscan.io/address/0x13e3Ee699D1909E989722E753853AE30b17e08c5
    AggregatorV3Interface public immutable priceFeed;

    /// @notice Interface for USDC
    IERC20 private immutable usdc;

    /// @notice Interface for USDT
    IERC20 private immutable usdt;

    /// @notice Interface for Optimism Token
    IERC20 private immutable op;

    /// @notice The mapping that holds the supported tokens that this contract will receive
    mapping(address => bool) private _tokenAddrToSupported;

    /// @notice The mapping that binds an identifier to a minting rate
    mapping(address => uint256[]) private _tokenAddrToRates;

    /// @notice Mapping that holds the max supply allocation for each token variant
    mapping(Variant => uint256) private _variantToMaxSupply;

    /// @notice The minting rates for USDC token
    uint256[6] public USDC_MINT_RATE = [
        uint256(30_000_000), // Ration Bag
        uint256(100_000_000), // Temporary Shelter
        uint256(10_000_000), // Hygiene Kit
        uint256(65_000_000), // Portable Toilets
        uint256(3_500), // Clean and Safe Water
        uint256(25_000_000) // H2O Wheel
    ];

    /// @notice The minting rates for USD Apache Helicopter backed dollars
    /// TODO Are these correct?
    uint256[6] public USD_MINT_RATE = [
        uint256(30), // Ration Bag
        uint256(100), // Temporary Shelter
        uint256(10), // Hygiene Kit
        uint256(65), // Portable Toilets
        uint256(3), // Clean and Safe Water
        uint256(25) // H2O Wheel
    ];

    /// @notice The minting rates for USDT token
    uint256[6] public USDT_MINT_RATE = [
        uint256(30_000_000_000_000_000_000), // Ration Bag
        uint256(100_000_000_000_000_000_000), // Temporary Shelter
        uint256(10_000_000_000_000_000_000), // Hygiene Kit
        uint256(65_000_000_000_000_000_000), // Portable Toilets
        uint256(3_500_000_000_000_000), // Clean and Safe Water
        uint256(25_000_000_000_000_000_000) // H2O Wheel
    ];

    event MintWithEth(Variant indexed Variant, address indexed minter, uint256 quantity);
    event MintWithToken(
        Variant indexed Variant,
        address indexed minter,
        uint256 quantity,
        uint256 amount,
        address tokenAddr
    );

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "SavePakistan: Only an Admin can call this function.");
        _;
    }

    constructor(
        address _treasuryAddr,
        address _usdcAddr,
        address _usdtAddr,
        address _optimismTokenAddr,
        address _priceFeed,
        address _opPriceFeed,
        string memory _baseURI
    ) ERC1155("") {
        treasuryAddr = _treasuryAddr;
        usdcAddr = _usdcAddr;
        usdtAddr = _usdtAddr;
        optimismTokenAddr = _optimismTokenAddr;
        priceFeed = AggregatorV3Interface(_priceFeed);
        opPriceFeed = AggregatorV3Interface(_opPriceFeed);
        baseURI = _baseURI;

        usdc = IERC20(usdcAddr);
        usdt = IERC20(usdtAddr);
        op = IERC20(optimismTokenAddr);

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, treasuryAddr);

        // defining the supported tokens
        _tokenAddrToSupported[usdcAddr] = true;
        _tokenAddrToSupported[usdtAddr] = true;
        _tokenAddrToSupported[optimismTokenAddr] = true;

        // supported token rates
        _tokenAddrToRates[usdcAddr] = USDC_MINT_RATE;
        _tokenAddrToRates[usdtAddr] = USDT_MINT_RATE;

        // defining the max supply for each token variants
        _variantToMaxSupply[Variant.RationBag] = uint256(5_000);
        _variantToMaxSupply[Variant.TemporaryShelter] = uint256(1_000);
        _variantToMaxSupply[Variant.HygieneKit] = uint256(5_000);
        _variantToMaxSupply[Variant.PortableToilets] = uint256(1_000);
        _variantToMaxSupply[Variant.Water] = uint256(5_000_000);
        _variantToMaxSupply[Variant.WaterWheel] = uint256(5_000);
    }

    /**
     * @notice Function to receive Ether when `msg.data` must be empty
     */
    receive() external payable {}

    /**
     * @notice Fallback function is called when `msg.data` is not empty
     */
    fallback() external payable {}

    /**
     * @notice Withdraws all ether balance to the designated treasury address.
     */
    function withdrawEther() external onlyAdmin {
        (bool sent, bytes memory data) = payable(address(treasuryAddr)).call{value: address(this).balance}("");
        require(sent, "SavePakistan: Failed to send Ether to treasury.");
    }

    /**
     * @notice Withdraws all tokens to treasury.
     */
    function withdrawTokens() external onlyAdmin {
        usdc.safeTransfer(treasuryAddr, usdc.balanceOf(address(this)));
        usdt.safeTransfer(treasuryAddr, usdt.balanceOf(address(this)));
    }

    /**
     * @notice Mints a token by purchasing using ether.
     * @param _variant Identifies the type of token to mint.
     * @param _quantity The quantity of tokens to be minted.
     *
     * Emits {MintWithEth} event.
     */
    function mintWithEth(Variant _variant, uint256 _quantity) external payable nonReentrant {
        require(
            _quantity < getVariantRemainingSupply(_variant),
            "SavePakistan: The requested quantity to purchase is beyond the remaining supply."
        );

        uint256 rate = getVariantEtherMintRate(_variant);
        uint256 amount = _quantity * rate;
        require(msg.value >= amount, "SavePakistan: Not enough Ether sent.");

        // send ether to treasury
        (bool sent, bytes memory data) = payable(address(this)).call{value: msg.value}("");
        require(sent, "SavePakistan: Failed to send Ether.");

        _mint(msg.sender, uint256(_variant), _quantity, "");

        emit MintWithEth(_variant, msg.sender, _quantity);
    }

    /**
     * @notice Mints a token by purchasing using ERC20 token.
     * @param _variant Identifies the type of token to mint.
     * @param _tokenAddr <to be defined>
     * @param _quantity The quantity of tokens to be minted.
     *
     * Emits {MintWithToken} event.
     */
    function mintWithToken(
        Variant _variant,
        address _tokenAddr,
        uint256 _quantity
    ) external nonReentrant {
        require(_tokenAddrToSupported[_tokenAddr], "SavePakistan: This token is not supported.");
        require(
            _quantity < getVariantRemainingSupply(_variant),
            "SavePakistan: The requested quantity to purchase is beyond the remaining supply."
        );

        uint256[] memory rates = _tokenAddrToRates[_tokenAddr];
        uint256 rate = rates[uint256(_variant)];
        uint256 amount = _quantity * rate;
        require(amount >= rate, "SavePakistan: Not enough volume sent for this token variant.");

        IERC20(_tokenAddr).safeTransferFrom(msg.sender, address(this), amount);

        _mint(msg.sender, uint256(_variant), _quantity, "");

        emit MintWithToken(_variant, msg.sender, _quantity, amount, _tokenAddr);
    }

    /**
     * @notice Mints a token by purchasing using ERC20 token.
     * @param _variant Identifies the type of token to mint.
     * @param _quantity The quantity of tokens to be minted.
     *
     * Emits {MintWithToken} event.
     */
    function mintWithOpToken(Variant _variant, uint256 _quantity) external nonReentrant {
        uint256 rate = getVariantOptimismMintRate(_variant);
        uint256 amount = _quantity * rate;
        require(amount >= rate, "SavePakistan: Not enough volume sent for this token variant.");

        IERC20(optimismTokenAddr).safeTransferFrom(msg.sender, address(this), amount);

        _mint(msg.sender, uint256(_variant), _quantity, "");

        emit MintWithToken(_variant, msg.sender, _quantity, amount, optimismTokenAddr);
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view virtual returns (string memory) {
        return "Save Pakistan";
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view virtual returns (string memory) {
        return "SP";
    }

    /**
     * @notice Gets the remaining supply for a token variant.
     * @param _variant The token variant corresponds to a real world item.
     */
    function getVariantRemainingSupply(Variant _variant) public view returns (uint256) {
        return getVariantMaxSupply(_variant) - totalSupply(uint256(_variant));
    }

    /**
     * @notice Gets the max supply for a token variant.
     * @param _variant The token variant corresponds to a real world item.
     */
    function getVariantMaxSupply(Variant _variant) public view returns (uint256) {
        return _variantToMaxSupply[_variant];
    }

    /**
     * @notice Gets the mint rate for a token variant in Ether.
     * @param _variant The token variant corresponds to a real world item.
     * @param _tokenAddr A supported token to receive payment in contract.
     */
    function getVariantMintRate(Variant _variant, address _tokenAddr) public view returns (uint256) {
        uint256[] memory rates = _tokenAddrToRates[_tokenAddr];
        return rates[uint256(_variant)];
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
     * @notice Returns the price of 1 Ether in USD
     */
    function getLatestPrice() public view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price); // <== 12 digits, 8 decimals, e.g. 132356008734 -> $1323.56008734
    }

    /**
     * @notice Returns the price of 1 OP Token in USD
     */
    function getLatestOptimismPrice() public view returns (uint256) {
        (, int256 price, , , ) = opPriceFeed.latestRoundData();
        return uint256(price); // <== 12 digits, 8 decimals, e.g. 132356008734 -> $1323.56008734
    }

    /**
     * @notice Returns current token variant price in wei based on the latest Ether/USD price on Chainlink Oracle
     */
    function getVariantEtherMintRate(Variant _variant) public view returns (uint256) {
        return (USD_MINT_RATE[uint256(_variant)] * 10**18) / (getLatestPrice() / 10**8);
    }

    /**
     * @notice Returns current token variant price in wei based on the latest Optimism/USD price on Chainlink Oracle
     */
    function getVariantOptimismMintRate(Variant _variant) public view returns (uint256) {
        return (USD_MINT_RATE[uint256(_variant)] * 10**18) / (getLatestOptimismPrice() / 10**8);
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
        string memory tokenURI = Strings.toString(uint256(Variant(_tokenId)));
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
