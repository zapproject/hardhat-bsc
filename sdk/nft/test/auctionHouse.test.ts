import { expect } from 'chai';

import { BigNumber, Contract, ethers, Signer } from 'ethers';

import { constructBidShares, constructMediaData } from '../src/utils';

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

import AuctionHouse, { Auction } from '../src/auctionHouse';
import ZapMedia from '../src/zapMedia';

import { getSigners } from './test_utils';

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

describe('AuctionHouse', () => {
  let token: Contract;
  let zapVault: Contract;
  let zapMarket: Contract;
  let zapMediaImpl: Contract;
  let mediaFactory: Contract;
  let signer: Signer;
  let zapMedia: Contract;
  let auctionHouse: Contract;

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
      });

      describe('#createAuction', () => {
        it('Should reject if the auctionHouse is not approved', async () => {
          const duration = 60 * 60 * 24;

          const reservePrice = BigNumber.from(10).pow(18).div(2);

          const auctionHouse = new AuctionHouse(1337, signer);

          await auctionHouse
            .createAuction(
              0,
              mediaAddress,
              duration,
              reservePrice,
              '0x0000000000000000000000000000000000000000',
              0,
              token.address,
            )
            .then((res) => {
              return res;
            })
            .catch((err) => {
              expect(err.message).to.equal(
                'Invariant failed: AuctionHouse (createAuction): Transfer caller is not owner nor approved.',
              );
            });
        });

        it('Should reject if the caller is not approved', async () => {
          const duration = 60 * 60 * 24;

          const reservePrice = BigNumber.from(10).pow(18).div(2);

          const unapprovedSigner = signers[1];

          const auctionHouse = new AuctionHouse(1337, unapprovedSigner);

          await media.approve(auctionHouse.auctionHouse.address, 0);

          await auctionHouse
            .createAuction(
              0,
              mediaAddress,
              duration,
              reservePrice,
              '0x0000000000000000000000000000000000000000',
              0,
              token.address,
            )
            .then((res) => {
              return res;
            })
            .catch((err) => {
              expect(err.message).to.equal(
                'Invariant failed: AuctionHouse (createAuction): Caller is not approved or token owner.',
              );
            });
        });

        it('Should reject if the curator fee is 100', async () => {
          const duration = 60 * 60 * 24;
          const reservePrice = BigNumber.from(10).pow(18).div(2);

          const auctionHouse = new AuctionHouse(1337, signer);

          await media.approve(auctionHouse.auctionHouse.address, 0);

          await auctionHouse
            .createAuction(
              0,
              mediaAddress,
              duration,
              reservePrice,
              await signers[1].getAddress(),
              100,
              token.address,
            )
            .then((res) => {
              return res;
            })
            .catch((err) => {
              expect(err.message).to.equal(
                'Invariant failed: AuctionHouse (createAuction): CuratorFeePercentage must be less than 100.',
              );
            });
        });

        it('Should reject if the tokenId does not exist', async () => {
          const duration = 60 * 60 * 24;
          const reservePrice = BigNumber.from(10).pow(18).div(2);

          const auctionHouse = new AuctionHouse(1337, signer);

          await media.approve(auctionHouse.auctionHouse.address, 0);

          await auctionHouse
            .createAuction(
              300,
              mediaAddress,
              duration,
              reservePrice,
              '0x0000000000000000000000000000000000000000',
              0,
              token.address,
            )
            .then((res) => {
              return res;
            })
            .catch((err) => {
              expect(err.message).to.equal(
                'Invariant failed: AuctionHouse (createAuction): TokenId does not exist.',
              );
            });
        });

        it('Should reject if the mediaContract is a zero address', async () => {
          const duration = 60 * 60 * 24;
          const reservePrice = BigNumber.from(10).pow(18).div(2);

          const auctionHouse = new AuctionHouse(1337, signer);

          await media.approve(auctionHouse.auctionHouse.address, 0);

          await auctionHouse
            .createAuction(
              0,
              ethers.constants.AddressZero,
              duration,
              reservePrice,
              '0x0000000000000000000000000000000000000000',
              0,
              token.address,
            )
            .then((res) => {
              return res;
            })
            .catch((err) => {
              expect(err.message).to.equal(
                'Invariant failed: AuctionHouse (createAuction): Media cannot be a zero address.',
              );
            });
        });

        it('Should create an auction', async () => {
          const duration = 60 * 60 * 24;
          const reservePrice = BigNumber.from(10).pow(18).div(2);

          const auctionHouse = new AuctionHouse(1337, signer);

          await media.approve(auctionHouse.auctionHouse.address, 0);

          await auctionHouse.createAuction(
            0,
            mediaAddress,
            duration,
            reservePrice,
            '0x0000000000000000000000000000000000000000',
            0,
            token.address,
          );

          const createdAuction = await auctionHouse.fetchAuction(0);

          expect(parseInt(createdAuction.token.tokenId.toString())).to.equal(0);

          expect(createdAuction.token.mediaContract).to.equal(mediaAddress);
          expect(createdAuction.approved).to.be.true;
          expect(parseInt(createdAuction.duration._hex)).to.equal(60 * 60 * 24);
          expect(createdAuction.curatorFeePercentage).to.equal(0);
          expect(parseInt(createdAuction.reservePrice._hex)).to.equal(parseInt(reservePrice._hex));
          expect(createdAuction.tokenOwner).to.equal(await signer.getAddress());
          expect(createdAuction.curator).to.equal(ethers.constants.AddressZero);
          expect(createdAuction.auctionCurrency).to.equal(token.address);
        });
      });

      describe.only('#startAuction', () => {
        let auctionHouse: AuctionHouse;
        let curatorConnected: AuctionHouse;
        let curator: Signer;

        beforeEach(async () => {
          curator = signers[9];
          auctionHouse = new AuctionHouse(1337, signer);
          curatorConnected = new AuctionHouse(1337, curator);

          await media.approve(auctionHouse.auctionHouse.address, 0);
        });

        it('Should reject if the auctionId does not exist', async () => {
          await curatorConnected.startAuction(0, true).catch((err) => {
            expect(err.message).to.equal(
              'Invariant failed: AuctionHouse (startAuction): AuctionId does not exist.',
            );
          });
        });

        it('Should reject if a valid curator does not start the auction', async () => {
          const duration = 60 * 60 * 24;
          const reservePrice = BigNumber.from(10).pow(18).div(2);

          await auctionHouse.createAuction(
            0,
            mediaAddress,
            duration,
            reservePrice,
            await curator.getAddress(),
            0,
            token.address,
          );

          await auctionHouse.startAuction(0, true).catch((err) => {
            expect(err.message).to.equal(
              'Invariant failed: AuctionHouse (startAuction): Only the curator can start this auction.',
            );
          });
        });

        it('Should start auction if the curator is not a zero address or token owner', async () => {
          const duration = 60 * 60 * 24;
          const reservePrice = BigNumber.from(10).pow(18).div(2);

          await auctionHouse.createAuction(
            0,
            mediaAddress,
            duration,
            reservePrice,
            await curator.getAddress(),
            0,
            token.address,
          );

          await curatorConnected.startAuction(0, true);

          const createdAuction = await auctionHouse.fetchAuction(0);

          expect(parseInt(createdAuction.token.tokenId.toString())).to.equal(0);
          expect(createdAuction.token.mediaContract).to.equal(mediaAddress);
          expect(createdAuction.approved).to.be.true;
          expect(parseInt(createdAuction.duration._hex)).to.equal(60 * 60 * 24);
          expect(createdAuction.curatorFeePercentage).to.equal(0);
          expect(parseInt(createdAuction.reservePrice._hex)).to.equal(parseInt(reservePrice._hex));
          expect(createdAuction.tokenOwner).to.equal(await signer.getAddress());
          expect(createdAuction.curator).to.equal(await curator.getAddress());
          expect(createdAuction.auctionCurrency).to.equal(token.address);
        });
      });
    });
  });
});
