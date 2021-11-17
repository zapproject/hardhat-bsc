import {ERC721} from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import {ZapMarket} from './ZapMarket.sol';
import {IMarket} from './interfaces/IMarket.sol';

contract External {
    event ExternalTokenDeployed(address indexed extToken);

    function configureExternalToken(
        address tokenAddress,
        address market,
        uint256 tokenId,
        IMarket.BidShares memory _bidShares
    ) external returns (bool success) {
        ZapMarket zapMarket;
        zapMarket = ZapMarket(market);

        require(
            ERC721(tokenAddress).ownerOf(tokenId) == msg.sender,
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
            // bytes memory name_b = bytes(ERC721(tokenAddress).name());
            // bytes memory symbol_b = bytes(ERC721(tokenAddress).symbol());
            // External.getName(tokenAddress);

            bytes memory name_b = 'Test';
            bytes memory symbol_b = 'TEST';

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
