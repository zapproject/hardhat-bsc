pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import {IMarketV2} from '../v2/IMarketV2.sol';

interface IMedia1155 {
    event URIUpdated(address owner, string _uri);

    function initialize(
        string calldata _uri,
        address marketContractAddr,
        bool permissive,
        string calldata collectionMetadata
    ) external;

    /**
     * @notice Mint new media for msg.sender.
     */
    function mint(
        address to,
        uint256 tokenId,
        uint256 amount,
        IMarketV2.BidShares calldata bidShares
    ) external;

    /**
     * @notice Batch mint medias with given IDs and amounts for msg.sender
     */
    function mintBatch(
        address _to,
        uint256[] calldata _tokenId,
        uint256[] calldata _amount,
        IMarketV2.BidShares[] calldata bidShares
    ) external;

    /**
     * @notice Transfer the token with the given ID to a given address.
     * Save the previous owner before the transfer, in case there is a sell-on fee.
     * @dev This can only be called by the auction contract specified at deployment
     */
    function auctionTransfer(
        uint256 tokenId,
        uint256 amount,
        address recipient,
        address owner
    ) external;

    /**
     * @notice Transfer the tokens with the given IDs and amount to a given address.
     * Save the previous owners before the transfer, in case there is a sell-on fee.
     */
    function batchAuctionTransfer(
        uint256[] calldata tokenId,
        uint256[] calldata amount,
        address recipient,
        address owner
    ) external;

    /**
     * @notice Set the ask on a piece of media
     */
    function setAsk(
        uint256 tokenId,
        IMarketV2.Ask calldata ask,
        address owner
    ) external;

    /**
     * @notice Set the ask on the medias of given IDs
     */
    function setAskBatch(
        uint256[] calldata tokenId,
        IMarketV2.Ask[] calldata ask,
        address owner
    ) external;

    /**
     * @notice Remove the ask on a piece of media
     */
    function removeAsk(uint256 tokenId, address owner) external;

    /**
     * @notice Remove the ask on medias of given IDs
     */
    function removeAskBatch(uint256[] calldata tokenId, address owner) external;

    /**
     * @notice Set the bid on a piece of media
     */
    function setBid(
        uint256 tokenId,
        IMarketV2.Bid calldata bid,
        address owner
    ) external;

    /**
     * @notice Remove the bid on a piece of media
     */
    function removeBid(uint256 tokenId) external;

    function acceptBid(
        uint256 tokenId,
        uint256 amount,
        IMarketV2.Bid calldata bid,
        address owner
    ) external;

    /**
     * @notice Burn a piece of media
     */
    function burn(
        uint256 tokenId,
        uint256 amount,
        address owner
    ) external;

    /**
     * @notice Burn a batch of media
     */
    function burnBatch(
        uint256[] calldata tokenId,
        uint256[] calldata amount,
        address owner
    ) external;
}
