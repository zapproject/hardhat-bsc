import { Signer } from 'ethers';
export declare function deployMedia(
  networkId: number,
  signer: Signer,
  collectionName: string,
  collectionSymbol: string,
  permissive: boolean,
  collectionMetadta: string,
): Promise<void>;
