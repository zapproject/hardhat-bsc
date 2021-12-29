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

  // Creates the instance of ZapMarket
  const zapMarket = new ethers.Contract(
    zapMarketAddresses.localhost,
    zapMarketAbi,
    signer,
  );

  // Returns the ZapMarket instance
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

    // Hardhat localhost account: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
    signer0 = provider.getSigner(0);

    /*Instantiates the MediaFactory class by passing in
     the chainId for the Hardhat localhost node on port 8545
     and the Hardhat localhost account
    */
    mediaFactory = new MediaFactory(31337, signer0);

    // ZapMarket contract instance
    zapMarket = deployMarket(signer0);

    // Deploys a media collection through the mediaFactory
    media = await mediaFactory.deployMedia(
      "Test Collection",
      "TC",
      false,
      "ipfs://testing"
    );

    // Address of the deployed media collection
    mediaAddress = media.args.mediaContract

  })

  it("Should be able to deploy a Media collection", async () => {

    // The event name is "MediaDeployed"
    const eventName = media.event;

    // The emitted name should equal MediaDeployed
    expect(eventName).to.equal('MediaDeployed');

  });

  it("Should emit a MediaContractCreated event on configuration", async () => {

    // Filters for the MediaContractCreated event
    const filter = zapMarket.filters.MediaContractCreated(
      null,
      null,
      null
    );

    // Transaction logs 
    const eventLogs = await zapMarket.queryFilter(filter)

    // Gets the MediaContractCreated event associated with this deployment
    const event = eventLogs[eventLogs.length - 1]

    // The emitted event should equal MediaContractCreated
    expect(event.event).to.equal("MediaContractCreated");

    // The emitted MediaContractCreated address should equal the emitted MediaDeployed address
    expect(event.args?.mediaContract).to.equal(mediaAddress);

    // The emitted collection name should equal the collection name set on deployment
    expect(event.args?.name).to.equal(ethers.utils.formatBytes32String('Test Collection'));

    // The emitted collection symbol should equal the collection symbol set on deployment
    expect(event.args?.symbol).to.equal(ethers.utils.formatBytes32String('TC'));

  });

  it("Should be registered to MediaFactory", async () => {

    // Deployed collection registration status
    const isRegistered = await zapMarket.isRegistered(mediaAddress);

    // Registration status should equal true
    expect(isRegistered).to.equal(true);

  });

  it("Should be configured to ZapMarket", async () => {

    // Deployed collection configuration status
    const isConfigured = await zapMarket.isConfigured(mediaAddress);

    // Configuration status should equal true
    expect(isConfigured).to.equal(true);

  });

});
