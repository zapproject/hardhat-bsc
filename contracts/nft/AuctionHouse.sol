// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import {SafeMathUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import {IERC721Upgradeable, IERC165Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {IERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import {SafeERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {IMarket} from "./interfaces/IMarket.sol";
import {Decimal} from "./Decimal.sol";
import {IMedia} from "./interfaces/IMedia.sol";
import {IAuctionHouse} from "./interfaces/IAuctionHouse.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";

interface IWETH {
    function deposit() external payable;

    function withdraw(uint256 wad) external;

    function transfer(address to, uint256 value) external returns (bool);
}

interface IMediaExtended is IMedia {
    function marketContract() external returns (address);
}

/**
 * @title An open auction house, enabling collectors and curators to run their own auctions
 */
contract AuctionHouse is IAuctionHouse, ReentrancyGuardUpgradeable {
    using SafeMathUpgradeable for uint256;
    using SafeERC20Upgradeable for IERC20Upgradeable;
    using Counters for Counters.Counter;

    // The minimum amount of time left in an auction after a new bid is created
    uint256 public timeBuffer;

    // The minimum percentage difference between the last bid amount and the current bid.
    uint8 public minBidIncrementPercentage;

    // / The address of the WETH contract, so that any ETH transferred can be handled as an ERC-20
    address public wethAddress;

    // A mapping of all of the auctions currently running.
    mapping(uint256 => IAuctionHouse.Auction) public auctions;

    mapping(address => mapping(uint256 => TokenDetails)) tokenDetails;

    bytes4 constant interfaceId = 0x80ac58cd; // 721 interface id

    Counters.Counter private _auctionIdTracker;

    /**
     * @notice Require that the specified auction exists
     */
    modifier auctionExists(uint256 auctionId) {
        require(_exists(auctionId), "Auction doesn't exist");
        _;
    }

    /*
     * Constructor
     */
    // constructor(address _weth) {
    //     wethAddress = _weth;
    //     timeBuffer = 15 * 60; // extend 15 minutes after every bid made in last 15 minutes
    //     minBidIncrementPercentage = 5; // 5%
    // }

    function initialize(address _weth) public initializer {
        wethAddress = _weth;
        timeBuffer = 15 * 60; // extend 15 minutes after every bid made in last 15 minutes
        minBidIncrementPercentage = 5; // 5%
    }

    function setTokenDetails(uint256 tokenId, address mediaContract)
        external
        returns (bool)
    {
        tokenDetails[mediaContract][tokenId] = TokenDetails({
            tokenId: tokenId,
            mediaContract: mediaContract
        });

        return true;
    }

    /**
     * @notice Create an auction.
     * @dev Store the auction details in the auctions mapping and emit an AuctionCreated event.
     * If there is no curator, or if the curator is the auction creator, automatically approve the auction.
     */
    function createAuction(
        uint256 tokenId,
        address mediaContract,
        uint256 duration,
        uint256 reservePrice,
        address payable curator,
        uint8 curatorFeePercentage,
        address auctionCurrency
    ) public override nonReentrant returns (uint256) {
        require(
            IERC165Upgradeable(mediaContract).supportsInterface(interfaceId),
            "tokenContract does not support ERC721 interface"
        );
        require(
            curatorFeePercentage < 100,
            "curatorFeePercentage must be less than 100"
        );
        address tokenOwner = IERC721Upgradeable(mediaContract).ownerOf(tokenId);

        require(
            msg.sender ==
                IERC721Upgradeable(mediaContract).getApproved(tokenId) ||
                msg.sender == tokenOwner,
            "Caller must be approved or owner for token id"
        );
        uint256 auctionId = _auctionIdTracker.current();

        auctions[auctionId] = Auction({
            token: tokenDetails[mediaContract][tokenId],
            approved: false,
            amount: 0,
            duration: duration,
            firstBidTime: 0,
            reservePrice: reservePrice,
            curatorFeePercentage: curatorFeePercentage,
            tokenOwner: tokenOwner,
            bidder: payable(address(0)),
            curator: curator,
            auctionCurrency: auctionCurrency
        });

        IERC721Upgradeable(mediaContract).transferFrom(
            tokenOwner,
            address(this),
            tokenId
        );

        _auctionIdTracker.increment();

        emit AuctionCreated(
            auctionId,
            tokenId,
            mediaContract,
            duration,
            reservePrice,
            tokenOwner,
            curator,
            curatorFeePercentage,
            auctionCurrency
        );

        if (
            auctions[auctionId].curator == address(0) || curator == tokenOwner
        ) {
            _approveAuction(auctionId, true);
        }

        return auctionId;
    }

    /**
     * @notice Approve an auction, opening up the auction for bids.
     * @dev Only callable by the curator. Cannot be called if the auction has already started.
     */
    function setAuctionApproval(uint256 auctionId, bool approved)
        external
        override
        auctionExists(auctionId)
    {
        require(
            msg.sender == auctions[auctionId].curator,
            "Must be auction curator"
        );
        require(
            auctions[auctionId].firstBidTime == 0,
            "Auction has already started"
        );
        _approveAuction(auctionId, approved);
    }

    function setAuctionReservePrice(uint256 auctionId, uint256 reservePrice)
        external
        override
        auctionExists(auctionId)
    {
        require(
            msg.sender == auctions[auctionId].curator ||
                msg.sender == auctions[auctionId].tokenOwner,
            "Must be auction curator or token owner"
        );
        require(
            auctions[auctionId].firstBidTime == 0,
            "Auction has already started"
        );

        auctions[auctionId].reservePrice = reservePrice;

        emit AuctionReservePriceUpdated(
            auctionId,
            auctions[auctionId].token.tokenId,
            auctions[auctionId].token.mediaContract,
            reservePrice
        );
    }

    /**
     * @notice Create a bid on a token, with a given amount.
     * @dev If provided a valid bid, transfers the provided amount to this contract.
     * If the auction is run in native ETH, the ETH is wrapped so it can be identically to other
     * auction currencies in this contract.
     */
    function createBid(
        uint256 auctionId,
        uint256 amount,
        address mediaContract
    ) external payable override auctionExists(auctionId) nonReentrant {
        address payable lastBidder = auctions[auctionId].bidder;
        require(
            auctions[auctionId].approved,
            "Auction must be approved by curator"
        );
        require(
            auctions[auctionId].firstBidTime == 0 ||
                block.timestamp <
                auctions[auctionId].firstBidTime.add(
                    auctions[auctionId].duration
                ),
            "Auction expired"
        );
        require(
            amount >= auctions[auctionId].reservePrice,
            "Must send at least reservePrice"
        );
        require(
            amount >=
                auctions[auctionId].amount.add(
                    auctions[auctionId]
                        .amount
                        .mul(minBidIncrementPercentage)
                        .div(100)
                ),
            "Must send more than last bid by minBidIncrementPercentage amount"
        );

        require(
            IERC165Upgradeable(mediaContract).supportsInterface(interfaceId),
            "Doesn't support NFT interface"
        );

        // For Zap NFT Marketplace Protocol, ensure that the bid is valid for the current bidShare configuration
        if (auctions[auctionId].token.mediaContract == mediaContract) {
            require(
                IMarket(IMediaExtended(mediaContract).marketContract())
                    .isValidBid(
                        mediaContract,
                        auctions[auctionId].token.tokenId,
                        amount
                    ),
                "Bid invalid for share splitting"
            );
        }

        // If this is the first valid bid, we should set the starting time now.
        // If it's not, then we should refund the last bidder
        if (auctions[auctionId].firstBidTime == 0) {
            auctions[auctionId].firstBidTime = block.timestamp;
        } else if (lastBidder != address(0)) {
            _handleOutgoingBid(
                lastBidder,
                auctions[auctionId].amount,
                auctions[auctionId].auctionCurrency
            );
        }

        _handleIncomingBid(amount, auctions[auctionId].auctionCurrency);

        auctions[auctionId].amount = amount;
        auctions[auctionId].bidder = payable(msg.sender);

        bool extended = false;
        // at this point we know that the timestamp is less than start + duration (since the auction would be over, otherwise)
        // we want to know by how much the timestamp is less than start + duration
        // if the difference is less than the timeBuffer, increase the duration by the timeBuffer
        if (
            auctions[auctionId]
                .firstBidTime
                .add(auctions[auctionId].duration)
                .sub(block.timestamp) < timeBuffer
        ) {
            // Playing code golf for gas optimization:
            // uint256 expectedEnd = auctions[auctionId].firstBidTime.add(auctions[auctionId].duration);
            // uint256 timeRemaining = expectedEnd.sub(block.timestamp);
            // uint256 timeToAdd = timeBuffer.sub(timeRemaining);
            // uint256 newDuration = auctions[auctionId].duration.add(timeToAdd);
            uint256 oldDuration = auctions[auctionId].duration;
            auctions[auctionId].duration = oldDuration.add(
                timeBuffer.sub(
                    auctions[auctionId].firstBidTime.add(oldDuration).sub(
                        block.timestamp
                    )
                )
            );
            extended = true;
        }

        emit AuctionBid(
            auctionId,
            auctions[auctionId].token.tokenId,
            auctions[auctionId].token.mediaContract,
            msg.sender,
            amount,
            lastBidder == address(0), // firstBid boolean
            extended
        );

        if (extended) {
            emit AuctionDurationExtended(
                auctionId,
                auctions[auctionId].token.tokenId,
                auctions[auctionId].token.mediaContract,
                auctions[auctionId].duration
            );
        }
    }

    /**
     * @notice End an auction, finalizing the bid on Zap NFT Marketplace if applicable and paying out the respective parties.
     * @dev If for some reason the auction cannot be finalized (invalid token recipient, for example),
     * The auction is reset and the NFT is transferred back to the auction creator.
     */
    function endAuction(uint256 auctionId, address mediaContract)
        external
        override
        auctionExists(auctionId)
        nonReentrant
    {
        require(
            uint256(auctions[auctionId].firstBidTime) != 0,
            "Auction hasn't begun"
        );
        require(
            block.timestamp >=
                auctions[auctionId].firstBidTime.add(
                    auctions[auctionId].duration
                ),
            "Auction hasn't completed"
        );

        address currency = auctions[auctionId].auctionCurrency == address(0)
            ? wethAddress
            : auctions[auctionId].auctionCurrency;
        uint256 curatorFee = 0;

        uint256 tokenOwnerProfit = auctions[auctionId].amount;

        if (auctions[auctionId].token.mediaContract == mediaContract) {
            // If the auction is running on mediaContract, settle it on the protocol
            (
                bool success,
                uint256 remainingProfit
            ) = _handleZapAuctionSettlement(auctionId, mediaContract);
            tokenOwnerProfit = remainingProfit;
            if (success != true) {
                _handleOutgoingBid(
                    auctions[auctionId].bidder,
                    auctions[auctionId].amount,
                    auctions[auctionId].auctionCurrency
                );
                _cancelAuction(auctionId);
                return;
            }
        } else {
            // Otherwise, transfer the token to the winner and pay out the participants below
            try
                IERC721Upgradeable(auctions[auctionId].token.mediaContract)
                    .safeTransferFrom(
                        address(this),
                        auctions[auctionId].bidder,
                        auctions[auctionId].token.tokenId
                    )
            {} catch {
                _handleOutgoingBid(
                    auctions[auctionId].bidder,
                    auctions[auctionId].amount,
                    auctions[auctionId].auctionCurrency
                );
                _cancelAuction(auctionId);
                return;
            }
        }

        if (auctions[auctionId].curator != address(0)) {
            curatorFee = tokenOwnerProfit
                .mul(auctions[auctionId].curatorFeePercentage)
                .div(100);
            tokenOwnerProfit = tokenOwnerProfit.sub(curatorFee);
            _handleOutgoingBid(
                auctions[auctionId].curator,
                curatorFee,
                auctions[auctionId].auctionCurrency
            );
        }
        _handleOutgoingBid(
            auctions[auctionId].tokenOwner,
            tokenOwnerProfit,
            auctions[auctionId].auctionCurrency
        );

        emit AuctionEnded(
            auctionId,
            auctions[auctionId].token.tokenId,
            auctions[auctionId].token.mediaContract,
            auctions[auctionId].tokenOwner,
            auctions[auctionId].curator,
            auctions[auctionId].bidder,
            tokenOwnerProfit,
            curatorFee,
            currency
        );
        delete auctions[auctionId];
    }

    /**
     * @notice Cancel an auction.
     * @dev Transfers the NFT back to the auction creator and emits an AuctionCanceled event
     */
    function cancelAuction(uint256 auctionId)
        external
        override
        nonReentrant
        auctionExists(auctionId)
    {
        require(
            auctions[auctionId].tokenOwner == msg.sender ||
                auctions[auctionId].curator == msg.sender,
            "Can only be called by auction creator or curator"
        );
        require(
            uint256(auctions[auctionId].firstBidTime) == 0,
            "Can't cancel an auction once it's begun"
        );
        _cancelAuction(auctionId);
    }

    /**
     * @dev Given an amount and a currency, transfer the currency to this contract.
     * If the currency is ETH (0x0), attempt to wrap the amount as WETH
     */
    function _handleIncomingBid(uint256 amount, address currency) internal {
        // If this is an ETH bid, ensure they sent enough and convert it to WETH under the hood

        if (currency == address(0)) {
            require(
                msg.value == amount,
                "Sent ETH Value does not match specified bid amount"
            );

            IWETH(wethAddress).deposit{value: amount}();
        } else {
            // We must check the balance that was actually transferred to the auction,
            // as some tokens impose a transfer fee and would not actually transfer the
            // full amount to the market, resulting in potentally locked funds
            IERC20Upgradeable token = IERC20Upgradeable(currency);
            uint256 beforeBalance = token.balanceOf(address(this));
            token.safeTransferFrom(msg.sender, address(this), amount);
            uint256 afterBalance = token.balanceOf(address(this));
            require(
                beforeBalance.add(amount) == afterBalance,
                "Token transfer call did not transfer expected amount"
            );
        }
    }

    function _handleOutgoingBid(
        address to,
        uint256 amount,
        address currency
    ) internal {
        // If the auction is in ETH, unwrap it from its underlying WETH and try to send it to the recipient.
        if (currency == address(0)) {
            IWETH(wethAddress).withdraw(amount);

            // If the ETH transfer fails (sigh), rewrap the ETH and try send it as WETH.
            if (!_safeTransferETH(to, amount)) {
                IWETH(wethAddress).deposit{value: amount}();
                IERC20Upgradeable(wethAddress).safeTransfer(to, amount);
            }
        } else {
            IERC20Upgradeable(currency).safeTransfer(to, amount);
        }
    }

    function _safeTransferETH(address to, uint256 value)
        internal
        returns (bool)
    {
        (bool success, ) = to.call{value: value}(new bytes(0));
        return success;
    }

    function _cancelAuction(uint256 auctionId) internal {
        address tokenOwner = auctions[auctionId].tokenOwner;
        IERC721Upgradeable(auctions[auctionId].token.mediaContract)
            .safeTransferFrom(
                address(this),
                tokenOwner,
                auctions[auctionId].token.tokenId
            );

        emit AuctionCanceled(
            auctionId,
            auctions[auctionId].token.tokenId,
            auctions[auctionId].token.mediaContract,
            tokenOwner
        );
        delete auctions[auctionId];
    }

    function _approveAuction(uint256 auctionId, bool approved) internal {
        auctions[auctionId].approved = approved;
        emit AuctionApprovalUpdated(
            auctionId,
            auctions[auctionId].token.tokenId,
            auctions[auctionId].token.mediaContract,
            approved
        );
    }

    function _exists(uint256 auctionId) internal view returns (bool) {
        return auctions[auctionId].tokenOwner != address(0);
    }

    function _handleZapAuctionSettlement(
        uint256 auctionId,
        address mediaContract
    ) internal returns (bool, uint256) {
        address currency = auctions[auctionId].auctionCurrency == address(0)
            ? wethAddress
            : auctions[auctionId].auctionCurrency;

        IMarket.Bid memory bid = IMarket.Bid({
            amount: auctions[auctionId].amount,
            currency: currency,
            bidder: address(this),
            recipient: auctions[auctionId].bidder,
            sellOnShare: Decimal.D256(0)
        });

        IERC20Upgradeable(currency).approve(
            IMediaExtended(mediaContract).marketContract(),
            bid.amount
        );
        IMedia(mediaContract).setBid(auctions[auctionId].token.tokenId, bid);
        uint256 beforeBalance = IERC20Upgradeable(currency).balanceOf(
            address(this)
        );
        try
            IMedia(mediaContract).acceptBid(
                auctions[auctionId].token.tokenId,
                bid
            )
        {} catch {
            // If the underlying NFT transfer here fails, we should cancel the auction and refund the winner
            IMediaExtended(mediaContract).removeBid(
                auctions[auctionId].token.tokenId
            );
            return (false, 0);
        }
        uint256 afterBalance = IERC20Upgradeable(currency).balanceOf(
            address(this)
        );

        // We have to calculate the amount to send to the token owner here in case there was a
        // sell-on share on the token
        return (true, afterBalance.sub(beforeBalance));
    }

    // TODO: consider reverting if the message sender is not WETH
    receive() external payable {}

    fallback() external payable {}
}
