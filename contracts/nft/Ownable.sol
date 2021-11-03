// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import {MediaStorage} from "./libraries/MediaStorage.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Ownable is Initializable {
    event OwnershipTransferred(address indexed previousOwner,address indexed newOwner);

    MediaStorage.Access internal access;

    /// @dev The Ownable constructor sets the original `access.owner` of the contract to the sender account.
    function _init_ownable() internal {
        access.owner = msg.sender;
    }

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

    /// @dev Allows the current access.owner to transfer control of the contract to a newOwner.
    /// @param newOwner The address to transfer ownership to.
    function transferOwnership(address payable newOwner) public onlyOwner {
        require(newOwner != address(0));
        emit OwnershipTransferred(access.owner, newOwner);
        access.owner = newOwner;
    }
}
