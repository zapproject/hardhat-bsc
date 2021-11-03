import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/introspection/ERC165StorageUpgradeable.sol'; // exposes _registerInterface
import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

import {Ownable} from '../Ownable.sol';
import {MediaGetter} from '../MediaGetter.sol';

contract BadMedia is
    ERC721BurnableUpgradeable,
    ReentrancyGuardUpgradeable,
    Ownable,
    MediaGetter,
    ERC721URIStorageUpgradeable,
    ERC721EnumerableUpgradeable,
    ERC165StorageUpgradeable
{
    uint256 private counter;
    
    function initialize (
        string calldata name,
        string calldata symbol,
        address marketContractAddr,
        bool permissive,
        string calldata _collectionMetadata
    ) external initializer {
        __ERC721_init(name, symbol);
        initialize();
        access.marketContract = marketContractAddr;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal 
      override (ERC721EnumerableUpgradeable, ERC721Upgradeable) {
        super._beforeTokenTransfer(
            from,
            to,
            tokenId
        );
    }

    function _burn(uint256 tokenId) 
        internal
        override(ERC721URIStorageUpgradeable, ERC721Upgradeable)
    {
        super._burn(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(
            ERC721EnumerableUpgradeable,
            ERC721Upgradeable,
            ERC165StorageUpgradeable
        )

        returns(bool)
     {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721URIStorageUpgradeable, ERC721Upgradeable)
        returns (string memory)
    {
        return ERC721URIStorageUpgradeable.tokenURI(tokenId);
    }

    function mint() public onlyOwner {
        _safeMint(msg.sender, counter);

        counter = counter + 1;
    }
}