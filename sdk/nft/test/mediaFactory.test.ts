// Chai test method
import { expect } from 'chai';

// Ethers Types
import { Contract, ethers } from 'ethers';

// ZapMarket ABI
import { zapMarketAbi } from '../abi';

// MediaFactory class
import MediaFactory from '../mediaFactory';

// ZapMarket localhost address
import { zapMarketAddresses } from '../addresses';

// Hardhat localhost connection
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

/**
   * Creates the ZapMarket instance.
   * @param {object} signer - Hardhat localhost abstraction of an Ethereum account.
   */
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

    signer0 = provider.getSigner(0);

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

  it("Should be configured", async () => {

    const isConfigured = await zapMarket.isConfigured(mediaAddress);

    expect(isConfigured).to.equal(true);

  });

});
