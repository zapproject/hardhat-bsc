import chai, { expect, use } from 'chai';

import { ethers, Wallet } from 'ethers';

import { constructAsk, constructBidShares, constructMediaData, Decimal } from '../src/utils';

import ZapMedia from '../src/zapMedia';

import {
  mediaFactoryAddresses,
  zapMarketAddresses,
  zapMediaAddresses,
} from '../src/contract/addresses';
import { JsonRpcProvider } from '@ethersproject/providers';

import {
  deployZapToken,
  deployZapVault,
  deployZapMarket,
  deployZapMediaImpl,
  deployMediaFactory,
  deployZapMedia,
} from '../src/deploy';

import { getSigners, signPermitMessage, signMintWithSigMessage } from './test_utils';
import { EIP712Signature } from '../src/types';

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

describe('ZapMedia', () => {
  let bidShares: any;
  let ask: any;
  let mediaData: any;
  let token: any;
  let zapVault: any;
  let zapMarket: any;
  let zapMediaImpl: any;
  let mediaFactory: any;
  let signer: any;
  let zapMedia: any;
  let eipSig: any;
  let address: string;
  let sig: any;
  let fetchMediaByIndex: any;
  let bid: any;

  const signers = getSigners(provider);

  beforeEach(async () => {
    signer = signers[0];
    // signer = provider.getSigner(0);

    token = await deployZapToken();
    zapVault = await deployZapVault();
    zapMarket = await deployZapMarket();
    zapMediaImpl = await deployZapMediaImpl();
    mediaFactory = await deployMediaFactory();
    zapMedia = await deployZapMedia();

    zapMarketAddresses['1337'] = zapMarket.address;
    mediaFactoryAddresses['1337'] = mediaFactory.address;
    zapMediaAddresses['1337'] = zapMedia.address;
  });

  describe('#constructor', () => {
    it('Should throw an error if the networkId is invalid', async () => {
      expect(() => {
        new ZapMedia(300, signer);
      }).to.throw('Constructor: Network Id is not supported.');
    });
  });

  describe('Contract Functions', () => {
    describe('View Functions', () => {
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
        eipSig = {
          deadline: 1000,
          v: 0,
          r: '0x00',
          s: '0x00',
        };
      });

      describe('test fetchContentHash, fetchMetadataHash, fetchPermitNonce', () => {
        it('Should be able to fetch contentHash', async () => {
          const media = new ZapMedia(1337, signer);
          await media.mint(mediaData, bidShares);
          const onChainContentHash = await media.fetchContentHash(0);
          expect(onChainContentHash).eq(ethers.utils.hexlify(mediaData.contentHash));
        });
        it("fetchContentHash should get 0x0 if tokenId doesn't exist", async () => {
          const media = new ZapMedia(1337, signer);
          await media.mint(mediaData, bidShares);
          const onChainContentHash = await media.fetchContentHash(56);

          // tokenId doesn't exists, so we expect a default return value of 0x0000...
          expect(onChainContentHash).eq(ethers.constants.HashZero);
        });
        it('Should be able to fetch metadataHash', async () => {
          const media = new ZapMedia(1337, signer);
          await media.mint(mediaData, bidShares);
          const onChainMetadataHash = await media.fetchMetadataHash(0);
          expect(onChainMetadataHash).eq(ethers.utils.hexlify(mediaData.metadataHash));
        });
        it("fetchMetadataHash should get 0x0 if tokenId doesn't exist", async () => {
          const media = new ZapMedia(1337, signer);
          await media.mint(mediaData, bidShares);
          const onChainMetadataHash = await media.fetchMetadataHash(56);

          // tokenId doesn't exists, so we expect a default return value of 0x0000...
          expect(onChainMetadataHash).eq(ethers.constants.HashZero);
        });
        it('Should be able to fetch permitNonce', async () => {
          // created wallets using privateKey because we need a wallet instance when creating a signature
          const otherWallet: Wallet = new ethers.Wallet(
            '0x043192f7a8fb472d04ef7bb0ba1fbb3667198253cc8046e9e56626b804966cb3',
          );
          const account9: Wallet = new ethers.Wallet(
            '0x915c40257f694fef7d8058fe4db4ba53f1343b592a8175ea18e7ece20d2987d7',
          );

          // connect to media contracts through ZapMedia class
          const zap_media = new ZapMedia(1337, signer);
          const zapMedia1 = new ZapMedia(1337, signers[1]);

          // mint a token by zapMedia1 in preparation to give permit to accounts 9 and 8
          await zapMedia1.mint(mediaData, bidShares);

          // get the arguments needed for EIP712 signature standard
          const deadline = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24; // 24 hours
          const domain = zap_media.eip712Domain();
          const nonce = await (await zap_media.fetchPermitNonce(otherWallet.address, 0)).toNumber();

          // generate the signature
          let eipSig: EIP712Signature = await signPermitMessage(
            otherWallet,
            account9.address,
            0,
            nonce,
            deadline,
            domain,
          );

          // permit account9 == give approval to account 9 for tokenId 0.
          await zapMedia1.permit(account9.address, 0, eipSig);

          // test account 9 is approved for tokenId 0
          const firstApprovedAddr = await zapMedia1.fetchApproved(0);
          expect(firstApprovedAddr.toLowerCase()).to.equal(account9.address.toLowerCase());

          const nonce2 = await (
            await zap_media.fetchPermitNonce(otherWallet.address, 0)
          ).toNumber();

          expect(nonce2).to.equal(nonce + 1);

          // give permission to account 8 for the same tokenId
          const account8: Wallet = new ethers.Wallet(
            '0x81c92fdc4c4703cb0da2af8ceae63160426425935f3bb701edd53ffa5c227417',
          );

          eipSig = await signPermitMessage(
            otherWallet,
            account8.address,
            0,
            nonce2,
            deadline,
            domain,
          );

          await zapMedia1.permit(account8.address, 0, eipSig);

          // test account 8 is approved for tokenId 0

          const secondApprovedAddr = await zapMedia1.fetchApproved(0);
          expect(secondApprovedAddr.toLowerCase()).to.equal(account8.address.toLowerCase());

          const nonce3 = await (
            await zap_media.fetchPermitNonce(otherWallet.address, 0)
          ).toNumber();
          expect(nonce3).to.equal(nonce2 + 1);

          const tokenThatDoesntExist = 38;
          const nonceForTokenThatDoesntExist = await (
            await zap_media.fetchPermitNonce(otherWallet.address, tokenThatDoesntExist)
          ).toNumber();
          expect(nonceForTokenThatDoesntExist).to.equal(0);
        });
      });
    });
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
            await signers[1].getAddress(),
            await signers[2].getAddress(),
            await signers[3].getAddress(),
          ],
          [15, 15, 15],
          15,
          35,
        );
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
          const creator = await media.fetchCreator(0);

          const onChainBidShares = await media.fetchCurrentBidShares(zapMedia.address, 0);
          const onChainContentURI = await media.fetchContentURI(0);
          const onChainMetadataURI = await media.fetchMetadataURI(0);

          expect(owner).to.equal(await signer.getAddress());
          expect(creator).to.equal(await signer.getAddress());
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

      describe('#mintWithSig', () => {
        it('throws an error if bid shares do not sum to 100', async () => {
          let bidShareSum = 0;
          const media = new ZapMedia(1337, signer);

          bidShares.creator.value = bidShares.creator.value.add(BigInt(1e18));

          for (var i = 0; i < bidShares.collabShares.length; i++) {
            bidShareSum += parseInt(bidShares.collabShares[i]);
          }

          bidShareSum += parseInt(bidShares.creator.value) + parseInt(bidShares.owner.value) + 5e18;

          const otherWallet: Wallet = new ethers.Wallet(
            '0x7a8c4ab64eaec15cab192c8e3bae1414de871a34c470c1c05a0f3541770686d9',
          );

          await media
            .mintWithSig(otherWallet.address, mediaData, bidShares, eipSig)

            .then((res) => {
              return res;
            })
            .catch((err) => {
              expect(err).to.eq(
                `Invariant failed: The BidShares sum to ${bidShareSum}, but they must sum to 100000000000000000000`,
              );
            });
        });

        it('throws an error if the tokenURI does not begin with `https://`', async () => {
          const otherWallet: Wallet = new ethers.Wallet(
            '0x7a8c4ab64eaec15cab192c8e3bae1414de871a34c470c1c05a0f3541770686d9',
          );

          const media = new ZapMedia(1337, signer);
          let metadataHex = ethers.utils.formatBytes32String('Test');
          let metadataHashRaw = ethers.utils.keccak256(metadataHex);
          let metadataHashBytes = ethers.utils.arrayify(metadataHashRaw);

          let contentHex = ethers.utils.formatBytes32String('Test Car');
          let contentHashRaw = ethers.utils.keccak256(contentHex);
          let contentHashBytes = ethers.utils.arrayify(contentHashRaw);
          // const signer1 = provider.getSigner(1);
          const invalidMediaData = {
            tokenURI: 'http://example.com',
            metadataURI: 'https://metadata.com',
            contentHash: contentHashBytes,
            metadataHash: metadataHashBytes,
          };

          await media
            .mintWithSig(otherWallet.address, invalidMediaData, bidShares, eipSig)
            .then((res) => {
              return res;
            })
            .catch((err) => {
              expect(err).to.eq('Invariant failed: http://example.com must begin with `https://`');
            });
        });

        it('throws an error if the metadataURI does not begin with `https://`', async () => {
          const otherWallet: Wallet = new ethers.Wallet(
            '0x7a8c4ab64eaec15cab192c8e3bae1414de871a34c470c1c05a0f3541770686d9',
          );
          const media = new ZapMedia(1337, signer);
          const invalidMediaData = {
            tokenURI: 'https://example.com',
            metadataURI: 'http://metadata.com',
            contentHash: mediaData.contentHash,
            metadataHash: mediaData.metadataHash,
          };

          await media
            .mintWithSig(otherWallet.address, invalidMediaData, bidShares, eipSig)
            .then((res) => {
              return res;
            })
            .catch((err) => {
              expect(err).to.eq('Invariant failed: http://metadata.com must begin with `https://`');
            });
        });

        it('creates a new piece of media', async () => {
          const mainWallet: Wallet = new ethers.Wallet(
            '0xb91c5477014656c1da52b3d4b6c03b59019c9a3b5730e61391cec269bc2e03e3',
          );
          const media = new ZapMedia(1337, signer);
          const deadline = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24; // 24 hours
          const domain = media.eip712Domain();
          const nonce = await media.fetchMintWithSigNonce(mainWallet.address);
          const media1ContentHash = ethers.utils.hexlify(mediaData.contentHash);
          const media1MetadataHash = ethers.utils.hexlify(mediaData.metadataHash);
          const eipSig = await signMintWithSigMessage(
            mainWallet,
            media1ContentHash,
            media1MetadataHash,
            Decimal.new(15).value,
            nonce.toNumber(),
            deadline,
            domain,
          );

          const totalSupply = await media.fetchTotalMedia();
          expect(totalSupply.toNumber()).to.eq(0);

          await media.mintWithSig(mainWallet.address, mediaData, bidShares, eipSig);

          const owner = await media.fetchOwnerOf(0);
          const creator = await media.fetchCreator(0);
          const onChainContentHash = await media.fetchContentHash(0);
          const onChainMetadataHash = await media.fetchMetadataHash(0);
          const mediaContentHash = ethers.utils.hexlify(mediaData.contentHash);
          const mediaMetadataHash = ethers.utils.hexlify(mediaData.metadataHash);

          const onChainBidShares = await media.fetchCurrentBidShares(zapMedia.address, 0);
          const onChainContentURI = await media.fetchContentURI(0);
          const onChainMetadataURI = await media.fetchMetadataURI(0);

          expect(owner.toLowerCase()).to.eq(mainWallet.address.toLowerCase());
          expect(creator.toLowerCase()).to.eq(mainWallet.address.toLowerCase());
          expect(onChainContentHash).to.eq(mediaContentHash);
          expect(onChainContentURI).to.eq(mediaData.tokenURI);
          expect(onChainMetadataURI).to.eq(mediaData.metadataURI);
          expect(onChainMetadataHash).to.eq(mediaMetadataHash);
          expect(parseInt(onChainBidShares.creator.value)).to.eq(parseInt(bidShares.creator.value));
          expect(parseInt(onChainBidShares.owner.value)).to.eq(parseInt(bidShares.owner.value));
          expect(onChainBidShares.collabShares).to.eql(bidShares.collabShares);
        });
      });

      describe('#getTokenCreators', () => {
        it('Should throw an error if the tokenId does not exist', async () => {
          const media = new ZapMedia(1337, signer);

          await media
            .fetchCreator(0)
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              expect(err.message).to.equal(
                'Invariant failed: ZapMedia (fetchCreator): TokenId does not exist.',
              );
            });
        });

        it('Should return the token creator', async () => {
          const media = new ZapMedia(1337, signer);

          await media.mint(mediaData, bidShares);

          const creator = await media.fetchCreator(0);

          expect(creator).to.equal(await signer.getAddress());
        });
      });

      describe('#tokenOfOwnerByIndex', () => {
        it('Should throw an error if the (owner) is a zero address', async () => {
          const media = new ZapMedia(1337, signer);

          await media.mint(mediaData, bidShares);

          await media
            .fetchMediaOfOwnerByIndex(ethers.constants.AddressZero, 0)
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              expect(err.message).to.equal(
                'Invariant failed: ZapMedia (fetchMediaOfOwnerByIndex): The (owner) address cannot be a zero address.',
              );
            });
        });

        it('Should return the token of the owner by index', async () => {
          const media = new ZapMedia(1337, signer);

          await media.mint(mediaData, bidShares);

          const tokenId = await media.fetchMediaOfOwnerByIndex(await signer.getAddress(), 0);

          expect(parseInt(tokenId._hex)).to.equal(0);
        });
      });

      describe('#setAsk', () => {
        it('Should throw an error if the signer is not approved nor the owner', async () => {
          ask = constructAsk(zapMedia.address, 100);

          const signer1 = signers[1];
          const media = new ZapMedia(1337, signer);
          const media1 = new ZapMedia(1337, signer1);

          await media.mint(mediaData, bidShares);

          const owner = await media.fetchOwnerOf(0);
          const getApproved = await media.fetchApproved(0);

          expect(owner).to.not.equal(await signer1.getAddress());
          expect(owner).to.equal(await signer.getAddress());
          expect(getApproved).to.not.equal(await signer1.getAddress());
          expect(getApproved).to.equal(ethers.constants.AddressZero);

          await media1
            .setAsk(0, ask)
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              expect(err.message).to.equal(
                'Invariant failed: ZapMedia (setAsk): Media: Only approved or owner.',
              );
            });
        });
        it('Should set an ask by the owner', async () => {
          ask = constructAsk(zapMedia.address, 100);
          const media = new ZapMedia(1337, signer);

          await media.mint(mediaData, bidShares);

          const owner = await media.fetchOwnerOf(0);
          expect(owner).to.equal(await signer.getAddress());

          const getApproved = await media.fetchApproved(0);
          expect(getApproved).to.equal(ethers.constants.AddressZero);

          await media.setAsk(0, ask);

          const onChainAsk = await media.fetchCurrentAsk(zapMedia.address, 0);

          expect(parseInt(onChainAsk.amount.toString())).to.equal(ask.amount);
          expect(onChainAsk.currency).to.equal(zapMedia.address);
        });

        it('Should set an ask by the approved', async () => {
          ask = constructAsk(zapMedia.address, 100);

          const signer1 = signers[1];
          const media = new ZapMedia(1337, signer);
          const media1 = new ZapMedia(1337, signer1);

          await media.mint(mediaData, bidShares);

          await media.approve(await signer1.getAddress(), 0);

          const owner = await media.fetchOwnerOf(0);
          expect(owner).to.equal(await signer.getAddress());

          const getApproved = await media.fetchApproved(0);
          expect(getApproved).to.equal(await signer1.getAddress());

          await media1.setAsk(0, ask);

          const onChainAsk = await media.fetchCurrentAsk(zapMedia.address, 0);

          expect(parseInt(onChainAsk.amount.toString())).to.equal(ask.amount);
          expect(onChainAsk.currency).to.equal(zapMedia.address);
        });
      });

      describe('#setbid', () => {
        it('creates a new bid on chain', async () => {
          
          bid = constructBid(
          token.address, 
          200, 
          await signers[1].getAddress(), 
          await signers[1].getAddress(),
          10,
          );

          const zap = new ZapMedia(1337, signer);

          await zap.mint(mediaData, bidShares);

          const signer1 = provider.getSigner(1);
          const zap1 = new ZapMedia(1337, signer1);

          const nullOnChainBid = await zap1.fetchCurrentBidForBidder(
            zapMedia.address,
            0,
            await signer1.getAddress(),
          );

          await token.mint(signer1.getAddress(), 300);

          await token.connect(signer1).approve(zapMarket.address, bid.amount);
          //console.log(await (await signer1.getBalance())._hex)
          
          expect(nullOnChainBid.currency).to.equal(ethers.constants.AddressZero);
          
          await zap1.setBid(0, bid)

          const onChainBid = await zap1.fetchCurrentBidForBidder(
            zapMedia.address,
            0,
            await signer1.getAddress(),
          );

          expect(parseFloat(formatUnits(onChainBid.amount, 'wei'))).to.equal(
            parseFloat(formatUnits(onChainBid.amount, 'wei'))
          );

          expect(onChainBid.currency.toLowerCase()).to.equal(
            bid.currency.toLowerCase()
          );

          expect(onChainBid.bidder.toLowerCase()).to.equal(
            bid.bidder.toLowerCase()
          );

          expect(onChainBid.recipient.toLowerCase()).to.equal(
            bid.recipient.toLowerCase()
          );

          expect(onChainBid.sellOnShare.value._hex).to.equal(
            bid.sellOnShare.value._hex);
          
      });

      describe('#removeAsk', () => {
        it('Should throw an error if the removeAsk tokenId does not exist', async () => {
          ask = constructAsk(zapMedia.address, 100);
          const media = new ZapMedia(1337, signer);

          await media
            .removeAsk(0)
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              expect(err.message).to.equal(
                'Invariant failed: ZapMedia (removeAsk): TokenId does not exist.',
              );
            });
        });

        it('Should throw an error if the tokenId exists but an ask was not set', async () => {
          const media = new ZapMedia(1337, signer);

          await media.mint(mediaData, bidShares);

          await media
            .removeAsk(0)
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              expect(err.message).to.equal(
                'Invariant failed: ZapMedia (removeAsk): Ask was never set.',
              );
            });
        });

        it('Should remove an ask', async () => {
          ask = constructAsk(zapMedia.address, 100);
          const media = new ZapMedia(1337, signer);

          await media.mint(mediaData, bidShares);

          const owner = await media.fetchOwnerOf(0);
          expect(owner).to.equal(await signer.getAddress());

          const getApproved = await media.fetchApproved(0);
          expect(getApproved).to.equal(ethers.constants.AddressZero);

          await media.setAsk(0, ask);

          const onChainAsk = await media.fetchCurrentAsk(zapMedia.address, 0);

          expect(parseInt(onChainAsk.amount.toString())).to.equal(ask.amount);
          expect(onChainAsk.currency).to.equal(zapMedia.address);

          await media.removeAsk(0);

          const onChainAskRemoved = await media.fetchCurrentAsk(zapMedia.address, 0);

          expect(parseInt(onChainAskRemoved.amount.toString())).to.equal(0);
          expect(onChainAskRemoved.currency).to.equal(ethers.constants.AddressZero);
        });
      });

      describe('#revokeApproval', () => {
        it("revokes an addresses approval of another address's media", async () => {
          const signer1 = signers[1];

          // expect(nullApproved).toBe(AddressZero)
          const media = new ZapMedia(1337, signer);
          await media.mint(mediaData, bidShares);

          await media.approve(await signer1.getAddress(), 0);

          const approved = await media.fetchApproved(0);
          expect(approved).to.equal(await signer1.getAddress());

          const media1 = new ZapMedia(1337, signer1);

          await media1.revokeApproval(0);

          const revokedStatus = await media.fetchApproved(0);
          expect(revokedStatus).to.equal(ethers.constants.AddressZero);
        });
      });

      describe('#burn', () => {
        it('Should burn a token', async () => {
          const media = new ZapMedia(1337, signer);
          await media.mint(mediaData, bidShares);
          const owner = await media.fetchOwnerOf(0);
          expect(owner).to.equal(await signer.getAddress());

          const preTotalSupply = await media.fetchTotalMedia();
          expect(preTotalSupply.toNumber()).to.equal(1);

          await media.burn(0);

          const postTotalSupply = await media.fetchTotalMedia();
          expect(postTotalSupply.toNumber()).to.equal(0);
        });
      });

      describe('#approve', () => {
        it('Should approve another address for a token', async () => {
          const signer1 = signers[1];

          const media = new ZapMedia(1337, signer);

          await media.mint(mediaData, bidShares);

          const preApprovedStatus = await media.fetchApproved(0);
          expect(preApprovedStatus).to.equal(ethers.constants.AddressZero);

          await media.approve(await signer1.getAddress(), 0);

          const postApprovedStatus = await media.fetchApproved(0);
          expect(postApprovedStatus).to.equal(await signer1.getAddress());
        });
      });

      describe('#setApprovalForAll', () => {
        it('Should set approval for another address for all tokens owned by owner', async () => {
          const signer1 = signers[1];

          const media = new ZapMedia(1337, signer);

          await media.mint(mediaData, bidShares);

          const preApprovalStatus = await media.fetchIsApprovedForAll(
            await signer.getAddress(),
            await signer1.getAddress(),
          );

          expect(preApprovalStatus).to.be.false;

          await media.setApprovalForAll(await signer1.getAddress(), true);

          const postApprovalStatus = await media.fetchIsApprovedForAll(
            await signer.getAddress(),
            await signer1.getAddress(),
          );

          expect(postApprovalStatus).to.be.true;

          await media.setApprovalForAll(await signer1.getAddress(), false);

          const revoked = await media.fetchIsApprovedForAll(
            await signer.getAddress(),
            await signer1.getAddress(),
          );

          expect(revoked).to.be.false;
        });
      });

      describe('#transferFrom', () => {
        it('Should transfer token to another address', async () => {
          const recipient = await signers[1].getAddress();
          const media = new ZapMedia(1337, signer);
          await media.mint(mediaData, bidShares);

          const owner = await media.fetchOwnerOf(0);

          expect(owner).to.equal(await signer.getAddress());

          await media.transferFrom(owner, recipient, 0);

          const newOwner = await media.fetchOwnerOf(0);

          expect(newOwner).to.equal(recipient);
        });
      });

      describe('#safeTransferFrom', () => {
        it('Should revert if the tokenId does not exist', async () => {
          const recipient = await signers[1].getAddress();

          const media = new ZapMedia(1337, signer);

          await media
            .safeTransferFrom(await signer.getAddress(), recipient, 0)
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              expect(err.message).to.equal(
                'Invariant failed: ZapMedia (safeTransferFrom): TokenId does not exist.',
              );
            });
        });

        it('Should revert if the (from) is a zero address', async () => {
          const recipient = await signers[1].getAddress();

          const media = new ZapMedia(1337, signer);

          await media.mint(mediaData, bidShares);

          await media
            .safeTransferFrom(ethers.constants.AddressZero, recipient, 0)
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              expect(err.message).to.equal(
                'Invariant failed: ZapMedia (safeTransferFrom): The (from) address cannot be a zero address.',
              );
            });
        });

        it('Should revert if the (to) is a zero address', async () => {
          const media = new ZapMedia(1337, signer);

          await media.mint(mediaData, bidShares);

          await media
            .safeTransferFrom(await signer.getAddress(), ethers.constants.AddressZero, 0)
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              expect(err.message).to.equal(
                'Invariant failed: ZapMedia (safeTransferFrom): The (to) address cannot be a zero address.',
              );
            });
        });

        it('Should safe transfer a token to an address', async () => {
          const recipient = await signers[1].getAddress();

          const media = new ZapMedia(1337, signer);

          await media.mint(mediaData, bidShares);

          await media.safeTransferFrom(await signer.getAddress(), recipient, 0);
        });
      });

      describe('#isValidBid', () => {
        it('Should return true if the bid amount can be evenly split by current bidShares', async () => {
          const media = new ZapMedia(1337, signer);

          await media.mint(mediaData, bidShares);
        });
      });
      describe('#permit', () => {
        it('should allow a wallet to set themselves to approved with a valid signature', async () => {
          const zap_media = new ZapMedia(1337, signer);
          await zap_media.mint(mediaData, bidShares);

          // created wallets using privateKey because we need a wallet instance when creating a signature
          const mainWallet: Wallet = new ethers.Wallet(
            '0x89e2d8a81beffed50f4d29f642127f18b5c8c1212c54b18ef66a784d0a172819',
          );
          const otherWallet: Wallet = new ethers.Wallet(
            '0x043192f7a8fb472d04ef7bb0ba1fbb3667198253cc8046e9e56626b804966cb3',
          );

          const deadline = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24; // 24 hours
          const domain = zap_media.eip712Domain();

          const nonce = await (await zap_media.fetchPermitNonce(mainWallet.address, 0)).toNumber();

          const eipSig = await signPermitMessage(
            mainWallet,
            otherWallet.address,
            0,
            nonce,
            deadline,
            domain,
          );

          await zap_media.permit(otherWallet.address, 0, eipSig);
          const approved = await zap_media.fetchApproved(0);

          expect(approved.toLowerCase()).to.equal(otherWallet.address.toLowerCase());

          // test to see if approved for another token. should fail.
          await zap_media
            .fetchApproved(1)
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              expect(err.message).to.equal(
                'Invariant failed: ZapMedia (fetchApproved): TokenId does not exist.',
              );
            });
        });
      });
      describe('#fetchMedia', () => {
        it('Should get media instance by index in the media contract', async () => {
          const media = new ZapMedia(1337, signer);

          await media.mint(mediaData, bidShares);

          const tokenId = await media.fetchMediaByIndex(0);

          expect(parseInt(tokenId._hex)).to.equal(0);
        });

        it('Should throw an error index out of range', async () => {
          const media = new ZapMedia(1337, signer);

          await media.mint(mediaData, bidShares);

          await media
            .fetchMediaByIndex(1)
            .then((res) => {
              return res;
            })
            .catch((err) => {
              expect(err.message).to.equal(
                'Invariant failed: ZapMedia (tokenByIndex): Index out of range.',
              );
            });
        });
      });

      describe('#fetchSignature', () => {
        it('Should fetch the signature of the newly minted nonce', async () => {
          const media = new ZapMedia(1337, signer);

          await media.mint(mediaData, bidShares);

          const sigNonce = await media.fetchMintWithSigNonce(await signer.getAddress());

          expect(parseInt(sigNonce._hex)).to.equal(0);
        });

        it('Should Revert if address does not exist', async () => {
          const media = new ZapMedia(1337, signer);

          await media.mint(mediaData, bidShares);

          await media
            .fetchMintWithSigNonce('0x9b713D5416884d12a5BbF13Ee08B6038E74CDe')
            .then((res) => {
              return res;
            })
            .catch((err) => {
              expect(err).to.equal(
                `Invariant failed: 0x9b713D5416884d12a5BbF13Ee08B6038E74CDe is not a valid address.`,
              );
            });
        });
      });
    });
  });
});
})
