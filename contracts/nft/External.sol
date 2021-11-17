import {IMarket} from './interfaces/IMarket.sol';
import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import {ZapMedia} from './ZapMedia.sol';
import {ZapMarket} from './ZapMarket.sol';

library External {
    function configureExternalToken(
        address tokenAddress,
        uint256 tokenId,
        IMarket.BidShares memory _bidShares
    ) external returns (bool success) {
        require(
            IERC721(tokenAddress).ownerOf(tokenId) == msg.sender,
            'MediaFactory: Only token owner can configure to ZapMarket'
        );

        if (!(zapMarket.isRegistered(tokenAddress))) {
            zapMarket.registerMedia(tokenAddress);
        } else {
            require(
                zapMarket.isInternal(tokenAddress),
                'This operation is meant for external NFTs'
            );
        }

        if (!(zapMarket.isConfigured(tokenAddress))) {
            bytes memory name_b = bytes(ERC721(tokenAddress).name());
            bytes memory symbol_b = bytes(ERC721(tokenAddress).symbol());

            bytes32 name_b32;
            bytes32 symbol_b32;

            assembly {
                name_b32 := mload(add(name_b, 32))
                symbol_b32 := mload(add(symbol_b, 32))
            }

            zapMarket.configure(
                msg.sender,
                tokenAddress,
                name_b32,
                symbol_b32,
                false
            );
        }

        zapMarket.setBidShares(tokenAddress, tokenId, _bidShares);

        emit ExternalTokenDeployed(tokenAddress);

        return true;
    }
}
