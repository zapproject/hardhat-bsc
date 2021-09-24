// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165StorageUpgradeable.sol"; // exposes _registerInterface
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {Decimal} from "./Decimal.sol";
import {IMarket} from "./interfaces/IMarket.sol";
import {IMedia} from "./interfaces/IMedia.sol";
import {Ownable} from "./Ownable.sol";
import {MediaGetter} from "./MediaGetter.sol";

import {MediaStorage} from "./libraries/MediaStorage.sol";
import "./libraries/Constants.sol";

/**
 * @title A media value system, with perpetual equity to creators
 * @notice This contract provides an interface to mint media with a market
 * owned by the creator.
 */
contract ZapMedia is
    IMedia,
    ERC721BurnableUpgradeable,
    ReentrancyGuardUpgradeable,
    Ownable,
    MediaGetter,
    ERC721URIStorageUpgradeable,
    ERC721EnumerableUpgradeable,
    ERC165StorageUpgradeable
{
    using Counters for Counters.Counter;
    using EnumerableSet for EnumerableSet.UintSet;
    using SafeMath for uint256;

    /*
     *     bytes4(keccak256('name()')) == 0x06fdde03
     *     bytes4(keccak256('symbol()')) == 0x95d89b41
     *     bytes4(keccak256('tokenURI(uint256)')) == 0xc87b56dd
     *     DEBUG(need to find the remaining methods that result to the new interfaceId )
     *
     *     => 0x06fdde03 ^ 0x95d89b41 ^ 0xc87b56dd == 0x5b5e139f
     */

    mapping(bytes4 => bool) private _supportedInterfaces;

    bytes public collectionMetadata;

    /* *********
     * Modifiers
     * *********
     */

    /**
     * @notice Require that the token has not been burned and has been minted
     */
    modifier onlyExistingToken(uint256 tokenId) {
        require(
            _exists(tokenId),
            // remove revert string before deployment to mainnet
            "Media: nonexistent token"
        );
        _;
    }

    /**
     * @notice Require that the token has had a content hash set
     */
    modifier onlyTokenWithContentHash(uint256 tokenId) {
        require(
            getTokenContentHashes(tokenId) != 0,
            // remove revert string before deployment to mainnet
            "Media: token does not have hash of created content"
        );
        _;
    }

    /**
     * @notice Require that the token has had a metadata hash set
     */
    modifier onlyTokenWithMetadataHash(uint256 tokenId) {
        require(
            tokens.tokenMetadataHashes[tokenId] != 0,
            // remove revert string before deployment to mainnet
            "Media: token does not have hash of its metadata"
        );
        _;
    }

    /**
     * @notice Ensure that the provided spender is the approved or the owner of
     * the media for the specified tokenId
     */
    modifier onlyApprovedOrOwner(address spender, uint256 tokenId) {
        require(
            _isApprovedOrOwner(spender, tokenId),
            // remove revert string before deployment to mainnet
            "Media: Only approved or owner"
        );
        _;
    }

    /**
     * @notice Ensure the token has been created (even if it has been burned)
     */
    modifier onlyTokenCreated(uint256 tokenId) {
        require(
            access._tokenIdTracker.current() > tokenId,
            // remove revert string before deployment to mainnet
            "Media: token with that id does not exist"
        );
        _;
    }

    /**
     * @notice Ensure that the provided URI is not empty
     */
    modifier onlyValidURI(string memory uri) {
        require(
            bytes(uri).length != 0,
            // remove revert string before deployment to mainnet
            "Media: specified uri must be non-empty"
        );
        _;
    }

    /**
     * @notice On deployment, set the market contract address and register the
     * ERC721 metadata interface
     */
    function initialize(
        string memory name,
        string memory symbol,
        address marketContractAddr,
        bool permissive,
        string memory _collectionMetadata
    ) external override initializer {
        __ERC721_init(name, symbol);
        _init_ownable();

        access.marketContract = marketContractAddr;
        IMarket zapMarket = IMarket(access.marketContract);

        bytes memory name_b = bytes(name);
        bytes memory symbol_b = bytes(symbol);

        bytes32 name_b32;
        bytes32 symbol_b32;

        assembly {
            name_b32 := mload(add(name_b, 32))
            symbol_b32 := mload(add(symbol_b, 32))
        }

        _registerInterface(0x80ac58cd); // registers old erc721 interface for AucitonHouse
        _registerInterface(0x5b5e139f); // registers current metadata upgradeable interface for AuctionHouse
        zapMarket.configure(msg.sender, address(this), name_b32, symbol_b32);
        access.approvedToMint[msg.sender] = true;
        access.isPermissive = permissive;
        collectionMetadata = bytes(_collectionMetadata);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(
            ERC721EnumerableUpgradeable,
            ERC721Upgradeable,
            ERC165StorageUpgradeable
        )
        returns (bool)
    {
        return
            interfaceId == type(IMedia).interfaceId ||
            _supportedInterfaces[interfaceId];
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721URIStorageUpgradeable, ERC721Upgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _registerInterface(bytes4 interfaceId) internal virtual override {
        require(interfaceId != 0xffffffff, "ERC165: invalid interface id");
        _supportedInterfaces[interfaceId] = true;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    )
        internal
        virtual
        override(ERC721EnumerableUpgradeable, ERC721Upgradeable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    /* *************
     * View Functions
     * **************
     */

    /**
     * @notice return the URI for a particular piece of media with the specified tokenId
     * @dev This function is an override of the base OZ implementation because we
     * will return the tokenURI even if the media has been burned. In addition, this
     * protocol does not support a base URI, so relevant conditionals are removed.
     * @return the URI for a token
     */
    function tokenUri(uint256 tokenId)
        public
        view
        onlyTokenCreated(tokenId)
        returns (string memory)
    {
        return tokenURI(tokenId);
    }

    /**
     * @notice Return the metadata URI for a piece of media given the token URI
     * @return the metadata URI for the token
     */
    function tokenMetadataURI(uint256 tokenId)
        external
        view
        override
        onlyTokenCreated(tokenId)
        returns (string memory)
    {
        return access._tokenMetadataURIs[tokenId];
    }

    /* ****************
     * Public Functions
     * ****************
     */

    /**
     * @notice see IMedia
     */
    function mint(MediaData memory data, IMarket.BidShares memory bidShares)
        public
        override
        nonReentrant
    {
        require(
            access.isPermissive || access.approvedToMint[msg.sender],
            "Media: Only Approved users can mint"
        );
        _mintForCreator(msg.sender, data, bidShares);
    }

    /**
     * @notice see IMedia a
     */
    function mintWithSig(
        address creator,
        MediaData memory data,
        IMarket.BidShares memory bidShares,
        EIP712Signature memory sig
    ) public override nonReentrant {
        require(
            access.isPermissive || access.approvedToMint[msg.sender],
            "Media: Only Approved users can mint"
        );
        require(
            sig.deadline == 0 || sig.deadline >= block.timestamp,
            // remove revert string before deployment to mainnet
            "Media: mintWithSig expired"
        );

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                _calculateDomainSeparator(),
                keccak256(
                    abi.encode(
                        Constants.MINT_WITH_SIG_TYPEHASH,
                        data.contentHash,
                        data.metadataHash,
                        bidShares.creator.value,
                        access.mintWithSigNonces[creator]++,
                        sig.deadline
                    )
                )
            )
        );

        address recoveredAddress = ecrecover(digest, sig.v, sig.r, sig.s);

        require(
            recoveredAddress != address(0) && creator == recoveredAddress,
            // remove revert string before deployment to mainnet
            "Media: Signature invalid"
        );

        _mintForCreator(recoveredAddress, data, bidShares);
    }

    /**
     * @notice see IMedia
     */
    function auctionTransfer(uint256 tokenId, address recipient)
        external
        override
    {
        require(
            msg.sender == access.marketContract,
            // remove revert string before deployment to mainnet
            "Media: only market contract"
        );
        tokens.previousTokenOwners[tokenId] = ownerOf(tokenId);
        _safeTransfer(ownerOf(tokenId), recipient, tokenId, "");
    }

    /**
     * @notice see IMedia
     */
    function setAsk(uint256 tokenId, IMarket.Ask memory ask)
        public
        override
        nonReentrant
        onlyApprovedOrOwner(msg.sender, tokenId)
    {
        IMarket(access.marketContract).setAsk(address(this), tokenId, ask);
    }

    /**
     * @notice see IMedia
     */
    function removeAsk(uint256 tokenId)
        external
        override
        nonReentrant
        onlyApprovedOrOwner(msg.sender, tokenId)
    {
        IMarket(access.marketContract).removeAsk(address(this), tokenId);
    }

    /**
     * @notice see IMedia
     */
    function setBid(uint256 tokenId, IMarket.Bid memory bid)
        public
        override
        nonReentrant
        onlyExistingToken(tokenId)
    {
        require(
            msg.sender == bid.bidder,
            // remove revert string before deployment to mainnet
            "Market: Bidder must be msg sender"
        );
        address mediaContractAddress = address(this);
        IMarket(access.marketContract).setBid(
            mediaContractAddress,
            tokenId,
            bid,
            msg.sender
        );
    }

    /**
     * @notice see IMedia
     */
    function removeBid(uint256 tokenId)
        external
        override
        nonReentrant
        onlyTokenCreated(tokenId)
    {
        address mediaContractAddress = address(this);
        IMarket(access.marketContract).removeBid(
            mediaContractAddress,
            tokenId,
            msg.sender
        );
    }

    /**
     * @notice see IMedia
     */
    function acceptBid(uint256 tokenId, IMarket.Bid memory bid)
        public
        override
        nonReentrant
        onlyApprovedOrOwner(msg.sender, tokenId)
    {
        IMarket(access.marketContract).acceptBid(address(this), tokenId, bid);
    }

    /**
     * @notice Burn a token.
     * @dev Only callable if the media owner is also the creator.
     */
    function burn(uint256 tokenId)
        public
        override
        nonReentrant
        onlyExistingToken(tokenId)
        onlyApprovedOrOwner(msg.sender, tokenId)
    {
        address owner = ownerOf(tokenId);

        require(
            tokens.tokenCreators[tokenId] == owner,
            // remove revert string before deployment to mainnet
            "Media: owner is not creator of media"
        );

        _burn(tokenId);
    }

    /**
     * @notice Revoke the approvals for a token. The provided `approve` function is not sufficient
     * for this protocol, as it does not allow an approved address to revoke it's own approval.
     * In instances where a 3rd party is interacting on a user's behalf via `permit`, they should
     * revoke their approval once their task is complete as a best practice.
     */
    function revokeApproval(uint256 tokenId) external override nonReentrant {
        require(
            msg.sender == getApproved(tokenId),
            // remove revert string before deployment to mainnet
            "Media: caller not approved address"
        );
        _approve(address(0), tokenId);
    }

    /**
     * @notice see IMedia
     * @dev only callable by approved or owner
     */
    function updateTokenURI(uint256 tokenId, string calldata tokenURILocal)
        external
        override
        nonReentrant
        onlyApprovedOrOwner(msg.sender, tokenId)
        onlyTokenWithContentHash(tokenId)
        onlyValidURI(tokenURILocal)
    {
        _setTokenURI(tokenId, tokenURILocal);
        emit TokenURIUpdated(tokenId, msg.sender, tokenURILocal);
    }

    /**
     * @notice see IMedia
     * @dev only callable by approved or owner
     */
    function updateTokenMetadataURI(
        uint256 tokenId,
        string calldata metadataURI
    )
        external
        override
        nonReentrant
        onlyApprovedOrOwner(msg.sender, tokenId)
        onlyTokenWithMetadataHash(tokenId)
        onlyValidURI(metadataURI)
    {
        _setTokenMetadataURI(tokenId, metadataURI);
        emit TokenMetadataURIUpdated(tokenId, msg.sender, metadataURI);
    }

    /**
     * @notice See IMedia
     * @dev This method is loosely based on the permit for ERC-20 tokens in  EIP-2612, but modified
     * for ERC-721.
     */
    function permit(
        address spender,
        uint256 tokenId,
        EIP712Signature memory sig
    ) public override nonReentrant onlyExistingToken(tokenId) {
        require(
            sig.deadline == 0 || sig.deadline >= block.timestamp,
            // remove revert string before deployment to mainnet
            "Media: Permit expired"
        );
        require(
            spender != address(0),
            // remove revert string before deployment to mainnet
            "Media: spender cannot be 0x0"
        );

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                _calculateDomainSeparator(),
                keccak256(
                    abi.encode(
                        Constants.PERMIT_TYPEHASH,
                        spender,
                        tokenId,
                        access.permitNonces[ownerOf(tokenId)][tokenId]++,
                        sig.deadline
                    )
                )
            )
        );

        address recoveredAddress = ecrecover(digest, sig.v, sig.r, sig.s);

        require(
            recoveredAddress != address(0) &&
                ownerOf(tokenId) == recoveredAddress,
            // remove revert string before deployment to mainnet
            "Media: Signature invalid"
        );

        _approve(spender, tokenId);
    }

    /* *****************
     * Private Functions
     * *****************
     */

    /**
     * @notice Creates a new token for `creator`. Its token ID will be automatically
     * assigned (and available on the emitted {IERC721-Transfer} event), and the token
     * URI autogenerated based on the base URI passed at construction.
     *
     * See {ERC721-_safeMint}.
     *
     * On mint, also set the sha256 hashes of the content and its metadata for integrity
     * checks, along with the initial URIs to point to the content and metadata. Attribute
     * the token ID to the creator, mark the content hash as used, and set the bid shares for
     * the media's market.
     *
     * Note that although the content hash must be unique for future mints to prevent duplicate media,
     * metadata has no such requirement.
     */
    function _mintForCreator(
        address creator,
        MediaData memory data,
        IMarket.BidShares memory bidShares
    ) internal onlyValidURI(data.tokenURI) onlyValidURI(data.metadataURI) {
        require(
            data.contentHash != 0,
            // remove revert string before deployment to mainnet
            "Media: content hash must be non-zero"
        );
        require(
            access._contentHashes[data.contentHash] == false,
            // remove revert string before deployment to mainnet
            "Media: a token has already been created with this content hash"
        );
        require(
            data.metadataHash != 0,
            // remove revert string before deployment to mainnet
            "Media: metadata hash must be non-zero"
        );

        uint256 tokenId = access._tokenIdTracker.current();

        _safeMint(creator, tokenId);
        access._tokenIdTracker.increment();
        _setTokenContentHash(tokenId, data.contentHash);
        _setTokenMetadataHash(tokenId, data.metadataHash);
        _setTokenMetadataURI(tokenId, data.metadataURI);
        _setTokenURI(tokenId, data.tokenURI);
        access._creatorTokens[creator].add(tokenId);
        access._contentHashes[data.contentHash] = true;

        tokens.tokenCreators[tokenId] = creator;
        tokens.previousTokenOwners[tokenId] = creator;

        // address mediaContractAddress = address(this);
        IMarket(access.marketContract).setBidShares(
            address(this),
            tokenId,
            bidShares
        );
        IMarket(access.marketContract).mintOrBurn(true, tokenId, address(this));
    }

    function _setTokenContentHash(uint256 tokenId, bytes32 contentHash)
        internal
        virtual
        onlyExistingToken(tokenId)
    {
        tokens.tokenContentHashes[tokenId] = contentHash;
    }

    function _setTokenMetadataHash(uint256 tokenId, bytes32 metadataHash)
        internal
        virtual
        onlyExistingToken(tokenId)
    {
        tokens.tokenMetadataHashes[tokenId] = metadataHash;
    }

    function _setTokenMetadataURI(uint256 tokenId, string memory metadataURI)
        internal
        virtual
        onlyExistingToken(tokenId)
    {
        access._tokenMetadataURIs[tokenId] = metadataURI;
    }

    /**
     * @notice Destroys `tokenId`.
     * @dev We modify the OZ _burn implementation to
     * maintain metadata and to remove the
     * previous token owner from the piece
     */
    function _burn(uint256 tokenId)
        internal
        override(ERC721URIStorageUpgradeable, ERC721Upgradeable)
    {
        super._burn(tokenId);

        delete tokens.previousTokenOwners[tokenId];

        IMarket(access.marketContract).mintOrBurn(
            false,
            tokenId,
            address(this)
        );
    }

    /**
     * @notice transfer a token and remove the ask for it.
     */
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        IMarket(access.marketContract).removeAsk(address(this), tokenId);

        super._transfer(from, to, tokenId);
    }

    /**
     * @dev Calculates EIP712 DOMAIN_SEPARATOR based on the current contract and chain ID.
     */
    function _calculateDomainSeparator() internal view returns (bytes32) {
        uint256 chainID;
        /* solium-disable-next-line */
        assembly {
            chainID := chainid()
        }

        ERC721Upgradeable mediaContract = ERC721Upgradeable(address(this));
        string memory mediaName = mediaContract.name();

        return
            keccak256(
                abi.encode(
                    keccak256(
                        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                    ),
                    keccak256(bytes(mediaName)),
                    keccak256(bytes("1")),
                    chainID,
                    address(this)
                )
            );
    }
}
