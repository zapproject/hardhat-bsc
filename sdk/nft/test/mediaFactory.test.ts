import { expect } from 'chai';
import { Contract, ethers } from 'ethers';
import { zapMarketAbi } from '../abi';
import { eventNames } from 'process';
import MediaFactory from '../mediaFactory';
import { zapMarketAddresses } from '../addresses';
import { sign } from 'crypto';

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

function deployMarket(signer: any) {

  const zapMarket = new ethers.Contract(
    zapMarketAddresses.localhost,
    zapMarketAbi,
    signer,
  );

  return zapMarket;

}


describe("MediaFactory", () => {

  // Hardhat signers[0]: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
  let signer0: any

  let mediaFactory: any

  let zapMarket: Contract;

  let media: Contract;

  let mediaAddress: string;

  before(async () => {

    signer0 = await provider.getSigner(0);

    // Creates 
    mediaFactory = new MediaFactory(31337, signer0);

    zapMarket = deployMarket(signer0);

    media = await mediaFactory.deployMedia(
      "Test Collection",
      "TC",
      false,
      "ipfs://testing"
    );

    mediaAddress = media.args.mediaContract

  })

  it("Should be able to deploy a Media collection", async () => {

    // The event name is "MediaDeployed"
    const eventName = media.event;

    expect(eventName).to.equal('MediaDeployed');

  });

  it("Should be registered", async () => {

    const isRegistered = await zapMarket.isRegistered(mediaAddress);

    expect(isRegistered).to.equal(true);

  });

});
