// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;
import 'hardhat/console.sol';

import {OwnableUpgradeable} from '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import {ZapMedia} from './ZapMedia.sol';
import {ZapMarket} from './ZapMarket.sol';
import {IMarket} from './interfaces/IMarket.sol';

contract MediaFactory is OwnableUpgradeable {
    event MediaDeployed(address indexed mediaContract);
    event ExternalTokenDeployed(address indexed extToken);

    ZapMarket zapMarket;

    function initialize(address _zapMarket) external initializer {
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
        zapMedia.initialize(
            name,
            symbol,
            marketContractAddr,
            permissive,
            _collectionMetadata
        );

        zapMedia.initTransferOwnership(payable(msg.sender));

        zapMarket.registerMedia(address(zapMedia));

        bytes memory name_b = bytes(name);
        bytes memory symbol_b = bytes(symbol);

        bytes32 name_b32;
        bytes32 symbol_b32;

        assembly {
            name_b32 := mload(add(name_b, 32))
            symbol_b32 := mload(add(symbol_b, 32))
        }

        zapMarket.configure(
            msg.sender,
            address(zapMedia),
            name_b32,
            symbol_b32,
            true
        );

        emit MediaDeployed(address(zapMedia));

        return address(zapMedia);
    }

    function configureExternalToken(
        string calldata name,
        string calldata symbol,
        // address marketContractAddr,
        address tokenAddress,
        uint256 tokenId,
        // bool permissive,
        // string calldata _collectionMetadata,
        IMarket.BidShares memory _bidShares
    ) external returns (bool success) {
        require(
            IERC721(tokenAddress).ownerOf(tokenId) == msg.sender,
            'MediaFactory: Only token owner can configure to ZapMarket'
        );

        if (!(zapMarket.isRegistered(tokenAddress))) {
            zapMarket.registerMedia(tokenAddress);
        }

        if (!(zapMarket.isConfigured(tokenAddress))) {
            bytes memory name_b = bytes(name);
            bytes memory symbol_b = bytes(symbol);

            bytes32 name_b32;
            bytes32 symbol_b32;

            assembly {
                name_b32 := mload(add(name_b, 32))
                symbol_b32 := mload(add(symbol_b, 32))
            }

            zapMarket.configure(
                msg.sender,
                tokenAddress,
                name_b32,
                symbol_b32,
                false
            );
        }

        zapMarket.setBidShares(tokenAddress, tokenId, _bidShares);

        emit ExternalTokenDeployed(tokenAddress);

        return true;
    }
}
