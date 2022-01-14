// Chai test method
import { expect } from 'chai';

// Ethers Types
import { BigNumber, Contract, ethers } from 'ethers';

// MediaFactory class
import MediaFactory from '../src/mediaFactory';

import {
  zapMarketAddresses,
  mediaFactoryAddresses,
  zapMediaAddresses,
  zapAuctionAddresses,
} from '../src/contract/addresses';

import {
  deployZapToken,
  deployZapVault,
  deployZapMarket,
  deployZapMediaImpl,
  deployMediaFactory,
  deployZapMedia,
  deployAuctionHouse,
} from '../src/deploy';

import { AuctionHouse } from '../src/auctionHouse';

import { getSigners } from './test_utils';

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

describe('AuctionHouse', () => {
  let token: any;
  let zapVault: any;
  let zapMarket: any;
  let zapMediaImpl: any;
  let mediaFactory: any;
  let signer: any;
  let zapMedia: any;
  let auctionHouse: any;

  const signers = getSigners(provider);

  beforeEach(async () => {
    signer = signers[0];

    token = await deployZapToken();
    zapVault = await deployZapVault();
    zapMarket = await deployZapMarket();
    zapMediaImpl = await deployZapMediaImpl();
    mediaFactory = await deployMediaFactory();
    zapMedia = await deployZapMedia();
    auctionHouse = await deployAuctionHouse();

    zapMarketAddresses['1337'] = zapMarket.address;
    mediaFactoryAddresses['1337'] = mediaFactory.address;
    zapMediaAddresses['1337'] = zapMedia.address;
    zapAuctionAddresses['1337'] = auctionHouse.address;
  });

  describe('#constructor', () => {
    it('Should throw an error if the networkId is invalid', async () => {
      expect(() => {
        new AuctionHouse(300, signer);
      }).to.throw('Constructor: Network Id is not supported.');
    });
  });
});
