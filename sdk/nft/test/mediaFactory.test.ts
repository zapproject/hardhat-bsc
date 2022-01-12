// Chai test method
import { expect } from 'chai';

// Ethers Types
import { Contract, ethers } from 'ethers';

// ZapMarket ABI
import { zapMarketAbi } from '../src/contract/abi';

// MediaFactory class
import MediaFactory from '../src/mediaFactory';

// ZapMarket localhost address
import {
  zapMarketAddresses,
  mediaFactoryAddresses,
  zapMediaAddresses,
} from '../src/contract/addresses';

import {
  deployZapToken,
  deployZapVault,
  deployZapMarket,
  deployZapMediaImpl,
  deployMediaFactory,
  deployZapMedia,
} from '../src/deploy';

// Hardhat localhost connection
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

describe('MediaFactory', () => {
  let mediaFactory: any;

  let zapMarket: any;

  let media: any;

  let mediaAddress: string;

  let token: any;
  let zapVault: any;
  let zapMediaImpl: any;
  let signer: any;
  let zapMedia: any;

  before(async () => {
    signer = provider.getSigner(0);

    token = await deployZapToken();
    zapVault = await deployZapVault();
    zapMarket = await deployZapMarket();
    zapMediaImpl = await deployZapMediaImpl();
    mediaFactory = await deployMediaFactory();
    zapMedia = await deployZapMedia();

    zapMarketAddresses['1337'] = zapMarket.address;
    mediaFactoryAddresses['1337'] = mediaFactory.address;
    zapMediaAddresses['1337'] = zapMedia.address;

    mediaFactory = new MediaFactory(1337, signer);

    // Deploys a media collection through the mediaFactory
    media = await mediaFactory.deployMedia('Test Collection', 'TC', false, 'ipfs://testing');

    // Address of the deployed media collection
    mediaAddress = media.args.mediaContract;
  });

  it('Should be able to deploy a Media collection', async () => {
    // The event name is "MediaDeployed"
    const eventName = media.event;
    // The emitted name should equal MediaDeployed
    expect(eventName).to.equal('MediaDeployed');
  });

  it('Should emit a MediaContractCreated event on configuration', async () => {
    // Filters for the MediaContractCreated event
    const filter = zapMarket.filters.MediaContractCreated(null, null, null);

    // Transaction logs
    const eventLogs = await zapMarket.queryFilter(filter);

    // Gets the MediaContractCreated event associated with this deployment
    const event = eventLogs[eventLogs.length - 1];

    // The emitted event should equal MediaContractCreated
    expect(event.event).to.equal('MediaContractCreated');

    // The emitted MediaContractCreated address should equal the emitted MediaDeployed address
    expect(event.args?.mediaContract).to.equal(mediaAddress);

    // The emitted collection name should equal the collection name set on deployment
    expect(event.args?.name).to.equal(ethers.utils.formatBytes32String('Test Collection'));

    // The emitted collection symbol should equal the collection symbol set on deployment
    expect(event.args?.symbol).to.equal(ethers.utils.formatBytes32String('TC'));
  });

  it('Should be registered to MediaFactory', async () => {
    // Deployed collection registration status
    const isRegistered = await zapMarket.isRegistered(mediaAddress);

    // Registration status should equal true
    expect(isRegistered).to.equal(true);
  });

  it('Should be configured to ZapMarket', async () => {
    // Deployed collection configuration status
    const isConfigured = await zapMarket.isConfigured(mediaAddress);

    // Configuration status should equal true
    expect(isConfigured).to.equal(true);
  });
});
