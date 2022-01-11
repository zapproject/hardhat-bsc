import { BigNumber, BigNumberish, Contract, ethers, Signer } from 'ethers'
import { Provider, TransactionReceipt } from '@ethersproject/providers'

import { contractAddresses } from './utils';
import { zapAuctionAbi } from './contract/abi';


export interface Auction {
  token: {
    tokenId: BigNumberish,
    mediaContract: string
  }
  approved: boolean
  amount: BigNumber
  duration: BigNumber
  firstBidTime: BigNumber
  reservePrice: BigNumber
  curatorFeePercentage: number
  tokenOwner: string
  bidder: string
  curator: string
  auctionCurrency: string
}

export class AuctionHouse {
  public readonly contract: Contract
  public readonly chainId: number
  public readonly signerOrProvider: Signer | Provider

  constructor(signerOrProvider: Signer | Provider, chainId: number) {
    this.chainId = chainId
    this.signerOrProvider = signerOrProvider
    this.contract = new ethers.Contract(
      contractAddresses(chainId).zapAuctionAddress,
      zapAuctionAbi,
      signerOrProvider,
    );
  }

  public async createAuction(
    tokenId: BigNumberish
  ): Promise<void> {
    const tx = await this.contract.auctions(
      tokenId
    );

    const receipt = await tx.wait();

    const eventLog = receipt.events[receipt.events.length - 1];

    return eventLog;
  }
}
