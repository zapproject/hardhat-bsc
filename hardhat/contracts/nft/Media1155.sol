// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts-upgradeable/utils/introspection/ERC165StorageUpgradeable.sol'; // exposes _registerInterface
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin-contracts/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin-contracts/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";
import "@openzeppelin-contracts/contracts/utils/Address.sol";
import "@openzeppelin-contracts/contracts/utils/Context.sol";
import "@openzeppelin-contracts/contracts/utils/introspection/ERC165.sol";
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';

import {IMarket} from './interfaces/IMarket.sol';
import {IMedia1155} from './interfaces/IMedia1155.sol';
import {Ownable} from './Ownable.sol';
import {MediaStorage} from './libraries/MediaStorage.sol';
import './libraries/Constants.sol';

/**
 * @title A media value system, with perpetual equity to creators
 * @notice This contract provides an interface to mint media with a market
 * owned by the creator.
 */
contract ZapMedia is
    IMedia1155,
    ERC1155Upgradeable,
    ReentrancyGuardUpgradeable,
    Ownable,
    IERC1155MetadataURI,
    ERC165StorageUpgradeable
{
    bytes internal _contractURI;
    mapping(uint256 => bool) public tokenIds;

    /* *********
     * Modifiers
     * *********
     */

    /**
     * @notice Require that the token has not been burned and has been minted
     */
    modifier onlyExistingToken(uint256[] tokenId) {
        // need to iterate through list of tokenIds to individually check if token exists
        for (uint i = 0; i < tokenId.length; i++) {
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
    modifier onlyApprovedOrOwner(address spender, uint256 tokenId) {
        require(
            _isApprovedOrOwner(spender, tokenId),
            // remove revert string before deployment to mainnet
            'Media: Only approved or owner'
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
            'Media: token with that id does not exist'
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
        override(
            ERC1155Upgradeable,
            ERC165StorageUpgradeable
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @notice return the URI for a particular piece of media with the specified tokenId
     * @dev This function is an override of the base OZ implementation because we
     * will return the tokenURI even if the media has been burned. In addition, this
     * protocol does not support a base URI, so relevant conditionals are removed.
     * @return the URI for a token
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        onlyTokenCreated(tokenId)
        returns (string memory)
    {
        // replace 'id' holder in uri with tokenId
        bytes memory strBytes = bytes(_uri);
        bytes memory buffer = new bytes(strBytes.length-4);
        for(uint i = 0; i < strBytes.length-3; i++) {
            buffer[i] = strBytes[i];

            if (strBytes[i] == '{' && strBytes[i+1] == 'i' && strBytes[i+2] == 'd' && strbytes[i+3] == '}'){
                return string(abi.encode(string(buffer[i]), uint2str(tokenId)));
            }
        }

        return _uri;
    }

    function _registerInterface(bytes4 interfaceId) internal virtual override {
        require(interfaceId != 0xffffffff, 'ERC165: invalid interface id');
        _supportedInterfaces[interfaceId] = true;
    }


    /* ****************
     * Public Functions
     * ****************
     */

     function batchMint(address _to, uint256[] calldata _ids, uint256[] calldata _amounts, IMarket.BidShares calldata bidShares)
        external
        override
        nonReentrant
    {
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

        _mintBatch(to, ids, amounts);
    }

    /**
     * @notice see IMedia1155
     * @dev mints an NFT and sets the bidshares for collaborators
     * @param data The media's metadata and content data, includes content and metadata hash, and token's URI
     */
    function mint(address _to, uint256 _id, uint256 _amount, IMarket.BidShares calldata bidShares)
        external
        override
        nonReentrant
    {
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

        IMarket(access.marketContract).mintOrBurn(true, tokenId, _amount, address(this));
        _mint(_to, _id, _amount, "");
    }


    /**
     * @notice see IMedia1155
     */
    function auctionTransfer(uint256[] calldata tokenId, uint256[] calldata amount, address recipient)
        external
        override
    {
        require(
            msg.sender == access.marketContract,
            // remove revert string before deployment to mainnet
            'Media: only market contract'
        );
        // tokens.previousTokenOwners[tokenId] = ownerOf(tokenId);.
    }

    /**
     * @notice see IMedia1155
     */
    function setAsk(uint256 tokenId, IMarket.Ask calldata ask)
        external
        override
        nonReentrant
        onlyApprovedOrOwner(msg.sender, tokenId)
        onlyExistingToken(tokenId)
    {
        IMarket(access.marketContract).setAsk(tokenId, ask);
    }

    /**
     * @notice see IMedia1155
     */
    function batchSetAsk(uint256[] calldata tokenId, IMarket.Ask calldata ask)
        external
        override
        nonReentrant
        onlyApprovedOrOwner(msg.sender, tokenId)
        onlyExistingToken(tokenId)
    {

    }

    /**
     * @notice see IMedia11551155
     */
    function removeAsk(uint256 tokenId)
        external
        override
        nonReentrant
        onlyApprovedOrOwner(msg.sender, tokenId)
        onlyExistingToken(tokenId)
    {
        IMarket(access.marketContract).removeAsk(tokenId);
    }

    /**
     * @notice see IMedia11551155
     */
    function batchRemoveAsk(uint256[] calldata tokenId)
        external
        override
        nonReentrant
        onlyApprovedOrOwner(msg.sender, tokenId)
        onlyExistingToken(tokenId)
    {
        
    }

    /**
     * @notice see IMedia1155
     */
    function setBid(uint256 tokenId, IMarket.Bid calldata bid)
        external
        override
        nonReentrant
        onlyExistingToken(tokenId)
    {
        require(msg.sender == bid.bidder, 'Market: Bidder must be msg sender');
        IMarket(access.marketContract).setBid(tokenId, bid, msg.sender);
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
        IMarket(access.marketContract).removeBid(tokenId, msg.sender);
    }

    /**
     * @notice see IMedia1155
     */
    function acceptBid(uint256 tokenId, IMarket.Bid memory bid)
        public
        override
        nonReentrant
        onlyApprovedOrOwner(msg.sender, tokenId)
        onlyExistingToken(tokenId)
    {
        IMarket(access.marketContract).acceptBid(address(this), tokenId, bid);
    }

    /**
     * @notice Burn a token.
     * @dev Only callable if the media owner is also the creator.
     * @param tokenId the ID of the token to burn
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
            'Media: owner is not creator of media'
        );

        _burn(tokenId);
    }

    /**
     * @notice Burn a batch of tokens.
     * @dev Only callable if the media owner is also the creator.
     * @param tokenId the list of IDs of the tokens to burn
     */
    function batchBurn(uint256[] calldata tokenId)
        external
        override
        nonReentrant
        onlyExistingToken(tokenId)
        onlyApprovedOrOwner(msg.sender, tokenId)
    {

    }

    /**
     * @notice Revoke the approvals for a token. The provided `approve` function is not sufficient
     * for this protocol, as it does not allow an approved address to revoke it's own approval.
     * In instances where a 3rd party is interacting on a user's behalf via `permit`, they should
     * revoke their approval once their task is complete as a best practice.
     */
    function revokeApproval(uint256 tokenId)
        external
        override
        onlyApprovedOrOwner(msg.sender, tokenId)
        nonReentrant
    {
        _approve(address(0), tokenId);
    }

    /**
     * @notice Revoke the approvals for a token. The provided `approve` function is not sufficient
     * for this protocol, as it does not allow an approved address to revoke it's own approval.
     * In instances where a 3rd party is interacting on a user's behalf via `permit`, they should
     * revoke their approval once their task is complete as a best practice.
     */
    function batchRevokeApproval(uint256 tokenId)
        external
        override
        onlyApprovedOrOwner(msg.sender, tokenId)
        nonReentrant
    {
        // _approve(address(0), tokenId);
    }

    /**
     * @notice see IMedia1155
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
     * @notice Destroys `tokenId`.
     * @dev We modify the OZ _burn implementation to
     * maintain metadata and to remove the
     * previous token owner from the piece
     */
    function _burn(uint256 tokenId)
        internal
        override(ERC721URIStorageUpgradeable, ERC721Upgradeable)
    {
        ERC721URIStorageUpgradeable._burn(tokenId);

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
        IMarket(access.marketContract).removeAsk(tokenId);

        ERC721Upgradeable._transfer(from, to, tokenId);
    }
}
