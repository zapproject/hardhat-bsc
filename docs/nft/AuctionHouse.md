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


