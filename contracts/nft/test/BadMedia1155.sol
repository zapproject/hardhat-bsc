// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts-upgradeable/utils/introspection/ERC165StorageUpgradeable.sol'; // exposes _registerInterface
import '@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol';
import '@openzeppelin/contracts/utils/Context.sol';
import '@openzeppelin/contracts/utils/introspection/ERC165.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

import {Ownable} from '../Ownable.sol';

/**
 * @title A media value system, with perpetual equity to creators
 * @notice This contract provides an interface to mint media with a market
 * owned by the creator.
 */
contract BadMedia1155 is
    Ownable,
    ERC1155Upgradeable,
    ReentrancyGuardUpgradeable,
    ERC165StorageUpgradeable
{
    function initialize(
        string calldata _uri,
        address marketContractAddr,
        bool permissive,
        string calldata collectionURI
    ) external initializer {
        __ERC1155_init(_uri);
        initialize_ownable();

        access.marketContract = marketContractAddr;

        // _registerInterface(0x80ac58cd); // registers old erc721 interface for AucitonHouse
        // _registerInterface(0x5b5e139f); // registers current metadata upgradeable interface for AuctionHouse
        // _registerInterface(type(IMedia1155).interfaceId);

        access.isPermissive = permissive;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155Upgradeable, ERC165StorageUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function mint(
        address _to,
        uint256 _id,
        uint256 _amount
    ) external nonReentrant {
        _mint(_to, _id, _amount, "");
    }

    function mintBatch(
        address _to,
        uint256[] calldata _tokenId,
        uint256[] calldata _amount
    ) external nonReentrant {
        _mintBatch(_to, _tokenId, _amount, "");
    }
}