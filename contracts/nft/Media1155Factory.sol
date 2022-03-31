// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

import {OwnableUpgradeable} from '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import {UpgradeableBeacon} from '@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol';
import {Media1155Proxy} from './Media1155Proxy.sol';
import {Media1155} from './Media1155.sol';
import {IMarketV2} from './v2/IMarketV2.sol';

/// @title Media 1155 Factory Contract
/// @notice This contract deploys Media1155 and external ERC1155 contracts,
///         registers and then configures them to be used on the Zap NFT Marketplace
/// @dev It creates instances of ERC1976 Media1155Proxy and sets their implementation to a deployed Media1155
contract Media1155Factory is OwnableUpgradeable {
    event Media1155Deployed(address indexed mediaContract);
    event ExternalTokenDeployed(address indexed extToken);

    IMarketV2 zapMarket;
    address beacon;

    /// @notice Contract constructor
    /// @dev utilises the OZ Initializable contract; cannot be called twice
    /// @param _zapMarket the address of the ZapMarket contract to register and configure each ERC721 on
    /// @param media1155Interface the address of the uninitialized Media1155 contract
    ///        to be passed to the Beacon constructor argument
    function initialize(address _zapMarket, address media1155Interface)
        external
        initializer
    {
        __Ownable_init();
        zapMarket = IMarketV2(_zapMarket);
        beacon = address(new UpgradeableBeacon(media1155Interface));
        UpgradeableBeacon(beacon).transferOwnership(address(this));
    }

    /// @notice Upgrades Media1155 contract
    /// @dev calls `upgrateTo` on the Beacon contract to upgrade/replace the implementation contract
    function upgradeMedia(address newInterface) external onlyOwner {
        require(
            msg.sender != address(0),
            'The zero address can not make contract calls'
        );
        UpgradeableBeacon(beacon).upgradeTo(newInterface);
    }

    /// @notice Deploys Media1155 ERC1155 contracts to be used on ZapMarket
    /// @dev This is the contract factory function, it deploys a proxy contract, then a ZapMedia contract,
    ///      and then sets the implementation and initializes Media1155
    /// @param uri Token uri for 1155 tokens
    /// @param marketContractAddr ZapMarket contract to attach to, this can not be updated
    /// @param permissive whether or not you would like this contract to be minted by everyone or just the owner
    /// @param _collectionMetadata the metadata URI of the collection
    /// @return the address of the deployed Media1155 proxy
    function deployMedia(
        string calldata uri,
        address marketContractAddr,
        bool permissive,
        string calldata _collectionMetadata
    ) external returns (address) {
        Media1155Proxy proxy = new Media1155Proxy();

        proxy.initialize(
            beacon,
            payable(msg.sender),
            uri,
            marketContractAddr,
            permissive,
            _collectionMetadata
        );

        address proxyAddress = address(proxy);

        zapMarket.registerMedia(proxyAddress);
    
        zapMarket.configure(msg.sender, proxyAddress, "", "");

        emit Media1155Deployed(proxyAddress);

        return proxyAddress;
    }
}
