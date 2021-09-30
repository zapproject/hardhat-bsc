// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {ZapMedia} from "./ZapMedia.sol";
import {ZapMarket} from "./ZapMarket.sol";

contract MediaFactory is OwnableUpgradeable{

    event MediaDeployed(address indexed mediaContract);

    ZapMarket zapMarket;

    function initialize(address _zapMarket) initializer external {
        zapMarket = ZapMarket(_zapMarket);
    }

    function deployMedia(
        string calldata name,
        string calldata symbol,
        address marketContractAddr,
        bool permissive,
        string calldata _collectionMetadata
    ) external returns (address) {
        ZapMedia zapMedia = new ZapMedia();
        zapMedia.initialize(name, symbol, marketContractAddr, permissive, _collectionMetadata);

        zapMedia.transferOwnership(payable(msg.sender));

        zapMarket.registerMedia(address(zapMedia));

        emit MediaDeployed(address(zapMedia));

        return address(zapMedia);
    }
}
