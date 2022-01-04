import chai, { expect, should, assert } from 'chai';

import { ethers, BigNumber, Signer, Wallet } from 'ethers';

import { constructBidShares, contractAddresses } from '../utils';

import ZapMedia from '../zapMedia';

import { solidity } from 'ethereum-waffle';

import { mediaFactoryAddresses, zapMarketAddresses, zapMediaAddresses } from '../addresses';
import { doesNotMatch } from 'assert';

chai.use(solidity);

const contracts = require('../deploy.js');

const ganache = require('ganache-cli');
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

const mediaData = () => {
  let tokenURI =
    'https://bafkreievpmtbofalpowrcbr5oaok33e6xivii62r6fxh6fontaglngme2m.ipfs.dweb.link/';
  let metadataURI =
    'https://bafkreihhu7xo7knc3vn42jj26gz3jkvh3uu3rwurkb4djsoo5ayqs2s25a.ipfs.dweb.link/';
  let metadataHex = ethers.utils.formatBytes32String('Test');
  let metadataHashRaw = ethers.utils.keccak256(metadataHex);
  let metadataHashBytes = ethers.utils.arrayify(metadataHashRaw);

  let contentHex = ethers.utils.formatBytes32String('Test Car');
  let contentHashRaw = ethers.utils.keccak256(contentHex);
  let contentHashBytes = ethers.utils.arrayify(contentHashRaw);

  let contentHash = contentHashBytes;
  let metadataHash = metadataHashBytes;

  return {
    tokenURI,
    metadataURI,
    contentHash,
    metadataHash,
  };
};

describe('ZapMedia', () => {
  let bidShares: any;
  let token: any;
  let zapVault: any;
  let zapMarket: any;
  let zapMediaImpl: any;
  let mediaFactory: any;
  let signer: any;
  let zapMedia: any;

  beforeEach(async () => {
    signer = provider.getSigner(0);

    token = await contracts.deployZapToken();
    zapVault = await contracts.deployZapVault();
    zapMarket = await contracts.deployZapMarket();
    zapMediaImpl = await contracts.deployZapMediaImpl();
    mediaFactory = await contracts.deployMediaFactory();
    zapMedia = await contracts.deployZapMedia();

    zapMarketAddresses['1337'] = zapMarket.address;
    mediaFactoryAddresses['1337'] = mediaFactory.address;
    zapMediaAddresses['1337'] = zapMedia.address;
  });

  describe('#constructor', () => {
    it('Should throw an error if the networkId is invalid', async () => {
      expect(() => {
        new ZapMedia(300, signer);
      }).to.throw('ZapMedia Constructor: Network Id is not supported.');
    });
  });

  describe('contract Functions', () => {
    let x: any;
    describe('Write Functions', () => {
      beforeEach(async () => {
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
      });

      describe('#updateContentURI', () => {
        it('Should throw an error if the tokenId does not exist', async () => {
          const media = new ZapMedia(1337, signer);

          await media
            .updateContentURI(0, 'www.newURI.com')
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              expect(err.message).to.equal(
                'Invariant failed: ZapMedia (updateContentURI): TokenId does not exist.',
              );
            });
        });

        it.only('Should update the content uri', async () => {
          const media = new ZapMedia(1337, signer);
          //   console.log(x.collabShares[0]);
          //   console.log(bidShares.collabShares[0]);
          //   const tx = await media.mint(mediaData(), bidShares);
        });
      });
    });
  });
});
