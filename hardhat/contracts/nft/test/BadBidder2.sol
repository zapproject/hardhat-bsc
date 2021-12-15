pragma solidity ^0.8.4;

import '../interfaces/IMedia.sol';
import '../ZapMedia.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract BadBidder2 {
    ZapMedia mediaContract;
    IERC20 tokenContract;
    uint256 tokenId;

    constructor(address _mediaContract, address _tokenContract) {
        mediaContract = ZapMedia(_mediaContract);
        tokenContract = IERC20(_tokenContract);
        tokenId = 0;
    }

    function setBid(address marketAddress, IMarket.Bid memory bid) external {
        tokenContract.approve(marketAddress, 300);
        mediaContract.setBid(tokenId, bid);
    }

    function acceptRemoveBid(IMarket.Bid memory bid) external payable {
        mediaContract.acceptBid(0, bid);
    }

    fallback() external payable {
        mediaContract.removeBid(0);
    }
}