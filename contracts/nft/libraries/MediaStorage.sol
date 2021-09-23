// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;
import {Counters} from '@openzeppelin/contracts/utils/Counters.sol';
import {EnumerableSet} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';

/// @title A title that should describe the contract/interface
/// @author The name of the author
/// @notice Explain to an end user what this does
/// @dev Explain to a developer any extra details
library MediaStorage {
    using EnumerableSet for EnumerableSet.UintSet;
    using Counters for Counters.Counter;

    /* *******
     * Globals
     * *******
     */

    struct Tokens {
        // Mapping from token to previous owner of the token
        mapping(uint256 => address) previousTokenOwners;
        // Mapping from token id to creator address
        mapping(uint256 => address) tokenCreators;
        // Mapping from token id to sha256 hash of content
        mapping(uint256 => bytes32) tokenContentHashes;
        // Mapping from token id to sha256 hash of metadata
        mapping(uint256 => bytes32) tokenMetadataHashes;
    }

    struct Access {
        // Address for the market
        address marketContract;
        address owner;
        // Mapping from Media address to whether or not to allow permissive minting
        bool isPermissive;
        // Mapping from creator address to their (enumerable) set of created tokens
        mapping(address => EnumerableSet.UintSet) _creatorTokens;
        // Mapping from contentHash to bool
        mapping(bytes32 => bool) _contentHashes;
        // Mapping from address to token id to permit nonce
        mapping(address => mapping(uint256 => uint256)) permitNonces;
        // Mapping from address to mint with sig nonce
        mapping(address => uint256) mintWithSigNonces;
        // Mapping from address to boolean; can this address mint?
        mapping(address => bool) approvedToMint;
        // Mapping from token id to metadataURI
        mapping(uint256 => string) _tokenMetadataURIs;
        Counters.Counter _tokenIdTracker;
    }
}
