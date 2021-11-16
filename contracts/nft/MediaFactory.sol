// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;
import 'hardhat/console.sol';

import {OwnableUpgradeable} from '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import {MediaProxy} from './MediaProxy.sol';
import {Ownable} from './Ownable.sol';
import {ZapMedia} from './ZapMedia.sol';
import {IMarket} from './interfaces/IMarket.sol';

interface IERC721Extended {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
}

contract MediaFactory is OwnableUpgradeable {
    event MediaDeployed(address indexed mediaContract);
    event MediaUpdated(address indexed mediaContract);
    event ExternalTokenDeployed(address indexed extToken);

    IMarket zapMarket;
    mapping(address=>address) proxyImplementations;

    function initialize(address _zapMarket) external initializer {
        zapMarket = IMarket(_zapMarket);
    }

    function upgradeMedia(
        address _proxy,
        address _newImpl
    ) external {
        require(
            msg.sender == ZapMedia(proxyImplementations[_proxy]).getOwner(),
            "Only the owner can make this upgrade"
        );

        MediaProxy(_proxy).upgrateTo(_newImpl);
        emit MediaUpdated(_proxy);
    }


    function deployMedia(
        string calldata name,
        string calldata symbol,
        address marketContractAddr,
        bool permissive,
        string calldata _collectionMetadata
    ) external returns (address) {
        MediaProxy proxy = new MediaProxy();
        ZapMedia zapMedia = new ZapMedia();

        proxy.initialize(address(zapMedia), name, symbol, marketContractAddr, permissive, _collectionMetadata);
        address proxyAddress = address(proxy);

        
        (bool success, bytes memory returndata) = proxyAddress.call(
            abi.encodeWithSelector(Ownable.initTransferOwnership.selector, payable(msg.sender))
        );

        require(
            !success && returndata.length != 0,
            "Creating ZapMedia proxy: Can not transfer ownership of proxy"
        );

        proxyImplementations[proxyAddress] = address(zapMedia);

        zapMarket.registerMedia(proxyAddress);

        zapMarket.registerMedia(proxyAddress);

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
            proxyAddress,
            name_b32,
            symbol_b32,
            true
        );

        emit MediaDeployed(proxyAddress);

        return proxyAddress;
    }

    function configureExternalToken(
        address tokenAddress,
        uint256 tokenId,
        IMarket.BidShares memory _bidShares
    ) external returns (bool success) {
        require(
            IERC721(tokenAddress).ownerOf(tokenId) == msg.sender,
            'MediaFactory: Only token owner can configure to ZapMarket'
        );

        if (!(zapMarket.isRegistered(tokenAddress))) {
            zapMarket.registerMedia(tokenAddress);
        }

        if (!(zapMarket._isConfigured(tokenAddress))) {
            bytes memory name_b = bytes(IERC721Extended(tokenAddress).name());
            bytes memory symbol_b = bytes(IERC721Extended(tokenAddress).symbol());

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
