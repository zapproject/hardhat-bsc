// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import {MediaStorage} from "./libraries/MediaStorage.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Ownable is Initializable {
    event OwnershipTransferInitiated(
        address indexed owner,
        address indexed appointedOwner
    );
    event OwnershipTransferred(address indexed previousOwner,address indexed newOwner);

    MediaStorage.Access internal access;
    address public appointedOwner;

    /// @dev The Ownable constructor sets the original `access.owner` of the contract to the sender account.
    function _init_ownable() internal {
        access.owner = msg.sender;
    }

    function getOwner() external view returns (address) {
        return access.owner;
    }

    /// @dev Throws if called by any contract other than latest designated caller
    modifier onlyOwner() {
        require(msg.sender == access.owner,
        "onlyOwner error: Only Owner of the Contract can make this Call");
        _;
    }

    function approveToMint(address toApprove) external {
        require(msg.sender == access.owner);
        access.approvedToMint[toApprove] = true;
    }

    function getTokenMetadataURIs(uint256 _tokenId) external view returns (string memory metadataUri) {
        return access._tokenMetadataURIs[_tokenId];
    }

    function getSigNonces(address _minter) public view returns (uint256 nonce) {
        return access.mintWithSigNonces[_minter];
    }

    function getPermitNonce(address _user, uint256 _tokenId) public view returns (uint256 nonce){
        return access.permitNonces[_user][_tokenId];
    }

    function marketContract() public view returns (address) {
        return access.marketContract;
    }

    /// @dev Allows the current owner to intiate the transfer control of the contract to a newOwner.
    /// @param newOwner The address to transfer ownership to.
    function initTransferOwnership(address payable newOwner) public onlyOwner {
        require(newOwner != address(0), "Ownable: Cannot transfer to zero address");
        emit OwnershipTransferInitiated(access.owner, newOwner);
        appointedOwner = newOwner;
    }

    /// @dev Allows new owner to claim the transfer control of the contract
    function claimTransferOwnership() public {
        require(appointedOwner != address(0), "Ownable: No ownership transfer have been initiated");
        require(msg.sender == appointedOwner, "Ownable: Caller is not the appointed owner of this contract");

        emit OwnershipTransferred(access.owner, appointedOwner);
        access.owner = appointedOwner;
        appointedOwner = address(0);
    }

    /// @dev Revoke transfer and set appointed owner to 0 address
    function revokeTransferOwnership() public onlyOwner {
        appointedOwner = address(0);
    }
}
