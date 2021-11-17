// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

import {OwnableUpgradeable} from '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';

import {MediaProxy} from './MediaProxy.sol';
import {Ownable} from './Ownable.sol';
import {ZapMedia} from './ZapMedia.sol';
import {ZapMarket} from './ZapMarket.sol';

/// @title Zap Media Factory Contract
/// @notice This contract deploys ZapMedia and external ERC721 contracts,
///         registers and then configures them to be used on the Zap NFT Marketplace
/// @dev It creates instances of ERC1976 MediaProxy and sets their implementation to a deployed ZapMedia
contract MediaFactory is OwnableUpgradeable {
    event MediaDeployed(address indexed mediaContract);
    event MediaUpdated(address indexed mediaContract);

    ZapMarket zapMarket;
    mapping(address=>address) proxyImplementations;

    /// @notice Contract constructor
    /// @dev utilises the OZ Initializable contract; cannot be called twice
    /// @param _zapMarket the address of the ZapMarket contract to register and configure each ERC721 on
    function initialize(address _zapMarket) external initializer {
        zapMarket = ZapMarket(_zapMarket);
    }

    /// @notice Upgrades ZapMedia contract
    /// @dev calls `upgrateTo` on the MediaProxy contract to upgrade/replace the implementation contract
    /// @param _proxy a parameter just like in doxygen (must be followed by parameter name)
    function upgradeMedia(
        address _proxy,
        address _newImpl
    ) external {
        require(
            msg.sender != address(0) && msg.sender == ZapMedia(proxyImplementations[_proxy]).getOwner(),
            "Only the owner can make this upgrade"
        );

        MediaProxy(_proxy).upgrateTo(_newImpl);
        emit MediaUpdated(_proxy);
    }

    /// @notice Deploys ZapMedia ERC721 contracts to be used on ZapMarket
    /// @dev This is the contract factory function, it deploys a proxy contract, then a ZapMedia contract,
    ///      and then sets the implementation and initializes ZapMedia
    /// @param name name of the collection
    /// @param symbol collection's symbol
    /// @param marketContractAddr ZapMarket contract to attach to, this can not be updated
    /// @param permissive whether or not you would like this contract to be minted by everyone or just the owner
    /// @param _collectionMetadata the metadata URI of the collection
    /// @return the address of the deployed ZapMedia proxy
    function deployMedia(
        string calldata name,
        string calldata symbol,
        address marketContractAddr,
        bool permissive,
        string calldata _collectionMetadata
    ) external returns (address) {
        MediaProxy proxy = new MediaProxy();
        ZapMedia zapMedia = new ZapMedia();

        proxy.initialize(address(zapMedia), payable(msg.sender), name, symbol, marketContractAddr, permissive, _collectionMetadata);
        address proxyAddress = address(proxy);

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