import { BigNumber, BigNumberish, Contract, ethers, Signer } from "ethers";
import { Provider, TransactionReceipt } from "@ethersproject/providers";

import { contractAddresses } from "./utils";
import { zapAuctionAbi, zapMediaAbi } from "./contract/abi";
import ZapMedia from "./zapMedia";
import invariant from "tiny-invariant";
import { FormatTypes } from "ethers/lib/utils";

export interface Auction {
  token: {
    tokenId: BigNumberish;
    mediaContract: string;
  };
  approved: boolean;
  amount: BigNumber;
  duration: BigNumber;
  firstBidTime: BigNumber;
  reservePrice: BigNumber;
  curatorFeePercentage: number;
  tokenOwner: string;
  bidder: string;
  curator: string;
  auctionCurrency: string;
}

class AuctionHouse {
  public readonly auctionHouse: Contract;
  public readonly chainId: number;
  public readonly signer: Signer;
  media: ZapMedia;

  constructor(chainId: number, signer: Signer) {
    this.chainId = chainId;
    this.signer = signer;

    this.auctionHouse = new ethers.Contract(
      contractAddresses(chainId).zapAuctionAddress,
      zapAuctionAbi,
      signer
    );

    this.media = new ZapMedia(chainId, signer);
  }

  public async fetchAuction(auctionId: BigNumberish): Promise<any> {
    const auctionInfo = await this.auctionHouse.auctions(auctionId);
    if (auctionInfo.token.mediaContract == ethers.constants.AddressZero) {
      invariant(
        false,
        "AuctionHouse (fetchAuction): AuctionId does not exist."
      );
    } else {
      return auctionInfo;
    }
  }

  public async fetchAuctionFromTransactionReceipt(
    receipt: TransactionReceipt
  ): Promise<Auction | null> {
    for (const log of receipt.logs) {
      if (log.address === this.auctionHouse.address) {
        let description = this.auctionHouse.interface.parseLog(log);
        if (description.args.auctionId) {
          return this.fetchAuction(description.args.auctionId);
        }
      }
    }

    return null;
  }

  public async createAuction(
    tokenId: BigNumberish,
    tokenAddress: string,
    duration: BigNumberish,
    reservePrice: BigNumberish,
    curator: string,
    curatorFeePercentages: number,
    auctionCurrency: string
  ) {
    // Checks if the tokenId exists if not throw an error
    try {
      await this.media.fetchOwnerOf(tokenId);
    } catch {
      invariant(false, "AuctionHouse (createAuction): TokenId does not exist.");
    }

    // Fetches the address who owns the tokenId
    const owner = await this.media.fetchOwnerOf(tokenId);

    // Fetches the address approved to the tokenId
    const approved = await this.media.fetchApproved(tokenId);

    // Fetches the address of the caller
    const signerAddress = await this.signer.getAddress();

    // If the curator fee is not less than 100 thrown an error
    if (curatorFeePercentages == 100) {
      invariant(
        false,
        "AuctionHouse (createAuction): CuratorFeePercentage must be less than 100."
      );
    }
    // If the caller is the tokenId owner and the auctionHouse address is not approved throw an error
    else if (signerAddress == owner && this.auctionHouse.address !== approved) {
      invariant(
        false,
        "AuctionHouse (createAuction): Transfer caller is not owner nor approved."
      );
    }
    // If the caller is not the tokenId owner and the auctionHouse is approved throw an error
    else if (signerAddress !== owner && this.auctionHouse.address == approved) {
      invariant(
        false,
        "AuctionHouse (createAuction): Caller is not approved or token owner."
      );
    }
    // If the media adddress is a zero address throw an error
    else if (tokenAddress == ethers.constants.AddressZero) {
      invariant(
        false,
        "AuctionHouse (createAuction): Media cannot be a zero address."
      );
    }
    // If the caller is the tokenId owner and the auctionHouse is approved invoke createAuction
    else {
      return this.auctionHouse.createAuction(
        tokenId,
        tokenAddress,
        duration,
        reservePrice,
        curator,
        curatorFeePercentages,
        auctionCurrency
      );
    }
  }

  public async startAuction(auctionId: BigNumberish, approved: boolean) {
    // Fetches the auction details
    const auctionInfo = await this.fetchAuction(auctionId);

    // If the fetched media returns a zero address this means the auction does not exist and throw an error
    if (auctionInfo.token.mediaContract == ethers.constants.AddressZero) {
      invariant(
        false,
        "AuctionHouse (startAuction): AuctionId does not exist."
      );

      // If the fetched firstBidTime is not 0 throw an error
    } else if (parseInt(auctionInfo.firstBidTime._hex) !== 0) {
      invariant(
        false,
        "AuctionHouse (startAuction): Auction has already started."
      );

      // If the fetched curator address does not equal the caller address throw an error
    } else if (auctionInfo.curator !== (await this.signer.getAddress())) {
      invariant(
        false,
        "AuctionHouse (startAuction): Only the curator can start this auction."
      );
    }

    // If the auctionId exists and the curator is the caller invoke startCreation
    return this.auctionHouse.startAuction(auctionId, approved);
  }

  public async setAuctionReservePrice(
    auctionId: BigNumberish,
    reservePrice: BigNumberish
  ) {
    // Fetches the auction details
    const auctionInfo = await this.fetchAuction(auctionId);

    // If the fetched media returns a zero address this means the auction does not exist and throw an error
    if (auctionInfo.token.mediaContract == ethers.constants.AddressZero) {
      invariant(
        false,
        "AuctionHouse (setAuctionReservePrice): AuctionId does not exist."
      );

      // If the caller does not equal the curator address and does not equal the token owner address throw an error
    } else if (
      (await this.signer.getAddress()) !== auctionInfo.curator &&
      (await this.signer.getAddress()) !== auctionInfo.tokenOwner
    ) {
      invariant(
        false,
        "AuctionHouse (setAuctionReservePrice): Caller must be the curator or token owner"
      );

      // If the fetched firstBidTime is not 0 throw an error
    } else if (parseInt(auctionInfo.firstBidTime._hex) !== 0) {
      invariant(
        false,
        "AuctionHouse (setAuctionReservePrice): Auction has already started."
      );
    } else {
      return this.auctionHouse.setAuctionReservePrice(auctionId, reservePrice);
    }
  }

  public async createBid(
    auctionId: BigNumberish,
    amount: BigNumberish,
    mediaContract: string
  ) {
    const auctionInfo = await this.fetchAuction(auctionId);

    if (mediaContract == ethers.constants.AddressZero) {
      invariant(
        false,
        "AuctionHouse (createBid): Media cannot be a zero address."
      );
    }

    if (amount < parseInt(auctionInfo.reservePrice._hex)) {
      invariant(
        false,
        "AuctionHouse (createBid): Must send at least reserve price."
      );
    }

    // If ETH auction, include the ETH in this transaction
    if (auctionInfo.currency === ethers.constants.AddressZero) {
      return this.auctionHouse.createBid(auctionId, amount, mediaContract, {
        value: amount,
      });
    } else {
      return this.auctionHouse.createBid(auctionId, amount, mediaContract);
    }
  }

  public async endAuction(auctionId: BigNumberish) {
    // * Only end auction if 1) at least one bid exists, 2) it is still listed auction and 3) firstBidTime to set duration is equal or greater than firstBidTime to Date.now() and 4) signer is curator
    // 1  check if auctionid exists (#2)
    // 2  reject if bidder exists 
    // 3 reject if dureation not fulfulled
    // 4 check if signer is curator of the auction (#4)
    // =============
    // Checks if the auctionId exists if not throw an error
    try {
      await this.fetchAuction(auctionId);
    } catch {
      invariant(false, 'AuctionHouse (endAuction): AuctionId does not exist.');
    }

    const auctionInfo = await this.fetchAuction(auctionId);
    // Reject if auction doesn't exist
    if (!auctionInfo) {
      invariant(false, 'AuctionHouse (endAuction): AuctionId does not exist.');
    } else {
      const auctionStarted = parseInt(auctionInfo.firstBidTime._hex) === 0;
      const hasBidder = auctionStarted && auctionInfo.bidder !== ethers.constants.AddressZero;
      // update this to get bidder's timestamp
      const timeover = Date.now() < parseInt(auctionInfo.duration._hex); 

        // Reject end auction no bids exist (only cancel auction allowed)
        if (auctionInfo.bidder === ethers.constants.AddressZero) {
          invariant(false, 'AuctionHouse (endAuction): Auction has not started yet.');
        } 
        // Reject end auction if a bidder exists AND if duration not fulfilled
        // * first bid time === 0 means auction has started.
        else if (hasBidder && !timeover) {
          // (parseInt(auctionInfo.firstBidTime._hex + auctionInfo.duration._hex)) < Date.now()) {
          invariant(false, 'AuctionHouse (endAuction): Auction has not ended yet.');
        }
        // Check if the signer is the curator, if not throw an error
        else if (hasBidder && timeover && auctionInfo.curator !== (await this.signer.getAddress())) {
          invariant(false, 'AuctionHouse (endAuction): Only the curator can end this auction.');
        }
        
        return this.auctionHouse.endAuction(auctionId);
      }
  }

  public async cancelAuction(auctionId: BigNumberish) {
    const auctionInfo = await this.fetchAuction(auctionId);

    // If the auctionId does not exist throw an error
    if (auctionInfo.token.mediaContract === ethers.constants.AddressZero) {
      invariant(false, 'AuctionHouse (cancelAuction): Auction does not exist.');
    }
    // If the auction firstBidTime is not 0 throw an error
    else if (parseInt(auctionInfo.firstBidTime._hex) !== 0) {
      invariant(false, 'AuctionHouse (cancelAuction): Auction has already started.');
    }
    // If the fetched curator address does not equal the caller address throw an error
    else if (auctionInfo.curator !== (await this.signer.getAddress())) {
      invariant(false, 'AuctionHouse (cancelAuction): Only the curator can cancel this auction.');
    }
    return this.auctionHouse.cancelAuction(auctionId);
  }
}

export default AuctionHouse;
