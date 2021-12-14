// SPDX-License-Identifier: GPL-3.0

// FOR TEST PURPOSES ONLY. NOT PRODUCTION SAFE
pragma solidity ^0.8.4;
import {IAuctionHouse} from "../interfaces/IAuctionHouse.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// This contract is meant to mimic a bidding contract that does not implement on IERC721 Received,
// and thus should cause a revert when an auction is finalized with this as the winning bidder.
contract BadBidder {
    address auction;
    address zap;

    constructor(address _auction, address _zap) public {
        auction = _auction;
        zap = _zap;
    }

    function placeBid(uint256 auctionId, uint256 amount, address mediaContract, address tokenAddress) external payable {
        IERC20(tokenAddress).approve(auction, amount);
        IAuctionHouse(auction).createBid(auctionId, amount, mediaContract);
    }

    receive() external payable {}
    fallback() external payable {}
}
