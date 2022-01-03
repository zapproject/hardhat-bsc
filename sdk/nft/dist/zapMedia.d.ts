import { Signer } from 'ethers';
import { MediaData, BidShares } from './types';
declare class ZapMedia {
    networkId: number;
    mediaIndex: any;
    contract: any;
    signer: Signer;
    constructor(networkId: number, signer: Signer, mediaIndex?: number);
    /**
     * Mints a new piece of media on an instance of the Zora Media Contract
     * @param mintData
     * @param bidShares
     */
    mint(mediaData: MediaData, bidShares: BidShares): Promise<any>;
    updateContentURI(mediaId: number, tokenURI: string): Promise<any>;
}
export default ZapMedia;
