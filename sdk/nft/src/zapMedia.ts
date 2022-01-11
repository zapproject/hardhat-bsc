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

import { zapMediaAbi, zapMarketAbi } from './contract/abi';

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
   * Fetches the creator for the specified media on an instance of the Zap Media Contract
   * @param mediaId
   */
  public async fetchCreator(mediaId: BigNumberish): Promise<string> {
    try {
      await this.media.ownerOf(mediaId);
    } catch (err: any) {
      invariant(false, 'ZapMedia (fetchCreator): TokenId does not exist.');
    }
    return this.media.getTokenCreators(mediaId);
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

  /**
   * Fetches the approved account for the specified media on an instance of the Zap Media Contract
   * @param mediaId
   */
  public async fetchApproved(mediaId: BigNumberish): Promise<string> {
    return this.media.getApproved(mediaId);
  }

  /**
   * Fetches if the specified operator is approved for all media owned by the specified owner on an instance of the Zap Media Contract
   * @param owner
   * @param operator
   */
  public async fetchIsApprovedForAll(owner: string, operator: string): Promise<boolean> {
    return this.media.isApprovedForAll(owner, operator);
  }

  public async updateContentURI(mediaId: number, tokenURI: string): Promise<ContractTransaction> {
    try {
      return await this.media.updateTokenURI(mediaId, tokenURI);
    } catch (err) {
      invariant(false, 'ZapMedia (updateContentURI): TokenId does not exist.');
    }
  }

  /***********************
   * ERC-721 Write Methods
   ***********************
   */

  /**
   * Grants approval to the specified address for the specified media on an instance of the Zap Media Contract
   * @param to
   * @param mediaId
   */
  public async approve(to: string, mediaId: BigNumberish): Promise<ContractTransaction> {
    return this.media.approve(to, mediaId);
  }

  /**
   * Grants approval for all media owner by msg.sender on an instance of the Zap Media Contract
   * @param operator
   * @param approved
   */
  public async setApprovalForAll(
    operator: string,
    approved: boolean,
  ): Promise<ContractTransaction> {
    return this.media.setApprovalForAll(operator, approved);
  }

  /**
   * Transfers the specified media to the specified to address on an instance of the Zap Media Contract
   * @param from
   * @param to
   * @param mediaId
   */
  public async transferFrom(
    from: string,
    to: string,
    mediaId: BigNumberish,
  ): Promise<ContractTransaction> {
    return this.media.transferFrom(from, to, mediaId);
  }

  /**
   * Executes a SafeTransfer of the specified media to the specified address if and only if it adheres to the ERC721-Receiver Interface
   * @param from
   * @param to
   * @param mediaId
   */
  public async safeTransferFrom(
    from: string,
    to: string,
    mediaId: BigNumberish,
  ): Promise<ContractTransaction> {
    try {
      await this.media.ownerOf(mediaId);
    } catch (err: any) {
      invariant(false, 'ZapMedia (safeTransferFrom): TokenId does not exist.');
    }

    if (from === ethers.constants.AddressZero) {
      invariant(false, 'ZapMedia (safeTransferFrom): The (from) address cannot be a zero address.');
    }

    if (to === ethers.constants.AddressZero) {
      invariant(false, 'ZapMedia (safeTransferFrom): The (to) address cannot be a zero address.');
    }

    return this.media['safeTransferFrom(address,address,uint256)'](from, to, mediaId);
  }

  /**
   * Mints a new piece of media on an instance of the Zap Media Contract
   * @param mintData
   * @param bidShares
   */
  public async mint(mediaData: MediaData, bidShares: BidShares): Promise<ContractTransaction> {
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

    // If the signer is not the token owner and the approved address is a zerp address
    if (tokenOwner !== signerAddress && isApproved === ethers.constants.AddressZero) {
      invariant(false, 'ZapMedia (setAsk): Media: Only approved or owner.');

      // If the signer is not the token owner or if the signer is the approved address
    } else if (tokenOwner !== signerAddress || isApproved === signerAddress) {
      return this.media.setAsk(mediaId, ask);

      // If the signer is the token owner and is not the approved address
    } else {
      return this.media.setAsk(mediaId, ask);
    }
  }

  /**
   * Removes the ask on the specified media on an instance of the Zap Media Contract
   * @param mediaId
   */
  public async removeAsk(mediaId: BigNumberish): Promise<ContractTransaction> {
    const ask = await this.market.currentAskForToken(this.media.address, mediaId);

    try {
      await this.media.ownerOf(mediaId);
    } catch (err: any) {
      invariant(false, 'ZapMedia (removeAsk): TokenId does not exist.');
    }

    if (ask.amount == 0) {
      invariant(false, 'ZapMedia (removeAsk): Ask was never set.');
    } else {
      return this.media.removeAsk(mediaId);
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

    const gasEstimate = await this.media.estimateGas.updateTokenMetadataURI(mediaId, metadataURI);
    return this.media.updateTokenMetadataURI(mediaId, metadataURI, { gasLimit: gasEstimate });
  }

  /**
   * Revokes the approval of an approved account for the specified media on an instance of the Zap Media Contract
   * @param mediaId
   */
  public async revokeApproval(mediaId: BigNumberish): Promise<ContractTransaction> {
    return this.media.revokeApproval(mediaId);
  }

  /**
   * Burns the specified media on an instance of the Zap Media Contract
   * @param mediaId
   */
  public async burn(mediaId: BigNumberish): Promise<ContractTransaction> {
    return this.media.burn(mediaId);
  }

  /**
   * Checks to see if a Bid's amount is evenly splittable given the media's current bidShares
   *
   * @param mediaId
   * @param bid
   */
  public async isValidBid(mediaId: BigNumberish, bid: any): Promise<boolean> {
    const isAmountValid = await this.market.isValidBid(mediaId, bid.amount);
    const decimal100 = Decimal.new(100);
    const currentBidShares = await this.fetchCurrentBidShares(this.media.address, mediaId);
    const isSellOnShareValid = bid.sellOnShare.value.lte(
      decimal100.value.sub(currentBidShares.creator.value),
    );

    return isAmountValid && isSellOnShareValid;
  }
}
export default ZapMedia;
