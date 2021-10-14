// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

library Constants{

        //keccak256("Permit(address spender,uint256 tokenId,uint256 nonce,uint256 deadline)");
    bytes32 public constant PERMIT_TYPEHASH =keccak256("Permit(address spender,uint256 tokenId,uint256 nonce,uint256 deadline)");
        

    //keccak256("MintWithSig(bytes32 contentHash,bytes32 metadataHash,uint256 creatorShare,uint256 nonce,uint256 deadline)");
    bytes32 public constant MINT_WITH_SIG_TYPEHASH =keccak256("MintWithSig(bytes32 contentHash,bytes32 metadataHash,uint256 creatorShare,uint256 nonce,uint256 deadline)");
        
    bytes4 internal constant _INTERFACE_ID_ERC721_METADATA = 0x4e222e66;

}