// Chai test method
import { expect } from 'chai';

// Ethers Types
import { BigNumber, Contract, ethers } from 'ethers';

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

// AuctionHouse class
import { AuctionHouse } from '../src/auctionHouse';

// Hardhat localhost connection
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

describe('AuctionHouse', () => {
  let mediaFactory: any;
  let auctionHouse: any;
  let signer: any;
  let zapMarket: any;
  let zapMedia: any;
  let auctionId: string;
  let media: any;
  let mediaAddress: string;

  before(async () => {
    signer = provider.getSigner(0);

    zapMedia = await deployZapMedia();

    zapMarket = await deployZapMarket();
    const platformFee = {
      fee: {
          value: BigNumber.from('5000000000000000000')
      },
    };
    await zapMarket.setFee(platformFee);

    mediaFactory = new MediaFactory(1337, signer);

    // Deploys a media collection through the mediaFactory
    media = await mediaFactory.deployMedia('Test Collection', 'TC', false, 'ipfs://testing');

    // Address of the deployed media collection
    mediaAddress = media.args.mediaContract;


    // Create an auctionHouse
    auctionHouse = new AuctionHouse(signer, 1337);

    // Approve auction
    await media.approve(auctionHouse.address, 0);

    // CreateAuction
    const tokenId = 0;
    const duration = 60 * 60 * 24;
    const reservePrice = BigNumber.from(10).pow(18).div(2);
    auctionId = await auctionHouse.createAuction(tokenId, mediaAddress, duration, reservePrice, '0x1234', 10, '0x15');
  });

  it("should be able to deploy", async () => {
    auctionHouse = new AuctionHouse(signer, 1337);

    expect(parseInt(await auctionHouse.timeBuffer(), 0)).to.eq(
      900,
      "time buffer should equal 900"
    );

    expect(await auctionHouse.minBidIncrementPercentage()).to.eq(
      5,
      "minBidIncrementPercentage should equal 5%"
    );

  });

  it("should revert if the caller is not approved", async () => {
    const duration = 60 * 60 * 24;
    const reservePrice = BigNumber.from(10).pow(18).div(2);
    await expect(
      auctionHouse
        .connect(false)
        .createAuction(
          0,
          mediaAddress,
          duration,
          reservePrice,
          '0x1234',
          10,
          '0x15'
        )
    ).revertedWith(
      `Caller must be approved or owner for token id`
    );
  });

  it("should revert if the curator fee percentage is >= 100", async () => {
    const duration = 60 * 60 * 24;
    const reservePrice = BigNumber.from(10).pow(18).div(2);
    const owner = await media.fetchOwnerOf(0);

    await expect(
      auctionHouse.createAuction(
        0,
        media.args.address,
        duration,
        reservePrice,
        '0x1234',
        100,
        '0x15'
      )
    ).revertedWith(
      `curatorFeePercentage must be less than 100`
    );
  });

  it("should create an auction", async () => {
    const owner = await media.fetchOwnerOf(0);
    const duration = 60 * 60 * 24;
    const reservePrice = BigNumber.from(10).pow(18).div(2);

    const createdAuction = await auctionHouse.createAuction(
      0,
      media.args.address,
      duration,
      reservePrice,
      '0x1234',
      100,
      '0x15'
    );

    expect(createdAuction.duration).to.eq(24 * 60 * 60);
    expect(createdAuction.reservePrice).to.eq(
      BigNumber.from(10).pow(18).div(2)
    );
    expect(createdAuction.curatorFeePercentage).to.eq(5);
    expect(createdAuction.tokenOwner).to.eq(owner);
    expect(createdAuction.curator).to.eq('0x1234');
    expect(createdAuction.approved).to.eq(true);

  });
});
