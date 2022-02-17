import { Contract, ContractTransaction, BigNumber, BigNumberish, Signer } from "ethers";
import { MediaData, BidShares, Ask, Bid, EIP712Signature, EIP712Domain } from "./types";
declare class ZapMedia {
    getSigNonces(addess: any): void;
    networkId: number;
    media: Contract;
    market: Contract;
    signer: Signer;
    mediaAddress: string;
    marketAddress: string;
    constructor(networkId: number, signer: Signer, customMediaAddress?: string);
    /*********************
     * Zap View Methods
     *********************
     */
    /**
     * Fetches the amount of tokens an address owns on a media contract
     * @param owner The address to fetch the token balance for
     */
    fetchBalanceOf(owner: string): Promise<BigNumber>;
    /**
     * Fetches the owner of the specified media on an instance of the Zap Media Contract
     * @param mediaId Numerical identifier for a minted token
     */
    fetchOwnerOf(mediaId: BigNumberish): Promise<string>;
    /**
     * Fetches the mediaId of the specified owner by index on an instance of the Zap Media Contract
     * @param owner Address of who the tokenId belongs to.
     * @param index The position of a tokenId that an address owns.
     */
    fetchMediaOfOwnerByIndex(owner: string, index: BigNumberish): Promise<BigNumber>;
    /**
     * Fetches the content uri for the specified media on an instance of the Zap Media Contract
     * @param mediaId Numerical identifier for a minted token
     */
    fetchContentURI(mediaId: BigNumberish): Promise<string>;
    /**
     * Fetches the metadata uri for the specified media on an instance of the ZAP Media Contract
     * @param mediaId
     */
    fetchMetadataURI(mediaId: BigNumberish): Promise<string>;
    /**
     * Fetches the content hash for the specified media on the ZapMedia Contract
     * @param mediaId Numerical identifier for a minted token
     */
    fetchContentHash(mediaId: BigNumberish): Promise<string>;
    /**
     * Fetches the metadata hash for the specified media on the ZapMedia Contract
     * @param mediaId Numerical identifier for a minted token
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
     * @param mediaId Numerical identifier for a minted token
     */
    fetchCreator(mediaId: BigNumberish): Promise<string>;
    /**
     * Fetches the current bid shares for the specified media on an instance of the Zap Media Contract
     * @param mediaId
     */
    fetchCurrentBidShares(mediaAddress: string, mediaId: BigNumberish): Promise<BidShares>;
    /**
     * Fetches the current ask for the specified media on an instance of the Zap Media Contract
     * @param mediaId Numerical identifier for a minted token
     */
    fetchCurrentAsk(mediaAddress: string, mediaId: BigNumberish): Promise<Ask>;
    /**
     * Fetches the current bid for the specified bidder for the specified media on an instance of the Zap Media Contract
     * @param mediaContractAddress Designates which media contract to connect to.
     * @param mediaId Numerical identifier for a minted token
     * @param bidder The public address that set the bid
     */
    fetchCurrentBidForBidder(mediaContractAddress: string, mediaId: BigNumberish, bidder: string): Promise<Bid>;
    /**
     * Fetches the total amount of non-burned media that has been minted on an instance of the Zap Media Contract
     */
    fetchTotalMedia(): Promise<BigNumber>;
    fetchMediaByIndex(index: BigNumberish): Promise<BigNumber>;
    /**
     * Fetches the approved account for the specified media on an instance of the Zap Media Contract
     * @param mediaId Numerical identifier for a minted token
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
     * @param to The address to be approved
     * @param mediaId Numerical identifier for a minted token
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
     * @param from The address of the owner who is transferring the token
     * @param to The receiving address
     * @param mediaId Numerical identifier for a minted token
     */
    transferFrom(from: string, to: string, mediaId: BigNumberish): Promise<ContractTransaction>;
    /**
     * Executes a SafeTransfer of the specified media to the specified address if and only if it adheres to the ERC721-Receiver Interface
     * @param from The address of the owner who is transferring the token
     * @param to The receiving address
     * @param mediaId Numerical identifier for a minted token
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
     * Sets a bid on the specified media on an instance of the Zap Media Contract
     * @param mediaId
     * @param bid
     */
    setBid(mediaId: BigNumberish, bid: Bid): Promise<ContractTransaction>;
    /**
     * Removes the ask on the specified media on an instance of the Zap Media Contract
     * @param mediaId Numerical identifier for a minted token
     */
    removeAsk(mediaId: BigNumberish): Promise<ContractTransaction>;
    /**
     * Accepts the specified bid on the specified media on an instance of the Zap Media Contract
     * @param mediaId
     * @param bid
     */
    acceptBid(mediaId: BigNumberish, bid: Bid): Promise<ContractTransaction>;
    /**
     * Removes the bid for the msg.sender on the specified media on an instance of the Zap Media Contract
     * @param mediaId
     */
    removeBid(mediaId: BigNumberish): Promise<ContractTransaction>;
    /**
     * Updates the metadata uri for the specified media on an instance of the Zap Media Contract
     * @param mediaId
     * @param metadataURI
     */
    updateMetadataURI(mediaId: BigNumberish, metadataURI: string): Promise<ContractTransaction>;
    /**
     * Grants the spender approval for the specificxed media using meta transactions as outlined in EIP-712
     * @param sender
     * @param mediaId
     * @param sig
     */
    permit(spender: string, tokenId: BigNumberish, sig: EIP712Signature): Promise<ContractTransaction>;
    /**
     * Revokes the approval of an approved account for the specified media on an instance of the Zap Media Contract
     * @param mediaId Numerical identifier for a minted token
     */
    revokeApproval(mediaId: BigNumberish): Promise<ContractTransaction>;
    /**
     * Burns the specified media on an instance of the Zap Media Contract
     * @param mediaId Numerical identifier for a minted token
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
     * Returns the EIP-712 Domain for an instance of the Zap Media Contract
     */
    eip712Domain(): EIP712Domain;
}
export default ZapMedia;
