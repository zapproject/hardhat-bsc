// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "./IERC4671.sol";

interface IERC4671Enumerable is IERC4671 {
    /// @return Total number of tokens emitted by the contract
    function total() external view returns (uint256);

    /// @notice Get the tokenId of a token using its position in the owner's list
    /// @param owner Address for whom to get the token
    /// @param index Index of the token
    /// @return tokenId of the token
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
}