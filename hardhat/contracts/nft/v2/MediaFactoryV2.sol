// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import {OwnableUpgradeable} from '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import {UpgradeableBeacon} from '@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol';
import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import {MediaProxy} from '../MediaProxy.sol';
import {ZapMediaV2} from './ZapMediaV2.sol';
import {IMarketV2} from './IMarketV2.sol';
import 'hardhat/console.sol';

interface IERC721Extended {
    function name() external view returns (string memory);

    function symbol() external view returns (string memory);
}

/// @title Zap Media Factory Contract
/// @notice This contract deploys ZapMedia and external ERC721 contracts,
///         registers and then configures them to be used on the Zap NFT Marketplace
/// @dev It creates instances of ERC1976 MediaProxy and sets their implementation to a deployed ZapMedia
contract MediaFactoryV2 is OwnableUpgradeable {
    event MediaDeployed(address indexed mediaContract);
    event ExternalTokenDeployed(address indexed extToken);

    IMarketV2 zapMarket;
    address beacon;

    /// @notice Contract constructor
    /// @dev utilises the OZ Initializable contract; cannot be called twice
    /// @param _zapMarket the address of the ZapMarket contract to register and configure each ERC721 on
    /// @param zapMediaInterface the address of the uninitialized ZapMedia contract
    ///        to be passed to the Beacon constructor argument
    function initialize(address _zapMarket, address zapMediaInterface)
        external
        initializer
    {
        __Ownable_init();
        zapMarket = IMarketV2(_zapMarket);
        beacon = address(new UpgradeableBeacon(zapMediaInterface));
        UpgradeableBeacon(beacon).transferOwnership(address(this));
    }

    /// @notice Upgrades ZapMedia contract
    /// @dev calls `upgrateTo` on the Beacon contract to upgrade/replace the implementation contract
    function upgradeMedia(address newInterface) external onlyOwner {
        require(
            msg.sender != address(0),
            'The zero address can not make contract calls'
        );
        UpgradeableBeacon(beacon).upgradeTo(newInterface);
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

        proxy.initialize(
            beacon,
            payable(msg.sender),
            name,
            symbol,
            marketContractAddr,
            permissive,
            _collectionMetadata
        );

        address proxyAddress = address(proxy);

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
