import chai, { expect, should, assert } from 'chai';

import { ethers, BigNumber, Signer, Wallet } from 'ethers';

import { constructBidShares, constructMediaData } from '../utils';

import ZapMedia from '../zapMedia';

import { mediaFactoryAddresses, zapMarketAddresses, zapMediaAddresses } from '../addresses';

const contracts = require('../deploy.js');

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

describe('ZapMedia', () => {
  let bidShares: any;
  let mediaData: any;
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
    describe('Write Functions', () => {
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

        mediaData = constructMediaData(tokenURI, metadataURI, contentHash, metadataHash);

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

      describe.only('#updateContentURI', () => {
        it('Should throw an error if the updateContentURI tokenId does not exist', async () => {
          //   Instantiates the ZapMedia class
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

        it('Should throw an error if the fetchContentURI tokenId does not exist', async () => {
          //   Instantiates the ZapMedia class
          const media = new ZapMedia(1337, signer);

          await media
            .fetchContentURI(0)
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              expect(err.message).to.equal(
                'Invariant failed: ZapMedia (fetchContentURI): TokenId does not exist.',
              );
            });
        });

        it('Should update the content uri', async () => {
          //   Instantiates the ZapMedia class
          const media = new ZapMedia(1337, signer);

          // Mints tokenId 0
          await media.mint(mediaData, bidShares);

          // Returns tokenId 0's tokenURI
          const fetchTokenURI = await media.fetchContentURI(0);

          // The returned tokenURI should equal the tokenURI configured in the mediaData
          expect(fetchTokenURI).to.equal(mediaData.tokenURI);

          // Updates tokenId 0's tokenURI
          await media.updateContentURI(0, 'https://newURI.com');

          // Returns tokenId 0's tokenURI
          const fetchNewURI = await media.fetchContentURI(0);

          // The new tokenURI returned should equal the updatedURI
          expect(fetchNewURI).to.equal('https://newURI.com');
        });
      });
    });
  });
});
