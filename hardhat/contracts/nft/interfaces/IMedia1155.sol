pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import {IMarket} from './IMarket.sol';


interface IMedia1155 {
    event TokenURIUpdated(address owner, string _uri);
    event TokenMetadataURIUpdated(address owner, string _uri);

    function initialize(
        string memory name,
        string memory symbol,
        address marketContractAddr,
        bool permissive,
        string memory collectionMetadata
    ) external;

    /**
     * @notice Return the metadata URI for a piece of media given the token URI
     */
    function tokenMetadataURI(uint256 tokenId)
        external
        view
        returns (string memory);

    /**
     * @notice Mint new media for msg.sender.
     */
    function mint(address to, uint256 tokenId, uint256 amount, IMarket.BidShares calldata bidShares)
        external;

    /**
     * @notice Batch mint medias with given IDs and amounts for msg.sender
     */
    function batchMint(uint256[] calldata tokenId, uint256[] calldata amount, IMarket.BidShares[] calldata bidShares) external;

    /**
     * @notice Transfer the token with the given ID to a given address.
     * Save the previous owner before the transfer, in case there is a sell-on fee.
     * @dev This can only be called by the auction contract specified at deployment
     */
    function auctionTransfer(uint256 tokenId, address recipient) external;

    /**
     * @notice Transfer the tokens with the given IDs and amount to a given address.
     * Save the previous owners before the transfer, in case there is a sell-on fee.
     */
    function batchAuctionTrasnfer(uint256[] calldata tokenId, uint256[] calldata amount, address recipient) external;

    /**
     * @notice Set the ask on a piece of media
     */
    function setAsk(uint256 tokenId, IMarket.Ask calldata ask) external;

    /**
     * @notice Set the ask on the medias of given IDs
     */
    function batchSetAsk(uint256[] calldata tokenId, IMarket.Ask[] calldata ask) external;

    /**
     * @notice Remove the ask on a piece of media
     */
    function removeAsk(uint256 tokenId) external;

    /**
     * @notice Remove the ask on medias of given IDs
     */
    function batchRemoveAsk(uint256[] calldata tokenId) external;

    /**
     * @notice Set the bid on a piece of media
     */
    function setBid(uint256 tokenId, IMarket.Bid calldata bid) external;

    /**
     * @notice Remove the bid on a piece of media
     */
    function removeBid(uint256 tokenId) external;

    function acceptBid(uint256 tokenId, IMarket.Bid calldata bid) external;

    /**
     * @notice Revoke approval for a piece of media
     */
    function revokeApproval(uint256 tokenId) external;
}