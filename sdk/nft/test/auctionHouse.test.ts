// Chai test method
import { expect } from 'chai';

// Ethers Types
import { BigNumber, Contract, ethers } from 'ethers';

import { constructAsk, constructBidShares, constructMediaData } from '../src/utils';

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

import AuctionHouse from '../src/auctionHouse';
import ZapMedia from '../src/zapMedia';

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

  describe('Contract Functions', () => {
    describe('Write Functions', () => {
      let media: any;
      let mediaAddress: any;
      let mediaData: any;
      let bidShares: any;

      let tokenURI =
        'https://bafkreievpmtbofalpowrcbr5oaok33e6xivii62r6fxh6fontaglngme2m.ipfs.dweb.link/';
      let metadataURI =
        'https://bafkreihhu7xo7knc3vn42jj26gz3jkvh3uu3rwurkb4djsoo5ayqs2s25a.ipfs.dweb.link/';

      beforeEach(async () => {
        let metadataHex = ethers.utils.formatBytes32String('Test');
        let metadataHashRaw = ethers.utils.keccak256(metadataHex);
        let metadataHashBytes = ethers.utils.arrayify(metadataHashRaw);

        let contentHex = ethers.utils.formatBytes32String('Test Car');
        let contentHashRaw = ethers.utils.keccak256(contentHex);
        let contentHashBytes = ethers.utils.arrayify(contentHashRaw);

        let contentHash = contentHashBytes;
        let metadataHash = metadataHashBytes;

        media = new ZapMedia(1337, signer);
        mediaAddress = zapMediaAddresses['1337'];

        bidShares = constructBidShares(
          [
            await provider.getSigner(1).getAddress(),
            await provider.getSigner(2).getAddress(),
            await provider.getSigner(3).getAddress(),
          ],
          [15, 15, 15],
          15,
          35,
        );

        mediaData = constructMediaData(tokenURI, metadataURI, contentHash, metadataHash);

        await media.mint(mediaData, bidShares);

        await media.approve(auctionHouse.address, 0);
      });

      describe.only('#createAuction', () => {
        it('Should create an auction', async () => {
          const duration = 60 * 60 * 24;
          const reservePrice = BigNumber.from(10).pow(18).div(2);

          const auctionHouse = new AuctionHouse(1337, signer);
          await auctionHouse.createAuction(
            0,
            zapMedia.address,
            duration,
            reservePrice,
            '0x0000000000000000000000000000000000000000',
            5,
            token.address,
          );
        });

        it('Should revert if the token contract does not support the ERC721 interface', async () => {
          const duration = 60 * 60 * 24;
          const reservePrice = BigNumber.from(10).pow(18).div(2);

          const auctionHouse = new AuctionHouse(1337, signer);

          await auctionHouse.createAuction(
            0,
            zapMedia.address,
            duration,
            reservePrice,
            '0x0000000000000000000000000000000000000000',
            5,
            token.address,
          );
        });
      });
    });
  });
});
