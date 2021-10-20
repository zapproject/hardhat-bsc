# ZapMedia
This contract is a media value system. it interacts with ZapMarket and the AuctionHouse contracts to provide a perpetual equity to its creators. This contract allows for the minting, burning, and transferral of ERC721 tokens utilizing a market owned by the creator.

## Modifiers
### onlyExistingToken(uint256)
Require that the token has not been burned and has been minted
|Arguments| Type | Description|
|------|------|------|
|`tokenId` | `uint256` | The Identifier for a specific ERC721|
### onlyTokenWithContentHash(uint256)
Require that the token has had a content hash set
|Arguments| Type | Description|
|------|------|------|
|`tokenId` | `uint256` | The Identifier for a specific ERC721|
### onlyTokenWithMetadataHash(uint256)
Require that the token has had a metadata hash set
|Arguments| Type | Description|
|------|------|------|
|`tokenId` | `uint256` | The Identifier for a specific ERC721|
### onlyApprovedOrOwner(address, uint256)
Ensure that the provided spendder is approved or the owner of the media for the specified tokenID
|Arguments| Type | Description|
|------|------|------|
|`spender`| `address` | Usually the msg.sender address; whoever is spending for the specific transaction|
|`tokenId` | `uint256` | The Identifier for a specific ERC721|
### onlyTokenCreated(uint256)
Ensure that the ttoken has been created, even if it had been burned
|Arguments| Type | Description|
|------|------|------|
|`tokenId` | `uint256` | The Identifier for a specific ERC721|
### onlyValidURI(string memory)
Ensure that the provided URI is not empty
|Arguments| Type | Description|
|------|------|------|
|`uri` | `string memory` | Uniform Resource Identifier to be validated|

## Methods

### initialize(string calldata, string calldata, address, bool, string calldata)
Creates the initial ERC721, establishes the ZapMarket, and registers an interface based on the generated interface ID.
|Arguments| Type | Description|
|------|------|------|
|`name`|`string calldata`| Name of the proposed media|
|`symbol`|`string calldata`| Symbol for the proposed media|
|`marketContractAddr`|`address`| Address of the relevant ZapMarket|
|`permissive`|`bool`| Allows the creator to mint more media tokens |
|`_collectionMetadata`|`string calldata`| Sets the public collection metadata|

### supportsInterface(bytes4)
Returns a boolean showing whether or not the given interfaceID is supported
|Arguments| Type | Description|
|------|------|------|
|`interfaceID`|`bytes4`| a bytes4 formatted representation of a contract interface. Id to be validated|

### tokenURI(uint256)
Returns the URI for a particular piece of media with the specified tokenID
|Arguments| Type | Description|
|------|------|------|
|`tokenID`|`uint256`| Token whose URI is to be fetched|

### _registerInterface
Sets an interface ID to be supported
|Arguments| Type | Description|
|------|------|------|
|`interfaceID`|`bytes4`| Interface ID to be registered|
### _beforeTokenTransfer(address, address, uint256)
TokenTransfer hook function
|Arguments| Type | Description|
|------|------|------|
|`to`|`address`| Current token owner. If this is the zero address, the token will be minted for `to`|
|`from`|`address`| Destination Address. If this is the zero address, the token will be burned|
|`tokenID`|`uint256`| Token ID to be transferred|
## View Functions
### tokenMetadataURI
Return the metadata URI for a piece of media given the token URI
|Arguments| Type | Description|
|------|------|------|
|`tokenID`|`uint256`| the token whose metadata will be attached |
## Public Functions
### mint(MediaData memory, IMarket.bidshares memory)
Mint new media for msg.sender.
|Arguments| Type | Description|
|------|------|------|
|`data`|`MediaData memory`|The media's metadata and content data, includes content and metadata hash, and token's URI|
|`bidShares`|`IMarket.BidShares memory`| The share percentages of the owners and creators of the media as determined by ZapMarket|
### mintWithSig(address, MediaData memory, IMarket.bidshares memory, EIP712Signature memory)
EIP-712 mintWithSig method. Mints new media for a creator given a valid signature.
|Arguments| Type | Description|
|------|------|------|
|`creator`|`address`|Address of media creator|
|`data`|`MediaData memory`|The media's metadata and content data, includes content and metadata hash, and token's URI|
|`bidShares`|`IMarket.BidShares memory`| The share percentages of the owners and creators of the media as determined by ZapMarket|
|`sig`|`EIP712Signature memory`|Creator's signature to be confirmed|
### auctionTransfer(uint256, address)
Transfer the token with the given ID to a given address.
|Arguments| Type | Description|
|------|------|------|
|`tokenID`|`uint256`| Token to be transferred |
|`recipient`|`address`| Address of token destination|
### setAsk(uint256, IMarket.Ask memory)
Set the ask on a piece of media
|Arguments| Type | Description|
|------|------|------|
|`tokenID`|`uint256`| The token being offered an ask |
|`ask`|`IMarket.Ask memory`| Value of ask to be set|
### removeAsk(uint256)
 Remove the ask on a piece of media
 |Arguments| Type | Description|
|------|------|------|
|`tokenID`|`uint256`| The token determine which ask to remove |
### setBid(uint256, IMarket.Ask memory)
Set the bid on a piece of media
|Arguments| Type | Description|
|------|------|------|
|`tokenID`|`uint256`| The token whose metadata will be attached |
|`bid`|`IMarket.Ask memory`| Value of bid to be set|
### removeBid(uint256)
Remove the bid on a piece of media
|Arguments| Type | Description|
|------|------|------|
|`tokenID`|`uint256`| The token whose bid is to be removed |
### acceptBid(uint256, IMarket.Ask memory)
Accept the bid on a piece of media
|Arguments| Type | Description|
|------|------|------|
|`tokenID`|`uint256`| The token whose bid is to be accepted |
|`bid`|`IMarket.Ask memory`| Value of bid to be accepted|
### burn(uint256)
Burn a token
|Arguments| Type | Description|
|------|------|------|
|`tokenID`|`uint256`| The token to burn |
### revokeApproval(uint256)
Revoke the approvals for a token. The provided `approve` function is not sufficient for this protocol, as it does not allow an approved address to revoke it's own approval. In instances where a 3rd party is interacting on a user's behalf via `permit`, they should revoke their approval once their task is complete as a best practice.
|Arguments| Type | Description|
|------|------|------|
|`tokenID`|`uint256`| The token whose approval is to be revoked |
### updateTokenURI(uint256, string calldata)
Update the token URI
|Arguments| Type | Description|
|------|------|------|
|`tokenID`|`uint256`| The token whose URI is to be updated |
|`tokenURIlocal`|`string calldata`| The URI to be updated|
### updateTokenMetadataURI(uint256, string calldata)
Update the token metadata uri
|Arguments| Type | Description|
|------|------|------|
|`tokenID`|`uint256`| the token whose metadata is to be updated |
|`metadataURI`|`string calldata`| The metadata to be updated|
### permit(address,uint256, EIP712Signature memory)
EIP-712 permit method. Sets an approved spender given a valid signature.
|Arguments| Type | Description|
|------|------|------|
|`spender`|`address`| Spender address to be approved |
|`tokenID`|`uint256`| The token to be given an approved spender|
|`sig`|`EIP712Signature`|Signature to confirm access|
## Private Functions
### _hasShares(uint256, IMarket.BidShares memory)
Returns a bool depicting whether or not the i'th collaborator has shares
|Arguments| Type | Description|
|------|------|------|
|`index`|`uint256`|the i'th collaborator|
|`bidShares`|`IMarket.BidShares memory`| The bidshares defined for the Collection's NFTs|
### _mintForCreator(address,MediaData memory, Imarket.BidShares memory)
Creates a new token for `creator`. Its token ID will be automatically  assigned (and available on the emitted {IERC721-Transfer} event), and the token URI autogenerated based on the base URI passed at construction.
|Arguments| Type | Description|
|------|------|------|
|`creator`|`address`| Creator of media token|
|`data`|MediaData|The media's metadata and content data|
|`bidShares`|`Imarket.BidShares`|The bidshares defined for the Collection's NFTs|
### _setTokenContentHash(uint256,bytes32)
Setter for tokenContentHash
|Arguments| Type | Description|
|------|------|------|
|`tokenID`|`uint256`| Token ID to set Content|
|`contentHash`|bytes32| Content Hash to be assigned to token|
### _setTokenMetadataHash(uint256,bytes32)
Setter for tokenMetadataHash
|Arguments| Type | Description|
|------|------|------|
|`tokenID`|`uint256`| Token ID to set metadata|
|`metadataHash`|`bytes32`|Metadata to be assigned to token|
### _setTokenMetadataURI(uint256,bytes32)
Setter for tokenMetadataURI
|Arguments| Type | Description|
|------|------|------|
|`tokenID`|`uint256`|Token ID to set metadata URI|
|`metaDataURI`|`bytes32`|URI to be assigned to token|
### _burn(uint256)
 Destroys `tokenId`.
 |Arguments| Type | Description|
|------|------|------|
|`tokenID`|`uint256`|ID of token to be burned|
### _transfer(address, address,uint256)
 transfer a token and remove the ask for it.   
 |Arguments| Type | Description|
|`to`|`address`| Current token owner.|
|`from`|`address`| Destination Address.|
|`tokenID`|`uint256`| Token ID to be transferred|
### _calculateDomainSeparator
Calculates EIP712 DOMAIN_SEPARATOR based on the current contract and chain ID.
|Arguments| Type | Description|
|------|------|------|
|No arguments|||