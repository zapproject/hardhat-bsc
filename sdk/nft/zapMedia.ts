import {
  Contract,
  ContractTransaction,
  BigNumber,
  BigNumberish,
  ethers,
  Signer,
  Wallet,
} from 'ethers';

import { contractAddresses, Decimal, validateBidShares, validateURI } from './utils';

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

  /*********************
   * Zap View Methods
   *********************
   */

  public async fetchBalanceOf(owner: string): Promise<BigNumber> {
    return this.contract.balanceOf(owner);
  }

  /**
   * Fetches the owner of the specified media on an instance of the Zap Media Contract
   * @param mediaId
   */
  public async fetchOwnerOf(mediaId: BigNumberish): Promise<string> {
    return this.contract.ownerOf(mediaId);
  }

  /**
   * Fetches the content hash for the specified media on the Zap Media Contract
   * @param mediaId
   */
  public async fetchContentHash(mediaId: BigNumberish): Promise<string> {
    return await this.contract.tokenContentHashes(mediaId);
  }

  /**
   * Fetches the metadata hash for the specified media on an instance of the Zap Media Contract
   * @param mediaId
   */
  public async fetchMetadataHash(mediaId: BigNumberish): Promise<string> {
    return this.contract.tokenMetadataHashes(mediaId);
  }

  /**
   * Fetches the content uri for the specified media on an instance of the Zap Media Contract
   * @param mediaId
   */
  public async fetchContentURI(mediaId: BigNumberish): Promise<string> {
    try {
      return await this.contract.tokenURI(mediaId);
    } catch {
      invariant(false, 'ZapMedia (fetchContentURI): TokenId does not exist.');
    }
  }

  /**
   * Fetches the metadata uri for the specified media on an instance of the ZAP Media Contract
   * @param mediaId
   */
  public async fetchMetadataURI(mediaId: BigNumberish): Promise<string> {
    return this.contract.tokenMetadataURI(mediaId);
  }

  /**
   * Fetches the current bid shares for the specified media on an instance of the Zora Media Contract
   * @param mediaId
   */
  //   public async fetchCurrentBidShares(mediaId: BigNumberish): Promise<BidShares> {
  //     return this.market.bidSharesForToken(mediaId);
  //   }

  /**
   * Fetches the total amount of non-burned media that has been minted on an instance of the Zap Media Contract
   */
  public async fetchTotalMedia(): Promise<BigNumber> {
    return this.contract.totalSupply();
  }

  /**
   * Mints a new piece of media on an instance of the Zap Media Contract
   * @param mintData
   * @param bidShares
   */
  public async mint(mediaData: MediaData, bidShares: BidShares): Promise<any> {
    try {
      validateURI(mediaData.tokenURI);
      validateURI(mediaData.metadataURI);
      validateBidShares(bidShares.collabShares, bidShares.creator, bidShares.owner);
    } catch (err: any) {
      return Promise.reject(err.message);
    }

    const gasEstimate = await this.contract.estimateGas.mint(mediaData, bidShares);

    return this.contract.mint(mediaData, bidShares, { gasLimit: gasEstimate });
  }

  public async updateContentURI(mediaId: number, tokenURI: string): Promise<ContractTransaction> {
    try {
      return await this.contract.updateTokenURI(mediaId, tokenURI);
    } catch (err) {
      invariant(false, 'ZapMedia (updateContentURI): TokenId does not exist.');
    }
  }

  /**
   * Updates the metadata uri for the specified media on an instance of the Zap Media Contract
   * @param mediaId
   * @param metadataURI
   */
  public async updateMetadataURI(
    mediaId: BigNumberish,
    metadataURI: string,
  ): Promise<ContractTransaction> {
    try {
      validateURI(metadataURI);
    } catch (err: any) {
      return Promise.reject(err.message);
    }

    return this.contract.updateTokenMetadataURI(mediaId, metadataURI);
  }
}
export default ZapMedia;
