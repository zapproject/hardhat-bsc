// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import '../interfaces/IMedia.sol';
import '../Media1155.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract BadBidder1155 {
    Media1155 mediaContract;
    IERC20 tokenContract;
    uint256 tokenId;

    constructor(address _mediaContract, address _tokenContract) {
        mediaContract = Media1155(_mediaContract);
        tokenContract = IERC20(_tokenContract);
        tokenId = 0;
    }

    function setBid(address marketAddress, IMarketV2.Bid memory bid, address owner) external {
        tokenContract.approve(marketAddress, 300);
        mediaContract.setBid(tokenId, bid, owner);
    }

    function acceptRemoveBid(IMarketV2.Bid memory bid, address owner) external payable {
        mediaContract.acceptBid(0, 1, bid, owner);
    }


    fallback() external payable {
        mediaContract.removeBid(0);
    }

    receive() external payable {}

    /**
     * @dev Handles the receipt of a single ERC1155 token type. This function is
     * called at the end of a `safeTransferFrom` after the balance has been updated.
     *
     * NOTE: To accept the transfer, this must return
     * `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`
     * (i.e. 0xf23a6e61, or its own function selector).
     *
     * @param operator The address which initiated the transfer (i.e. msg.sender)
     * @param from The address which previously owned the token
     * @param id The ID of the token being transferred
     * @param value The amount of tokens being transferred
     * @param data Additional data with no specified format
     * @return `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))` if transfer is allowed
     */
    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external returns (bytes4){
        return bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes32)"));
    }

    /**
     * @dev Handles the receipt of a multiple ERC1155 token types. This function
     * is called at the end of a `safeBatchTransferFrom` after the balances have
     * been updated.
     *
     * NOTE: To accept the transfer(s), this must return
     * `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`
     * (i.e. 0xbc197c81, or its own function selector).
     *
     * @param operator The address which initiated the batch transfer (i.e. msg.sender)
     * @param from The address which previously owned the token
     * @param ids An array containing ids of each token being transferred (order and length must match values array)
     * @param values An array containing amounts of each token being transferred (order and length must match ids array)
     * @param data Additional data with no specified format
     * @return `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))` if transfer is allowed
     */
    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external returns (bytes4){
        return bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes32)"));
    }
}