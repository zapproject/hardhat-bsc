import { Contract, ContractTransaction, BigNumber, ethers, Signer, Wallet } from 'ethers';

import { contractAddresses, Decimal, validateBidShares } from './utils';

import { zapMediaAbi } from './abi';

import { MediaData, BidShares } from './types';

import invariant from 'tiny-invariant';

class ZapMedia {
  networkId: number;
  mediaIndex: any;
  contract: any;
  signer: Signer;

  constructor(networkId: number, signer: Signer, mediaIndex?: number) {
    this.networkId = networkId;

    this.signer = signer;

    this.mediaIndex = mediaIndex;

    if (mediaIndex === undefined) {
      this.contract = new ethers.Contract(
        contractAddresses(networkId).zapMediaAddress,
        zapMediaAbi,
        signer,
      );
    } else {
    }
  }

  /**
   * Mints a new piece of media on an instance of the Zora Media Contract
   * @param mintData
   * @param bidShares
   */
  public async mint(mediaData: MediaData, bidShares: BidShares): Promise<any> {
    try {
      console.log(bidShares);
      validateBidShares(bidShares.collabShares, bidShares.creator, bidShares.owner);
    } catch (err: any) {
      return 'Oh no ' + err.message;
    }

    const gasEstimate = await this.contract.estimateGas.mint(mediaData, bidShares);

    return await this.contract.mint(mediaData, bidShares, { gasLimit: gasEstimate });
  }

  public async updateContentURI(mediaId: number, tokenURI: string): Promise<ContractTransaction> {
    try {
      return await this.contract.updateTokenURI(mediaId, tokenURI);
    } catch (err) {
      invariant(false, 'ZapMedia (updateContentURI): TokenId does not exist.');
    }
  }

  public async fetchBalanceOf(owner: string): Promise<BigNumber> {
    return this.contract.balanceOf(owner);
  }
}
export default ZapMedia;
