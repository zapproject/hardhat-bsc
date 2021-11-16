// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

import {OwnableUpgradeable} from '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';

import {MediaProxy} from './MediaProxy.sol';
import {Ownable} from './Ownable.sol';
import {ZapMediaOld} from './ZapMediaOld.sol';
import {ZapMarketOld} from './ZapMarketOld.sol';

contract MediaFactoryOld is OwnableUpgradeable {
    event MediaDeployed(address indexed mediaContract);
    event MediaUpdated(address indexed mediaContract);

    ZapMarketOld zapMarket;
    mapping(address=>address) proxyImplementations;

    function initialize(address _zapMarket) external initializer {
        zapMarket = ZapMarketOld(_zapMarket);
    }

    function upgradeMedia(
        address _proxy,
        address _newImpl
    ) external {
        require(
            msg.sender == ZapMediaOld(proxyImplementations[_proxy]).getOwner(),
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
        ZapMediaOld zapMedia = new ZapMediaOld();

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


        bytes memory name_b = bytes(name);
        bytes memory symbol_b = bytes(symbol);

        bytes32 name_b32;
        bytes32 symbol_b32;

        assembly {
            name_b32 := mload(add(name_b, 32))
            symbol_b32 := mload(add(symbol_b, 32))
        }

        zapMarket.configure(msg.sender, proxyAddress, name_b32, symbol_b32);

        emit MediaDeployed(proxyAddress);

        return proxyAddress;
    }
}
