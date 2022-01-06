import chai, { expect, should, assert } from 'chai';

import { ethers, BigNumber, Signer, Wallet } from 'ethers';

import { constructAsk, constructBidShares, constructMediaData } from '../utils';

import ZapMedia from '../zapMedia';

import { mediaFactoryAddresses, zapMarketAddresses, zapMediaAddresses } from '../addresses';

const contracts = require('../deploy.js');

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

describe('ZapMedia', () => {
  let bidShares: any;
  let ask: any;
  let mediaData: any;
  let token: any;
  let tokenAddress: string;
  let zapVault: any;
  let zapMarket: any;
  let zapMediaImpl: any;
  let mediaFactory: any;
  let signer: any;
  let zapMedia: any;

  beforeEach(async () => {
    signer = provider.getSigner(0);

    token = await contracts.deployZapToken();
    tokenAddress = token.address;
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

        ask = constructAsk(tokenAddress, 100);
      });

      describe('#updateContentURI', () => {
        it('Should thrown an error if the tokenURI does not begin with `https://`', async () => {
          //   Instantiates the ZapMedia class
          const media = new ZapMedia(1337, signer);

          mediaData.tokenURI = 'http://example.com';

          await media
            .mint(mediaData, bidShares)
            .then((res) => {
              return res;
            })
            .catch((err) => {
              expect(err).to.equal(
                'Invariant failed: http://example.com must begin with `https://`',
              );
            });
        });

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

      describe('#updateMetadataURI', () => {
        it('Should thrown an error if the metadataURI does not begin with `https://`', async () => {
          //   Instantiates the ZapMedia class
          const media = new ZapMedia(1337, signer);

          mediaData.metadataURI = 'http://example.com';

          await media
            .mint(mediaData, bidShares)
            .then((res) => {
              return res;
            })
            .catch((err) => {
              expect(err).to.equal(
                'Invariant failed: http://example.com must begin with `https://`',
              );
            });
        });

        it('Should update the metadata uri', async () => {
          const media = new ZapMedia(1337, signer);

          await media.mint(mediaData, bidShares);

          const fetchMetadataURI = await media.fetchMetadataURI(0);
          expect(fetchMetadataURI).to.equal(mediaData.metadataURI);

          await media.updateMetadataURI(0, 'https://newMetadataURI.com');

          const newMetadataURI = await media.fetchMetadataURI(0);
          expect(newMetadataURI).to.equal('https://newMetadataURI.com');
        });
      });

      describe('#mint', () => {
        it('throws an error if bid shares do not sum to 100', async () => {
          let bidShareSum = 0;
          const media = new ZapMedia(1337, signer);

          bidShares.creator.value = bidShares.creator.value.add(BigInt(1e18));

          for (var i = 0; i < bidShares.collabShares.length; i++) {
            bidShareSum += parseInt(bidShares.collabShares[i]);
          }

          bidShareSum += parseInt(bidShares.creator.value) + parseInt(bidShares.owner.value) + 5e18;

          await media
            .mint(mediaData, bidShares)
            .then((res) => {
              return res;
            })
            .catch((err) => {
              expect(err).to.equal(
                `Invariant failed: The BidShares sum to ${bidShareSum}, but they must sum to 100000000000000000000`,
              );
            });
        });

        it('Should be able to mint', async () => {
          const media = new ZapMedia(1337, signer);

          const preTotalSupply = (await media.fetchTotalMedia()).toNumber();

          expect(preTotalSupply).to.equal(0);

          await media.mint(mediaData, bidShares);

          const owner = await media.fetchOwnerOf(0);
          const onChainBidShares = await media.fetchCurrentBidShares(zapMedia.address, 0);
          const onChainContentURI = await media.fetchContentURI(0);
          const onChainMetadataURI = await media.fetchMetadataURI(0);

          expect(owner).to.equal(await signer.getAddress());
          expect(onChainContentURI).to.equal(mediaData.tokenURI);
          expect(onChainMetadataURI).to.equal(mediaData.metadataURI);
          expect(parseInt(onChainBidShares.creator.value)).to.equal(
            parseInt(bidShares.creator.value),
          );
          expect(parseInt(onChainBidShares.owner.value)).to.equal(
            parseInt(onChainBidShares.owner.value),
          );
          expect(onChainBidShares.collaborators).to.eql(bidShares.collaborators);
          expect(onChainBidShares.collabShares).to.eql(bidShares.collabShares);
        });
      });

      describe('#setAsk', () => {
        it('sets an ask for a piece of media', async () => {
          const zap = require('@zapSdk');

          const media = new ZapMedia(1337, signer);

          await media.mint(mediaData, bidShares);
          await media.setAsk(0, ask);

          const onChainAsk = await media.fetchCurrentAsk(zapMedia.address, 0);

          expect(parseInt(onChainAsk.amount.toString())).to.equal(ask.amount);
          expect(onChainAsk.currency).to.equal(zapMedia.address);
        });
      });
    });
  });
});
