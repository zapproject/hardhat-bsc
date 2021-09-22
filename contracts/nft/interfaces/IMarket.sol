// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import {Decimal} from '../Decimal.sol';

/**
 * @title Interface for Zap NFT Marketplace Protocol's Market
 */
interface IMarket {
    struct Bid {
        // Amount of the currency being bid
        uint256 amount;
        // Address to the ERC20 token being used to bid
        address currency;
        // Address of the bidder
        address bidder;
        // Address of the recipient
        address recipient;
        // % of the next sale to award the current owner
        Decimal.D256 sellOnShare;
    }

    struct Ask {
        // Amount of the currency being asked
        uint256 amount;
        // Address to the ERC20 token being asked
        address currency;
    }

    struct BidShares {
        // % of sale value that goes to the _previous_ owner of the nft
        // Decimal.D256 platformFee;
        // % of sale value that goes to the original creator of the nft
        Decimal.D256 creatorTwo;
        Decimal.D256 creator;
        // % of sale value that goes to the seller (current owner) of the nft
        Decimal.D256 owner;
    }

    struct PlatformFee {
        Decimal.D256 fee;
    }

    event BidCreated(
        address indexed mediaContract,
        uint256 indexed tokenId,
        Bid bid
    );
    event BidRemoved(uint256 indexed tokenId, Bid bid);
    event BidFinalized(uint256 indexed tokenId, Bid bid, address mediaContract);
    event AskCreated(
        address indexed mediaContract,
        uint256 indexed tokenId,
        Ask ask
    );
    event AskRemoved(uint256 indexed tokenId, Ask ask);
    event BidShareUpdated(uint256 indexed tokenId, BidShares bidShares);
    event MediaContractCreated(
        address indexed mediaContract,
        bytes32 name,
        bytes32 symbol
    );
    event Minted(uint256 indexed token, address indexed mediaContract);
    event Burned(uint256 indexed token, address indexed mediaContract);

    function bidForTokenBidder(
        address mediaContractAddress,
        uint256 tokenId,
        address bidder
    ) external view returns (Bid memory);

    function currentAskForToken(address mediaContractAddress, uint256 tokenId)
        external
        view
        returns (Ask memory);

    function bidSharesForToken(address mediaContractAddress, uint256 tokenId)
        external
        view
        returns (BidShares memory);

    function isValidBid(
        address mediaContractAddress,
        uint256 tokenId,
        uint256 bidAmount
    ) external view returns (bool);

    function isValidBidShares(BidShares calldata bidShares)
        external
        view
        returns (bool);

    function splitShare(Decimal.D256 calldata sharePercentage, uint256 amount)
        external
        pure
        returns (uint256);

    function configure(
        address deployer,
        address mediaContract,
        bytes32 name,
        bytes32 symbol
    ) external;

    function mintOrBurn(
        bool isMint,
        uint256 tokenId,
        address mediaContract
    ) external;

    function setBidShares(
        address mediaContractAddress,
        uint256 tokenId,
        BidShares calldata bidShares
    ) external;

    function setAsk(
        address mediaContractAddress,
        uint256 tokenId,
        Ask calldata ask
    ) external;

    function removeAsk(address mediaContractAddress, uint256 tokenId) external;

    function setBid(
        address mediaContractAddress,
        uint256 tokenId,
        Bid calldata bid,
        address spender
    ) external;

    function removeBid(
        address mediaContractAddress,
        uint256 tokenId,
        address bidder
    ) external;

    function acceptBid(
        address mediaContractAddress,
        uint256 tokenId,
        Bid calldata expectedBid
    ) external;
}
