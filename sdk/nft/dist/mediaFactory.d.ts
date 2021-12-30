import { Signer } from 'ethers';
declare class MediaFactory {
    deployMedia(networkId: number, signer: Signer, collectionName: string, collectionSymbol: string, permissive: boolean, collectionMetadta: string): Promise<void>;
}
export default MediaFactory;
