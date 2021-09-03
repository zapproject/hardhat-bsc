// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import {MediaStorage} from "./libraries/MediaStorage.sol";

contract Ownable {
    event OwnershipTransferred(address indexed previousOwner,address indexed newOwner);

    MediaStorage.Access access;

    /// @dev The Ownable constructor sets the original `access.owner` of the contract to the sender account.
    constructor() public { access.owner = msg.sender; }

    function getOwner() external view returns (address) {
        return access.owner;
    }

    /// @dev Throws if called by any contract other than latest designated caller
    modifier onlyOwner() {
        require(msg.sender == access.owner);
        _;
    }

    function approveToMint(address toApprove) external {
        require(msg.sender == access.owner);
        access.approvedToMint[toApprove] = true;
    }

    /// @dev Allows the current access.owner to transfer control of the contract to a newOwner.
    /// @param newOwner The address to transfer ownership to.
    function transferOwnership(address payable newOwner) public onlyOwner {
        require(newOwner != address(0));
        emit OwnershipTransferred(access.owner, newOwner);
        access.owner = newOwner;
    }
}
