// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

//import {SafeMathUpgradeable} from '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import {IERC721Upgradeable} from '@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol';
import {IERC20Upgradeable} from '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import {SafeERC20Upgradeable} from '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';
import {Initializable} from '@openzeppelin/contracts/proxy/utils/Initializable.sol';
import {Decimal} from '../Decimal.sol';
import {ZapMediaV2} from './ZapMediaV2.sol';
import {IMediaV2} from './IMediaV2.sol';
import {Media1155} from '../Media1155.sol';
import {IMarketV2} from './IMarketV2.sol';
import {Ownable} from '../access/Ownable.sol';
import 'hardhat/console.sol';

/**
 * @title A Market for pieces of media
 * @notice This contract contains all of the market logic for Media
 */
contract ZapMarketV2 is IMarketV2, Ownable {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    /* *******
     * Globals
     * *******
     */

    // Address of the media contract that can call this market
    mapping(address => address[]) public mediaContracts;

    // Mapping from media address to a bool showing whether or not
    // they're registered by the media factory
    mapping(address => bool) public registeredMedias;

    // registered media factory address
    address mediaFactory;

    // Mapping from token to mapping from bidder to bid
    mapping(address => mapping(uint256 => mapping(address => Bid)))
        private _tokenBidders;

    // Mapping from token to the bid shares for the token
    mapping(address => mapping(uint256 => BidShares)) private _bidShares;

    // Mapping from token to the current ask for the token
    mapping(address => mapping(uint256 => Ask)) private _tokenAsks;

    // Mapping from Media address to the Market configuration status
    mapping(address => bool) public isConfigured;

    // Mapping of token ids of accepted bids to their mutex
    mapping(uint256 => bool) private bidMutex;

    address platformAddress;

    IMarketV2.PlatformFee platformFee;

    mapping(address => mapping(address => mapping(uint256 => Ask)))
        private _tokenAsks1155;

    /* *********
     * Modifiers
     * *********
     */

    /**
     * @notice require that the msg.sender is the configured media contract
     */
    modifier onlyMediaCaller() {
        require(
            isConfigured[msg.sender] == true,
            'Market: Only media contract'
        );

        _;
    }

    modifier onlyMediaFactory() {
        require(
            msg.sender == mediaFactory,
            'Market: Only the media factory can do this action'
        );
        _;
    }

    modifier isUnlocked(uint256 tokenId) {
        require(!bidMutex[tokenId], 'There is a bid transaction in progress');
        bidMutex[tokenId] = true;
        _;
        bidMutex[tokenId] = false;
    }

    /* ****************
     * View Functions
     * ****************
     */
    function bidForTokenBidder(
        address mediaContractAddress,
        uint256 tokenId,
        address bidder
    ) external view override returns (Bid memory) {
        return _tokenBidders[mediaContractAddress][tokenId][bidder];
    }

    function currentAskForToken(
        address mediaContractAddress,
        address owner,
        uint256 tokenId
    ) external override returns (Ask memory) {
        if (IMediaV2(mediaContractAddress).supportsInterface(0xd9b67a26)) {
            return _tokenAsks1155[mediaContractAddress][owner][tokenId];
        }
        return _tokenAsks[mediaContractAddress][tokenId];
    }

    function bidSharesForToken(address mediaContractAddress, uint256 tokenId)
        public
        view
        override
        returns (BidShares memory)
    {
        return _bidShares[mediaContractAddress][tokenId];
    }

    /**
     * @notice Validates that the bid is valid by ensuring that the bid amount can be split perfectly into all the bid shares.
     *  We do this by comparing the sum of the individual share values with the amount and ensuring they are equal. Because
     *  the splitShare function uses integer division, any inconsistencies with the original and split sums would be due to
     *  a bid splitting that does not perfectly divide the bid amount.
     */
    function isValidBid(
        address mediaContractAddress,
        uint256 tokenId,
        uint256 bidAmount
    ) public view override returns (bool) {
        BidShares memory bidShares = bidSharesForToken(
            mediaContractAddress,
            tokenId
        );

        require(
            isValidBidShares(bidShares),
            'Market: Invalid bid shares for token'
        );

        uint256 collabShareValue = 0;
        Decimal.D256 memory thisCollabsShare;
        thisCollabsShare.value = 0;
        for (uint256 i = 0; i < bidShares.collaborators.length; i++) {
            thisCollabsShare.value = bidShares.collabShares[i];

            collabShareValue =
                collabShareValue +
                (splitShare(thisCollabsShare, bidAmount));
        }

        return
            bidAmount != 0 &&
            (bidAmount ==
                splitShare(bidShares.creator, bidAmount) +
                    (collabShareValue) +
                    (splitShare(platformFee.fee, bidAmount)) +
                    (splitShare(bidShares.owner, bidAmount)));
    }

    /**
     * @notice Validates that the provided bid shares sum to 100
     */
    function isValidBidShares(BidShares memory bidShares)
        public
        view
        override
        returns (bool)
    {
        uint256 collabSharePerc = 0;

        for (uint256 i = 0; i < bidShares.collaborators.length; i++) {
            collabSharePerc = collabSharePerc + (bidShares.collabShares[i]);
        }

        return
            bidShares.creator.value +
                (collabSharePerc) +
                (bidShares.owner.value) +
                (platformFee.fee.value) ==
            uint256(100) * (Decimal.BASE);
    }

    /**
     * @notice return a % of the specified amount. This function is used to split a bid into shares
     * for a media's shareholders.
     */
    function splitShare(Decimal.D256 memory sharePercentage, uint256 amount)
        public
        pure
        override
        returns (uint256)
    {
        return Decimal.mul(amount, sharePercentage) / (100);
    }

    /* ****************
     * Public Functions
     * ****************
     */

    function initializeMarket(address _platformAddress) public initializer {
        owner = msg.sender;

        platformAddress = _platformAddress;
    }

    function isRegistered(address mediaContractAddress)
        public
        view
        override
        returns (bool)
    {
        return (registeredMedias[mediaContractAddress]);
    }

    function setMediaFactory(address _mediaFactory)
        external
        override
        onlyOwner
    {
        mediaFactory = _mediaFactory;
    }

    function viewFee() public view returns (Decimal.D256 memory) {
        return platformFee.fee;
    }

    function setFee(IMarketV2.PlatformFee memory newFee) public onlyOwner {
        platformFee = newFee;
    }

    /**
     * @notice Sets the media contract address. This address is the only permitted address that
     * can call the mutable functions. This method can only be called once.
     */

    function configure(
        address deployer,
        address mediaContract,
        bytes32 name,
        bytes32 symbol
    ) external override onlyMediaFactory {
        require(
            isConfigured[mediaContract] != true,
            'Market: Already configured'
        );

        require(
            mediaContract != address(0) && deployer != address(0),
            'Market: cannot set media contract as zero address'
        );

        isConfigured[mediaContract] = true;

        mediaContracts[deployer].push(mediaContract);

        emit MediaContractCreated(mediaContract, name, symbol);
    }

    function mintOrBurn(
        bool isMint,
        uint256 tokenId,
        address mediaContract
    ) external override {
        require(msg.sender == mediaContract, 'Market: Media only function');

        if (isMint == true) {
            emit Minted(tokenId, mediaContract);
        } else {
            emit Burned(tokenId, mediaContract);
        }
    }

    function mintOrBurnBatch(
        bool isMint,
        uint256[] calldata tokenId,
        uint256[] calldata amount,
        address mediaContract
    ) external {
        require(msg.sender == mediaContract, 'Market: Media only function');

        if (isMint == true) {
            emit MintedBatch(tokenId, amount, mediaContract);
        } else {
            emit BurnedBatch(tokenId, amount, mediaContract);
        }
    }

    function registerMedia(address mediaContract)
        external
        override
        onlyMediaFactory
    {
        registeredMedias[mediaContract] = true;
    }

    function revokeRegistration(address mediaContract)
        external
        override
        onlyOwner
    {
        registeredMedias[mediaContract] = false;
    }

    /**
     * @notice Sets bid shares for a particular tokenId. These bid shares must
     * sum to 100.
     */
    function setBidShares(uint256 tokenId, BidShares memory bidShares)
        public
        override
        onlyMediaCaller
    {
        require(
            isValidBidShares(bidShares),
            'Market: Invalid bid shares, must sum to 100'
        );

        _bidShares[msg.sender][tokenId] = bidShares;
        emit BidShareUpdated(tokenId, bidShares, msg.sender);
    }

    /**
     * @notice Sets the ask on a particular media. If the ask cannot be evenly split into the media's
     * bid shares, this reverts.
     */
    function setAsk(
        address owner,
        uint256 tokenId,
        Ask memory ask
    ) public override onlyMediaCaller {
        require(
            isValidBid(msg.sender, tokenId, ask.amount),
            'Market: Ask invalid for share splitting'
        );

        _tokenAsks[msg.sender][tokenId] = ask;
        emit AskCreated(msg.sender, tokenId, ask);
    }

    /**
     * @notice Sets the ask on a particular media. If the ask cannot be evenly split into the media's
     * bid shares, this reverts.
     */
    function setAskBatch(
        address owner,
        uint256[] calldata tokenId,
        Ask[] calldata ask
    ) external override onlyMediaCaller {
        require(
            tokenId.length == ask.length,
            'Market: TokenId and Ask arrays do not have the same length'
        );

        for (uint256 i = 0; i < tokenId.length; i++) {
            require(
                isValidBid(msg.sender, tokenId[i], ask[i].amount),
                'Market: Ask invalid for share splitting'
            );

            _tokenAsks1155[msg.sender][owner][tokenId[i]] = ask[i];
        }

        emit AskCreatedBatch(msg.sender, tokenId, ask);
    }

    /**
     * @notice removes an ask for a token and emits an AskRemoved event
     */
    function removeAsk(address owner, uint256 tokenId)
        external
        override
        onlyMediaCaller
    {
        // emit AskRemoved(
        //     tokenId,
        //     _tokenAsks[msg.sender][owner][tokenId],
        //     msg.sender
        // );
        // delete _tokenAsks[msg.sender][owner][tokenId];
    }

    /**
     * @notice removes specified asks for a specified token and emits AskRemoved event
     */
    function removeAskBatch(address owner, uint256[] calldata tokenId)
        external
        override
        onlyMediaCaller
    {
        Ask[] memory ask = new Ask[](tokenId.length);

        // for (uint256 i = 0; i < tokenId.length; i++) {
        //     ask[i] = _tokenAsks[msg.sender][owner][tokenId[i]];
        //     delete _tokenAsks[msg.sender][owner][tokenId[i]];
        // }

        emit AskRemovedBatch(tokenId, ask, msg.sender);
    }

    /**
     * @notice Sets the bid on a particular media for a bidder. The token being used to bid
     * is transferred from the spender to this contract to be held until removed or accepted.
     * If another bid already exists for the bidder, it is refunded.
     */
    function setBid(
        address mediaAddress,
        uint256 tokenId,
        Bid memory bid,
        address spender,
        address owner
    ) public override onlyMediaCaller {
        BidShares memory bidShares = _bidShares[msg.sender][tokenId];

        require(
            bidShares.creator.value + (bid.sellOnShare.value) <=
                uint256(100) * (Decimal.BASE),
            'Market: Sell on fee invalid for share splitting'
        );
        require(bid.bidder != address(0), 'Market: bidder cannot be 0 address');
        require(bid.amount != 0, 'Market: cannot bid amount of 0');
        require(
            bid.currency != address(0),
            'Market: bid currency cannot be 0 address'
        );
        require(
            bid.recipient != address(0),
            'Market: bid recipient cannot be 0 address'
        );

        Bid storage existingBid = _tokenBidders[msg.sender][tokenId][
            bid.bidder
        ];

        // If there is an existing bid, refund it before continuing
        if (existingBid.amount > 0) {
            removeBid(tokenId, bid.bidder);
        }

        IERC20Upgradeable token = IERC20Upgradeable(bid.currency);

        // We must check the balance that was actually transferred to the market,
        // as some tokens impose a transfer fee and would not actually transfer the
        // full amount to the market, resulting in locked funds for refunds & bid acceptance

        uint256 beforeBalance = token.balanceOf(address(this));

        token.safeTransferFrom(spender, address(this), bid.amount);

        require(
            token.balanceOf(address(this)) == beforeBalance + bid.amount,
            'Market: Market balance did not increase from bid'
        );

        _tokenBidders[msg.sender][tokenId][bid.bidder] = Bid(
            bid.amount,
            bid.currency,
            bid.bidder,
            bid.recipient,
            bid.sellOnShare
        );

        emit BidCreated(msg.sender, tokenId, bid);
        // If a bid meets the criteria for an ask, automatically accept the bid.
        // If no ask is set or the bid does not meet the requirements, ignore.
        if (
            _tokenAsks1155[msg.sender][owner][tokenId].currency != address(0) &&
            bid.currency ==
            _tokenAsks1155[msg.sender][owner][tokenId].currency &&
            bid.amount >= _tokenAsks1155[msg.sender][owner][tokenId].amount
        ) {
            // Finalize exchange
            if (IMediaV2(mediaAddress).supportsInterface(0xd9b67a26)) {
                _finalizeNFTTransfer1155(
                    msg.sender,
                    tokenId,
                    bid.bidder,
                    owner
                );
            } else {
                _finalizeNFTTransfer(msg.sender, tokenId, bid.bidder);
            }
        }
    }

    /**
     * @notice Removes the bid on a particular media for a bidder. The bid amount
     * is transferred from this contract to the bidder, if they have a bid placed.
     */
    function removeBid(uint256 tokenId, address bidder)
        public
        override
        onlyMediaCaller
        isUnlocked(tokenId)
    {
        Bid storage bid = _tokenBidders[msg.sender][tokenId][bidder];
        uint256 bidAmount = bid.amount;
        address bidCurrency = bid.currency;

        require(bid.amount > 0, 'Market: cannot remove bid amount of 0');

        IERC20Upgradeable token = IERC20Upgradeable(bidCurrency);

        emit BidRemoved(tokenId, bid, msg.sender);
        delete _tokenBidders[msg.sender][tokenId][bidder];
        token.safeTransfer(bidder, bidAmount);
    }

    /**
     * @notice Accepts a bid from a particular bidder. Can only be called by the media contract.
     * See {_finalizeNFTTransfer}
     * Provided bid must match a bid in storage. This is to prevent a race condition
     * where a bid may change while the acceptBid call is in transit.
     * A bid cannot be accepted if it cannot be split equally into its shareholders.
     * This should only revert in rare instances (example, a low bid with a zero-decimal token),
     * but is necessary to ensure fairness to all shareholders.
     */
    function acceptBid(
        address mediaContractAddress,
        uint256 tokenId,
        Bid calldata expectedBid,
        address owner
    ) external override onlyMediaCaller isUnlocked(tokenId) {
        Bid memory bid = _tokenBidders[mediaContractAddress][tokenId][
            expectedBid.bidder
        ];
        require(bid.amount > 0, 'Market: cannot accept bid of 0');
        require(
            bid.amount == expectedBid.amount &&
                bid.currency == expectedBid.currency &&
                bid.sellOnShare.value == expectedBid.sellOnShare.value &&
                bid.recipient == expectedBid.recipient,
            'Market: Unexpected bid found.'
        );

        require(
            isValidBid(mediaContractAddress, tokenId, bid.amount),
            'Market: Bid invalid for share splitting'
        );

        if (IMediaV2(mediaContractAddress).supportsInterface(0xd9b67a26)) {
            _finalizeNFTTransfer1155(
                mediaContractAddress,
                tokenId,
                bid.bidder,
                owner
            );
        } else {
            _finalizeNFTTransfer(mediaContractAddress, tokenId, bid.bidder);
        }
    }

    /**
     * @notice Given a token ID and a bidder, this method transfers the value of
     * the bid to the shareholders. It also transfers the ownership of the media
     * to the bid recipient. Finally, it removes the accepted bid and the current ask.
     */
    function _finalizeNFTTransfer(
        address mediaContractAddress,
        uint256 tokenId,
        address bidder
    ) private {
        Bid memory bid = _tokenBidders[mediaContractAddress][tokenId][bidder];
        BidShares storage bidShares = _bidShares[mediaContractAddress][tokenId];

        IERC20Upgradeable token = IERC20Upgradeable(bid.currency);

        // Transfer bid share to owner of media
        token.safeTransfer(
            IERC721Upgradeable(mediaContractAddress).ownerOf(tokenId),
            splitShare(bidShares.owner, bid.amount)
        );

        // Transfer bid share to creator of media
        token.safeTransfer(
            ZapMediaV2(mediaContractAddress).getTokenCreators(tokenId),
            splitShare(bidShares.creator, bid.amount)
        );

        uint256 collaboratorShares = 0;

        Decimal.D256 memory thisCollabsShare;
        thisCollabsShare.value = 0;
        // Transfer bid share to the remaining media collaborators
        for (uint256 i = 0; i < bidShares.collaborators.length; i++) {
            collaboratorShares =
                collaboratorShares +
                (bidShares.collabShares[i]);

            thisCollabsShare.value = bidShares.collabShares[i];

            token.safeTransfer(
                bidShares.collaborators[i],
                splitShare(thisCollabsShare, bid.amount)
            );
        }
        // Transfer bid share to previous owner of media (if applicable)
        token.safeTransfer(
            // ZapMediaV2(mediaContractAddress).getPreviousTokenOwners(tokenId),
            platformAddress,
            splitShare(platformFee.fee, bid.amount)
        );
        // Transfer media to bid recipient
        ZapMediaV2(mediaContractAddress).auctionTransfer(
            tokenId,
            bid.recipient
        );

        // Calculate the bid share for the new owner,
        // equal to 100 - creatorShare - sellOnShare
        bidShares.owner = Decimal.D256(
            uint256(100) *
                (Decimal.BASE) -
                (collaboratorShares) -
                (_bidShares[mediaContractAddress][tokenId].creator.value) -
                (platformFee.fee.value)
        );
        // Set the previous owner share to the accepted bid's sell-on fee
        // platformFee.fee = bid.sellOnShare;

        // Remove the accepted bid
        delete _tokenBidders[mediaContractAddress][tokenId][bidder];

        emit BidShareUpdated(tokenId, bidShares, mediaContractAddress);
        emit BidFinalized(tokenId, bid, mediaContractAddress);
    }

    function _finalizeNFTTransfer1155(
        address mediaContractAddress,
        uint256 tokenId,
        address bidder,
        address owner
    ) private {
        Bid memory bid = _tokenBidders[mediaContractAddress][tokenId][bidder];
        BidShares storage bidShares = _bidShares[mediaContractAddress][tokenId];

        IERC20Upgradeable token = IERC20Upgradeable(bid.currency);

        // Transfer bid share to owner of media
        token.safeTransfer(owner, splitShare(bidShares.owner, bid.amount));

        // Transfer bid share to creator of media
        token.safeTransfer(
            Media1155(mediaContractAddress).getTokenCreators(tokenId),
            splitShare(bidShares.creator, bid.amount)
        );

        uint256 collaboratorShares = 0;

        Decimal.D256 memory thisCollabsShare;
        thisCollabsShare.value = 0;
        // Transfer bid share to the remaining media collaborators
        for (uint256 i = 0; i < bidShares.collaborators.length; i++) {
            collaboratorShares =
                collaboratorShares +
                (bidShares.collabShares[i]);

            thisCollabsShare.value = bidShares.collabShares[i];

            token.safeTransfer(
                bidShares.collaborators[i],
                splitShare(thisCollabsShare, bid.amount)
            );
        }

        // Transfer bid share to previous owner of media (if applicable)
        token.safeTransfer(
            // ZapMediaV2(mediaContractAddress).getPreviousTokenOwners(tokenId),
            platformAddress,
            splitShare(platformFee.fee, bid.amount)
        );

        // Transfer media to bid recipient
        Media1155(mediaContractAddress).auctionTransfer(
            tokenId,
            1,
            bid.recipient,
            owner
        );

        // Calculate the bid share for the new owner,
        // equal to 100 - creatorShare - sellOnShare
        bidShares.owner = Decimal.D256(
            uint256(100) *
                (Decimal.BASE) -
                (collaboratorShares) -
                (_bidShares[mediaContractAddress][tokenId].creator.value) -
                (platformFee.fee.value)
        );
        // Set the previous owner share to the accepted bid's sell-on fee
        // platformFee.fee = bid.sellOnShare;

        // Remove the accepted bid
        delete _tokenBidders[mediaContractAddress][tokenId][bidder];

        emit BidShareUpdated(tokenId, bidShares, mediaContractAddress);
        emit BidFinalized(tokenId, bid, mediaContractAddress);
    }
}
