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
   * Fetch the balance of an address on an instance of a ZapMedia contract
   * @param owner The address of the account whose balance is being fetched
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
   * Fetch the owner of a tokenId on an instance of a ZapMedia contract
   * @param tokenId The Numerical identifier of a minted token whose owner is being fetched
   */
  public async fetchOwnerOf(tokenId: BigNumberish): Promise<string> {
    try {
      return await this.media.ownerOf(tokenId);
    } catch {
      invariant(false, "ZapMedia (fetchOwnerOf): The token id does not exist.");
    }
  }

  /**
   * Fetch the tokenId of the specified owner by index on an instance of a ZapMedia Contract
   * @param owner The owner address of the tokenId.
   * @param index The ERC-721 enumerbale index of owner
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
   * Fetch the content uri for the specified tokenId on an instance of a ZapMedia Contract
   * @param tokenId The Numerical identifier of a minted token whose content uri is being fetched
   */
  public async fetchContentURI(tokenId: BigNumberish): Promise<string> {
    try {
      return await this.media.tokenURI(tokenId);
    } catch {
      invariant(false, "ZapMedia (fetchContentURI): TokenId does not exist.");
    }
  }

  /**
   * Fetch the metadata uri for the specified tokenId on an instance of a ZapMedia Contract
   * @param tokenId The Numerical identifier of a minted token whose metadata uri is being fetched
   */
  public async fetchMetadataURI(tokenId: BigNumberish): Promise<string> {
    try {
      return await this.media.tokenMetadataURI(tokenId);
    } catch {
      invariant(false, "ZapMedia (fetchMetadataURI): TokenId does not exist.");
    }
  }

  /**
   * Fetch the contentHash of a tokenId on an instance of a ZapMedia contract.
   * @param tokenId The Numerical identifier of a minted token whose contentHash is being fetched
   */
  public async fetchContentHash(tokenId: BigNumberish): Promise<string> {
    return this.media.getTokenContentHashes(tokenId);
  }

  /**
   * Fetch the metadataHash of a tokenId on an instance of a ZapMedia contract.
   * @param tokenId The Numerical identifier of a minted token whose metadataHash is being fetched
   */
  public async fetchMetadataHash(tokenId: BigNumberish): Promise<string> {
    return this.media.getTokenMetadataHashes(tokenId);
  }

  /**
   * Fetches the permit nonce on the specified media id for the owner address
   * @param address
   * @param tokenId
   */
  public async fetchPermitNonce(
    address: string,
    tokenId: BigNumberish
  ): Promise<BigNumber> {
    return this.media.getPermitNonce(address, tokenId);
  }

  /**
   * Fetch the creator of a tokenId on an instance of a ZapMedia contract
   * @param tokenId he Numerical identifier of a minted token whose creator is being fetched
   */
  public async fetchCreator(tokenId: BigNumberish): Promise<string> {
    return await this.media.getTokenCreators(tokenId);
  }

  /**
   * Fetch the current bidShares of a tokenId on an instance of a ZapMedia contract
   * @param mediaAddress The address of a ZapMedia contract
   * @param tokenId The Numerical identifier of a minted token whose bidShares are being fetched
   */
  public async fetchCurrentBidShares(
    mediaAddress: string,
    tokenId: BigNumberish
  ): Promise<BidShares> {
    if (mediaAddress == ethers.constants.AddressZero) {
      invariant(
        false,
        "ZapMedia (fetchCurrentBidShares): The (mediaAddress) cannot be a zero address."
      );
    }
    return this.market.bidSharesForToken(mediaAddress, tokenId);
  }

  /**
   * Fetch the current ask of a tokenId on an instance of a ZapMedia contract
   * @param mediaAddress The address of a ZapMedia contract
   * @param tokenId The Numerical identifier of a minted token whose ask is being fetched
   */
  public async fetchCurrentAsk(
    mediaAddress: string,
    tokenId: BigNumberish
  ): Promise<Ask> {
    return this.market.currentAskForToken(mediaAddress, tokenId);
  }

  /**
   * Fetches the current bid for the specified bidder for the specified media on an instance of the Zap Media Contract
   * @param mediaAddress Designates which media contract to connect to.
   * @param tokenId Numerical identifier for a minted token
   * @param bidder The public address that set the bid
   */
  public async fetchCurrentBidForBidder(
    mediaAddress: string,
    tokenId: BigNumberish,
    bidder: string
  ): Promise<Bid> {
    // Checks if the mediaAddress is a zero address
    if (mediaAddress == ethers.constants.AddressZero) {
      invariant(
        false,
        "ZapMedia (fetchCurrentBidForBidder): The (media contract) address cannot be a zero address."
      );
    }

    // Checks if the tokenId exists
    try {
      await this.media.attach(mediaAddress).ownerOf(tokenId);
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
    return this.market.bidForTokenBidder(mediaAddress, tokenId, bidder);
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
   * @param tokenId Numerical identifier for a minted token
   */
  public async fetchApproved(tokenId: BigNumberish): Promise<string> {
    try {
      return await this.media.getApproved(tokenId);
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
    tokenId: number,
    tokenURI: string
  ): Promise<ContractTransaction> {
    let owner: string;

    try {
      owner = await this.media.ownerOf(tokenId);
    } catch {
      invariant(false, "ZapMedia (updateContentURI): TokenId does not exist.");
    }

    try {
      validateURI(tokenURI);
    } catch (err: any) {
      return Promise.reject(err.message);
    }

    // Returns the address approved for the tokenId by the owner
    const approveAddr: string = await this.media.getApproved(tokenId);

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

    return await this.media.updateTokenURI(tokenId, tokenURI);
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
   * @param tokenId Numerical identifier for a minted token
   */
  public async approve(
    to: string,
    tokenId: BigNumberish
  ): Promise<ContractTransaction> {
    // Will be assigned the address of the token owner
    let owner: string;

    try {
      owner = await this.media.ownerOf(tokenId);
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

    return this.media.approve(to, tokenId);
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
   * @param tokenId Numerical identifier for a minted token
   */
  public async transferFrom(
    from: string,
    to: string,
    tokenId: BigNumberish
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
      owner = await this.media.ownerOf(tokenId);
    } catch {
      invariant(false, "ZapMedia (transferFrom): TokenId does not exist.");
    }

    // Returns the address approved for the tokenId by the owner
    const approveAddr: string = await this.media.getApproved(tokenId);

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

    return this.media.transferFrom(from, to, tokenId);
  }

  /**
   * Executes a SafeTransfer of the specified media to the specified address if and only if it adheres to the ERC721-Receiver Interface
   * @param from The address of the owner who is transferring the token
   * @param to The receiving address
   * @param tokenId Numerical identifier for a minted token
   */
  public async safeTransferFrom(
    from: string,
    to: string,
    tokenId: BigNumberish
  ): Promise<ContractTransaction> {
    let owner: string;
    try {
      owner = await this.media.ownerOf(tokenId);
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
    const approveAddr: string = await this.media.getApproved(tokenId);

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
      tokenId
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
   * @param tokenId
   * @param ask
   */
  public async setAsk(
    tokenId: BigNumberish,
    ask: Ask
  ): Promise<ContractTransaction> {
    // Returns the address of the tokenOwner
    const tokenOwner = await this.media.ownerOf(tokenId);

    // Returns the address of the connected signer
    const signerAddress = await this.signer.getAddress();

    // Returns the address approved for the tokenId
    const isApproved = await this.media.getApproved(tokenId);

    // If the signer is not the token owner and the approved address is a zerp address
    if (
      tokenOwner !== signerAddress &&
      isApproved === ethers.constants.AddressZero
    ) {
      invariant(false, "ZapMedia (setAsk): Media: Only approved or owner.");

      // If the signer is not the token owner or if the signer is the approved address
    } else if (tokenOwner !== signerAddress || isApproved === signerAddress) {
      return this.media.setAsk(tokenId, ask);

      // If the signer is the token owner and is not the approved address
    } else {
      return this.media.setAsk(tokenId, ask);
    }
  }

  /**
   * Sets a bid on the specified media on an instance of the Zap Media Contract
   * @param tokenId
   * @param bid
   */
  public async setBid(
    tokenId: BigNumberish,
    bid: Bid
  ): Promise<ContractTransaction> {
    //If the tokenId does not exist
    try {
      await this.media.ownerOf(tokenId);
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

    return this.media.setBid(tokenId, bid);
  }

  /**
   * Removes the ask on the specified media on an instance of the Zap Media Contract
   * @param tokenId Numerical identifier for a minted token
   */
  public async removeAsk(tokenId: BigNumberish): Promise<ContractTransaction> {
    const ask = await this.market.currentAskForToken(
      this.media.address,
      tokenId
    );

    try {
      await this.media.ownerOf(tokenId);
    } catch (err: any) {
      invariant(false, "ZapMedia (removeAsk): TokenId does not exist.");
    }

    if (ask.amount == 0) {
      invariant(false, "ZapMedia (removeAsk): Ask was never set.");
    } else {
      return this.media.removeAsk(tokenId);
    }
  }

  /**
   * Accepts the specified bid on the specified media on an instance of the Zap Media Contract
   * @param tokenId
   * @param bid
   */
  public async acceptBid(
    tokenId: BigNumberish,
    bid: Bid
  ): Promise<ContractTransaction> {
    let owner: string;
    try {
      owner = await this.media.ownerOf(tokenId);
    } catch {
      invariant(false, "ZapMedia (acceptBid): The token id does not exist.");
    }

    // Returns the address approved for the tokenId by the owner
    const approveAddr: string = await this.media.getApproved(tokenId);

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

    return this.media.acceptBid(tokenId, bid);
  }
  /**
   * Removes the bid for the msg.sender on the specified media on an instance of the Zap Media Contract
   * @param tokenId
   */
  public async removeBid(tokenId: BigNumberish): Promise<ContractTransaction> {
    try {
      await this.media.ownerOf(tokenId);
    } catch {
      invariant(false, "ZapMedia (removeBid): The token id does not exist.");
    }

    return this.media.removeBid(tokenId);
  }

  /**
   * Updates the metadata uri for the specified media on an instance of the Zap Media Contract
   * @param tokenId
   * @param metadataURI
   */
  public async updateMetadataURI(
    tokenId: BigNumberish,
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
      owner = await this.media.ownerOf(tokenId);
    } catch {
      invariant(false, "ZapMedia (updateMetadataURI): TokenId does not exist.");
    }

    // Returns the address approved for the tokenId by the owner
    const approveAddr: string = await this.media.getApproved(tokenId);

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

    return this.media.updateTokenMetadataURI(tokenId, metadataURI);
  }

  /**
   * Grants the spender approval for the specificxed media using meta transactions as outlined in EIP-712
   * @param sender
   * @param tokenId
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
   * @param tokenId Numerical identifier for a minted token
   */
  public async revokeApproval(
    tokenId: BigNumberish
  ): Promise<ContractTransaction> {
    let owner: string;
    try {
      owner = await this.media.ownerOf(tokenId);
    } catch {
      invariant(
        false,
        "ZapMedia (revokeApproval): The token id does not exist."
      );
    }

    // Returns the address approved for the tokenId by the owner
    const approveAddr: string = await this.media.getApproved(tokenId);

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
    return this.media.revokeApproval(tokenId);
  }

  /**
   * Burns the specified media on an instance of the Zap Media Contract
   * @param tokenId Numerical identifier for a minted token
   */
  public async burn(tokenId: BigNumberish): Promise<ContractTransaction> {
    // Will store the address of the token owner if the tokenId exists
    let owner: string;

    // Checks if the tokenId exists. If the tokenId exists store the owner
    // address in the variable and if it doesnt throw an error
    try {
      owner = await this.media.ownerOf(tokenId);
    } catch {
      invariant(false, "ZapMedia (burn): TokenId does not exist.");
    }

    // Returns the address approved for the tokenId by the owner
    const approveAddr: string = await this.media.getApproved(tokenId);

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
    return await this.media.burn(tokenId);
  }

  /**
   * Checks to see if a Bid's amount is evenly splittable given the media's current bidShares
   *
   * @param tokenId
   * @param bid
   */
  public async isValidBid(tokenId: BigNumberish, bid: any): Promise<boolean> {
    const isAmountValid = await this.market.isValidBid(tokenId, bid.amount);
    const decimal100 = Decimal.new(100);
    const currentBidShares = await this.fetchCurrentBidShares(
      this.media.address,
      tokenId
    );
    const isSellOnShareValid = bid.sellOnShare.value.lte(
      decimal100.value.sub(currentBidShares.creator.value)
    );

    return isAmountValid && isSellOnShareValid;
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
