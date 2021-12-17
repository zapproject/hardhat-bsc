import { Signer } from 'ethers';
import deployMediaFunc from '.';

class MediaFactory {
  async deployMedia(
    networkId: number,
    signer: Signer,
    collectionName: string,
    collectionSymbol: string,
    permissive: boolean,
    collectionMetadta: string,
  ) {
    try {
      const result = await deployMediaFunc(
        networkId,
        signer,
        collectionName,
        collectionSymbol,
        permissive,
        collectionMetadta,
      );
      return result;
    } catch (err) {
      console.log(err);
    }
  }
}

export default MediaFactory;
