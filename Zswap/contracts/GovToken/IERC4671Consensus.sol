// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "./IERC4671.sol";

interface IERC4671Consensus is IERC4671 {
    /// @notice Get voters addresses for this consensus contract
    /// @return Addresses of the voters
    function voters() external view returns (address[] memory);

    /// @notice Cast a vote to mint a token for a specific address
    /// @param owner Address for whom to mint the token
    function approveMint(address owner) external;

    /// @notice Cast a vote to invalidate a specific token
    /// @param tokenId Identifier of the token to invalidate
    function approveInvalidate(uint256 tokenId) external;
}