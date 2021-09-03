pragma solidity ^0.8.4;

import {MediaGettersLib} from './libraries/MediaGettersLib.sol';
import {MediaStorage} from './libraries/MediaStorage.sol';

/// @title A title that should describe the contract/interface
/// @author The name of the author
/// @notice Explain to an end user what this does
/// @dev Explain to a developer any extra details
contract MediaGetter {
    using MediaGettersLib for MediaStorage.Tokens;

    MediaStorage.Tokens tokens;

    function getTokenCreators(uint256 _tokenId) public view returns (address creator) {
        creator = tokens.getTokenCreators(_tokenId);
    }

    function getPreviousTokenOwners(uint256 _tokenId) public view returns (address prevOwner) {
        prevOwner = tokens.getPreviousTokenOwners(_tokenId);
    }

    function getTokenContentHashes(uint256 _tokenId) public view returns (bytes32 contentHash) {
        contentHash = tokens.getTokenContentHashes(_tokenId);
    }

}
