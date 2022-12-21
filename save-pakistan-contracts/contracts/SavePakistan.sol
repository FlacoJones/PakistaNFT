/* solhint-disable var-name-mixedcase */
/* solhint-disable func-param-name-mixedcase */
// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {ERC1155Upgradeable, IERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {ERC1155SupplyUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import {IERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import {SafeERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import {AccessControlUpgradeable, IAccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {StringsUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import {CountersUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
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
contract SavePakistan is
    ERC1155Upgradeable,
    ERC1155SupplyUpgradeable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20Upgradeable for IERC20Upgradeable;
    using CountersUpgradeable for CountersUpgradeable.Counter;

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
    address public treasuryAddr;

    /// @notice The USDC token address
    /// @dev See https://optimistic.etherscan.io/token/0x7f5c764cbc14f9669b88837ca1490cca17c31607
    address public usdcAddr;

    /// @notice The USDT token address
    /// @dev See https://optimistic.etherscan.io/token/0x94b008aa00579c1307b0ef2c499ad98a8ce58e58
    address public usdtAddr;

    /// @notice The Optimism token address
    /// @dev See https://optimistic.etherscan.io/token/0x4200000000000000000000000000000000000042
    address public optimismTokenAddr;

    /// @notice The Chainlink OP/USD Price Oracle address
    /// @dev See https://optimistic.etherscan.io/address/0x0D276FC14719f9292D5C1eA2198673d1f4269246
    AggregatorV3Interface public opPriceFeed;

    /// @notice The Chainlink ETH/USD Price Oracle address
    /// @dev See https://optimistic.etherscan.io/address/0x13e3Ee699D1909E989722E753853AE30b17e08c5
    AggregatorV3Interface public priceFeed;

    /// @notice Interface for USDC
    IERC20Upgradeable private usdc;

    /// @notice Interface for USDT
    IERC20Upgradeable private usdt;

    /// @notice Interface for Optimism Token
    IERC20Upgradeable private op;

    /// @notice The mapping that holds the supported tokens that this contract will receive
    mapping(address => bool) private _tokenAddrToSupported;

    /// @notice The mapping that binds an identifier to a minting rate
    mapping(address => uint256[]) private _tokenAddrToRates;

    /// @notice Mapping that holds the max supply allocation for each token variant
    mapping(Variant => uint256) private _variantToMaxSupply;

    /// @notice The minting rates for USDC token
    uint256[6] public usdcMintRates;

    /// @notice The minting rates for USD Apache Helicopter backed dollars
    uint256[6] public usdMintRates;

    /// @notice The minting rates for USDT token
    uint256[6] public usdtMintRates;

    event MintWithEth(Variant indexed Variant, address indexed minter, uint256 quantity);
    event MintWithToken(
        Variant indexed Variant,
        address indexed minter,
        uint256 quantity,
        uint256 amount,
        address tokenAddr
    );
    event SetTreasuryAddr(address indexed oldTreasuryAddr, address indexed newTreasuryAddr);

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "SavePakistan: Only an Admin can call this function.");
        _;
    }

    function mintTo(
        address to,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) external onlyAdmin {
        _mint(to, id, amount, data);
    }

    function initialize(
        address _treasuryAddr,
        address _usdcAddr,
        address _usdtAddr,
        address _optimismTokenAddr,
        address _priceFeed,
        address _opPriceFeed,
        string memory _baseURI
    ) public initializer {
        __ERC1155_init("");
        __AccessControl_init();
        __Ownable_init();
        __Pausable_init();

        treasuryAddr = _treasuryAddr;
        usdcAddr = _usdcAddr;
        usdtAddr = _usdtAddr;
        optimismTokenAddr = _optimismTokenAddr;
        priceFeed = AggregatorV3Interface(_priceFeed);
        opPriceFeed = AggregatorV3Interface(_opPriceFeed);
        baseURI = _baseURI;

        usdc = IERC20Upgradeable(usdcAddr);
        usdt = IERC20Upgradeable(usdtAddr);
        op = IERC20Upgradeable(optimismTokenAddr);

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, treasuryAddr);

        // defining the supported tokens
        _tokenAddrToSupported[usdcAddr] = true;
        _tokenAddrToSupported[usdtAddr] = true;
        _tokenAddrToSupported[optimismTokenAddr] = true;

        // defining the mint rates
        usdMintRates = [
            uint256(0), // Ration Bag
            uint256(0), // Temporary Shelter
            uint256(0), // Hygiene Kit
            uint256(0), // Portable Toilets
            uint256(0), // Clean and Safe Water
            uint256(0) // H2O Wheel
        ];
        usdcMintRates = [
            uint256(0), // Ration Bag
            uint256(0), // Temporary Shelter
            uint256(0), // Hygiene Kit
            uint256(0), // Portable Toilets
            uint256(0), // Clean and Safe Water
            uint256(0) // H2O Wheel
        ];
        usdtMintRates = [
            uint256(0), // Ration Bag
            uint256(0), // Temporary Shelter
            uint256(0), // Hygiene Kit
            uint256(0), // Portable Toilets
            uint256(0), // Clean and Safe Water
            uint256(0) // H2O Wheel
        ];

        // supported token rates
        _tokenAddrToRates[usdcAddr] = usdcMintRates;
        _tokenAddrToRates[usdtAddr] = usdtMintRates;

        // defining the max supply for each token variants
        _variantToMaxSupply[Variant.RationBag] = uint256(5_000);
        _variantToMaxSupply[Variant.TemporaryShelter] = uint256(1_000);
        _variantToMaxSupply[Variant.HygieneKit] = uint256(5_000);
        _variantToMaxSupply[Variant.PortableToilets] = uint256(1_000);
        _variantToMaxSupply[Variant.Water] = uint256(5_000_000);
        _variantToMaxSupply[Variant.WaterWheel] = uint256(5_000);
    }

    /**
     * @dev See {PausableUpgradeable-_pause}.
     */
    function pause() external onlyAdmin {
        _pause();
    }

    /**
     * @dev See {PausableUpgradeable-_unpause}.
     */
    function unpause() external onlyAdmin {
        _unpause();
    }

    /**
     * @notice Function to receive Ether when `msg.data` must be empty
     */
    receive() external payable {}

    /**
     * @notice Sets new treasury address.
     * @param _treasuryAddr The new treasury address.
     */
    function setTreasuryAddr(address _treasuryAddr) external onlyOwner {
        emit SetTreasuryAddr(treasuryAddr, _treasuryAddr);
        treasuryAddr = _treasuryAddr;
    }

    /**
     * @notice Withdraws all ether balance to the designated treasury address.
     */
    function withdrawEther() external onlyAdmin {
        (bool sent, ) = payable(address(treasuryAddr)).call{value: address(this).balance}("");
        require(sent, "SavePakistan: Failed to send Ether to treasury.");
    }

    /**
     * @notice Withdraws all tokens to treasury.
     */
    function withdrawTokens() external onlyAdmin {
        usdc.safeTransfer(treasuryAddr, usdc.balanceOf(address(this)));
        usdt.safeTransfer(treasuryAddr, usdt.balanceOf(address(this)));
        op.safeTransfer(treasuryAddr, op.balanceOf(address(this)));
    }

    /**
     * @notice Mints a token by purchasing using ether.
     * @param _variant Identifies the type of token to mint.
     * @param _quantity The quantity of tokens to be minted.
     *
     * Emits {MintWithEth} event.
     */
    function mintWithEth(Variant _variant, uint256 _quantity) external payable nonReentrant whenNotPaused {
        require(
            _quantity <= getVariantRemainingSupply(_variant),
            "SavePakistan: The requested quantity to purchase is beyond the remaining supply."
        );

        uint256 rate = getVariantEtherMintRate(_variant);
        uint256 amount = _quantity * rate;
        require(msg.value >= amount, "SavePakistan: Not enough Ether sent.");

        (bool sent, ) = payable(address(this)).call{value: msg.value}("");
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
    ) external nonReentrant whenNotPaused {
        require(_tokenAddrToSupported[_tokenAddr], "SavePakistan: This token is not supported.");
        require(
            _quantity <= getVariantRemainingSupply(_variant),
            "SavePakistan: The requested quantity to purchase is beyond the remaining supply."
        );

        uint256[] memory rates = _tokenAddrToRates[_tokenAddr];

        uint256 rate = 0;

        if (_tokenAddr == optimismTokenAddr) {
            rate = getVariantOptimismMintRate(_variant);
        } else {
            rate = rates[uint256(_variant)];
        }

        uint256 amount = _quantity * rate;
        require(amount >= rate, "SavePakistan: Not enough volume sent for this token variant.");

        IERC20Upgradeable(_tokenAddr).safeTransferFrom(msg.sender, address(this), amount);

        _mint(msg.sender, uint256(_variant), _quantity, "");

        emit MintWithToken(_variant, msg.sender, _quantity, amount, _tokenAddr);
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
        return uint256(price);
    }

    /**
     * @notice Returns current token variant price in wei based on the latest Ether/USD price on Chainlink Oracle
     */
    function getVariantEtherMintRate(Variant _variant) public view returns (uint256) {
        return (usdMintRates[uint256(_variant)] * 10**26) / getLatestPrice();
    }

    /**
     * @notice Returns current token variant price in wei based on the latest Optimism/USD price on Chainlink Oracle
     */
    function getVariantOptimismMintRate(Variant _variant) public view returns (uint256) {
        return (usdMintRates[uint256(_variant)] * 10**26) / getLatestOptimismPrice();
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlUpgradeable, ERC1155Upgradeable)
        returns (bool)
    {
        return
            interfaceId == type(IAccessControlUpgradeable).interfaceId ||
            interfaceId == type(IERC1155Upgradeable).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {ERC1155-uri}.
     */
    function uri(uint256 _tokenId) public view override returns (string memory) {
        string memory tokenURI = StringsUpgradeable.toString(uint256(Variant(_tokenId)));
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
    ) internal virtual override(ERC1155Upgradeable, ERC1155SupplyUpgradeable) {
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
