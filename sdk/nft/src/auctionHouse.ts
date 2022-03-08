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

  constructor(chainId: number, signer: Signer, customMediaAddress?: string) {
    this.chainId = chainId;
    this.signer = signer;

    this.auctionHouse = new ethers.Contract(
      contractAddresses(chainId).zapAuctionAddress,
      zapAuctionAbi,
      signer
    );

    if (customMediaAddress == ethers.constants.AddressZero) {
      invariant(
        false,
        "AuctionHouse (constructor): The (customMediaAddress) cannot be a zero address."
      );
    }

    if (customMediaAddress !== undefined) {
      this.media = new ZapMedia(chainId, signer, customMediaAddress);
    } else {
      this.media = new ZapMedia(chainId, signer);
    }
  }

  public async fetchAuction(auctionId: BigNumberish): Promise<any> {
    return await this.auctionHouse.auctions(auctionId);
  }

  public async fetchAuctionFromTransactionReceipt(
    receipt: TransactionReceipt
  ): Promise<Auction | null> {
    for (const log of receipt.logs) {
      if (log.address === this.auctionHouse.address) {
        let description = this.auctionHouse.interface.parseLog(log);
        if (description.args.auctionId) {
          return this.auctionHouse.auctions(description.args.auctionId);
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
    if (signerAddress == owner && this.auctionHouse.address !== approved) {
      invariant(
        false,
        "AuctionHouse (createAuction): Transfer caller is not owner nor approved."
      );
    }
    // If the caller is not the tokenId owner and the auctionHouse is approved throw an error
    if (signerAddress !== owner && this.auctionHouse.address == approved) {
      invariant(
        false,
        "AuctionHouse (createAuction): Caller is not approved or token owner."
      );
    }
    // If the media adddress is a zero address throw an error
    if (tokenAddress == ethers.constants.AddressZero) {
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
    const auctionInfo = await this.auctionHouse.auctions(auctionId);

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
    const auctionInfo = await this.auctionHouse.auctions(auctionId);

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
    const auctionInfo = await this.auctionHouse.auctions(auctionId);
    if (auctionInfo.token.mediaContract == ethers.constants.AddressZero) {
      invariant(false, "AuctionHouse (createBid): AuctionId does not exist.");
    }

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

  public async cancelAuction(auctionId: BigNumberish) {
    const auctionInfo = await this.auctionHouse.auctions(auctionId);

    if (auctionInfo.token.meBidiaContract == ethers.constants.AddressZero) {
      invariant(
        false,
        "AuctionHouse (cancelAuction): AuctionId does not exist."
      );
    }

    if (
      (await this.signer.getAddress()) !== auctionInfo.curator &&
      (await this.signer.getAddress()) !== auctionInfo.tokenOwner
    ) {
      invariant(
        false,
        "AuctionHouse (cancelAuction): Caller is not the auction creator or curator."
      );
    }

    if (parseInt(auctionInfo.amount._hex) > 0) {
      invariant(
        false,
        "AuctionHouse (cancelAuction): You can't cancel an auction that has a bid."
      );
    }

    return this.auctionHouse.cancelAuction(auctionId);
  }

  public async endAuction(auctionId: BigNumberish, mediaAddress: string) {
    const auctionInfo = await this.auctionHouse.auctions(auctionId);

    if (auctionInfo.token.mediaContract == ethers.constants.AddressZero) {
      invariant(false, "AuctionHouse (endAuction): AuctionId does not exist.");
    }

    // If the fetched firstBidTime is not 0 throw an error
    if (parseInt(auctionInfo.firstBidTime._hex) == 0) {
      invariant(false, "AuctionHouse (endAuction): Auction hasn't started.");
    }

		// If the bid hasn't been placed throw an error
		if (parseInt(auctionInfo.bidder) == 0) {
      invariant(false, "AuctionHouse (endAuction): Auction started but bid hasn't been placed.");
    }

    // Retrieve the time now in seconds
    const dateNow = Date.now()/1000;

    // Sum of the auction duration and auction's first time bid
    const auctionSum = parseInt(auctionInfo.duration._hex) + parseInt(auctionInfo.firstBidTime._hex);
  
    if (dateNow !>= auctionSum) {
      console.log("auction not completed");
    }
    return this.auctionHouse.endAuction(auctionId, mediaAddress);
  }
}

export default AuctionHouse;
