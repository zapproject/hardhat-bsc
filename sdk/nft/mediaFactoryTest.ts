import chai from 'chai';
import { ethers, } from 'ethers';
import MediaFactory from './mediaFactory';

const networkId = 4;
const signer = new ethers.providers.JsonRpcProvider();

describe("MediaFactory", () => {
  let collectionName: string;
  let collectionSymbol: string;
  let permissive: boolean;
  let collectionMetadta: string;

  it('Should be able to deploy a new Media contract', async () => {
    const mediaFactory = new MediaFactory(networkId, signer.getSigner());
    await mediaFactory.deployMedia(collectionName, collectionSymbol, permissive, collectionMetadta);
  })
});
