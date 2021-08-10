// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract ZapAuction is IERC721Receiver {
    struct AuctionInfo {
        address seller;
        uint256 price;
        uint256 duration;
        uint256 maxBid;
        address maxBidUser;
        uint256 tokenId;
        bool isActive;
        uint256[] bidAmounts;
        address[] users;
    }

    mapping(address => mapping(uint256 => AuctionInfo)) public tokenToAuction;

    // Array with all token ids, used for enumeration
    mapping(address => uint256[]) private _allTokenAuctions;

    // Mapping from token id to position in the allTokens array
    mapping(address => mapping(uint256 => uint256))
        private _allTokenAuctionsIndex;

    mapping(address => mapping(uint256 => mapping(address => uint256)))
        public bids;

    function tokenAuctionSupply(address _nft) public view returns (uint256) {
        return _allTokenAuctions[_nft].length;
    }

    function tokenAuctionIdByIndex(address _nft, uint256 index)
        public
        view
        returns (uint256)
    {
        require(
            index < tokenAuctionSupply(_nft),
            "ERC721Enumerable: global index out of bounds"
        );
        return _allTokenAuctions[_nft][index];
    }

    /**
     * @dev See {IERC721Enumerable-tokenByIndex}.
     */
    function tokenAuctionByIndex(address _nft, uint256 index)
        public
        view
        returns (AuctionInfo memory)
    {
        uint256 tokenId = tokenAuctionIdByIndex(_nft, index);
        return getTokenAuctionDetails(_nft, tokenId);
    }

    // function tokenAuctionIdByLength(
    //     address _nft,
    //     uint256 _start,
    //     uint256 _length
    // ) external view returns (uint256[] memory ids) {
    //     require(_start < tokenAuctionSupply(_nft), "Enumerable: global index out of bounds");
    //     ids = new uint256[](_length);
    //     uint256 listingIndex;
    //     for (uint256 index = _start; index < _start + _length; index++) {
    //         if (tokenAuctionSupply(_nft) <= index) {
    //           break;
    //         }
    //         ids[listingIndex] = tokenAuctionIdByIndex(_nft, index);
    //         listingIndex++;
    //     }
    //     assembly {
    //         mstore(ids, listingIndex)
    //     }
    // }

    function tokenAuctionByLength(
        address _nft,
        uint256 _start,
        uint256 _length
    ) external view returns (AuctionInfo[] memory items) {
        require(
            _start < tokenAuctionSupply(_nft),
            "Enumerable: global index out of bounds"
        );
        items = new AuctionInfo[](_length);
        uint256 listingIndex;
        for (uint256 index = _start; index < _start + _length; index++) {
            if (tokenAuctionSupply(_nft) <= index) {
                break;
            }
            items[listingIndex] = tokenAuctionByIndex(_nft, index);
            listingIndex++;
        }
        assembly {
            mstore(items, listingIndex)
        }
    }

    function _addTokenToAllTokensEnumeration(address _nft, uint256 tokenId)
        private
    {
        _allTokenAuctionsIndex[_nft][tokenId] = _allTokenAuctions[_nft].length;
        _allTokenAuctions[_nft].push(tokenId);
    }

    function _removeTokenFromAllTokensEnumeration(address _nft, uint256 tokenId)
        private
    {
        // To prevent a gap in the tokens array, we store the last token in the index of the token to delete, and
        // then delete the last slot (swap and pop).
        uint256 lastTokenAuctionIndex = _allTokenAuctions[_nft].length - 1;
        uint256 tokenAuctionIndex = _allTokenAuctionsIndex[_nft][tokenId];

        // When the token to delete is the last token, the swap operation is unnecessary. However, since this occurs so
        // rarely (when the last minted token is burnt) that we still do the swap here to avoid the gas cost of adding
        // an 'if' statement (like in _removeTokenFromOwnerEnumeration)
        uint256 lastTokenAuctionId = _allTokenAuctions[_nft][
            lastTokenAuctionIndex
        ];

        _allTokenAuctions[_nft][tokenAuctionIndex] = lastTokenAuctionId; // Move the last token to the slot of the to-delete token
        _allTokenAuctionsIndex[_nft][lastTokenAuctionId] = tokenAuctionIndex; // Update the moved token's index

        // This also deletes the contents at the last position of the array
        delete _allTokenAuctionsIndex[_nft][tokenId];
        _allTokenAuctions[_nft].pop();
    }

    /**
       Seller puts the item on auction
    */
    function createTokenAuction(
        address _nft,
        uint256 _tokenId,
        uint256 _price,
        uint256 _duration
    ) external {
        require(msg.sender != address(0), "Invalid Address");
        require(_nft != address(0), "Invalid Account");
        require(_price > 0, "Price should be more than 0");
        require(_duration > 0, "Invalid duration value");
        AuctionInfo memory auctionInfo = AuctionInfo({
            seller: msg.sender,
            price: uint256(_price),
            duration: _duration,
            maxBid: 0,
            maxBidUser: address(0),
            isActive: true,
            tokenId: _tokenId,
            bidAmounts: new uint256[](0),
            users: new address[](0)
        });
        address owner = msg.sender;
        ERC721(_nft).safeTransferFrom(owner, address(this), _tokenId);
        tokenToAuction[_nft][_tokenId] = auctionInfo;
        _addTokenToAllTokensEnumeration(_nft, _tokenId);
    }

    /**
       Users bid for a particular nft, the max bid is compared and set if the current bid id highest
    */
    function bid(address _nft, uint256 _tokenId) external payable {
        AuctionInfo storage auctionInfo = tokenToAuction[_nft][_tokenId];
        require(
            msg.value >= auctionInfo.price,
            "bid price is less than current price"
        );
        require(auctionInfo.isActive, "auction not active");
        require(
            auctionInfo.duration > block.timestamp,
            "Deadline already passed"
        );
        if (bids[_nft][_tokenId][msg.sender] > 0) {
            (bool success, ) = msg.sender.call{
                value: bids[_nft][_tokenId][msg.sender]
            }("");
            require(success);
        }
        bids[_nft][_tokenId][msg.sender] = msg.value;
        if (auctionInfo.bidAmounts.length == 0) {
            auctionInfo.maxBid = msg.value;
            auctionInfo.maxBidUser = msg.sender;
        } else {
            uint256 lastIndex = auctionInfo.bidAmounts.length - 1;
            require(
                auctionInfo.bidAmounts[lastIndex] < msg.value,
                "Current max bid is higher than your bid"
            );
            auctionInfo.maxBid = msg.value;
            auctionInfo.maxBidUser = msg.sender;
        }
        auctionInfo.users.push(msg.sender);
        auctionInfo.bidAmounts.push(msg.value);
    }

    /**
       Called by the seller when the auction duration is over the hightest bid user get's the nft and other bidders get eth back
    */
    function executeSale(address _nft, uint256 _tokenId) external {
        AuctionInfo storage auctionInfo = tokenToAuction[_nft][_tokenId];
        require(
            auctionInfo.duration <= block.timestamp,
            "Deadline did not pass yet"
        );
        require(auctionInfo.seller == msg.sender, "Not seller");
        require(auctionInfo.isActive, "auction not active");
        auctionInfo.isActive = false;
        if (auctionInfo.bidAmounts.length == 0) {
            ERC721(_nft).safeTransferFrom(
                address(this),
                auctionInfo.seller,
                _tokenId
            );
        } else {
            (bool success, ) = auctionInfo.seller.call{
                value: auctionInfo.maxBid
            }("");
            require(success);
            for (uint256 i = 0; i < auctionInfo.users.length; i++) {
                address user = auctionInfo.users[i];
                if (
                    user != auctionInfo.maxBidUser &&
                    bids[_nft][_tokenId][user] > 0
                ) {
                    (success, ) = user.call{value: bids[_nft][_tokenId][user]}(
                        ""
                    );
                    require(success);
                    bids[_nft][_tokenId][user] = 0;
                }
            }
            ERC721(_nft).safeTransferFrom(
                address(this),
                auctionInfo.maxBidUser,
                _tokenId
            );
        }
        _removeTokenFromAllTokensEnumeration(_nft, _tokenId);
    }

    /**
       Called by the seller if they want to cancel the auction for their nft so the bidders get back the locked eeth and the seller get's back the nft
    */
    function cancelAuction(address _nft, uint256 _tokenId) external {
        AuctionInfo storage auctionInfo = tokenToAuction[_nft][_tokenId];
        require(auctionInfo.seller == msg.sender, "Not seller");
        require(auctionInfo.isActive, "auction not active");
        auctionInfo.isActive = false;
        bool success;
        for (uint256 i = 0; i < auctionInfo.users.length; i++) {
            address user = auctionInfo.users[i];
            if (bids[_nft][_tokenId][user] > 0) {
                (success, ) = user.call{value: bids[_nft][_tokenId][user]}("");
                require(success);
                bids[_nft][_tokenId][user] = 0;
            }
        }
        ERC721(_nft).safeTransferFrom(
            address(this),
            auctionInfo.seller,
            _tokenId
        );
        _removeTokenFromAllTokensEnumeration(_nft, _tokenId);
    }

    function getTokenAuctionDetails(address _nft, uint256 _tokenId)
        public
        view
        returns (AuctionInfo memory)
    {
        AuctionInfo memory auctionInfo = tokenToAuction[_nft][_tokenId];
        return auctionInfo;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return
            bytes4(
                keccak256("onERC721Received(address,address,uint256,bytes)")
            );
    }

    receive() external payable {}
}
