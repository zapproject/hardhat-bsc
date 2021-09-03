pragma solidity ^0.8.4;
import {MediaStorage} from "./MediaStorage.sol";

library MediaGettersLib {

    function getTokenCreators(MediaStorage.Tokens storage self, uint256 _tokenId) internal view returns (address creator) {
        return self.tokenCreators[_tokenId];
    }

    function getPreviousTokenOwners(MediaStorage.Tokens storage self, uint256 _tokenId) internal view returns (address prevOwner) {
        return self.previousTokenOwners[_tokenId];
    }

    function getTokenContentHashes(MediaStorage.Tokens storage self, uint256 _tokenId) internal view returns (bytes32 contentHash) {
        return self.tokenContentHashes[_tokenId];
    }
}
