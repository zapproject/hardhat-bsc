// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts-upgradeable/utils/introspection/ERC165StorageUpgradeable.sol'; // exposes _registerInterface
import '@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/utils/Context.sol';
import '@openzeppelin/contracts/utils/introspection/ERC165.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

import {EnumerableSet} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {IMarketV2} from './v2/IMarketV2.sol';
import {IMedia1155} from './interfaces/IMedia1155.sol';
import {Ownable} from './Ownable.sol';
import {MediaStorage} from './libraries/MediaStorage.sol';
import './libraries/Constants.sol';
import 'hardhat/console.sol';

/**
 * @title A media value system, with perpetual equity to creators
 * @notice This contract provides an interface to mint media with a market
 * owned by the creator.
 */
contract Media1155 is
    IMedia1155,
    ERC1155Upgradeable,
    ReentrancyGuardUpgradeable,
    Ownable,
    ERC165StorageUpgradeable
{
    using EnumerableSet for EnumerableSet.UintSet;

    bytes internal _contractURI;
    mapping(uint256 => bool) public tokenIds;
    mapping(bytes4 => bool) private _supportedInterfaces;
    MediaStorage.Tokens internal tokens;

    /* *********
     * Modifiers
     * *********
     */

    /**
     * @notice Require that the token has not been burned and has been minted
     */
    modifier onlyExistingToken(uint256 tokenId) {
        require(
            tokenIds[tokenId],
            // remove revert string before deployment to mainnet
            'Media: nonexistent token'
        );

        _;
    }

    /**
     * @notice Require that the tokens have not been burned and has been minted
     */
    modifier onlyExistingTokenBatch(uint256[] calldata tokenId) {
        // need to iterate through list of tokenIds to individually check if token exists
        for (uint256 i = 0; i < tokenId.length; i++) {
            require(
                tokenIds[tokenId[i]],
                // remove revert string before deployment to mainnet
                'Media: nonexistent token'
            );
        }

        _;
    }

    /**
     * @notice Ensure that the provided spender is the approved or the owner of
     * the media for the specified tokenId
     */
    modifier onlyApprovedOrOwner(
        address owner,
        address spender,
        uint256 tokenId
    ) {
        require(balanceOf(owner, tokenId) > 0, 'Media: Token balance is zero');

        if (owner != spender) {
            require(
                ERC1155Upgradeable.isApprovedForAll(owner, spender),
                'Media: Only approved or owner'
            );
        }

        _;
    }

    /**
     * @notice Ensure that the provided spender is the approved or the owner of
     * the media for the specified tokenId
     */
    modifier onlyApprovedOrOwnerBatch(
        address owner,
        address spender,
        uint256[] calldata tokenId
    ) {
        // require(
        //     ERC1155Upgradeable.isApprovedForAll(spender, tokenId),
        //     // remove revert string before deployment to mainnet
        //     'Media: Only approved or owner'
        // );
        _;
    }

    /**
     * @notice Ensure the token has been created (even if it has been burned)
     */
    modifier onlyTokenCreated(uint256 tokenId) {
        // require(
        // access._tokenIdTracker.current() > tokenId,
        // remove revert string before deployment to mainnet
        //     'Media: token with that id does not exist'
        // );
        _;
    }

    /**
     * @notice Ensure that the provided URI is not empty
     */
    modifier onlyValidURI(string memory uri) {
        require(
            bytes(uri).length != 0,
            // remove revert string before deployment to mainnet
            'Media: specified uri must be non-empty'
        );
        _;
    }

    /**
     * @notice On deployment, set the market contract address and register the
     * ERC1155 metadata interface
     */

    function initialize(
        string calldata _uri,
        address marketContractAddr,
        bool permissive,
        string calldata collectionURI
    ) external override initializer {
        __ERC1155_init(_uri);
        initialize_ownable();

        access.marketContract = marketContractAddr;

        // _registerInterface(0x80ac58cd); // registers old erc721 interface for AucitonHouse
        // _registerInterface(0x5b5e139f); // registers current metadata upgradeable interface for AuctionHouse
        _registerInterface(type(IMedia1155).interfaceId);

        access.isPermissive = permissive;
        _contractURI = bytes(collectionURI);
    }

    /**
     *  @notice Returns a boolean, showing whether or not the given interfaceId is supported
     * @dev This function is overriden from the ERC721 and ERC165 contract stack
     * @param interfaceId a bytes4 formatted representation of a contract interface
     * @return boolean dipicting whether or not the interface is supported
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155Upgradeable, ERC165StorageUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function getTokenCreators(uint256 _tokenId)
        public
        view
        returns (address creator)
    {
        creator = tokens.tokenCreators[_tokenId];
    }

    function _registerInterface(bytes4 interfaceId) internal virtual override {
        require(interfaceId != 0xffffffff, 'ERC165: invalid interface id');
        _supportedInterfaces[interfaceId] = true;
    }

    /* ****************
     * Public Functions
     * ****************
     */

    function mintBatch(
        address _to,
        uint256[] calldata _tokenId,
        uint256[] calldata _amount,
        IMarketV2.BidShares[] calldata bidShares
    ) external override nonReentrant {
        require(
            access.isPermissive ||
                access.approvedToMint[msg.sender] ||
                access.owner == msg.sender,
            'Media: Only Approved users can mint batch'
        );

        require(
            _tokenId.length == _amount.length &&
                _amount.length == bidShares.length,
            'Media: The tokenId, amount, and bidShares lengths are mismatched'
        );

        for (uint256 i = 0; i < bidShares.length; i++) {
            require(
                bidShares[i].collaborators.length ==
                    bidShares[i].collabShares.length,
                'Media: Arrays do not have the same length'
            );
            for (uint256 j = 0; j < bidShares[i].collaborators.length; j++) {
                require(
                    _hasShares(j, bidShares[i]),
                    'Media: Each collaborator must have a share of the nft'
                );
            }
        }

        _mintForCreatorBatch(_to, _tokenId, _amount, bidShares);
    }

    /**
     * @notice see IMedia1155
     * @dev mints an NFT and sets the bidshares for collaborators.
     * If the specified to address is not the caller, then the to wallet will have to setApprovalForAll() the zapMarket
     */
    function mint(
        address _to,
        uint256 _id,
        uint256 _amount,
        IMarketV2.BidShares calldata bidShares
    ) external override nonReentrant {
        require(
            access.isPermissive ||
                access.approvedToMint[msg.sender] ||
                access.owner == msg.sender,
            'Media: Only Approved users can mint'
        );
        require(
            bidShares.collaborators.length == bidShares.collabShares.length,
            'Media: Arrays do not have the same length'
        );
        for (uint256 i = 0; i < bidShares.collaborators.length; i++) {
            require(
                _hasShares(i, bidShares),
                'Media: Each collaborator must have a share of the nft'
            );
        }

        _mintForCreator(msg.sender, _id, _amount, bidShares);
    }

    /**
     * @notice see IMedia1155
     */
    function auctionTransfer(
        uint256 tokenId,
        uint256 amount,
        address recipient,
        address owner
    ) external override {
        require(
            msg.sender == access.marketContract,
            // remove revert string before deployment to mainnet
            'Media: only market contract'
        );
        // tokens.previousTokenOwners[tokenId] = ownerOf(tokenId);
        safeTransferFrom(owner, recipient, tokenId, amount, '');
    }

    /**
     * @notice see IMedia1155
     */
    function batchAuctionTransfer(
        uint256[] calldata tokenId,
        uint256[] calldata amount,
        address recipient,
        address owner
    ) external override {}

    /**
     * @notice see IMedia1155
     */
    function setAsk(
        uint256 tokenId,
        IMarketV2.Ask calldata ask,
        address owner
    )
        external
        override
        nonReentrant
        onlyExistingToken(tokenId)
        onlyApprovedOrOwner(owner, msg.sender, tokenId)
    {
        IMarketV2(access.marketContract).setAsk(tokenId, ask);
    }

    /**
     * @notice see IMedia1155
     */
    function setAskBatch(
        uint256[] calldata tokenId,
        IMarketV2.Ask[] calldata ask,
        address owner
    )
        external
        override
        nonReentrant
        onlyApprovedOrOwnerBatch(owner, msg.sender, tokenId)
        onlyExistingTokenBatch(tokenId)
    {
        IMarketV2(access.marketContract).setAskBatch(tokenId, ask);
    }

    /**
     * @notice see IMedia11551155
     */
    function removeAsk(uint256 tokenId, address owner)
        external
        override
        nonReentrant
        onlyExistingToken(tokenId)
        onlyApprovedOrOwner(owner, msg.sender, tokenId)
    {
        IMarketV2(access.marketContract).removeAsk(tokenId);
    }

    /**
     * @notice see IMedia11551155
     */
    function removeAskBatch(uint256[] calldata tokenId, address owner)
        external
        override
        nonReentrant
        onlyApprovedOrOwnerBatch(owner, msg.sender, tokenId)
        onlyExistingTokenBatch(tokenId)
    {}

    /**
     * @notice see IMedia1155
     */
    function setBid(
        uint256 tokenId,
        IMarketV2.Bid calldata bid,
        address owner
    ) external override nonReentrant onlyExistingToken(tokenId) {
        require(msg.sender == bid.bidder, 'Market: Bidder must be msg sender');
        setApprovalForAll(access.marketContract, true);
        IMarketV2(access.marketContract).setBid(
            address(this),
            tokenId,
            bid,
            msg.sender,
            owner
        );
    }

    /**
     * @notice see IMedia1155
     */
    function removeBid(uint256 tokenId)
        external
        override
        nonReentrant
        onlyTokenCreated(tokenId)
    {
        IMarketV2(access.marketContract).removeBid(tokenId, msg.sender);
    }

    /**
     * @notice see IMedia1155
     */
    function acceptBid(
        uint256 tokenId,
        IMarketV2.Bid memory bid,
        address owner
    )
        public
        override
        nonReentrant
        onlyApprovedOrOwner(owner, msg.sender, tokenId)
        onlyExistingToken(tokenId)
    {
        IMarketV2(access.marketContract).acceptBid(
            address(this),
            tokenId,
            bid,
            owner
        );
    }

    /**
     * @notice Burn a token.
     * @dev Only callable if the media owner is also the creator.
     * @param tokenId the ID of the token to burn
     */
    function burn(
        uint256 tokenId,
        uint256 amount,
        address owner
    )
        public
        override
        nonReentrant
        onlyExistingToken(tokenId)
        onlyApprovedOrOwner(owner, msg.sender, tokenId)
    {
        require(
            access._creatorTokens[msg.sender].contains(tokenId) &&
                msg.sender == owner,
            'Media: Must be creator of token to burn'
        );
        _burn(msg.sender, tokenId, amount);
    }

    /**
     * @notice Burn a batch of tokens.
     * @dev Only callable if the media owner is also the creator.
     * @param tokenId the list of IDs of the tokens to burn
     */
    function burnBatch(
        uint256[] calldata tokenId,
        uint256[] calldata amount,
        address owner
    )
        external
        override
        nonReentrant
        onlyExistingTokenBatch(tokenId)
        onlyApprovedOrOwnerBatch(owner, msg.sender, tokenId)
    {}

    function transferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount
    ) external onlyApprovedOrOwner(from, msg.sender, id) nonReentrant {
        safeTransferFrom(from, to, id, amount, '');
    }

    /// @notice Returns a bool depicting whether or not the i'th collaborator has shares
    /// @dev Explain to a developer any extra details
    /// @param index the "i'th collaborator"
    /// @param bidShares the bidshares defined for the Collection's NFTs
    /// @return Boolean that is true if the i'th collaborator has shares for this collection's NFTs
    function _hasShares(uint256 index, IMarketV2.BidShares memory bidShares)
        internal
        pure
        returns (bool)
    {
        return (bidShares.collabShares[index] != 0);
    }

    /**
     * @notice Creates a new token for `creator`. Its token ID will be automatically
     * assigned (and available on the emitted {IERC721-Transfer} event), and the token
     * URI autogenerated based on the base URI passed at construction.
     *
     * See {ERC721-_safeMint}.
     *
     * On mint, also set the keccak256 hashes of the content and its metadata for integrity
     * checks, along with the initial URIs to point to the content and metadata. Attribute
     * the token ID to the creator, mark the content hash as used, and set the bid shares for
     * the media's market.
     *
     * Note that although the content hash must be unique for future mints to prevent duplicate media,
     * metadata has no such requirement.
     */
    function _mintForCreator(
        address creator,
        uint256 id,
        uint256 amount,
        IMarketV2.BidShares memory bidShares
    ) internal {
        setApprovalForAll(access.marketContract, true);
        _mint(creator, id, amount, '');

        if (tokenIds[id]) {
            require(
                access._creatorTokens[msg.sender].contains(id),
                'Media: Cannot mint an existing token as non creator'
            );
        } else {
            access._creatorTokens[msg.sender].add(id);
            tokens.tokenCreators[id] = creator;
        }

        IMarketV2(access.marketContract).setBidShares(id, bidShares);

        IMarketV2(access.marketContract).mintOrBurn(true, id, address(this));

        tokenIds[id] = true;
    }

    /**
     * @notice Creates a new token for `creator`. Its token ID will be automatically
     * assigned (and available on the emitted {IERC721-Transfer} event), and the token
     * URI autogenerated based on the base URI passed at construction.
     *
     * See {ERC721-_safeMint}.
     *
     * On mint, also set the keccak256 hashes of the content and its metadata for integrity
     * checks, along with the initial URIs to point to the content and metadata. Attribute
     * the token ID to the creator, mark the content hash as used, and set the bid shares for
     * the media's market.
     *
     * Note that although the content hash must be unique for future mints to prevent duplicate media,
     * metadata has no such requirement.
     */
    function _mintForCreatorBatch(
        address creator,
        uint256[] memory id,
        uint256[] memory amount,
        IMarketV2.BidShares[] memory bidShares
    ) internal {
        setApprovalForAll(access.marketContract, true);
        _mintBatch(creator, id, amount, '');

        for (uint256 i = 0; i < id.length; i++) {
            if (tokenIds[id[i]]) {
                require(
                    access._creatorTokens[msg.sender].contains(id[i]),
                    'Media: Cannot mint an existing token as non creator'
                );
            } else {
                access._creatorTokens[msg.sender].add(id[i]);
                tokens.tokenCreators[id[i]] = creator;
            }

            IMarketV2(access.marketContract).setBidShares(id[i], bidShares[i]);

            tokenIds[id[i]] = true;
            IMarketV2(access.marketContract).mintOrBurn(
                true,
                id[i],
                address(this)
            );
        }
    }

    // /**
    //  * @notice Destroys `tokenId`.
    //  * @dev We modify the OZ _burn implementation to
    //  * maintain metadata and to remove the
    //  * previous token owner from the piece
    //  */
    // function _burn(uint256 tokenId)
    //     internal
    //     override(ERC1155Upgradeable)
    // {
    //     ERC1155Upgradeable._burn(tokenId);

    //     delete tokens.previousTokenOwners[tokenId];

    //     IMarketV2(access.marketContract).mintOrBurn(
    //         false,
    //         tokenId,
    //         address(this)
    //     );
    // }

    // /**
    //  * @notice transfer a token and remove the ask for it.
    //  */
    // function _transfer(
    //     address from,
    //     address to,
    //     uint256 tokenId
    // ) internal override {
    //     IMarketV2(access.marketContract).removeAsk(tokenId);

    //     ERC721Upgradeable._transfer(from, to, tokenId);
    // }
}
