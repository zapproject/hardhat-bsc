import { ContractTransaction, BigNumber, BigNumberish, Signer } from 'ethers';
import { MediaData, BidShares, Ask, EIP712Signature, EIP712Domain } from './types';
declare class ZapMedia {
    getSigNonces(addess: any): void;
    networkId: number;
    mediaIndex: any;
    media: any;
    market: any;
    signer: Signer;
    readOnly: boolean;
    constructor(networkId: number, signer: Signer, mediaIndex?: number);
    /*********************
     * Zap View Methods
     *********************
     */
    fetchBalanceOf(owner: string): Promise<BigNumber>;
    /**
     * Fetches the owner of the specified media on an instance of the Zap Media Contract
     * @param mediaId
     */
    fetchOwnerOf(mediaId: BigNumberish): Promise<string>;
    /**
     * Fetches the mediaId of the specified owner by index on an instance of the Zap Media Contract
     * @param owner
     * @param index
     */
    fetchMediaOfOwnerByIndex(owner: string, index: BigNumberish): Promise<BigNumber>;
    /**
     * Fetches the content uri for the specified media on an instance of the Zap Media Contract
     * @param mediaId
     */
    fetchContentURI(mediaId: BigNumberish): Promise<string>;
    /**
     * Fetches the metadata uri for the specified media on an instance of the ZAP Media Contract
     * @param mediaId
     */
    fetchMetadataURI(mediaId: BigNumberish): Promise<string>;
    /**
     * Fetches the content hash for the specified media on the ZapMedia Contract
     * @param mediaId
     */
    fetchContentHash(mediaId: BigNumberish): Promise<string>;
    /**
     * Fetches the metadata hash for the specified media on the ZapMedia Contract
     * @param mediaId
     */
    fetchMetadataHash(mediaId: BigNumberish): Promise<string>;
    /**
     * Fetches the permit nonce on the specified media id for the owner address
     * @param address
     * @param mediaId
     */
    fetchPermitNonce(address: string, mediaId: BigNumberish): Promise<BigNumber>;
    /**
     * Fetches the creator for the specified media on an instance of the Zap Media Contract
     * @param mediaId
     */
    fetchCreator(mediaId: BigNumberish): Promise<string>;
    /**
     * Fetches the current bid shares for the specified media on an instance of the Zap Media Contract
     * @param mediaId
     */
    fetchCurrentBidShares(mediaAddress: string, mediaId: BigNumberish): Promise<BidShares>;
    /**
     * Fetches the current ask for the specified media on an instance of the Zap Media Contract
     * @param mediaId
     */
    fetchCurrentAsk(mediaAddress: string, mediaId: BigNumberish): Promise<Ask>;
    /**
     * Fetches the total amount of non-burned media that has been minted on an instance of the Zap Media Contract
     */
    fetchTotalMedia(): Promise<BigNumber>;
    fetchMediaByIndex(index: BigNumberish): Promise<BigNumber>;
    /**
     * Fetches the approved account for the specified media on an instance of the Zap Media Contract
     * @param mediaId
     */
    fetchApproved(mediaId: BigNumberish): Promise<string>;
    /**
     * Fetches if the specified operator is approved for all media owned by the specified owner on an instance of the Zap Media Contract
     * @param owner
     * @param operator
     */
    fetchIsApprovedForAll(owner: string, operator: string): Promise<boolean>;
    updateContentURI(mediaId: number, tokenURI: string): Promise<ContractTransaction>;
    /**fetches the media specified Signature nonce. if signature nonce does not exist, function
     * will return an error message
     * @param address
     * @returns sigNonce
     */
    fetchMintWithSigNonce(address: string): Promise<BigNumber>;
    /***********************
     * ERC-721 Write Methods
     ***********************
     */
    /**
     * Grants approval to the specified address for the specified media on an instance of the Zap Media Contract
     * @param to
     * @param mediaId
     */
    approve(to: string, mediaId: BigNumberish): Promise<ContractTransaction>;
    /**
     * Grants approval for all media owner by msg.sender on an instance of the Zap Media Contract
     * @param operator
     * @param approved
     */
    setApprovalForAll(operator: string, approved: boolean): Promise<ContractTransaction>;
    /**
     * Transfers the specified media to the specified to address on an instance of the Zap Media Contract
     * @param from
     * @param to
     * @param mediaId
     */
    transferFrom(from: string, to: string, mediaId: BigNumberish): Promise<ContractTransaction>;
    /**
     * Executes a SafeTransfer of the specified media to the specified address if and only if it adheres to the ERC721-Receiver Interface
     * @param from
     * @param to
     * @param mediaId
     */
    safeTransferFrom(from: string, to: string, mediaId: BigNumberish): Promise<ContractTransaction>;
    /**
     * Mints a new piece of media on an instance of the Zap Media Contract
     * @param mintData
     * @param bidShares
     */
    mint(mediaData: MediaData, bidShares: BidShares): Promise<ContractTransaction>;
    /**
     * Mints a new piece of media on an instance of the Zap Media Contract
     * @param creator
     * @param mediaData
     * @param bidShares
     * @param sig
     */
    mintWithSig(creator: string, mediaData: MediaData, bidShares: BidShares, sig: EIP712Signature): Promise<ContractTransaction>;
    /**
     * Sets an ask on the specified media on an instance of the Zap Media Contract
     * @param mediaId
     * @param ask
     */
    setAsk(mediaId: BigNumberish, ask: Ask): Promise<ContractTransaction>;
    /**
     * Removes the ask on the specified media on an instance of the Zap Media Contract
     * @param mediaId
     */
    removeAsk(mediaId: BigNumberish): Promise<ContractTransaction>;
    /**
     * Updates the metadata uri for the specified media on an instance of the Zap Media Contract
     * @param mediaId
     * @param metadataURI
     */
    updateMetadataURI(mediaId: BigNumberish, metadataURI: string): Promise<ContractTransaction>;
    /**
     * Grants the spender approval for the specified media using meta transactions as outlined in EIP-712
     * @param sender
     * @param mediaId
     * @param sig
     */
    permit(spender: string, tokenId: BigNumberish, sig: EIP712Signature): Promise<ContractTransaction>;
    /**
     * Revokes the approval of an approved account for the specified media on an instance of the Zap Media Contract
     * @param mediaId
     */
    revokeApproval(mediaId: BigNumberish): Promise<ContractTransaction>;
    /**
     * Burns the specified media on an instance of the Zap Media Contract
     * @param mediaId
     */
    burn(mediaId: BigNumberish): Promise<ContractTransaction>;
    /**
     * Checks to see if a Bid's amount is evenly splittable given the media's current bidShares
     *
     * @param mediaId
     * @param bid
     */
    isValidBid(mediaId: BigNumberish, bid: any): Promise<boolean>;
    /****************
   * Miscellaneous
   * **************
   */
    /**
     * Returns the EIP-712 Domain for an instance of the Zora Media Contract
     */
    eip712Domain(): EIP712Domain;
}
export default ZapMedia;
