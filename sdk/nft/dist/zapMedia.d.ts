import { ContractTransaction, BigNumber, BigNumberish, Signer } from 'ethers';
import { MediaData, BidShares, Ask } from './types';
declare class ZapMedia {
    networkId: number;
    mediaIndex: any;
    media: any;
    market: any;
    signer: Signer;
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
    updateContentURI(mediaId: number, tokenURI: string): Promise<ContractTransaction>;
    /**
     * Mints a new piece of media on an instance of the Zap Media Contract
     * @param mintData
     * @param bidShares
     */
    mint(mediaData: MediaData, bidShares: BidShares): Promise<any>;
    /**
     * Sets an ask on the specified media on an instance of the Zap Media Contract
     * @param mediaId
     * @param ask
     */
    setAsk(mediaId: BigNumberish, ask: Ask): Promise<ContractTransaction>;
    /**
     * Updates the metadata uri for the specified media on an instance of the Zap Media Contract
     * @param mediaId
     * @param metadataURI
     */
    updateMetadataURI(mediaId: BigNumberish, metadataURI: string): Promise<ContractTransaction>;
}
export default ZapMedia;
