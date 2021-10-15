# Zap Hardhat Development Enviroment

## Installation

`npm install`

`npm run build`

### Build Contracts and Generate Typechain Typings

`npm run compile`

### Run Hardhat Node & Run Tasks

In order to run tasks, complete the following steps:

1. ```./start.sh``` This will run the localhost hardhat node and deploy your contracts to it.
2. Open a new terminal, ```npx hardhat --network localhost [your-task-here]```

### Run Contract Tests & Get Callstacks

`npx hardhat node`

`npm run test`


### Run Contract Tests and Generate Gas Usage Report

In one terminal run `npm`

Then in another run `npm run test -- --network localhost`

Notes:

- When running with this `localhost` option, you get a gas report but may not get good callstacks
- See [here](https://github.com/cgewecke/eth-gas-reporter#installation-and-config) for how to configure the gas usage report.

### Run Coverage Report for Tests

`npm run coverage`

Notes:

- running a coverage report currently deletes artifacts, so after each coverage run you will then need to run `npx hardhat clean` followed by `npm run build` before re-running tests

### Deploy to Ethereum

Create/modify network config in `hardhat.config.ts` and add API key and private key, then run:

`npx hardhat run --network rinkeby scripts/deploy.ts`
### -or- Just use Docker NOTE PLEASE BUILD CONTAINERS BEFORE MAKING PULL REQUESTS
Right click on the dockerfile and click "build image", tag the image (ex) - "zaphardhatdevelop:latest"
Run  `docker run -td zaphardhatdevelop`, the command `npx hardhat node` will run automatically
To Deploy to localhost,
Run `docker build -t zaphardhat:branchname . `
-Open Docker Desktop, click the cli button marked with ">-"
Run `npx hardhat run --network localhost scripts/deploy.ts`

---
# NFT Contract Documentation
# ZapVault
The purpose of ZapVault is to serve as the default address to store the earnings made from an NFT sale using the ZapMedia, ZapMarket, and AuctionHouse contracts. When a sale is made, tokens get transferred here, at which point the owner of the vault may view the current balance or withdraw the tokens into his own address for further usage.

## Methods

### initializeVault(address)
This function creates the initial vault, establishing the owner and Zap token address.
|**Argument**|**Type**|**Description**|
|------|------|------|
|`token`|`address`| Address of the current zap token |

### vaultBalance()
This is a getter function that returns the current ```balance``` of Zap tokens within the smart contract, as transferred by the various NFT contracts
|**Argument**|**Type**|**Description**|
|------|------|------|
| no arguments |

### withdraw(uint256)
This function allows the owner to withdraw a number of tokes up to the smart contract's current balance
|**Argument**|**Type**|**Description**|
|------|------|------|
|`value`|`uint256`| The amount requested for withdrawal|

---
# ZapMarket
## Events
### AskCreated (address,uint256,tuple)
Emits after an asking price is set by the owner.
| Arguments | Description |
| ------ | ------ |
| mediaContract (address) | Returns the media contract address.|
| tokenId (uint256) | Returns the numerical token identifier. |
| ask (tuple) | Returns the ask properties ```amount, currency, sellOnShare```.|

### AskRemoved (address,uint256,tuple)
Emits after an asking price is removed by the owner.
| Arguments | Description |
| ------ | ------ |
| mediaContract (address) | Returns the media contract address.|
| tokenId (uint256) | Returns the numerical token identifier. |
| ask (tuple) | Returns the ask properties ```amount, currency, sellOnShare```.|

### BidCreated (address,uint256,tuple)
Emits after a bid is placed on an NFT currently in auction.
| Arguments | Description |
| ------ | ------ |
| mediaContract (address) | Returns the media contract address.|
| tokenId (uint256) | Returns the numerical token identifier. |
| bid (tuple) | Returns the bid properties ```amount, currency, bidder, recipient, sellOnShare```.|

### BidFinalized (address,uint256,tuple)
Emits after a bid is accepted by the owner.
| Arguments | Description |
| ------ | ------ |
| tokenId (uint256) | Returns the numerical token identifier. |
| bid (tuple) | Returns the bid properties ```amount, currency, bidder, recipient, sellOnShare```.|
| mediaContract (address) | Returns the media contract address.|

### BidRemoved (uint256,tuple,address)
Emits after a bid is removed on a token in an auction.
| Arguments | Description |
| ------ | ------ |
| tokenId (uint256) | Returns the numerical token identifier. |
| bid (tuple) | Returns the bid properties ```amount, currency, bidder, recipient, sellOnShare```.|
| mediaContract (address) | Returns the media contract address.|

### BidShareUpdated (uint256,tuple,address)
Emits after an NFT is minted and when a bid is accepted on a token in an auction.
| Arguments | Description |
| ------ | ------ |
| tokenId (uint256) | Returns the numerical token identifier. |
| bidShares (tuple) | Returns the bidShare properties ```owner, creator, collabShares```.|
| mediaContract (address) | Returns the media contract address.|

### Burned (uint256,address)
Emits after the removal of a NFT.
| Arguments | Description |
| ------ | ------ |
| tokenId (uint256) | Returns the numerical token identifier. |
| mediaContract (address) | Returns the media contract address.|

### MediaContractCreated (address,bytes32,bytes32)
Emits after a media contract is deployed and initialized.
| Arguments | Description |
| ------ | ------ |
| mediaContract (address) | Returns the media contract address.|
| name (bytes32) | Returns the collection name as a bytes32 string.|
| symbol (bytes32) | Returns the collection symbol as a bytes32 string.|

### Minted (address,bytes32,bytes32)
Emits after a NFT is created.
| Arguments | Description |
| ------ | ------ |
| mediaContract (address) | Returns the media contract address.|
| name (bytes32) | Returns the collection name as a bytes32 string.|
| symbol (bytes32) | Returns the collection symbol as a bytes32 string.|

### OwnershipTransferred (address,address)
Emits after the current owner gives control to the new owner.
| Arguments | Description |
| ------ | ------ |
| owner(address) | Returns the current owner address renouncing their ownership .|
| newOwner (bytes32) | Returns the new owner address receiving ownership.|

## Methods
### acceptBid nonpayable (address,uint256,tuple)
Accepts a bid from a particular bidder. Can only be called by the media contract. See {_finalizeNFTTransfer} Provided bid must match a bid in storage. This is to prevent a race condition where a bid may change while the acceptBid call is in transit. A bid cannot be accepted if it cannot be split equally into its shareholders. This should only revert in rare instances (for example, a low bid with a zero-decimal token), but is necessary to ensure fairness to all shareholders.
| Arguments | Description |
| ------ | ------ |
| mediaContractAddress (address) | The media contract address.|
| tokenId (uint256) | The numerical token identifier.|
| expectedBid (tuple) | Returns the bid properties accepted by the owner ``` amount, currency, bidder, recipient, spender, sellOnShare```.|

### bidForTokenBidder view (address,uint256,address)
Gets a bid placed by a bidder and returns the ```currency, amount, bidder```.
| Arguments | Description |
| ------ | ------ |
| mediaContractAddress (address) | The media contract address.|
| tokenId (uint256) | The numerical token identifier.|
| bidder (address) | Address of the bidder.|

### bidSharesForToken view (address,uint256)
Gets the bidShares set by the owner during the mint process and returns the ```owner, creator, collabShares```.
| Arguments | Description |
| ------ | ------ |
| mediaContractAddress (address) | The media contract address.|
| tokenId (uint256) | The numerical token identifier.|

### configure nonpayable (address,address,bytes32,bytes32)
Sets the media contract address. This address is the only permitted address that can call the mutable functions. This method can only be called once.
| Arguments | Description |
| ------ | ------ |
| deployer (address) | Address of the collection owner deploying the media contract .|
| mediaContract (address) | Address of the deployed media contract .|
| name (bytes32) | Collection name as a bytes32 string.|
| symobl (bytes32) | Collection symbol as a bytes32 string .|

### currentAskForToken view (address,uint256)
Gets the ask set by the owner and returns the ```amount, currency, sellOnShare```.
| Arguments | Description |
| ------ | ------ |
| mediaContractAddress (address) | Address of media contract.|
| tokenId (uint256) | The numerical identifier of the token.|

### getOwner view ()
Gets the current owner address of the market contract.

### initializeMarket nonpayable (address)
An upgradeable function that acts as the constructor. Enables contract functionality after deployment and can only be called once after the initial initialization by the owner. Inside this function body a private variable is set to true to ensure this function can not be called twice, The msg.sender is set as the owner, The platform address value is set as the platformAddress variable.
| Arguments | Description |
| ------ | ------ |
| _platformAddress(address) | Address of the Vault contract.|

### isConfigured view (address)
A mapping from media address to the market configuration status. The media configuration status is set in the body of the configure function during the deployment process. This function will return true or false depending on if the media contract passed in is configured or not.
| Arguments | Description |
| ------ | ------ |
| mediaContractAddress (address) | Address of the media contract .|

### isValidBid view (address,uint256,uint256)
Validates that the bid is valid by ensuring that the bid amount can be split perfectly into all the bid shares. We do this by comparing the sum of the individual share values with the amount and ensuring they are equal. Because the splitShare function uses integer division, any inconsistencies with the original and split sums would be due to a bid splitting that does not perfectly divide the bid amount.
| Arguments | Description |
| ------ | ------ |
| mediaContractAddress (address) | Address of the media contract .|
| tokenId (uint256) | The numerical identifier for a NFT, the bid was placed on .|
| bidAmount (uint256) | The numerical currency amount the bid was placed with .|

### mediaContracts view (address,uint256)
A mapping from the media owner address to the media contract address.
| Arguments | Description |
| ------ | ------ |
| mediaOwner (address) | Address of the media contract .|
| mediaContractIndex (uint256) | The numerical index media contract for selection .|

### mintOrBurn nonpayable (bool,uint256,address)
Determines which event to emit between Burned or Mint. If the isMint status is true, a new NFT is created and emits the Mint event. If the isMint status is false, a NFT is going to be removed and emits the Burned event.
| Arguments | Description |
| ------ | ------ |
| isMint (bool) | Checks if a NFT is being minted .|
| tokenId (uint256) | The numerical identifier for a NFT .|
| mediaContract (address) | Address of the media contract.|

### removeAsk nonpayable (address,uint256)
Removes an ask for a token and emits an AskRemoved event
| Arguments | Description |
| ------ | ------ |
| mediaContractAddress (address) | Address of the media contract.|
| tokenId (uint256) | Address of the media contract.|

### removeBid nonpayable (address,uint256,address)
Removes the bid on a particular media for a bidder. The bid amount is transferred from this contract to the bidder, if they have a bid placed.
| Arguments | Description |
| ------ | ------ |
| mediaContractAddress (address) | Address of the media contract.|
| tokenId (uint256) | The numerical token identifier.|
| bidder (address) | Address of the bidder.|

### setAsk nonpayable (address,uint256,tuple)
Sets the ask on a particular media. If the ask cannot be evenly split into the media's bid shares, this reverts.
| Arguments | Description |
| ------ | ------ |
| mediaContractAddress (address) | Address of the media contract.|
| tokenId (uint256) | The numerical token identifier.|
| ask (tuple) | The ask properties ```amount, currency, sellOnShare```.|

### setBid nonpayable (address,uint256,tuple,address)
Sets the bid on a particular media for a bidder. The token is used to bid is transferred from the spender to this contract to be held until removed or accepted. If another bid already exists for the bidder, it is refunded.
| Arguments | Description |
| ------ | ------ |
| mediaContractAddress (address) | Address of the media contract.|
| tokenId (uint256) | The numerical token identifier .|
| bid (uint256) | Sets the bid properties ```amount, currency, bidder, recipient, sellOnShare``` .|
| spender (address) | Address of currency holder.|

### setBidShares nonpayable (address,uint256,tuple)
Sets bid shares for a particular tokenId. These bid shares must sum to 100.
| Arguments | Description |
| ------ | ------ |
| mediaContractAddress (address) | Address of the media contract.|
| tokenId (uint256) | The numerical token identifier.|
| bidShares (tuple) | Sets the properties consisting of ```owner, creator, collabShares```.|

### setFee nonpayable (tuple)
Sets the platform fee for NFT auctions. This fee can only be set by the owner of the market contract.
| Arguments | Description |
| ------ | ------ |
| newFee (tuple) | The fee to set as a percentage.|

### splitShare pure (tuple,uint256)
Return a % of the specified amount. This function is used to split a bid into shares for a media's shareholders.
| Arguments | Description |
| ------ | ------ |
| sharePercentage (tuple) | Percentage of royalties for the```owner, creator, collaborators``` receive after a bid is accepted, and an NFT is transferred .|
| amount (uint256) | Amount of tokens each shareholder receives based on their share percentage  .|

### transferOwnership nonpayable (address)
Allows the current owner to transfer control of the contract to a newOwner.
| Arguments | Description |
| ------ | ------ |
| newOwner (address) | Address to transfer control over the market contract.| 

### viewFee view ()
Gets the current platform fee value.

---
# Auction House

An open auction house smart contract, enabling creators, collectors, and curators to sell their NFTs as their own auctions. The auction house is only compatible with NTFs that are from Media contracts.

## Auctions
Auctions are created by the auction house. Auctions are of the [minimum bid](https://auction.wgbh.org/networkinfo.taf?_function=glossary#MinimumBid) auction type.

The auctions are permission-less and anyone can start an auction for free. Duration of auctions are time restricted, which is set at auction creation and may also increase if a bid is place in the last 15 minutes of the auction.

Auctions can also be managed by curators. Curators are given full access to auction functionality.

## Curators
A curator can:
-   Approve and deny proposals for an NFT to be listed with them.
-   Earn a fee for their curation
-   Cancel an auction prior to bidding being commenced

If an owner of an NFT chooses to list with a curator, that curator can charge a curator fee and has to approve any auction before it commences with that curators auction house.

Creators and collectors can submit a proposal to list their NFTs with a curator onchain, which the curator must accept (or optionally reject). This creates an onchain record of a curators activity and value creation.

Creators and collectors always have the option to run an auction themselves for free.

## Functions
### Create Auction

At any time, the holder of a token can create an auction. When an auction is created, the token is moved out of their wallet and held in escrow by the auction. The owner can retrieve the token at any time, so long as the auction has not begun.


| **Name** | **Type** | **Description** |
|--|--|--|
| `tokenId` | `uint256` | The tokenID to use in the auction |
| `mediaContract` | `address` | The address of the media contract the token is from |
| `duration` | `uint256` | The length of time, in seconds, that the auction should run for once the reserve price is hit.
| `reservePrice` | `uint256` | The minimum price for the first bid, starting the auction.
| `curator` | `address` | The address of the curator for this auction
| `curatorFeePercentage` | `uint8` | The percentage of the winning bid to share with the curator
| `auctionCurrency` | `address` | The currency to perform this auction in, or 0x0 for ETH

### Cancel Auction
If an auction has not started yet, the curator or the creator of the auction may cancel the auction, and remove it from the registry. This action returns the token to the previous holder.

| **Name** | **Type** | **Description** |
|--|--|--|
| `auctionId` | `uint256` | The ID of the auction |

### Set Auction Approval

If a created auction specifies a curator to start the auction, the curator  _must_  approve it in order for it to start. This is to allow curators to specifically choose which auctions they are willing to curate and perform.
| **Name** | **Type** | **Description** |
|--|--|--|
| `auctionId` | `uint256` | The ID of the auction |
| `approved` | `bool` | The approval state to set on the auction |

### Create Bid

If an auction is approved, anyone is able to bid. The first bid  _must_  be greater than the reserve price. Once the first bid is successfully placed, other bidders may continue to place bids up until the auction's duration has passed.

If a bid is placed in the final 15 minutes of the auction, the auction is extended for another 15 minutes.
| **Name** | **Type** | **Description** |
|--|--|--|
| `auctionId` | `uint256` | The ID of the auction |
| `amount` | `uint256` | The amount of currency to bid. If the bid is in ETH, this must match the sent ETH value |
| `mediaContract` | `address` | The address of the media contract the token is from |

### End Auction

Once the auction is no longer receiving bids, Anyone may finalize the auction. This action transfers the NFT to the winner, places the winning bid on the piece, and pays out the auction creator and curator.
| **Name** | **Type** | **Description** |
|--|--|--|
| `auctionId` | `uint256` | The ID of the auction |
| `mediaContract` | `address` | The address of the media contract the token is from |



