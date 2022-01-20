import { BigNumber, BigNumberish, Contract, ethers, Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';

import { contractAddresses } from './utils';
import { zapAuctionAbi, zapMediaAbi } from './contract/abi';
import ZapMedia from './zapMedia';
import invariant from 'tiny-invariant';

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
      signer,
    );

    this.media = new ZapMedia(chainId, signer);
  }

  public async fetchAuction(auctionId: BigNumberish): Promise<any> {
    const auctionInfo = await this.auctionHouse.auctions(auctionId);
    if (auctionInfo.token.mediaContract == ethers.constants.AddressZero) {
      invariant(false, 'AuctionHouse (fetchAuction): AuctionId does not exist.');
    }
    else {
      return auctionInfo;
    }
  }

  public async createAuction(
    tokenId: BigNumberish,
    tokenAddress: string,
    duration: BigNumberish,
    reservePrice: BigNumberish,
    curator: string,
    curatorFeePercentages: number,
    auctionCurrency: string,
  ) {
    // Checks if the tokenId exists if not throw an error
    try {
      await this.media.fetchOwnerOf(tokenId);
    } catch {
      invariant(false, 'AuctionHouse (createAuction): TokenId does not exist.');
    }

    // Fetches the address who owns the tokenId
    const owner = await this.media.fetchOwnerOf(tokenId);

    // Fetches the address approved to the tokenId
    const approved = await this.media.fetchApproved(tokenId);

    // Fetches the address of the caller
    const signerAddress = await this.signer.getAddress();

    // If the curator fee is not less than 100 thrown an error
    if (curatorFeePercentages == 100) {
      invariant(false, 'AuctionHouse (createAuction): CuratorFeePercentage must be less than 100.');
    }
    // If the caller is the tokenId owner and the auctionHouse address is not approved throw an error
    else if (signerAddress == owner && this.auctionHouse.address !== approved) {
      invariant(false, 'AuctionHouse (createAuction): Transfer caller is not owner nor approved.');
    }
    // If the caller is not the tokenId owner and the auctionHouse is approved throw an error
    else if (signerAddress !== owner && this.auctionHouse.address == approved) {
      invariant(false, 'AuctionHouse (createAuction): Caller is not approved or token owner.');
    }
    // If the media adddress is a zero address throw an error
    else if (tokenAddress == ethers.constants.AddressZero) {
      invariant(false, 'AuctionHouse (createAuction): Media cannot be a zero address.');
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
        auctionCurrency,
      );
    }
  }

  public async startAuction(auctionId: BigNumberish, approved: boolean) {
    // Fetches the auction details
    const auctionInfo = await this.fetchAuction(auctionId);

    // If the fetched media returns a zero address this means the auction does not exist and throw an error
    if (auctionInfo.token.mediaContract == ethers.constants.AddressZero) {
      invariant(false, 'AuctionHouse (startAuction): AuctionId does not exist.');

      // If the fetched firstBidTime is not 0 throw an error
    } else if (parseInt(auctionInfo.firstBidTime._hex) !== 0) {
      invariant(false, 'AuctionHouse (startAuction): Auction has already started.');

      // If the fetched curator address does not equal the caller address throw an error
    } else if (auctionInfo.curator !== (await this.signer.getAddress())) {
      invariant(false, 'AuctionHouse (startAuction): Only the curator can start this auction.');
    }

    // If the auctionId exists and the curator is the caller invoke startCreation
    return this.auctionHouse.startAuction(auctionId, approved);
  }

  public async setAuctionReservePrice(auctionId: BigNumberish, reservePrice: BigNumberish) {
    // Fetches the auction details
    const auctionInfo = await this.fetchAuction(auctionId);

    // If the fetched media returns a zero address this means the auction does not exist and throw an error
    if (auctionInfo.token.mediaContract == ethers.constants.AddressZero) {
      invariant(false, 'AuctionHouse (setAuctionReservePrice): AuctionId does not exist.');

      // If the caller does not equal the curator address and does not equal the token owner address throw an error
    } else if (
      (await this.signer.getAddress()) !== auctionInfo.curator &&
      (await this.signer.getAddress()) !== auctionInfo.tokenOwner
    ) {
      invariant(
        false,
        'AuctionHouse (setAuctionReservePrice): Caller must be the curator or token owner',
      );

      // If the fetched firstBidTime is not 0 throw an error
    } else if (parseInt(auctionInfo.firstBidTime._hex) !== 0) {
      invariant(false, 'AuctionHouse (setAuctionReservePrice): Auction has already started.');
    } else {
      return this.auctionHouse.setAuctionReservePrice(auctionId, reservePrice);
    }
  }
}

export default AuctionHouse;
