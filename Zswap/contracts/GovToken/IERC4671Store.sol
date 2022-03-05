// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "./IERC165.sol";

interface IERC4671Store is IERC165 {
    // Event emitted when a IERC4671Enumerable contract is added to the owner's records
    event Added(address owner, address token);

    // Event emitted when a IERC4671Enumerable contract is removed from the owner's records
    event Removed(address owner, address token);

    /// @notice Add a IERC4671Enumerable contract address to the caller's record
    /// @param token Address of the IERC4671Enumerable contract to add
    function add(address token) external;

    /// @notice Remove a IERC4671Enumerable contract from the caller's record
    /// @param token Address of the IERC4671Enumerable contract to remove
    function remove(address token) external;

    /// @notice Get all the IERC4671Enumerable contracts for a given owner
    /// @param owner Address for which to retrieve the IERC4671Enumerable contracts
    function get(address owner) external view returns (address[] memory);
}