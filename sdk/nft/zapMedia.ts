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

import { zapMediaAbi, zapMarketAbi } from './abi';

import { MediaData, BidShares, Ask } from './types';

import invariant from 'tiny-invariant';
import { timeStamp } from 'console';
import { sign } from 'crypto';

class ZapMedia {
  networkId: number;
  mediaIndex: any;
  media: any;
  market: any;
  signer: Signer;

  constructor(networkId: number, signer: Signer, mediaIndex?: number) {
    this.networkId = networkId;

    this.signer = signer;

    this.mediaIndex = mediaIndex;

    this.market = new ethers.Contract(
      contractAddresses(networkId).zapMarketAddress,
      zapMarketAbi,
      signer,
    );

    if (mediaIndex === undefined) {
      this.media = new ethers.Contract(
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
    return this.media.balanceOf(owner);
  }

  /**
   * Fetches the owner of the specified media on an instance of the Zap Media Contract
   * @param mediaId
   */
  public async fetchOwnerOf(mediaId: BigNumberish): Promise<string> {
    return this.media.ownerOf(mediaId);
  }

  /**
   * Fetches the content uri for the specified media on an instance of the Zap Media Contract
   * @param mediaId
   */
  public async fetchContentURI(mediaId: BigNumberish): Promise<string> {
    try {
      return await this.media.tokenURI(mediaId);
    } catch {
      invariant(false, 'ZapMedia (fetchContentURI): TokenId does not exist.');
    }
  }

  /**
   * Fetches the metadata uri for the specified media on an instance of the ZAP Media Contract
   * @param mediaId
   */
  public async fetchMetadataURI(mediaId: BigNumberish): Promise<string> {
    return this.media.tokenMetadataURI(mediaId);
  }

  /**
   * Fetches the current bid shares for the specified media on an instance of the Zap Media Contract
   * @param mediaId
   */
  public async fetchCurrentBidShares(
    mediaAddress: string,
    mediaId: BigNumberish,
  ): Promise<BidShares> {
    return this.market.bidSharesForToken(mediaAddress, mediaId);
  }

  /**
   * Fetches the current ask for the specified media on an instance of the Zap Media Contract
   * @param mediaId
   */
  public async fetchCurrentAsk(mediaAddress: string, mediaId: BigNumberish): Promise<Ask> {
    return this.market.currentAskForToken(mediaAddress, mediaId);
  }

  /**
   * Fetches the total amount of non-burned media that has been minted on an instance of the Zap Media Contract
   */
  public async fetchTotalMedia(): Promise<BigNumber> {
    return this.media.totalSupply();
  }

  public async updateContentURI(mediaId: number, tokenURI: string): Promise<ContractTransaction> {
    try {
      return await this.media.updateTokenURI(mediaId, tokenURI);
    } catch (err) {
      invariant(false, 'ZapMedia (updateContentURI): TokenId does not exist.');
    }
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

    const gasEstimate = await this.media.estimateGas.mint(mediaData, bidShares);

    return this.media.mint(mediaData, bidShares, { gasLimit: gasEstimate });
  }

  /**
   * Sets an ask on the specified media on an instance of the Zap Media Contract
   * @param mediaId
   * @param ask
   */
  public async setAsk(mediaId: BigNumberish, ask: Ask): Promise<ContractTransaction> {
    // Returns the address of the tokenOwner
    const tokenOwner = await this.media.ownerOf(mediaId);

    // Returns the address of the connected signer
    const signerAddress = await this.signer.getAddress();

    // Returns the address approved for the tokenId
    const isApproved = await this.media.getApproved(mediaId);

    // If the connected signer owns the token invoke setAsk
    // Or if the connected signer is approved by the token owner invoke setAsk
    if (tokenOwner === signerAddress || isApproved === signerAddress) {
      return this.media.setAsk(mediaId, ask);

      // If the connected signer is neither throw an error
    } else {
      invariant(false, 'ZapMedia (setAsk): Media: Only approved or owner.');
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

    return this.media.updateTokenMetadataURI(mediaId, metadataURI);
  }
}
export default ZapMedia;
