import { Contract, Signer } from 'ethers';
declare class MediaFactory {
    contract: Contract;
    networkId: number;
    signer: Signer;
    constructor(networkId: number, signer: Signer);
    /**
     * Deploys a NFT collection.
     * @param {string} collectionName - The name of the NFT collection.
     * @param {string} collectionSymbol - The symbol of the NFT collection.
     * @param {boolean} permissive - Determines if minting can be performed other than the collection owner.
     * @param {string} collectionMetadta - Contract level metadata.
     */
    deployMedia(collectionName: string, collectionSymbol: string, permissive: boolean, collectionMetadta: string): Promise<void>;
}
export default MediaFactory;
