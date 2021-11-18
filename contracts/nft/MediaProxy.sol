// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import {ERC1967UpgradeUpgradeable} from '@openzeppelin/contracts-upgradeable/proxy/ERC1967/ERC1967UpgradeUpgradeable.sol';
import {IBeacon} from '@openzeppelin/contracts/proxy/beacon/IBeacon.sol';

/// @title Upgradeable proxy contract for a ZapMedia
/// @notice This contract acts as a proxy that delegates calls for ZapMedia.
///         it stores the ZapMedia implementation address which can be upgraded by the admin
/// @dev Implements the OpenZeppelin ERC1967UpgradeUpgradeable contract
contract MediaProxy is ERC1967UpgradeUpgradeable {

    modifier onlyAdmin() {
        require(msg.sender == _getAdmin(), "Only the Admin can call this function");
        _;
    }

    /// @notice Constructor for the ZapMedia proxy and its implementation
    /// @dev This function is initializable and implements the OZ Initializable contract by inheiritance
    /// @param beacon the address of the Beacon contract which has the implementation contract address
    /// @param owner the intended owner of the ZapMedia contract
    /// @param name name of the collection
    /// @param symbol collection's symbol
    /// @param marketContractAddr ZapMarket contract to attach to, this can not be updated
    /// @param permissive whether or not you would like this contract to be minted by everyone or just the owner
    /// @param collectionURI the metadata URI of the collection
    function initialize(
        address beacon,
        address payable owner,
        string calldata name,
        string calldata symbol,
        address marketContractAddr,
        bool permissive,
        string calldata collectionURI
    ) public {
        _upgradeBeaconToAndCall(
            beacon,
            abi.encodeWithSignature(
                "initialize(string,string,address,bool,string)",
                name,
                symbol,
                marketContractAddr,
                permissive,
                collectionURI
            ),
            false
        );

        _changeAdmin(msg.sender);

        (bool success, bytes memory returndata) = (IBeacon(beacon).implementation()).delegatecall(
            abi.encodeWithSignature("initTransferOwnership(address)", owner)
        );

        require(
            success && returndata.length == 0,
            "Creating ZapMedia proxy: Can not transfer ownership of proxy"
        );

    }

    /// @notice Changes the admin contract of this ERC1967 contract
    /// @dev This is a wrapper function for the ERC1967 _changeAdmin function and uses a modifier
    ///      to ensure that only the current admin contract can change the admin
    /// @param newAdmin the address of the new admin contract
    function changeAdmin(address newAdmin) external onlyAdmin {
        _changeAdmin(newAdmin);
    }

    /// @notice Get the owner of the ZapMedia implementation
    /// @dev This makes a `delegatecall`, which means that __the `owner` is stored in this proxy's state__
    /// @param _impl address of the implementation which has the getOwner function bytecode
    /// @return _implOwner address of this ZapMedia's owner
    function getImplOwner(address _impl) public onlyAdmin returns (address _implOwner){
        (bool success, bytes memory returndata) = _impl.delegatecall(
            abi.encodeWithSignature("getOwner()")
        );

        require(success && returndata.length > 0, "Can not get the owner of this ZapMedia");
        _implOwner = abi.decode(returndata, (address));
    }

    function _delegate(address _impl) internal virtual {
        assembly {
            calldatacopy(0, 0, calldatasize())

            let result := delegatecall(
                gas(),
                _impl,
                0,
                calldatasize(),
                0,
                0
            )

            // Copy the returned data.
            returndatacopy(0, 0, returndatasize())

            switch result
                // delegatecall returns 0 on error.
                case 0 {
                    revert(0, returndatasize())
                }
                default {
                    return(0, returndatasize())
                }
            }
    }

    fallback() external {
        // ensures that the call is always made to the implementation (ZapMedia)
        // https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies#transparent-proxies-and-function-clashes 
        if (msg.sender != _getAdmin()){
            _delegate(IBeacon(_getBeacon()).implementation());
        }
    }
}
