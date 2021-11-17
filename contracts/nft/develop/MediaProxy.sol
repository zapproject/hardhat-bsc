// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import {ERC1967UpgradeUpgradeable} from '@openzeppelin/contracts-upgradeable/proxy/ERC1967/ERC1967UpgradeUpgradeable.sol';
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

/// @title A title that should describe the contract/interface
/// @author The name of the author
/// @notice Explain to an end user what this does
/// @dev Explain to a developer any extra details
contract MediaProxy is ERC1967UpgradeUpgradeable {

    modifier onlyAdmin() {
        require(msg.sender == _getAdmin());
        _;
    }

    function initialize(
        address implementation,
        address payable owner,
        string calldata name,
        string calldata symbol,
        address marketContractAddr,
        bool permissive,
        string calldata collectionURI
    ) public {
        _upgradeToAndCall(
            implementation,
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

        (bool success, bytes memory returndata) = implementation.delegatecall(
            abi.encodeWithSignature("initTransferOwnership(address)", owner)
        );

        require(
            success && returndata.length == 0,
            "Creating ZapMedia proxy: Can not transfer ownership of proxy"
        );

    }

    function changeAdmin(address newAdmin) external onlyAdmin {
        _changeAdmin(newAdmin);
    }

    function upgrateTo(address _impl) external onlyAdmin {
        _upgradeTo(_impl);
    }

    function upgradeToAndCall(address _impl, bytes memory data) external onlyAdmin{
        _upgradeToAndCall(_impl, data, false);
    }

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
            _delegate(_getImplementation());
        }
    }
}
