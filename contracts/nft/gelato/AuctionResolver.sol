// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

import {Ownable} from '../access/Ownable.sol';
import {SafeMathUpgradeable} from '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';

import {IResolver} from './interfaces/IResolver.sol';
import {IAuctionHouse} from '../interfaces/IAuctionHouse.sol';

/// @title Gelato Resolver contract for the AuctionHouse
/// @notice This contract will check if conditions are met to call AuctionHouse functions
/// @dev If the described conditions are met, it returns the payload for calling the desired function
contract AuctionResolver is Ownable, IResolver{
    using SafeMathUpgradeable for uint256;

    address private auctionHouse;

    function initResolver(address _auctionHouse) public initializer {
        owner = msg.sender;
        auctionHouse = _auctionHouse;
    }

    function checker() external view override returns(bool canExec, bytes memory execPayload){
        uint256 numAuctions = IAuctionHouse(auctionHouse).getNumAuction();
        require(numAuctions > 0, "AuctionResolver: No Auction to end at this time");

        for (uint256 i = 0; i < numAuctions; i++) {

            IAuctionHouse.Auction memory auction = IAuctionHouse(auctionHouse).viewAuction(i);

            uint256 endTime = auction.firstBidTime.add(
                    auction.duration
            );

            uint256 auctionId = IAuctionHouse(auctionHouse).getAuctionId(i);

            address mediaContract = auction.token.mediaContract;

            if (block.timestamp >= endTime){
                canExec = true;
                execPayload = abi.encodeWithSelector(
                    IAuctionHouse.endAuction.selector, auctionId, mediaContract
                );
            }
        }
    }
}
