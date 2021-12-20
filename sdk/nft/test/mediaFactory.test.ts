import chai from 'chai';
import { ethers, } from 'ethers';
import MediaFactory from '../mediaFactory';

const networkId = 4;
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

const signer = new ethers.Wallet(privateKey, provider);

describe("MediaFactory", () => {
  let collectionName: string;
  let collectionSymbol: string;
  let permissive: boolean;
  let collectionMetadta: string;

  it('should be a class', () => {
    const mediaFactory = new MediaFactory(networkId, signer);
    console.log(mediaFactory);
  });

  it('Should be able to deploy a new Media contract', async () => {
    const mediaFactory = new MediaFactory(networkId, signer);
    await mediaFactory.deployMedia(collectionName, collectionSymbol, permissive, collectionMetadta);
  })
});
