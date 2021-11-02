// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import {Initializable} from '@openzeppelin/contracts/proxy/utils/Initializable.sol';

contract Ownable is Initializable {
    event OwnershipTransferInitiated(
        address indexed owner,
        address indexed appointedOwner
    );
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );
    address owner;
    address public appointedOwner;

    /// @dev The Ownable constructor sets the original `owner` of the contract to the sender account.

    function initialize() public virtual initializer {
        owner = msg.sender;
    }

    function getOwner() external view returns (address) {
        return owner;
    }

    /// @dev Throws if called by any contract other than latest designated caller
    modifier onlyOwner() {
        require(
            msg.sender == owner,
            'Ownable: Only owner has access to this function'
        );
        _;
    }

    /// @dev Allows the current owner to intiate the transfer control of the contract to a newOwner.
    /// @param newOwner The address to transfer ownership to.
    function initTransferOwnership(address payable newOwner) public onlyOwner {
        require(newOwner != address(0));
        emit OwnershipTransferInitiated(owner, newOwner);
        appointedOwner = newOwner;
    }

    /// @dev Allows new owner to claim the transfer control of the contract
    function claimTransferOwnership() public {
        require(appointedOwner != address(0), "No ownership transfer have been initiated");
        require(msg.sender == appointedOwner, "Caller is not the appointed owner of this contract");

        emit OwnershipTransferred(owner, appointedOwner);
        owner = appointedOwner;
        appointedOwner = address(0);
    }

    /// @dev Revoke transfer and set appointed owner to 0 address
    function revokeTransferOwnership() public onlyOwner {
        appointedOwner = address(0);
    }
}
