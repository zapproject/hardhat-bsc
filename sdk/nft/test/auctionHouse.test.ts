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
      }).to.throw('ZapMedia Constructor: Network Id is not supported.');
    });
  });

  it.only('should be able to deploy', async () => {
    // auctionHouse = new AuctionHouse(signer, 1337);
    // expect(parseInt(await auctionHouse.timeBuffer(), 0)).to.eq(900, 'time buffer should equal 900');
    // expect(await auctionHouse.minBidIncrementPercentage()).to.eq(
    //   5,
    //   'minBidIncrementPercentage should equal 5%',
    // );
  });

  it('should revert if the caller is not approved', async () => {
    // const duration = 60 * 60 * 24;
    // const reservePrice = BigNumber.from(10).pow(18).div(2);
    // await expect(
    //   auctionHouse
    //     .connect(false)
    //     .createAuction(0, mediaAddress, duration, reservePrice, '0x1234', 10, '0x15'),
    // ).revertedWith(`Caller must be approved or owner for token id`);
  });

  it('should revert if the curator fee percentage is >= 100', async () => {
    // const duration = 60 * 60 * 24;
    // const reservePrice = BigNumber.from(10).pow(18).div(2);
    // const owner = await media.fetchOwnerOf(0);
    // await expect(
    //   auctionHouse.createAuction(
    //     0,
    //     media.args.address,
    //     duration,
    //     reservePrice,
    //     '0x1234',
    //     100,
    //     '0x15',
    //   ),
    // ).revertedWith(`curatorFeePercentage must be less than 100`);
  });

  it('should create an auction', async () => {
    // const owner = await media.fetchOwnerOf(0);
    // const duration = 60 * 60 * 24;
    // const reservePrice = BigNumber.from(10).pow(18).div(2);
    // const createdAuction = await auctionHouse.createAuction(
    //   0,
    //   media.args.address,
    //   duration,
    //   reservePrice,
    //   '0x1234',
    //   100,
    //   '0x15',
    // );
    // expect(createdAuction.duration).to.eq(24 * 60 * 60);
    // expect(createdAuction.reservePrice).to.eq(BigNumber.from(10).pow(18).div(2));
    // expect(createdAuction.curatorFeePercentage).to.eq(5);
    // expect(createdAuction.tokenOwner).to.eq(owner);
    // expect(createdAuction.curator).to.eq('0x1234');
    // expect(createdAuction.approved).to.eq(true);
  });
});
