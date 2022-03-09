import {
  Contract,
  ContractTransaction,
  BigNumber,
  BigNumberish,
  ethers,
  Signer,
  Wallet,
} from "ethers";

import {
  contractAddresses,
  Decimal,
  validateBidShares,
  validateURI,
  validateAndParseAddress,
} from "./utils";

import { zapMediaAbi, zapMarketAbi } from "./contract/abi";

import {
  MediaData,
  BidShares,
  Ask,
  Bid,
  EIP712Signature,
  EIP712Domain,
} from "./types";

import invariant from "tiny-invariant";
import { timeStamp } from "console";
import { sign } from "crypto";

class ZapMedia {
  getSigNonces(addess: any) {
    throw new Error("Method not implemented.");
  }
  public networkId: number;
  public media: Contract;
  public market: Contract;
  public signer: Signer;
  public mediaAddress: string;
  public marketAddress: string;  

  constructor(networkId: number, signer: Signer, customMediaAddress?: string) {
    this.networkId = networkId;

    this.signer = signer;

    this.market = new ethers.Contract(
      contractAddresses(networkId).zapMarketAddress,
      zapMarketAbi,
      signer
    );
    this.marketAddress = contractAddresses(networkId).zapMarketAddress;
    if (customMediaAddress == ethers.constants.AddressZero) {
      invariant(
        false,
        "ZapMedia (constructor): The (customMediaAddress) cannot be a zero address."
      );
    }

    if (customMediaAddress !== undefined) {
      this.media = new ethers.Contract(customMediaAddress, zapMediaAbi, signer);
      this.mediaAddress = customMediaAddress;
    } else {
      this.media = new ethers.Contract(
        contractAddresses(networkId).zapMediaAddress,
        zapMediaAbi,
        signer
      );
      this.mediaAddress = contractAddresses(networkId).zapMediaAddress;
    }
  }

  /*********************
   * Zap View Methods
   *********************
   */

  /**
   * Fetches the amount of tokens an address owns on a media contract
   * @param owner The address to fetch the token balance for
   */
  public async fetchBalanceOf(owner: string): Promise<BigNumber> {
    if (owner == ethers.constants.AddressZero) {
      invariant(
        false,
        "ZapMedia (fetchBalanceOf): The (owner) address cannot be a zero address."
      );
    }

    return this.media.balanceOf(owner);
  }

  /**
   * Fetches the owner of the specified media on an instance of the Zap Media Contract
   * @param mediaId Numerical identifier for a minted token
   */
  public async fetchOwnerOf(mediaId: BigNumberish): Promise<string> {
    try {
      return await this.media.ownerOf(mediaId);
    } catch {
      invariant(false, "ZapMedia (fetchOwnerOf): The token id does not exist.");
    }
  }

  /**
   * Fetches the mediaId of the specified owner by index on an instance of the Zap Media Contract
   * @param owner Address of who the tokenId belongs to.
   * @param index The position of a tokenId that an address owns.
   */
  public async fetchMediaOfOwnerByIndex(
    owner: string,
    index: BigNumberish
  ): Promise<BigNumber> {
    // If the owner is a zero address throw an error
    if (owner == ethers.constants.AddressZero) {
      invariant(
        false,
        "ZapMedia (fetchMediaOfOwnerByIndex): The (owner) address cannot be a zero address."
      );
    }

    return this.media.tokenOfOwnerByIndex(owner, index);
  }

  /**
   * Fetches the content uri for the specified media on an instance of the Zap Media Contract
   * @param mediaId Numerical identifier for a minted token
   */
  public async fetchContentURI(mediaId: BigNumberish): Promise<string> {
    try {
      return await this.media.tokenURI(mediaId);
    } catch {
      invariant(false, "ZapMedia (fetchContentURI): TokenId does not exist.");
    }
  }

  /**
   * Fetches the metadata uri for the specified media on an instance of the ZAP Media Contract
   * @param mediaId
   */
  public async fetchMetadataURI(mediaId: BigNumberish): Promise<string> {
    try {
      return await this.media.tokenMetadataURI(mediaId);
    } catch {
      invariant(false, "ZapMedia (fetchMetadataURI): TokenId does not exist.");
    }
  }

  /**
   * Fetches the content hash for the specified media on the ZapMedia Contract
   * @param mediaId Numerical identifier for a minted token
   */
  public async fetchContentHash(mediaId: BigNumberish): Promise<string> {
    return this.media.getTokenContentHashes(mediaId);
  }

  /**
   * Fetches the metadata hash for the specified media on the ZapMedia Contract
   * @param mediaId Numerical identifier for a minted token
   */
  public async fetchMetadataHash(mediaId: BigNumberish): Promise<string> {
    return this.media.getTokenMetadataHashes(mediaId);
  }

  /**
   * Fetches the permit nonce on the specified media id for the owner address
   * @param address
   * @param mediaId
   */
  public async fetchPermitNonce(
    address: string,
    mediaId: BigNumberish
  ): Promise<BigNumber> {
    return this.media.getPermitNonce(address, mediaId);
  }

  /**
   * Fetches the creator for the specified media on an instance of the Zap Media Contract
   * @param mediaId Numerical identifier for a minted token
   */
  public async fetchCreator(mediaId: BigNumberish): Promise<string> {
    return await this.media.getTokenCreators(mediaId);
  }

  /**
   * Fetches the current bid shares for the specified media on an instance of the Zap Media Contract
   * @param mediaId
   */
  public async fetchCurrentBidShares(
    mediaAddress: string,
    mediaId: BigNumberish
  ): Promise<BidShares> {
    if (mediaAddress == ethers.constants.AddressZero) {
      invariant(
        false,
        "ZapMedia (fetchCurrentBidShares): The (mediaAddress) cannot be a zero address."
      );
    }
    return this.market.bidSharesForToken(mediaAddress, mediaId);
  }

  /**
   * Fetches the current ask for the specified media on an instance of the Zap Media Contract
   * @param mediaId Numerical identifier for a minted token
   */
  public async fetchCurrentAsk(
    mediaAddress: string,
    mediaId: BigNumberish
  ): Promise<Ask> {
    return this.market.currentAskForToken(mediaAddress, mediaId);
  }

  /**
   * Fetches the current bid for the specified bidder for the specified media on an instance of the Zap Media Contract
   * @param mediaContractAddress Designates which media contract to connect to.
   * @param mediaId Numerical identifier for a minted token
   * @param bidder The public address that set the bid
   */
  public async fetchCurrentBidForBidder(
    mediaContractAddress: string,
    mediaId: BigNumberish,
    bidder: string
  ): Promise<Bid> {
    // Checks if the mediaContractAddress is a zero address
    if (mediaContractAddress == ethers.constants.AddressZero) {
      invariant(
        false,
        "ZapMedia (fetchCurrentBidForBidder): The (media contract) address cannot be a zero address."
      );
    }

    // Checks if the tokenId exists
    try {
      await this.media.attach(mediaContractAddress).ownerOf(mediaId);
    } catch {
      invariant(
        false,
        "ZapMedia (fetchCurrentBidForBidder): The token id does not exist."
      );
    }

    // Checks if the bidder address is a zero address
    if (bidder == ethers.constants.AddressZero) {
      invariant(
        false,
        "ZapMedia (fetchCurrentBidForBidder): The (bidder) address cannot be a zero address."
      );
    }

    // Invokes the bidForTokenBidder function on the ZapMarket contract and returns the bidders bid details
    return this.market.bidForTokenBidder(mediaContractAddress, mediaId, bidder);
  }

  /**
   * Fetches the total amount of non-burned media that has been minted on an instance of the Zap Media Contract
   */
  public async fetchTotalMedia(): Promise<BigNumber> {
    return await this.media.totalSupply();
  }

  public async fetchMediaByIndex(index: BigNumberish): Promise<BigNumber> {
    let totalMedia: BigNumberish = await this.fetchTotalMedia();

    if (index > parseInt(totalMedia._hex) - 1) {
      invariant(false, "ZapMedia (fetchMediaByIndex): Index out of range.");
    }

    return this.media.tokenByIndex(index);
  }

  /**
   * Fetches the approved account for the specified media on an instance of the Zap Media Contract
   * @param mediaId Numerical identifier for a minted token
   */
  public async fetchApproved(mediaId: BigNumberish): Promise<string> {
    try {
      return await this.media.getApproved(mediaId);
    } catch {
      invariant(false, "ZapMedia (fetchApproved): TokenId does not exist.");
    }
  }

  /**
   * Fetches if the specified operator is approved for all media owned by the specified owner on an instance of the Zap Media Contract
   * @param owner
   * @param operator
   */
  public async fetchIsApprovedForAll(
    owner: string,
    operator: string
  ): Promise<boolean> {
    return this.media.isApprovedForAll(owner, operator);
  }

  public async updateContentURI(
    mediaId: number,
    tokenURI: string
  ): Promise<ContractTransaction> {
    let owner: string;

    try {
      owner = await this.media.ownerOf(mediaId);
    } catch {
      invariant(false, "ZapMedia (updateContentURI): TokenId does not exist.");
    }

    try {
      validateURI(tokenURI);
    } catch (err: any) {
      return Promise.reject(err.message);
    }

    // Returns the address approved for the tokenId by the owner
    const approveAddr: string = await this.media.getApproved(mediaId);

    // Returns true/false if the operator was approved for all by the owner
    const approveForAllStatus: boolean = await this.media.isApprovedForAll(
      owner,
      await this.signer.getAddress()
    );

    // Checks if the caller is not approved, not approved for all, and not the owner.
    // If the caller meets the three conditions throw an error
    if (
      approveAddr == ethers.constants.AddressZero &&
      approveForAllStatus == false &&
      owner !== (await this.signer.getAddress())
    ) {
      invariant(
        false,
        "ZapMedia (updateContentURI): Caller is not approved nor the owner."
      );
    }

    return await this.media.updateTokenURI(mediaId, tokenURI);
  }

  /**fetches the media specified Signature nonce. if signature nonce does not exist, function
   * will return an error message
   * @param address
   * @returns sigNonce
   */

  public async fetchMintWithSigNonce(address: string): Promise<BigNumber> {
    try {
      validateAndParseAddress(address);
    } catch (err: any) {
      return Promise.reject(err.message);
    }
    return this.media.getSigNonces(address);
  }

  /***********************
   * ERC-721 Write Methods
   ***********************
   */

  /**
   * Grants approval to the specified address for the specified media on an instance of the Zap Media Contract
   * @param to The address to be approved
   * @param mediaId Numerical identifier for a minted token
   */
  public async approve(
    to: string,
    mediaId: BigNumberish
  ): Promise<ContractTransaction> {
    // Will be assigned the address of the token owner
    let owner: string;

    try {
      owner = await this.media.ownerOf(mediaId);
    } catch {
      invariant(false, "ZapMedia (approve): TokenId does not exist.");
    }

    const approvalStatus: boolean = await this.media.isApprovedForAll(
      owner,
      await this.signer.getAddress()
    );

    if ((await this.signer.getAddress()) !== owner && approvalStatus == false) {
      invariant(
        false,
        "ZapMedia (approve): Caller is not the owner nor approved for all."
      );
    }

    return this.media.approve(to, mediaId);
  }

  /**
   * Grants approval for all media owner by msg.sender on an instance of the Zap Media Contract
   * @param operator
   * @param approved
   */
  public async setApprovalForAll(
    operator: string,
    approved: boolean
  ): Promise<ContractTransaction> {
    if (operator == (await this.signer.getAddress())) {
      invariant(
        false,
        "ZapMedia (setApprovalForAll): The caller cannot be the operator."
      );
    }
    return this.media.setApprovalForAll(operator, approved);
  }

  /**
   * Transfers the specified media to the specified to address on an instance of the Zap Media Contract
   * @param from The address of the owner who is transferring the token
   * @param to The receiving address
   * @param mediaId Numerical identifier for a minted token
   */
  public async transferFrom(
    from: string,
    to: string,
    mediaId: BigNumberish
  ): Promise<ContractTransaction> {
    let owner: string;
    if (from == ethers.constants.AddressZero) {
      invariant(
        false,
        "ZapMedia (transferFrom): The (from) address cannot be a zero address."
      );
    }

    if (to == ethers.constants.AddressZero) {
      invariant(
        false,
        "ZapMedia (transferFrom): The (to) address cannot be a zero address."
      );
    }

    try {
      owner = await this.media.ownerOf(mediaId);
    } catch {
      invariant(false, "ZapMedia (transferFrom): TokenId does not exist.");
    }

    // Returns the address approved for the tokenId by the owner
    const approveAddr: string = await this.media.getApproved(mediaId);

    // Returns true/false if the operator was approved for all by the owner
    const approveForAllStatus: boolean = await this.media.isApprovedForAll(
      owner,
      await this.signer.getAddress()
    );

    // Checks if the caller is not approved, not approved for all, and not the owner.
    // If the caller meets the three conditions throw an error
    if (
      approveAddr == ethers.constants.AddressZero &&
      approveForAllStatus == false &&
      owner !== (await this.signer.getAddress())
    ) {
      invariant(
        false,
        "ZapMedia (transferFrom): Caller is not approved nor the owner."
      );
    }

    return this.media.transferFrom(from, to, mediaId);
  }

  /**
   * Executes a SafeTransfer of the specified media to the specified address if and only if it adheres to the ERC721-Receiver Interface
   * @param from The address of the owner who is transferring the token
   * @param to The receiving address
   * @param mediaId Numerical identifier for a minted token
   */
  public async safeTransferFrom(
    from: string,
    to: string,
    mediaId: BigNumberish
  ): Promise<ContractTransaction> {
    let owner: string;
    try {
      owner = await this.media.ownerOf(mediaId);
    } catch {
      invariant(false, "ZapMedia (safeTransferFrom): TokenId does not exist.");
    }

    if (from == ethers.constants.AddressZero) {
      invariant(
        false,
        "ZapMedia (safeTransferFrom): The (from) address cannot be a zero address."
      );
    }

    if (to == ethers.constants.AddressZero) {
      invariant(
        false,
        "ZapMedia (safeTransferFrom): The (to) address cannot be a zero address."
      );
    }

    // Returns the address approved for the tokenId by the owner
    const approveAddr: string = await this.media.getApproved(mediaId);

    // Returns true/false if the operator was approved for all by the owner
    const approveForAllStatus: boolean = await this.media.isApprovedForAll(
      owner,
      await this.signer.getAddress()
    );

    // Checks if the caller is not approved, not approved for all, and not the owner.
    // If the caller meets the three conditions throw an error
    if (
      approveAddr == ethers.constants.AddressZero &&
      approveForAllStatus == false &&
      owner !== (await this.signer.getAddress())
    ) {
      invariant(
        false,
        "ZapMedia (safeTransferFrom): Caller is not approved nor the owner."
      );
    }

    return this.media["safeTransferFrom(address,address,uint256)"](
      from,
      to,
      mediaId
    );
  }

  /**
   * Mints a new piece of media on an instance of the Zap Media Contract
   * @param mintData
   * @param bidShares
   */
  public async mint(
    mediaData: MediaData,
    bidShares: BidShares
  ): Promise<ContractTransaction> {
    try {
      validateURI(mediaData.tokenURI);
      validateURI(mediaData.metadataURI);
      validateBidShares(
        bidShares.collabShares,
        bidShares.creator,
        bidShares.owner
      );
    } catch (err: any) {
      return Promise.reject(err.message);
    }

    const gasEstimate: BigNumber = await this.media.estimateGas.mint(
      mediaData,
      bidShares
    );

    return this.media.mint(mediaData, bidShares, { gasLimit: gasEstimate });
  }

  /**
   * Mints a new piece of media on an instance of the Zap Media Contract
   * @param creator
   * @param mediaData
   * @param bidShares
   * @param sig
   */
  public async mintWithSig(
    creator: string,
    mediaData: MediaData,
    bidShares: BidShares,
    sig: EIP712Signature
  ): Promise<ContractTransaction> {
    try {
      // this.ensureNotReadOnly()
      validateURI(mediaData.metadataURI);
      validateURI(mediaData.tokenURI);
      validateBidShares(
        bidShares.collabShares,
        bidShares.creator,
        bidShares.owner
      );
    } catch (err: any) {
      return Promise.reject(err.message);
    }

    return this.media.mintWithSig(creator, mediaData, bidShares, sig);
  }

  /**
   * Sets an ask on the specified media on an instance of the Zap Media Contract
   * @param mediaId
   * @param ask
   */
  public async setAsk(
    mediaId: BigNumberish,
    ask: Ask
  ): Promise<ContractTransaction> {
    // Returns the address of the tokenOwner
    const tokenOwner = await this.media.ownerOf(mediaId);

    // Returns the address of the connected signer
    const signerAddress = await this.signer.getAddress();

    // Returns the address approved for the tokenId
    const isApproved = await this.media.getApproved(mediaId);

    // If the signer is not the token owner and the approved address is a zerp address
    if (
      tokenOwner !== signerAddress &&
      isApproved === ethers.constants.AddressZero
    ) {
      invariant(false, "ZapMedia (setAsk): Media: Only approved or owner.");

      // If the signer is not the token owner or if the signer is the approved address
    } else if (tokenOwner !== signerAddress || isApproved === signerAddress) {
      return this.media.setAsk(mediaId, ask);

      // If the signer is the token owner and is not the approved address
    } else {
      return this.media.setAsk(mediaId, ask);
    }
  }

  /**
   * Sets a bid on the specified media on an instance of the Zap Media Contract
   * @param mediaId
   * @param bid
   */
  public async setBid(
    mediaId: BigNumberish,
    bid: Bid
  ): Promise<ContractTransaction> {
    //If the tokenId does not exist
    try {
      await this.media.ownerOf(mediaId);
    } catch (err: any) {
      invariant(false, "ZapMedia (setBid): TokenId does not exist.");
    }

    if (bid.currency == ethers.constants.AddressZero) {
      invariant(false, "ZapMedia (setBid): Currency cannot be a zero address.");
    } else if (bid.recipient == ethers.constants.AddressZero) {
      invariant(
        false,
        "ZapMedia (setBid): Recipient cannot be a zero address."
      );
    } else if (bid.amount == 0) {
      invariant(false, "ZapMedia (setBid): Amount cannot be zero.");
    }

    return this.media.setBid(mediaId, bid);
  }

  /**
   * Removes the ask on the specified media on an instance of the Zap Media Contract
   * @param mediaId Numerical identifier for a minted token
   */
  public async removeAsk(mediaId: BigNumberish): Promise<ContractTransaction> {
    const ask = await this.market.currentAskForToken(
      this.media.address,
      mediaId
    );

    try {
      await this.media.ownerOf(mediaId);
    } catch (err: any) {
      invariant(false, "ZapMedia (removeAsk): TokenId does not exist.");
    }

    if (ask.amount == 0) {
      invariant(false, "ZapMedia (removeAsk): Ask was never set.");
    } else {
      return this.media.removeAsk(mediaId);
    }
  }

  /**
   * Accepts the specified bid on the specified media on an instance of the Zap Media Contract
   * @param mediaId
   * @param bid
   */
  public async acceptBid(
    mediaId: BigNumberish,
    bid: Bid
  ): Promise<ContractTransaction> {
    let owner: string;
    try {
      owner = await this.media.ownerOf(mediaId);
    } catch {
      invariant(false, "ZapMedia (acceptBid): The token id does not exist.");
    }

    // Returns the address approved for the tokenId by the owner
    const approveAddr: string = await this.media.getApproved(mediaId);

    // Returns true/false if the operator was approved for all by the owner
    const approveForAllStatus: boolean = await this.media.isApprovedForAll(
      owner,
      await this.signer.getAddress()
    );

    if (
      approveAddr == ethers.constants.AddressZero &&
      approveForAllStatus == false &&
      owner !== (await this.signer.getAddress())
    ) {
      invariant(
        false,
        "ZapMedia (acceptBid): Caller is not approved nor the owner."
      );
    }

    return this.media.acceptBid(mediaId, bid);
  }
  /**
   * Removes the bid for the msg.sender on the specified media on an instance of the Zap Media Contract
   * @param mediaId
   */
  public async removeBid(mediaId: BigNumberish): Promise<ContractTransaction> {
    try {
      await this.media.ownerOf(mediaId);
    } catch {
      invariant(false, "ZapMedia (removeBid): The token id does not exist.");
    }

    return this.media.removeBid(mediaId);
  }

  /**
   * Updates the metadata uri for the specified media on an instance of the Zap Media Contract
   * @param mediaId
   * @param metadataURI
   */
  public async updateMetadataURI(
    mediaId: BigNumberish,
    metadataURI: string
  ): Promise<ContractTransaction> {
    // Will store the address of the token owner if the tokenId exists
    let owner: string;

    try {
      validateURI(metadataURI);
    } catch (err: any) {
      return Promise.reject(err.message);
    }

    // Checks if the tokenId exists. If the tokenId exists store the owner
    // address in the variable and if it doesnt throw an error
    try {
      owner = await this.media.ownerOf(mediaId);
    } catch {
      invariant(false, "ZapMedia (updateMetadataURI): TokenId does not exist.");
    }

    // Returns the address approved for the tokenId by the owner
    const approveAddr: string = await this.media.getApproved(mediaId);

    // Returns true/false if the operator was approved for all by the owner
    const approveForAllStatus: boolean = await this.media.isApprovedForAll(
      owner,
      await this.signer.getAddress()
    );

    // Checks if the caller is not approved, not approved for all, and not the owner.
    // If the caller meets the three conditions throw an error
    if (
      approveAddr == ethers.constants.AddressZero &&
      approveForAllStatus == false &&
      owner !== (await this.signer.getAddress())
    ) {
      invariant(
        false,
        "ZapMedia (updateMetadataURI): Caller is not approved nor the owner."
      );
    }

    return this.media.updateTokenMetadataURI(mediaId, metadataURI);
  }

  /**
   * Grants the spender approval for the specificxed media using meta transactions as outlined in EIP-712
   * @param sender
   * @param mediaId
   * @param sig
   */
  public async permit(
    spender: string,
    tokenId: BigNumberish,
    sig: EIP712Signature
  ): Promise<ContractTransaction> {
    // try {
    //   this.ensureNotReadOnly()
    // } catch (err) {
    //   if (err instanceof Error) {
    //     return Promise.reject(err.message)
    //   }
    // }
    return this.media.permit(spender, tokenId, sig);
  }

  /**
   * Revokes the approval of an approved account for the specified media on an instance of the Zap Media Contract
   * @param mediaId Numerical identifier for a minted token
   */
  public async revokeApproval(
    mediaId: BigNumberish
  ): Promise<ContractTransaction> {
    let owner: string;
    try {
      owner = await this.media.ownerOf(mediaId);
    } catch {
      invariant(
        false,
        "ZapMedia (revokeApproval): The token id does not exist."
      );
    }

    // Returns the address approved for the tokenId by the owner
    const approveAddr: string = await this.media.getApproved(mediaId);

    // Returns true/false if the operator was approved for all by the owner
    const approveForAllStatus: boolean = await this.media.isApprovedForAll(
      owner,
      await this.signer.getAddress()
    );

    // Checks if the caller is not approved, not approved for all, and not the owner.
    // If the caller meets the three conditions throw an error
    if (
      approveAddr == ethers.constants.AddressZero &&
      approveForAllStatus == false &&
      owner !== (await this.signer.getAddress())
    ) {
      invariant(
        false,
        "ZapMedia (revokeApproval): Caller is not approved nor the owner."
      );
    }
    return this.media.revokeApproval(mediaId);
  }

  /**
   * Burns the specified media on an instance of the Zap Media Contract
   * @param mediaId Numerical identifier for a minted token
   */
  public async burn(mediaId: BigNumberish): Promise<ContractTransaction> {
    // Will store the address of the token owner if the tokenId exists
    let owner: string;

    // Checks if the tokenId exists. If the tokenId exists store the owner
    // address in the variable and if it doesnt throw an error
    try {
      owner = await this.media.ownerOf(mediaId);
    } catch {
      invariant(false, "ZapMedia (burn): TokenId does not exist.");
    }

    // Returns the address approved for the tokenId by the owner
    const approveAddr: string = await this.media.getApproved(mediaId);

    // Returns true/false if the operator was approved for all by the owner
    const approveForAllStatus: boolean = await this.media.isApprovedForAll(
      owner,
      await this.signer.getAddress()
    );

    // Checks if the caller is not approved, not approved for all, and not the owner.
    // If the caller meets the three conditions throw an error
    if (
      approveAddr == ethers.constants.AddressZero &&
      approveForAllStatus == false &&
      owner !== (await this.signer.getAddress())
    ) {
      invariant(
        false,
        "ZapMedia (burn): Caller is not approved nor the owner."
      );
    }

    // Invoke the burn function if the caller is approved, approved for all, or the owner
    return await this.media.burn(mediaId);
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
    const currentBidShares = await this.fetchCurrentBidShares(
      this.media.address,
      mediaId
    );
    const isSellOnShareValid = bid.sellOnShare.value.lte(
      decimal100.value.sub(currentBidShares.creator.value)
    );

    return isAmountValid && isSellOnShareValid;
  }

 public async isValidBidShares(
    bidShares: BidShares,
  ): Promise<boolean> {
    return this.market.isValidBidShares(bidShares);
  }

  /****************
   * Miscellaneous
   * **************
   */

  /**
   * Returns the EIP-712 Domain for an instance of the Zap Media Contract
   */
  public eip712Domain(): EIP712Domain {
    // Due to a bug in ganache-core, set the chainId to 1 if its a local blockchain
    // https://github.com/trufflesuite/ganache-core/issues/515
    const chainId = this.networkId == 1337 ? 1 : this.networkId;

    return {
      name: "TEST COLLECTION",
      version: "1",
      chainId: chainId,
      verifyingContract: this.media.address,
    };
  }
}
export default ZapMedia;
