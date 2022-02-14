import chai, { expect } from "chai";

import chaiAsPromised from "chai-as-promised";

import { ethers, Wallet, Signer, Contract, BigNumberish } from "ethers";

import { formatUnits } from "ethers/lib/utils";

import {
  constructAsk,
  constructBidShares,
  constructMediaData,
  constructBid,
  Decimal,
  validateBidShares,
} from "../src/utils";

import ZapMedia from "../src/zapMedia";
import MediaFactory from "../src/mediaFactory";

import {
  mediaFactoryAddresses,
  zapMarketAddresses,
  zapMediaAddresses,
} from "../src/contract/addresses";

import {
  deployZapToken,
  deployZapVault,
  deployZapMarket,
  deployZapMediaImpl,
  deployMediaFactory,
  deployZapMedia,
} from "../src/deploy";

import {
  getSigners,
  signPermitMessage,
  signMintWithSigMessage,
} from "./test_utils";
import { EIP712Signature, Bid, BidShares, Ask } from "../src/types";
import { BlobOptions } from "buffer";
import { SrvRecord } from "dns";

const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

chai.use(chaiAsPromised);

chai.should();

describe("ZapMedia", () => {
  let bidShares: any;
  let ask: any;
  let mediaDataOne: any;
  let mediaDataTwo: any;
  let token: Contract;
  let zapVault: Contract;
  let zapMarket: Contract;
  let mediaFactoryDeployed: Contract;
  let zapMedia: Contract;

  let signer: Signer;
  let signerOne: Signer;

  let mediaFactory: MediaFactory;
  let signerOneConnected: ZapMedia;
  let ownerConnected: ZapMedia;
  let customMediaSigner0: ZapMedia;
  let customMediaSigner1: ZapMedia;
  let customMediaAddress: string;

  let eipSig: any;

  const signers = getSigners(provider);

  let tokenURI =
    "https://bafkreievpmtbofalpowrcbr5oaok33e6xivii62r6fxh6fontaglngme2m.ipfs.dweb.link/";

  let metadataURI =
    "https://bafkreihhu7xo7knc3vn42jj26gz3jkvh3uu3rwurkb4djsoo5ayqs2s25a.ipfs.dweb.link/";

  beforeEach(async () => {
    signer = signers[0];
    signerOne = signers[1];

    token = await deployZapToken();
    zapVault = await deployZapVault();
    zapMarket = await deployZapMarket();
    await deployZapMediaImpl();
    mediaFactoryDeployed = await deployMediaFactory();
    zapMedia = await deployZapMedia();

    zapMarketAddresses["1337"] = zapMarket.address;
    mediaFactoryAddresses["1337"] = mediaFactoryDeployed.address;
    zapMediaAddresses["1337"] = zapMedia.address;

    // MetadataHex
    let metadataHexOne = ethers.utils.formatBytes32String("Test1");
    let metadataHexTwo = ethers.utils.formatBytes32String("Test2");

    // MetadataHashRaw
    let metadataHashRawOne = ethers.utils.keccak256(metadataHexOne);
    let metadataHashRawTwo = ethers.utils.keccak256(metadataHexTwo);

    // MetadataHashBytes
    let metadataHashBytesOne = ethers.utils.arrayify(metadataHashRawOne);
    let metadataHashBytesTwo = ethers.utils.arrayify(metadataHashRawTwo);

    // ContextHex
    let contentHexOne = ethers.utils.formatBytes32String("Testing1");
    let contentHexTwo = ethers.utils.formatBytes32String("Testing2");

    // ContentHashRaw
    let contentHashRawOne = ethers.utils.keccak256(contentHexOne);
    let contentHashRawTwo = ethers.utils.keccak256(contentHexTwo);

    // ContentHashBytes
    let contentHashBytesOne = ethers.utils.arrayify(contentHashRawOne);
    let contentHashBytesTwo = ethers.utils.arrayify(contentHashRawTwo);

    // ContentHash
    let contentHashOne = contentHashBytesOne;
    let contentHashTwo = contentHashBytesTwo;

    let metadataHashOne = metadataHashBytesOne;
    let metadataHashTwo = metadataHashBytesTwo;

    mediaDataOne = constructMediaData(
      tokenURI,
      metadataURI,
      contentHashOne,
      metadataHashOne
    );

    mediaDataTwo = constructMediaData(
      tokenURI,
      metadataURI,
      contentHashTwo,
      metadataHashTwo
    );

    bidShares = constructBidShares(
      [
        await provider.getSigner(1).getAddress(),
        await provider.getSigner(2).getAddress(),
        await provider.getSigner(3).getAddress(),
      ],
      [15, 15, 15],
      15,
      35
    );

    eipSig = {
      deadline: 1000,
      v: 0,
      r: "0x00",
      s: "0x00",
    };

    // signerOne (signers[1]) creates an instance of the MediaFactory class
    mediaFactory = new MediaFactory(1337, signerOne);

    // signerOne (signers[1]) deploys their own media contract
    const { args } = await mediaFactory.deployMedia(
      "TEST COLLECTION 2",
      "TC2",
      true,
      "www.example.com"
    );

    customMediaAddress = args.mediaContract;

    ownerConnected = new ZapMedia(1337, signer);

    signerOneConnected = new ZapMedia(1337, signerOne);

    customMediaSigner1 = new ZapMedia(1337, signerOne, customMediaAddress);

    customMediaSigner0 = new ZapMedia(1337, signer, customMediaAddress);

    // The owner (signers[0]) mints on their own media contract
    await ownerConnected.mint(mediaDataOne, bidShares);

    // The signerOne (signers[1]) mints on the owners (signers[0]) media contract
    await signerOneConnected.mint(mediaDataTwo, bidShares);

    // The signerOne (signers[1]) mints on their own media contract by passing in the
    // their media address as optional argument
    await customMediaSigner1.mint(mediaDataOne, bidShares);
  });

  describe("Contract Functions", () => {
    describe("#constructor", () => {
      it("Should throw an error if the networkId is invalid", async () => {
        expect(() => {
          new ZapMedia(300, signer);
        }).to.throw("Constructor: Network Id is not supported.");
      });

      it("Should throw an error if the custom media is a zero address", async () => {
        expect(() => {
          new ZapMedia(1337, signer, ethers.constants.AddressZero);
        }).to.throw(
          "ZapMedia (constructor): The (customMediaAddress) cannot be a zero address."
        );
      });
    });

    describe("View Functions", () => {
      describe("#fetchBalanceOf", () => {
        it("Should reject if the owner is a zero address on the main media", async () => {
          await signerOneConnected
            .fetchBalanceOf(ethers.constants.AddressZero)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (fetchBalanceOf): The (owner) address cannot be a zero address."
            );
        });

        it("Should reject if the owner is a zero address through a custom media", async () => {
          await customMediaSigner1
            .fetchBalanceOf(ethers.constants.AddressZero)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (fetchBalanceOf): The (owner) address cannot be a zero address."
            );
        });

        it("Should fetch the owner balance on the main media", async () => {
          const balance: BigNumberish = await ownerConnected.fetchBalanceOf(
            await signer.getAddress()
          );

          const balanceOne: BigNumberish = await ownerConnected.fetchBalanceOf(
            await signerOne.getAddress()
          );

          expect(parseInt(balance._hex)).to.equal(1);
          expect(parseInt(balanceOne._hex)).to.equal(1);
        });

        it("Should fetch the owner balance through a custom media", async () => {
          const balance0: BigNumberish =
            await customMediaSigner1.fetchBalanceOf(await signer.getAddress());

          const balance1: BigNumberish =
            await customMediaSigner1.fetchBalanceOf(
              await signerOne.getAddress()
            );

          expect(parseInt(balance0._hex)).to.equal(0);
          expect(parseInt(balance1._hex)).to.equal(1);
        });
      });

      describe("#fetchContentURI", () => {
        it("Should reject if the token id does not exist on the main media", async () => {
          await ownerConnected
            .fetchContentURI(5)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (fetchContentURI): TokenId does not exist."
            );
        });

        it("Should reject if the token id does not exist on a custom media", async () => {
          await customMediaSigner1
            .fetchContentURI(1)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (fetchContentURI): TokenId does not exist."
            );
        });

        it("Should fetch the content uri on the main media", async () => {
          const firstTokenURI: string = await ownerConnected.fetchContentURI(0);

          const secondTokenURI: string = await ownerConnected.fetchContentURI(
            1
          );

          expect(firstTokenURI).to.equal(tokenURI);

          expect(secondTokenURI).to.equal(tokenURI);
        });

        it("Should fetch the content uri on a custom media", async () => {
          const firstContentURI: string =
            await customMediaSigner1.fetchContentURI(0);

          expect(firstContentURI).to.equal(tokenURI);
        });
      });

      describe("#fetchMetadataURI", () => {
        it("should reject if the token id does not exist on the main media", async () => {
          await ownerConnected
            .fetchMetadataURI(5)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (fetchMetadataURI): TokenId does not exist."
            );
        });

        it("Should reject if the token id does not exist on a custom media", async () => {
          await customMediaSigner1
            .fetchMetadataURI(10)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (fetchMetadataURI): TokenId does not exist."
            );
        });

        it("Should fetch the metadata uri on a custom media", async () => {
          const firstMetadataURI = await customMediaSigner1.fetchMetadataURI(0);

          expect(firstMetadataURI).to.equal(metadataURI);
        });

        it("should fetch the metadata URI on the main media", async () => {
          const firstMetadataURI = await ownerConnected.fetchMetadataURI(0);

          const secondMetadataURI = await ownerConnected.fetchMetadataURI(1);

          expect(firstMetadataURI).to.equal(metadataURI);

          expect(secondMetadataURI).to.equal(metadataURI);
        });
      });

      describe("#fetchOwnerOf", () => {
        it("Should reject if the token id does not exist on the main media", async () => {
          // Should throw an error due to the token id not existing on the main media
          await ownerConnected
            .fetchOwnerOf(12)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (fetchOwnerOf): The token id does not exist."
            );
        });

        it("Should reject if the token id does not exist on a custom media", async () => {
          // Should throw an error due to the token id not existing on the custom media
          await customMediaSigner1
            .fetchOwnerOf(7)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (fetchOwnerOf): The token id does not exist."
            );
        });

        it("Should fetch an owner of a token id on the main media", async () => {
          // Returns the owner address of tokenId 0 on the main media contract
          const tokenOwner: string = await ownerConnected.fetchOwnerOf(0);

          // Expect the returned address to equal the address of owner (signers[0])
          expect(tokenOwner).to.equal(await signer.getAddress());

          // Returns the owner address of tokenId 1 on the main media contract
          const tokenOwnerOne: string = await ownerConnected.fetchOwnerOf(1);

          // Expect the returned address to equal the address of signerOne
          expect(tokenOwnerOne).to.equal(await signerOne.getAddress());
        });

        it("Should fetch an owner of a token id on a custom media", async () => {
          // The owner of tokenId 0 on the custom media should equal the address of signerOne
          const tokenOwner: string = await customMediaSigner1
            .fetchOwnerOf(0)
            .should.eventually.equal(await signerOne.getAddress());

          expect(tokenOwner).to.equal(await signerOne.getAddress());
        });
      });

      describe("#fetchContentHash", () => {
        it("Should return 0x0 if tokenId doesn't exist on the main media", async () => {
          // Return 0x0 due to a non existent tokenId on the main media
          const onChainContentHash: string =
            await ownerConnected.fetchContentHash(56);

          // tokenId doesn't exists, so we expect a default return value of 0x0000...
          expect(onChainContentHash).eq(ethers.constants.HashZero);
        });

        it("Should return 0x0 if tokenId doesn't exist on a custom media", async () => {
          // Returns 0x0 due to a non existent tokenId on a custom media
          const onChainContentHash: string =
            await customMediaSigner1.fetchContentHash(56);

          // tokenId doesn't exists, so we expect a default return value of 0x0000...
          expect(onChainContentHash).eq(ethers.constants.HashZero);
        });

        it("Should be able to fetch contentHash on the main media", async () => {
          // Returns the content hash of tokenId 0 on the main media
          const onChainContentHashOne: string =
            await ownerConnected.fetchContentHash(0);

          // Returns the content hash of tokenId 1 on the main media
          const onChainContentHashTwo: string =
            await ownerConnected.fetchContentHash(1);

          // Expect the returned content hash to equal the content hash set on mint
          expect(onChainContentHashOne).eq(
            ethers.utils.hexlify(mediaDataOne.contentHash)
          );

          // Expect the returned content hash to equal the content hash set on mint
          expect(onChainContentHashTwo).eq(
            ethers.utils.hexlify(mediaDataTwo.contentHash)
          );
        });

        it("Should be able to fetch contentHash on a custom media", async () => {
          // Returns the content hash of tokenId 0 on a custom media
          const onChainContentHash: string =
            await customMediaSigner1.fetchContentHash(0);

          // Expect the returned content hash to equal the content hash set on mint
          expect(onChainContentHash).eq(
            ethers.utils.hexlify(mediaDataOne.contentHash)
          );
        });
      });

      describe("#fetchMetadataHash", async () => {
        it("Should return 0x0 if tokenId doesn't exist on the main media", async () => {
          // Returns 0x0 due to a non existent tokenId on the main media
          const onChainMetadataHash: string =
            await ownerConnected.fetchMetadataHash(56);

          // tokenId doesn't exists, so we expect a default return value of 0x0000...
          expect(onChainMetadataHash).eq(ethers.constants.HashZero);
        });

        it("Should return 0x0 if tokenId doesn't exist on a custom media", async () => {
          // Returns 0x0 due to a non existent tokenId on a custom media
          const onChainMetadataHash: string =
            await customMediaSigner1.fetchMetadataHash(1001);

          // tokenId doesn't exists, so we expect a default return value of 0x0000...
          expect(onChainMetadataHash).eq(ethers.constants.HashZero);
        });

        it("Should be able to fetch metadataHash on the main media", async () => {
          // Returns the metadataHash of tokenId 0 on the main media
          const onChainMetadataHashOne: string =
            await ownerConnected.fetchMetadataHash(0);

          // Returns the metadataHash of tokenId 1 on the main media
          const onChainMetadataHashTwo: string =
            await ownerConnected.fetchMetadataHash(1);

          // Expect the returned metadata hash for tokenId 0 to equal the one set on mint
          expect(onChainMetadataHashOne).eq(
            ethers.utils.hexlify(mediaDataOne.metadataHash)
          );

          // Expect the returned metadata hash for tokenId 1 to equal the one set on mint
          expect(onChainMetadataHashTwo).eq(
            ethers.utils.hexlify(mediaDataTwo.metadataHash)
          );
        });

        it("Should be able to fetch metadataHash on a custom media", async () => {
          // Returns the metadata hash of tokenId 0 on a custom media
          const onChainMetadataHash: string =
            await customMediaSigner1.fetchMetadataHash(0);

          // tokenId doesn't exists, so we expect a default return value of 0x0000...
          expect(onChainMetadataHash).eq(
            ethers.utils.hexlify(mediaDataOne.metadataHash)
          );
        });
      });

      describe.skip("#fetchPermitNonce", () => {
        it("Should be able to fetch permitNonce", async () => {
          // created wallets using privateKey because we need a wallet instance when creating a signature
          const otherWallet: Wallet = new ethers.Wallet(
            // "0x043192f7a8fb472d04ef7bb0ba1fbb3667198253cc8046e9e56626b804966cb3"
            "0x89e2d8a81beffed50f4d29f642127f18b5c8c1212c54b18ef66a784d0a172819"
          );
          const account9: Wallet = new ethers.Wallet(
            "0x915c40257f694fef7d8058fe4db4ba53f1343b592a8175ea18e7ece20d2987d7"
          );
          // get the arguments needed for EIP712 signature standard
          const deadline =
            Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24; // 24 hours

          const domain = ownerConnected.eip712Domain();

          const nonce = (
            await ownerConnected.fetchPermitNonce(otherWallet.address, 1)
          ).toNumber();

          // generate the signature
          let eipSig: EIP712Signature = await signPermitMessage(
            otherWallet,
            account9.address,
            1,
            nonce,
            deadline,
            domain
          );

          // permit account9 == give approval to account 9 for tokenId 0.
          await signerOneConnected.permit(account9.address, 1, eipSig);

          // test account 9 is approved for tokenId 0
          const firstApprovedAddr = await signerOneConnected.fetchApproved(1);

          expect(firstApprovedAddr.toLowerCase()).to.equal(
            account9.address.toLowerCase()
          );

          const nonce2 = await (
            await ownerConnected.fetchPermitNonce(otherWallet.address, 1)
          ).toNumber();
          expect(nonce2).to.equal(nonce + 1);
          // give permission to account 8 for the same tokenId
          const account8: Wallet = new ethers.Wallet(
            "0x81c92fdc4c4703cb0da2af8ceae63160426425935f3bb701edd53ffa5c227417"
          );

          eipSig = await signPermitMessage(
            otherWallet,
            account8.address,
            1,
            nonce2,
            deadline,
            domain
          );

          await signerOneConnected.permit(account8.address, 1, eipSig);
          // test account 8 is approved for tokenId 1
          const secondApprovedAddr = await signerOneConnected.fetchApproved(1);
          expect(secondApprovedAddr.toLowerCase()).to.equal(
            account8.address.toLowerCase()
          );
          const nonce3 = await (
            await ownerConnected.fetchPermitNonce(otherWallet.address, 1)
          ).toNumber();
          expect(nonce3).to.equal(nonce2 + 1);
          const tokenThatDoesntExist = 38;
          const nonceForTokenThatDoesntExist = await (
            await ownerConnected.fetchPermitNonce(
              otherWallet.address,
              tokenThatDoesntExist
            )
          ).toNumber();
          expect(nonceForTokenThatDoesntExist).to.equal(0);
        });
      });

      describe("#fetchMediaOfOwnerByIndex", () => {
        it("Should throw an error if the (owner) is a zero address on the main media", async () => {
          // fetchMediaOfOwnerByIndex will fail due to a zero address passed in as the owner
          await ownerConnected
            .fetchMediaOfOwnerByIndex(ethers.constants.AddressZero, 0)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (fetchMediaOfOwnerByIndex): The (owner) address cannot be a zero address."
            );
        });

        it("Should throw an error if the (owner) is a zero address on a custom media", async () => {
          // fetchMediaOfOwnerByIndex will fail due to a zero address passed in as the owner
          await customMediaSigner1
            .fetchMediaOfOwnerByIndex(ethers.constants.AddressZero, 0)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (fetchMediaOfOwnerByIndex): The (owner) address cannot be a zero address."
            );
        });

        it("Should return the token of the owner by index on the main media", async () => {
          // Returns the tokenId owner (signers[0]) minted on the main media contract
          const fetchToken = await ownerConnected.fetchMediaOfOwnerByIndex(
            await signer.getAddress(),
            0
          );

          // Returns the tokenId signerOne (signers[1]) minted on the main media contract
          const fetchTokenOne = await ownerConnected.fetchMediaOfOwnerByIndex(
            await signerOne.getAddress(),
            0
          );

          // Expect owner (signers[0]) to own tokenId 0 on the main media contract
          expect(parseInt(fetchToken._hex)).to.equal(0);

          // Expect signerOne (signers[1]) to own tokenId 1 on the main media contract
          expect(parseInt(fetchTokenOne._hex)).to.equal(1);
        });

        it("Should return the token of an owner by index from a custom media", async () => {
          // Returns the tokenId signerOne (signers[1]) minted on their media contract
          const fetchToken = await customMediaSigner1.fetchMediaOfOwnerByIndex(
            await signerOne.getAddress(),
            0
          );

          // Expect signerOne (signers[1]) to own tokenId 0 on their own media contract
          expect(parseInt(fetchToken._hex)).to.equal(0);
        });
      });

      describe("#fetchTotalMedia", () => {
        it("Should fetch the total media minted on the main media", async () => {
          // Returns the total amount tokens minted on the main media
          const totalSupply: BigNumberish =
            await signerOneConnected.fetchTotalMedia();

          // Expect the totalSupply to equal 2
          expect(parseInt(totalSupply._hex)).to.equal(2);
        });

        it("Should fetch the total media minted on a custom media", async () => {
          // Returns the total amount tokens minted on the custom media
          const totalSupply: BigNumberish =
            await customMediaSigner1.fetchTotalMedia();

          // Expect the totalSupply to equal 1
          expect(parseInt(totalSupply._hex)).to.equal(1);
        });
      });

      describe("#fetchCreator", () => {
        it("Should return a zero address if the token id does not exist on the main media", async () => {
          // Returns a zero address due to the nonexistent tokenId on the custom media
          const ownerAddr: string = await ownerConnected.fetchCreator(300);

          // Expect the address to equal a zero address
          expect(ownerAddr).to.equal(ethers.constants.AddressZero);
        });

        it("Should return a zero address if the token id does not exist on a custom media", async () => {
          // Returns a zero address due to the nonexistent tokenId on a custom media
          const ownerAddr: string = await customMediaSigner1.fetchCreator(12);

          // Expect the address to equal a zero address
          expect(ownerAddr).to.equal(ethers.constants.AddressZero);
        });

        it("Should return the token creator on the main media", async () => {
          // Returns the creator address of tokenId 0 on the main media
          const creatorOne: string = await ownerConnected.fetchCreator(0);

          // Returns the creator address of tokenId 1 on the main media
          const creatorTwo: string = await ownerConnected.fetchCreator(1);

          // Expect creator of tokenId 0 to equal the owner (signers[0]) address
          expect(creatorOne).to.equal(await signer.getAddress());

          // Expect the creator of tokenId 1 to equal the signerOne (signers[1]) address
          expect(creatorTwo).to.equal(await signerOne.getAddress());
        });

        it("Should return the token creator on a custom media", async () => {
          // Returns the creator address of tokenId 0 on a custom media
          const creator: string = await customMediaSigner1.fetchCreator(0);

          // Expect the creator of tokenId 0 on the custom media to equal the signerOne (signers[1]) address
          expect(creator).to.equal(await signerOne.getAddress());
        });
      });

      describe("#fetchCurrentBidShares", () => {
        it("Should throw an error if the media address is a zero address on the main media", async () => {
          await ownerConnected
            .fetchCurrentBidShares(ethers.constants.AddressZero, 0)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (fetchCurrentBidShares): The (mediaAddress) cannot be a zero address."
            );
        });

        it("Should reject if the MediaAddress is a zero address on a custom media", async () => {
          await customMediaSigner1
            .fetchCurrentBidShares(ethers.constants.AddressZero, 0)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (fetchCurrentBidShares): The (mediaAddress) cannot be a zero address."
            );
        });

        it("Should return null values if the token id does not exist on the main media", async () => {
          const bidShares = await ownerConnected.fetchCurrentBidShares(
            zapMedia.address,
            400
          );

          expect(parseInt(bidShares.creator.value._hex)).to.equal(0);
          expect(parseInt(bidShares.owner.value._hex)).to.equal(0);
          expect(bidShares.collaborators).to.have.lengthOf(0);
          expect(bidShares.collabShares).to.have.lengthOf(0);
        });

        it("Should return null values if the token id does not exist on the customMedia", async () => {
          const bidShares = await customMediaSigner1.fetchCurrentBidShares(
            customMediaAddress,
            300
          );

          expect(parseInt(bidShares.creator.value._hex)).to.equal(0);
          expect(parseInt(bidShares.owner.value._hex)).to.equal(0);
          expect(bidShares.collaborators).to.have.lengthOf(0);
          expect(bidShares.collabShares).to.have.lengthOf(0);
        });

        it("should return the bidShares of a token Id on the main media", async () => {
          const onChainBidShares = await ownerConnected.fetchCurrentBidShares(
            zapMedia.address,
            0
          );
          expect(parseInt(onChainBidShares.creator.value._hex)).to.equal(
            parseInt(bidShares.creator.value._hex)
          );
          expect(parseInt(onChainBidShares.owner.value._hex)).to.equal(
            parseInt(bidShares.owner.value._hex)
          );
          expect(onChainBidShares.collaborators).to.deep.equal(
            bidShares.collaborators
          );
          expect(onChainBidShares.collabShares).to.deep.equal(
            bidShares.collabShares
          );
        });

        it("Should return the bidShares of a token Id on the main media", async () => {
          const onChainBidShares = await ownerConnected.fetchCurrentBidShares(
            zapMedia.address,
            1
          );
          expect(parseInt(onChainBidShares.creator.value._hex)).to.equal(
            parseInt(bidShares.creator.value._hex)
          );
          expect(parseInt(onChainBidShares.owner.value._hex)).to.equal(
            parseInt(bidShares.owner.value._hex)
          );
          expect(onChainBidShares.collaborators).to.deep.equal(
            bidShares.collaborators
          );
          expect(onChainBidShares.collabShares).to.deep.equal(
            bidShares.collabShares
          );
        });

        it("should return the bidShares of a token Id on the custom media", async () => {
          const onChainBidShares =
            await customMediaSigner1.fetchCurrentBidShares(
              customMediaAddress,
              0
            );
          expect(parseInt(onChainBidShares.creator.value._hex)).to.equal(
            parseInt(bidShares.creator.value._hex)
          );
          expect(parseInt(onChainBidShares.owner.value._hex)).to.equal(
            parseInt(bidShares.owner.value._hex)
          );
          expect(onChainBidShares.collaborators).to.deep.equal(
            bidShares.collaborators
          );
          expect(onChainBidShares.collabShares).to.deep.equal(
            bidShares.collabShares
          );
        });
      });
    });

    describe("Write Functions", () => {
      describe("#updateContentURI", () => {
        it("Should reject if the token id does not exist on the main media", async () => {
          await ownerConnected
            .updateContentURI(4, "https://newTokenURI.com")
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (updateContentURI): TokenId does not exist."
            );
        });

        it("Should reject if the token id does not exist on a custom media", async () => {
          await customMediaSigner1
            .updateContentURI(4, "https://newTokenURI.com")
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (updateContentURI): TokenId does not exist."
            );
        });

        it("Should reject if the tokenURI does not begin with `https://` on the main media", async () => {
          await ownerConnected
            .updateContentURI(0, "http://newTokenURI.com")
            .should.be.rejectedWith(
              "Invariant failed: http://newTokenURI.com must begin with `https://`"
            );
        });

        it("Should reject if the tokenURI does not begin with `https://` on a custom media", async () => {
          await customMediaSigner1
            .updateContentURI(0, "http://newTokenURI.com")
            .should.be.rejectedWith(
              "Invariant failed: http://newTokenURI.com must begin with `https://`"
            );
        });

        it("Should reject if the caller is not the owner or approved on the main media", async () => {
          await signerOneConnected
            .updateContentURI(0, "https://newTokenURI.com")
            .should.be.rejectedWith(
              "ZapMedia (updateContentURI): Caller is not approved nor the owner."
            );
        });

        it("Should reject if the caller is not the owner or approved on a custom media", async () => {
          await customMediaSigner0
            .updateContentURI(0, "https://newTokenURI.com")
            .should.be.rejectedWith(
              "ZapMedia (updateContentURI): Caller is not approved nor the owner."
            );
        });

        it("Should update the content uri if approved on the main media", async () => {
          const preApproveAddr: string = await ownerConnected.fetchApproved(0);
          expect(preApproveAddr).to.equal(ethers.constants.AddressZero);

          await ownerConnected.approve(await signerOne.getAddress(), 0);

          const postApproveAddr: string = await ownerConnected.fetchApproved(0);
          expect(postApproveAddr).to.equal(await signerOne.getAddress());

          await signerOneConnected.updateContentURI(
            0,
            "https://newTokenURI.com"
          );

          const tokenURI: string = await signerOneConnected.fetchContentURI(0);
          expect(tokenURI).to.equal("https://newTokenURI.com");
        });

        it("Should update the content uri if approved on a custom media", async () => {
          const preApproveAddr: string = await customMediaSigner0.fetchApproved(
            0
          );
          expect(preApproveAddr).to.equal(ethers.constants.AddressZero);

          await customMediaSigner1.approve(await signer.getAddress(), 0);

          const postApproveAddr: string =
            await customMediaSigner0.fetchApproved(0);
          expect(postApproveAddr).to.equal(await signer.getAddress());

          await customMediaSigner0.updateContentURI(
            0,
            "https://newTokenURI.com"
          );

          const fetchNewURI: string = await customMediaSigner0.fetchContentURI(
            0
          );
          expect(fetchNewURI).to.equal("https://newTokenURI.com");
        });

        it("Should update the content uri on the main media by owner", async () => {
          const fetchTokenURI: string = await ownerConnected.fetchContentURI(0);
          expect(fetchTokenURI).to.equal(mediaDataOne.tokenURI);

          await ownerConnected.updateContentURI(0, "https://newTokenURI.com");

          const fetchNewURI: string = await ownerConnected.fetchContentURI(0);

          expect(fetchNewURI).to.equal("https://newTokenURI.com");
        });

        it("Should update the content uri on a custom media by owner", async () => {
          await customMediaSigner1.updateContentURI(
            0,
            "https://newTokenURI.com"
          );

          const fetchNewURI: string = await customMediaSigner1.fetchContentURI(
            0
          );
          expect(fetchNewURI).to.equal("https://newTokenURI.com");
        });
      });

      describe("#updateMetadataURI", () => {
        it("Should reject if the metadataURI does not begin with `https://` on the main media", async () => {
          await ownerConnected
            .updateMetadataURI(0, "http://newMetadataURI.com")
            .should.be.rejectedWith(
              "Invariant failed: http://newMetadataURI.com must begin with `https://`"
            );
        });

        it("Should reject if the metadataURI does not begin with `https://` on a custom media", async () => {
          await customMediaSigner1
            .updateMetadataURI(0, "http://newMetadataURI.com")
            .should.be.rejectedWith(
              "Invariant failed: http://newMetadataURI.com must begin with `https://`"
            );
        });

        it("Should reject if the token id does not exist on the main media", async () => {
          await ownerConnected
            .updateMetadataURI(1001, "https://newMetadataURI.com")
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (updateMetadataURI): TokenId does not exist."
            );
        });

        it("Should reject if the token id does not exist on a custom media", async () => {
          await customMediaSigner1
            .updateMetadataURI(1001, "https://newMetadataURI.com")
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (updateMetadataURI): TokenId does not exist."
            );
        });

        it("Should reject if the caller is not approved nor the owner on the main media", async () => {
          await signerOneConnected
            .updateMetadataURI(0, "https://newMetadataURI.com")
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (updateMetadataURI): Caller is not approved nor the owner."
            );
        });

        it("Should reject if the caller is not approved nor the owner on a custom media", async () => {
          await customMediaSigner0
            .updateMetadataURI(0, "https://newMetadataURI.com")
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (updateMetadataURI): Caller is not approved nor the owner."
            );
        });

        it("Should update the metadata uri by the approved on the main media", async () => {
          const preApproveAddr: string = await ownerConnected.fetchApproved(0);
          expect(preApproveAddr).to.equal(ethers.constants.AddressZero);

          await ownerConnected.approve(await signerOne.getAddress(), 0);

          const postApproveAddr: string = await ownerConnected.fetchApproved(0);
          expect(postApproveAddr).to.equal(await signerOne.getAddress());

          await signerOneConnected.updateMetadataURI(
            0,
            "https://newMetadataURI.com"
          );

          const newMetadataURI: string = await ownerConnected.fetchMetadataURI(
            0
          );

          expect(newMetadataURI).to.equal("https://newMetadataURI.com");
        });

        it("Should update the metadata uri by the approved on a custom media", async () => {
          const preApproveAddr: string = await customMediaSigner1.fetchApproved(
            0
          );
          expect(preApproveAddr).to.equal(ethers.constants.AddressZero);

          await customMediaSigner1.approve(await signer.getAddress(), 0);

          const postApproveAddr: string =
            await customMediaSigner1.fetchApproved(0);

          expect(postApproveAddr).to.equal(await signer.getAddress());

          await customMediaSigner0.updateMetadataURI(
            0,
            "https://newMetadataURI.com"
          );

          const newMetadataURI: string =
            await customMediaSigner1.fetchMetadataURI(0);

          expect(newMetadataURI).to.equal("https://newMetadataURI.com");
        });

        it("Should update the metadata uri by the owner on the main media", async () => {
          await ownerConnected.updateMetadataURI(
            0,
            "https://newMetadataURI.com"
          );

          const newMetadataURI: string = await ownerConnected.fetchMetadataURI(
            0
          );
          expect(newMetadataURI).to.equal("https://newMetadataURI.com");
        });

        it("Should update the metadata uri by the owner on a custom media", async () => {
          await customMediaSigner1.updateMetadataURI(
            0,
            "https://newMetadataURI.com"
          );

          const newMetadataURI: string =
            await customMediaSigner0.fetchMetadataURI(0);
          expect(newMetadataURI).to.equal("https://newMetadataURI.com");
        });
      });

      describe("#mint", () => {
        it("Should reject if the bid shares do not sum to 100 on the main media", async () => {
          let bidShareSum: number = 0;

          bidShares.creator.value = bidShares.creator.value.add(BigInt(1e18));

          for (var i = 0; i < bidShares.collabShares.length; i++) {
            bidShareSum += parseInt(bidShares.collabShares[i]);
          }

          bidShareSum +=
            parseInt(bidShares.creator.value) +
            parseInt(bidShares.owner.value) +
            5e18;

          await ownerConnected
            .mint(mediaDataOne, bidShares)
            .should.be.rejectedWith(
              `Invariant failed: The BidShares sum to ${bidShareSum}, but they must sum to 100000000000000000000`
            );
        });

        it("Should reject if the bid shares do not sum to 100 on a custom media", async () => {
          let bidShareSum: number = 0;

          bidShares.creator.value = bidShares.creator.value.add(BigInt(1e18));

          for (var i = 0; i < bidShares.collabShares.length; i++) {
            bidShareSum += parseInt(bidShares.collabShares[i]);
          }

          bidShareSum +=
            parseInt(bidShares.creator.value) +
            parseInt(bidShares.owner.value) +
            5e18;

          await customMediaSigner1
            .mint(mediaDataOne, bidShares)
            .should.be.rejectedWith(
              `Invariant failed: The BidShares sum to ${bidShareSum}, but they must sum to 100000000000000000000`
            );
        });

        it("Should be able to mint on the main media", async () => {
          // Returns the total tokens minted on the main media
          const preTotalSupply: BigNumberish = (
            await ownerConnected.fetchTotalMedia()
          ).toNumber();

          // Expect the total amount of tokens minted on the main media to equal 2
          expect(preTotalSupply).to.equal(2);

          // Returns the  owner of token id 0 on the main media
          const owner0: string = await ownerConnected.fetchOwnerOf(0);

          // Returns the creator of token id 0 on the main media
          const creator0: string = await ownerConnected.fetchCreator(0);

          // Returns the bidShares on of token id 0 on the main media
          const onChainBidShares: BidShares =
            await ownerConnected.fetchCurrentBidShares(zapMedia.address, 0);

          // Returns the contentURI of token id 0 on the main media
          const onChainContentURI0: string =
            await ownerConnected.fetchContentURI(0);

          // Returns the metadataURI of token id 0 on the main media
          const onChainMetadataURI0: string =
            await ownerConnected.fetchMetadataURI(0);

          // Expect the returned owner address to equal signers[0] address
          expect(owner0).to.equal(await signer.getAddress());

          // Expect the returned creator address to equal signers[0] address
          expect(creator0).to.equal(await signer.getAddress());

          // Expect the returned content URI to equal the tokenURI set on mint
          expect(onChainContentURI0).to.equal(mediaDataOne.tokenURI);

          // Expect the metadata URI to equal the metadataURI set on mint
          expect(onChainMetadataURI0).to.equal(mediaDataOne.metadataURI);

          // Expect the retuned bidShares creator to equal the signers[0] address
          expect(parseInt(onChainBidShares.creator.value)).to.equal(
            parseInt(bidShares.creator.value)
          );

          // Expect the returned bidShares owner to equal the signers[0] address
          expect(parseInt(onChainBidShares.owner.value)).to.equal(
            parseInt(onChainBidShares.owner.value)
          );

          // Expect the returned bidShares collaborators to equal the collaborators set on mint
          expect(onChainBidShares.collaborators).to.eql(
            bidShares.collaborators
          );

          // Expect the returned bidShares collaboShares to equal the collabShares set on mint
          expect(onChainBidShares.collabShares).to.eql(bidShares.collabShares);
        });

        it("Should be able to mint on a custom media", async () => {
          // Returns the total tokens minted on a custom media
          const preTotalSupply: BigNumberish = (
            await customMediaSigner0.fetchTotalMedia()
          ).toNumber();

          // Expect the total amount of tokens minted on a custom media to equal 1
          expect(preTotalSupply).to.equal(1);

          // Returns the  owner of token id 0 on a custom media
          const owner: string = await customMediaSigner0.fetchOwnerOf(0);

          // Returns the creator of token id 0 on a custom media
          const creator: string = await customMediaSigner0.fetchCreator(0);

          // Returns the bidShares on of token id 0 on a custom main media
          const onChainBidShares: BidShares =
            await customMediaSigner0.fetchCurrentBidShares(
              customMediaAddress,
              0
            );

          // Returns the contentURI of token id 0 on a custom media
          const onChainContentURI: string =
            await customMediaSigner0.fetchContentURI(0);

          // Returns the metadataURI of token on a custom media
          const onChainMetadataURI: string =
            await customMediaSigner0.fetchMetadataURI(0);

          // Expect the returned owner address to equal signers[1] address
          expect(owner).to.equal(await signerOne.getAddress());

          // Expect the returned creator address to equal signers[1] address
          expect(creator).to.equal(await signerOne.getAddress());

          // Expect the returned content URI to equal the tokenURI set on mint
          expect(onChainContentURI).to.equal(mediaDataOne.tokenURI);

          // Expect the metadata URI to equal the metadataURI set on mint
          expect(onChainMetadataURI).to.equal(mediaDataOne.metadataURI);

          // Expect the retuned bidShares creator to equal the signers[1] address
          expect(parseInt(onChainBidShares.creator.value)).to.equal(
            parseInt(bidShares.creator.value)
          );

          // Expect the returned bidShares owner to equal the signers[1] address
          expect(parseInt(onChainBidShares.owner.value)).to.equal(
            parseInt(onChainBidShares.owner.value)
          );

          // Expect the returned bidShares collaborators to equal the collaborators set on mint
          expect(onChainBidShares.collaborators).to.eql(
            bidShares.collaborators
          );

          // Expect the returned bidShares collaboShares to equal the collabShares set on mint
          expect(onChainBidShares.collabShares).to.eql(bidShares.collabShares);
        });
      });

      describe("#mintWithSig", () => {
        it("throws an error if bid shares do not sum to 100", async () => {
          let bidShareSum = 0;

          bidShares.creator.value = bidShares.creator.value.add(BigInt(1e18));

          for (var i = 0; i < bidShares.collabShares.length; i++) {
            bidShareSum += parseInt(bidShares.collabShares[i]);
          }

          bidShareSum +=
            parseInt(bidShares.creator.value) +
            parseInt(bidShares.owner.value) +
            5e18;

          const otherWallet: Wallet = new ethers.Wallet(
            "0x7a8c4ab64eaec15cab192c8e3bae1414de871a34c470c1c05a0f3541770686d9"
          );

          await ownerConnected
            .mintWithSig(otherWallet.address, mediaDataOne, bidShares, eipSig)
            .catch((err) => {
              expect(err).to.eq(
                `Invariant failed: The BidShares sum to ${bidShareSum}, but they must sum to 100000000000000000000`
              );
            });
        });

        it("throws an error if the tokenURI does not begin with `https://`", async () => {
          const otherWallet: Wallet = new ethers.Wallet(
            "0x7a8c4ab64eaec15cab192c8e3bae1414de871a34c470c1c05a0f3541770686d9"
          );

          let metadataHex = ethers.utils.formatBytes32String("Test");
          let metadataHashRaw = ethers.utils.keccak256(metadataHex);
          let metadataHashBytes = ethers.utils.arrayify(metadataHashRaw);

          let contentHex = ethers.utils.formatBytes32String("Test Car");
          let contentHashRaw = ethers.utils.keccak256(contentHex);
          let contentHashBytes = ethers.utils.arrayify(contentHashRaw);
          // const signer1 = provider.getSigner(1);
          const invalidMediaData = {
            tokenURI: "http://example.com",
            metadataURI: "https://metadata.com",
            contentHash: contentHashBytes,
            metadataHash: metadataHashBytes,
          };

          await ownerConnected
            .mintWithSig(
              otherWallet.address,
              invalidMediaData,
              bidShares,
              eipSig
            )
            .catch((err) => {
              expect(err).to.eq(
                "Invariant failed: http://example.com must begin with `https://`"
              );
            });
        });

        it("throws an error if the metadataURI does not begin with `https://`", async () => {
          const otherWallet: Wallet = new ethers.Wallet(
            "0x7a8c4ab64eaec15cab192c8e3bae1414de871a34c470c1c05a0f3541770686d9"
          );

          const invalidMediaData = {
            tokenURI: "https://example.com",
            metadataURI: "http://metadata.com",
            contentHash: mediaDataOne.contentHash,
            metadataHash: mediaDataOne.metadataHash,
          };

          await ownerConnected
            .mintWithSig(
              otherWallet.address,
              invalidMediaData,
              bidShares,
              eipSig
            )
            .catch((err) => {
              expect(err).to.eq(
                "Invariant failed: http://metadata.com must begin with `https://`"
              );
            });
        });

        // Using metadata that is already minted
        it.skip("creates a new piece of media", async () => {
          const mainWallet: Wallet = new ethers.Wallet(
            "0xb91c5477014656c1da52b3d4b6c03b59019c9a3b5730e61391cec269bc2e03e3"
          );
          const deadline =
            Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24; // 24 hours
          const domain = ownerConnected.eip712Domain();
          const nonce = await ownerConnected.fetchMintWithSigNonce(
            mainWallet.address
          );
          const media1ContentHash = ethers.utils.hexlify(
            mediaDataOne.contentHash
          );
          const media1MetadataHash = ethers.utils.hexlify(
            mediaDataOne.metadataHash
          );
          const eipSig = await signMintWithSigMessage(
            mainWallet,
            media1ContentHash,
            media1MetadataHash,
            Decimal.new(15).value,
            nonce.toNumber(),
            deadline,
            domain
          );

          const totalSupply = await ownerConnected.fetchTotalMedia();
          expect(totalSupply.toNumber()).to.eq(2);

          await ownerConnected.mintWithSig(
            mainWallet.address,
            mediaDataOne,
            bidShares,
            eipSig
          );

          const owner = await ownerConnected.fetchOwnerOf(0);
          const creator = await ownerConnected.fetchCreator(0);
          const onChainContentHash = await ownerConnected.fetchContentHash(0);
          const onChainMetadataHash = await ownerConnected.fetchMetadataHash(0);
          const mediaContentHash = ethers.utils.hexlify(
            mediaDataOne.contentHash
          );
          const mediaMetadataHash = ethers.utils.hexlify(
            mediaDataOne.metadataHash
          );

          const onChainBidShares = await ownerConnected.fetchCurrentBidShares(
            zapMedia.address,
            0
          );
          const onChainContentURI = await ownerConnected.fetchContentURI(0);
          const onChainMetadataURI = await ownerConnected.fetchMetadataURI(0);

          expect(owner.toLowerCase()).to.eq(mainWallet.address.toLowerCase());
          expect(creator.toLowerCase()).to.eq(mainWallet.address.toLowerCase());
          expect(onChainContentHash).to.eq(mediaContentHash);
          expect(onChainContentURI).to.eq(mediaDataOne.tokenURI);
          expect(onChainMetadataURI).to.eq(mediaDataOne.metadataURI);
          expect(onChainMetadataHash).to.eq(mediaMetadataHash);
          expect(parseInt(onChainBidShares.creator.value)).to.eq(
            parseInt(bidShares.creator.value)
          );
          expect(parseInt(onChainBidShares.owner.value)).to.eq(
            parseInt(bidShares.owner.value)
          );
          expect(onChainBidShares.collabShares).to.eql(bidShares.collabShares);
        });
      });

      describe("#setAsk", () => {
        it("Should throw an error if the signer is not approved nor the owner of the main media", async () => {
          ask = constructAsk(token.address, 100);

          const owner = await ownerConnected.fetchOwnerOf(0);
          const getApproved = await ownerConnected.fetchApproved(0);

          expect(owner).to.not.equal(await signerOne.getAddress());
          expect(owner).to.equal(await signer.getAddress());
          expect(getApproved).to.not.equal(await signerOne.getAddress());
          expect(getApproved).to.equal(ethers.constants.AddressZero);

          await signerOneConnected.setAsk(0, ask).catch((err) => {
            expect(err.message).to.equal(
              "Invariant failed: ZapMedia (setAsk): Media: Only approved or owner."
            );
          });
        });

        it("Should throw an error if the signer is not approved nor the owner of a custom media", async () => {
          ask = constructAsk(token.address, 100);

          const owner = await customMediaSigner1.fetchOwnerOf(0);
          const getApproved = await customMediaSigner1.fetchApproved(0);

          expect(owner).to.not.equal(await signer.getAddress());
          expect(owner).to.equal(await signerOne.getAddress());
          expect(getApproved).to.not.equal(await signer.getAddress());
          expect(getApproved).to.equal(ethers.constants.AddressZero);

          await customMediaSigner0.setAsk(0, ask).catch((err) => {
            expect(err.message).to.equal(
              "Invariant failed: ZapMedia (setAsk): Media: Only approved or owner."
            );
          });
        });

        it("Should set an ask by the owner on the main media", async () => {
          ask = constructAsk(token.address, 100);

          const owner = await ownerConnected.fetchOwnerOf(0);
          expect(owner).to.equal(await signer.getAddress());

          await ownerConnected.setAsk(0, ask);

          const onChainAsk = await ownerConnected.fetchCurrentAsk(
            zapMedia.address,
            0
          );

          expect(parseInt(onChainAsk.amount.toString())).to.equal(ask.amount);
          expect(onChainAsk.currency).to.equal(token.address);
        });

        it("Should set an ask by the owner of a custom media", async () => {
          ask = constructAsk(token.address, 100);

          const owner = await customMediaSigner1.fetchOwnerOf(0);
          expect(owner).to.equal(await signerOne.getAddress());

          await customMediaSigner1.setAsk(0, ask);

          const onChainAsk = await customMediaSigner1.fetchCurrentAsk(
            customMediaAddress,
            0
          );

          expect(parseInt(onChainAsk.amount.toString())).to.equal(ask.amount);
          expect(onChainAsk.currency).to.equal(token.address);
        });

        it("Should set an ask by the approved on the main media", async () => {
          ask = constructAsk(token.address, 100);

          await ownerConnected.approve(await signerOne.getAddress(), 0);

          const owner = await ownerConnected.fetchOwnerOf(0);
          expect(owner).to.equal(await signer.getAddress());

          const getApproved = await ownerConnected.fetchApproved(0);
          expect(getApproved).to.equal(await signerOne.getAddress());

          await signerOneConnected.setAsk(0, ask);

          const onChainAsk = await ownerConnected.fetchCurrentAsk(
            zapMedia.address,
            0
          );

          expect(parseInt(onChainAsk.amount.toString())).to.equal(ask.amount);
          expect(onChainAsk.currency).to.equal(token.address);
        });

        it("Should set an ask by the approved on the custom media", async () => {
          ask = constructAsk(token.address, 100);

          await customMediaSigner1.approve(await signer.getAddress(), 0);

          const owner = await customMediaSigner1.fetchOwnerOf(0);
          expect(owner).to.equal(await signerOne.getAddress());

          const getApproved = await customMediaSigner1.fetchApproved(0);
          expect(getApproved).to.equal(await signer.getAddress());

          await customMediaSigner0.setAsk(0, ask);

          const onChainAsk = await customMediaSigner1.fetchCurrentAsk(
            customMediaAddress,
            0
          );

          expect(parseInt(onChainAsk.amount.toString())).to.equal(ask.amount);
          expect(onChainAsk.currency).to.equal(token.address);
        });
      });

      describe("#setbid", () => {
        let bidder: Signer;
        let bid: Bid;
        let bidderMainConnected: ZapMedia;
        let bidderCustomConnected: ZapMedia;

        beforeEach(async () => {
          bidder = signers[2];
          bid = constructBid(
            token.address,
            200,
            await bidder.getAddress(),
            await bidder.getAddress(),
            10
          );

          // The bidder(signer[2]) is connected to the ZapMedia class as a signer
          bidderMainConnected = new ZapMedia(1337, bidder);

          // The bidder(signer[2]) is connected to a custom media class as a signer
          bidderCustomConnected = new ZapMedia(
            1337,
            bidder,
            customMediaAddress
          );

          // Transfer tokens to the bidder
          await token.mint(await bidder.getAddress(), 1000);
        });

        it("Should reject if the token id does not exist on the main media", async () => {
          // The bidder(signers[2]) attempts to setBid on a non existent token
          await bidderMainConnected
            .setBid(300, bid)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (setBid): TokenId does not exist."
            );
        });

        it("Should reject if the tokenID does not exist on a custom media", async () => {
          // The bidder(signers[2]) attempts to setBid on a non existent token
          await bidderCustomConnected
            .setBid(30, bid)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (setBid): TokenId does not exist."
            );
        });

        it("Should reject if the bid currency is a zero address on the main media", async () => {
          // The bidder approves zapMarket to receive the bid amount before setting the bid
          await token.connect(bidder).approve(zapMarket.address, bid.amount);

          // Sets the bid currency to a zero address
          bid.currency = ethers.constants.AddressZero;

          // The bidder attempts to set a bid with the currency as a zero address
          await bidderMainConnected
            .setBid(0, bid)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (setBid): Currency cannot be a zero address."
            );
        });

        it("Should reject if the bid currency is a zero address on a custom media", async () => {
          // The bidder approves zapMarket to receive the bid amount before setting the bid
          await token.connect(bidder).approve(zapMarket.address, bid.amount);

          // Sets the bid currency to a zero address
          bid.currency = ethers.constants.AddressZero;

          // The bidder attempts to set a bid with the currency as a zero address
          await bidderCustomConnected
            .setBid(0, bid)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (setBid): Currency cannot be a zero address."
            );
        });

        it("Should reject if the bid recipient is a zero address on the main media", async () => {
          // The bidder approves zapMarket to receive the bid amount before setting the bid
          await token.connect(bidder).approve(zapMarket.address, bid.amount);

          // Sets the bid recipient to a zero address
          bid.recipient = ethers.constants.AddressZero;

          // The bidder attempts to set a bid with the recipient as a zero address
          await bidderMainConnected
            .setBid(0, bid)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (setBid): Recipient cannot be a zero address."
            );
        });

        it("Should reject if the bid recipient is a zero address on a custom media", async () => {
          // The bidder approves zapMarket to receive the bid amount before setting the bid
          await token.connect(bidder).approve(zapMarket.address, bid.amount);

          // Sets the bid recipient to a zero address
          bid.recipient = ethers.constants.AddressZero;

          // The bidder attempts to set a bid with the recipient as a zero address
          await bidderCustomConnected
            .setBid(0, bid)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (setBid): Recipient cannot be a zero address."
            );
        });

        it("Should reject if the bid amount is zero on the main media", async () => {
          // The bidder approves zapMarket to receive the bid amount before setting the bid
          await token.connect(bidder).approve(zapMarket.address, bid.amount);

          // Sets the bid amount to zero
          bid.amount = 0;

          // The bidder attempts to set a bid with zero tokens
          await bidderMainConnected
            .setBid(0, bid)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (setBid): Amount cannot be zero."
            );
        });

        it("Should reject if the bid amount is zero on a custom media", async () => {
          // The bidder approves zapMarket to receive the bid amount before setting the bid
          await token.connect(bidder).approve(zapMarket.address, bid.amount);

          // Sets the bid amount to zero
          bid.amount = 0;

          // The bidder attempts to set a bid with zero tokens
          await bidderCustomConnected
            .setBid(0, bid)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (setBid): Amount cannot be zero."
            );
        });

        it("Should set a bid on the main media", async () => {
          // Checks the balance of the bidder before setting the bid
          const bidderPreBal = await token.balanceOf(await bidder.getAddress());

          // Fetches the bidders bid details before setting the bid
          const nullOnChainBid = await ownerConnected.fetchCurrentBidForBidder(
            zapMedia.address,
            0,
            await bidder.getAddress()
          );

          // The bidder approves zapMarket to receive the bid amount before setting the bid
          await token.connect(bidder).approve(zapMarket.address, bid.amount);

          // The bidder balance should equal the 1000 before setting the bid
          expect(parseInt(bidderPreBal._hex)).to.equal(1000);

          // The returned currency should equal a zero address before setting the bed
          expect(nullOnChainBid.currency).to.equal(
            ethers.constants.AddressZero
          );

          // The bidder(signers[1]) sets their bid
          // The bid amount is then transferred to the ZapMarket balance
          // The bid amount is then withdrawn from the their balance
          await bidderMainConnected.setBid(0, bid);

          // The bidder balance after setting the bidx
          const bidderPostBal = await token.balanceOf(
            await bidder.getAddress()
          );

          // The bidder balance after setting a bid should be 200 less than the start balance
          expect(parseInt(bidderPostBal._hex)).equal(
            parseInt(bidderPreBal._hex) - 200
          );

          // Fetches the bidders bid details after setting the bid
          const onChainBid = await ownerConnected.fetchCurrentBidForBidder(
            zapMedia.address,
            0,
            await bidder.getAddress()
          );

          // The returned bid amount should equal the bid amount confifured in the setBid function
          expect(parseFloat(formatUnits(onChainBid.amount, "wei"))).to.equal(
            parseFloat(formatUnits(bid.amount, "wei"))
          );

          // The returned bid currency should equal the bid currency configured on setBid
          expect(onChainBid.currency.toLowerCase()).to.equal(
            bid.currency.toLowerCase()
          );

          // The returned bidder should equal the bidder configured on setBid
          expect(onChainBid.bidder.toLowerCase()).to.equal(
            bid.bidder.toLowerCase()
          );

          // The returned recipient should equal the recipient configured on setBid
          expect(onChainBid.recipient.toLowerCase()).to.equal(
            bid.recipient.toLowerCase()
          );

          // The returned sellOnShare should equal the sellOnShare configured on setBid
          expect(onChainBid.sellOnShare.value._hex).to.equal(
            bid.sellOnShare.value._hex
          );
        });

        it("Should set a bid on a custom media", async () => {
          // Checks the balance of the bidder before setting the bid
          const bidderPreBal = await token.balanceOf(await bidder.getAddress());

          // Fetches the bidders bid details before setting the bid
          const nullOnChainBid =
            await customMediaSigner1.fetchCurrentBidForBidder(
              zapMedia.address,
              0,
              await bidder.getAddress()
            );

          // The bidder approves zapMarket to receive the bid amount before setting the bid
          await token.connect(bidder).approve(zapMarket.address, bid.amount);

          // The bidder balance should equal the 1000 before setting the bid
          expect(parseInt(bidderPreBal._hex)).to.equal(1000);

          // The returned currency should equal a zero address before setting the bed
          expect(nullOnChainBid.currency).to.equal(
            ethers.constants.AddressZero
          );

          // The bidder(signers[1]) sets their bid
          // The bid amount is then transferred to the ZapMarket balance
          // The bid amount is then withdrawn from the their balance
          await bidderCustomConnected.setBid(0, bid);

          // The bidder balance after setting the bidx
          const bidderPostBal = await token.balanceOf(
            await bidder.getAddress()
          );

          // The bidder balance after setting a bid should be 200 less than the start balance
          expect(parseInt(bidderPostBal._hex)).equal(
            parseInt(bidderPreBal._hex) - 200
          );

          // Fetches the bidders bid details after setting the bid
          const onChainBid = await customMediaSigner0.fetchCurrentBidForBidder(
            customMediaAddress,
            0,
            await bidder.getAddress()
          );

          // The returned bid amount should equal the bid amount configured in the setBid function
          expect(parseFloat(formatUnits(onChainBid.amount, "wei"))).to.equal(
            parseFloat(formatUnits(bid.amount, "wei"))
          );

          // The returned bid currency should equal the bid currency configured on setBid
          expect(onChainBid.currency.toLowerCase()).to.equal(
            bid.currency.toLowerCase()
          );

          // The returned bidder should equal the bidder configured on setBid
          expect(onChainBid.bidder.toLowerCase()).to.equal(
            bid.bidder.toLowerCase()
          );

          // The returned recipient should equal the recipient configured on setBid
          expect(onChainBid.recipient.toLowerCase()).to.equal(
            bid.recipient.toLowerCase()
          );

          // The returned sellOnShare should equal the sellOnShare configured on setBid
          expect(onChainBid.sellOnShare.value._hex).to.equal(
            bid.sellOnShare.value._hex
          );
        });

        it("Should refund the original bid if the bidder bids again on the main media", async () => {
          // The bidder approves zapMarket to receive the bid amount before setting the bid
          await token.connect(bidder).approve(zapMarket.address, 1000);

          const bidderPreBal = await token.balanceOf(await bidder.getAddress());
          expect(parseInt(bidderPreBal)).to.equal(1000);

          const marketPretBal = await token.balanceOf(zapMarket.address);
          expect(parseInt(marketPretBal)).to.equal(0);

          // The bidders first bid
          await bidderMainConnected.setBid(0, bid);

          // The bidder balance after placing the first bid
          const bidderPostBal1 = await token.balanceOf(
            await bidder.getAddress()
          );

          // The bidder balance after placing should be 200 less
          expect(parseInt(bidderPostBal1._hex)).to.equal(800);

          // ZapMarket balance after the bidder places their first bid
          const marketPostBal1 = await token.balanceOf(zapMarket.address);

          // The ZapMarket balance should equal the first bid amount after the bidder places a bid
          expect(parseInt(marketPostBal1._hex)).to.equal(200);

          // Set the bid amount to 200
          bid.amount = 400;

          // The bidders second bid
          await bidderMainConnected.setBid(0, bid);

          // ZapMarket balance after the bidder places their second bid
          const marketPostBal2 = await token.balanceOf(zapMarket.address);

          // The ZapMarket balance should equal the second bid amount after the bidder places their second bid
          expect(parseInt(marketPostBal2._hex)).to.equal(400);

          const bidderPostBal = await token.balanceOf(
            await bidder.getAddress()
          );

          expect(parseInt(bidderPostBal._hex)).to.equal(600);
        });

        it("Should refund the original bid if the bidder bids again on a custom media", async () => {
          // The bidder approves zapMarket to receive the bid amount before setting the bid
          await token.connect(bidder).approve(zapMarket.address, 1000);

          const bidderPreBal = await token.balanceOf(await bidder.getAddress());
          expect(parseInt(bidderPreBal)).to.equal(1000);

          const marketPretBal = await token.balanceOf(zapMarket.address);
          expect(parseInt(marketPretBal)).to.equal(0);

          // The bidders first bid
          await bidderCustomConnected.setBid(0, bid);

          // The bidder balance after placing the first bid
          const bidderPostBal1 = await token.balanceOf(
            await bidder.getAddress()
          );

          // The bidder balance after placing should be 200 less
          expect(parseInt(bidderPostBal1._hex)).to.equal(800);

          // ZapMarket balance after the bidder places their first bid
          const marketPostBal1 = await token.balanceOf(zapMarket.address);

          // The ZapMarket balance should equal the first bid amount after the bidder places a bid
          expect(parseInt(marketPostBal1._hex)).to.equal(200);

          // Set the bid amount to 200
          bid.amount = 400;

          // The bidders second bid
          await bidderCustomConnected.setBid(0, bid);

          // ZapMarket balance after the bidder places their second bid
          const marketPostBal2 = await token.balanceOf(zapMarket.address);

          // The ZapMarket balance should equal the second bid amount after the bidder places their second bid
          expect(parseInt(marketPostBal2._hex)).to.equal(400);

          const bidderPostBal = await token.balanceOf(
            await bidder.getAddress()
          );

          expect(parseInt(bidderPostBal._hex)).to.equal(600);
        });

        describe("#fetchCurrentAsk", () => {
          it("Should return null values if the media is a zero address with a valid token id", async () => {
            const fetchAsk: Ask = await ownerConnected.fetchCurrentAsk(
              ethers.constants.AddressZero,
              0
            );

            expect(fetchAsk.currency).to.equal(ethers.constants.AddressZero);

            expect(parseInt(fetchAsk.amount.toString())).to.equal(0);
          });

          it("Should return null values if the token id does not exist on the main media", async () => {
            const fetchAsk: Ask = await ownerConnected.fetchCurrentAsk(
              zapMedia.address,
              10
            );

            expect(fetchAsk.currency).to.equal(ethers.constants.AddressZero);

            expect(parseInt(fetchAsk.amount.toString())).to.equal(0);
          });

          it("Should return null values if the token id does not exist on a custom media", async () => {
            const fetchAsk: Ask = await customMediaSigner1.fetchCurrentAsk(
              customMediaAddress,
              10
            );

            expect(fetchAsk.currency).to.equal(ethers.constants.AddressZero);

            expect(parseInt(fetchAsk.amount.toString())).to.equal(0);
          });

          it("Should fetch the current ask on the main media", async () => {
            ask = constructAsk(token.address, 100);

            await ownerConnected.setAsk(0, ask);

            const fetchAsk = await ownerConnected.fetchCurrentAsk(
              zapMedia.address,
              0
            );

            expect(parseInt(fetchAsk.amount.toString())).to.equal(ask.amount);
            expect(fetchAsk.currency).to.equal(token.address);
          });

          it("Should fetch the current ask on a custom media", async () => {
            ask = constructAsk(token.address, 100);

            await customMediaSigner1.setAsk(0, ask);

            const fetchAsk = await ownerConnected.fetchCurrentAsk(
              customMediaAddress,
              0
            );

            expect(parseInt(fetchAsk.amount.toString())).to.equal(ask.amount);
            expect(fetchAsk.currency).to.equal(token.address);
          });
        });

        describe("#fetchCurrentBidForBidder", () => {
          it("Should reject if the media contract is a zero address", async () => {
            await ownerConnected
              .fetchCurrentBidForBidder(
                ethers.constants.AddressZero,
                0,
                await bidder.getAddress()
              )
              .should.be.rejectedWith(
                "Invariant failed: ZapMedia (fetchCurrentBidForBidder): The (media contract) address cannot be a zero address."
              );
          });

          it("Should reject if the token id does not exist on the main media", async () => {
            await ownerConnected
              .fetchCurrentBidForBidder(
                zapMedia.address,
                10,
                await bidder.getAddress()
              )
              .should.be.rejectedWith(
                "Invariant failed: ZapMedia (fetchCurrentBidForBidder): The token id does not exist."
              );
          });

          it("Should reject if the bidder is a zero address on the main media", async () => {
            await ownerConnected
              .fetchCurrentBidForBidder(
                zapMedia.address,
                0,
                ethers.constants.AddressZero
              )
              .should.be.rejectedWith(
                "Invariant failed: ZapMedia (fetchCurrentBidForBidder): The (bidder) address cannot be a zero address."
              );
          });

          it("Should reject if the token id does not exist on a custom media", async () => {
            await ownerConnected
              .fetchCurrentBidForBidder(
                customMediaAddress,
                10,
                await bidder.getAddress()
              )
              .should.be.rejectedWith(
                "Invariant failed: ZapMedia (fetchCurrentBidForBidder): The token id does not exist."
              );
          });

          it("Should reject if the bidder is a zero address on a custom media", async () => {
            await ownerConnected
              .fetchCurrentBidForBidder(
                customMediaAddress,
                0,
                ethers.constants.AddressZero
              )
              .should.be.rejectedWith(
                "Invariant failed: ZapMedia (fetchCurrentBidForBidder): The (bidder) address cannot be a zero address."
              );
          });
        });
      });

      describe("#removeAsk", () => {
        it("Should reject if the tokenId does not exist on the main media", async () => {
          ask = constructAsk(token.address, 100);
          await ownerConnected
            .removeAsk(400)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (removeAsk): TokenId does not exist."
            );
        });

        it("Should reject if the tokenId does not exist on a custom media", async () => {
          ask = constructAsk(customMediaAddress, 100);
          await customMediaSigner1
            .removeAsk(400)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (removeAsk): TokenId does not exist."
            );
        });

        it("Should reject if the ask was never set on the main media", async () => {
          await ownerConnected
            .removeAsk(0)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (removeAsk): Ask was never set."
            );
        });

        it("Should reject if the ask was never set on a custom media", async () => {
          await customMediaSigner1
            .removeAsk(0)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (removeAsk): Ask was never set."
            );
        });

        it("Should remove an ask on the main media", async () => {
          ask = constructAsk(token.address, 100);

          const owner: string = await ownerConnected.fetchOwnerOf(0);
          expect(owner).to.equal(await signer.getAddress());

          const getApproved: string = await ownerConnected.fetchApproved(0);
          expect(getApproved).to.equal(ethers.constants.AddressZero);

          await ownerConnected.setAsk(0, ask);

          const onChainAsk: Ask = await ownerConnected.fetchCurrentAsk(
            zapMedia.address,
            0
          );

          expect(parseInt(onChainAsk.amount.toString())).to.equal(ask.amount);
          expect(onChainAsk.currency).to.equal(token.address);

          await ownerConnected.removeAsk(0);

          const onChainAskRemoved: Ask = await ownerConnected.fetchCurrentAsk(
            zapMedia.address,
            0
          );

          expect(parseInt(onChainAskRemoved.amount.toString())).to.equal(0);
          expect(onChainAskRemoved.currency).to.equal(
            ethers.constants.AddressZero
          );
        });

        it("Should remove an ask on a custom media", async () => {
          ask = constructAsk(token.address, 100);

          const owner: string = await customMediaSigner0.fetchOwnerOf(0);
          expect(owner).to.equal(await signerOne.getAddress());

          const getApproved: string = await customMediaSigner0.fetchApproved(0);
          expect(getApproved).to.equal(ethers.constants.AddressZero);

          await customMediaSigner1.setAsk(0, ask);

          const onChainAsk: Ask = await customMediaSigner0.fetchCurrentAsk(
            customMediaAddress,
            0
          );

          expect(parseInt(onChainAsk.amount.toString())).to.equal(ask.amount);
          expect(onChainAsk.currency).to.equal(token.address);

          await customMediaSigner1.removeAsk(0);

          const onChainAskRemoved: Ask =
            await customMediaSigner0.fetchCurrentAsk(customMediaAddress, 0);

          expect(parseInt(onChainAskRemoved.amount.toString())).to.equal(0);
          expect(onChainAskRemoved.currency).to.equal(
            ethers.constants.AddressZero
          );
        });
      });

      describe("#removeBid", () => {
        let mainBid: Bid;
        let customBid: Bid;
        let bidderCustomConnected: ZapMedia;
        beforeEach(async () => {
          mainBid = constructBid(
            token.address,
            200,
            await signerOne.getAddress(),
            await signerOne.getAddress(),
            10
          );

          customBid = constructBid(
            token.address,
            300,
            await signer.getAddress(),
            await signer.getAddress(),
            10
          );

          await token.mint(await signerOne.getAddress(), 200);

          await token
            .connect(signerOne)
            .approve(zapMarket.address, mainBid.amount);

          await token
            .connect(signer)
            .approve(zapMarket.address, customBid.amount);

          bidderCustomConnected = new ZapMedia(
            1337,
            signer,
            customMediaAddress
          );
        });

        it("Should reject if the token id does not exist on the main media", async () => {
          const preBidBal: string = await token.balanceOf(
            await signerOne.getAddress()
          );
          expect(parseInt(preBidBal)).to.equal(mainBid.amount);

          const preMarketBal: string = await token.balanceOf(zapMarket.address);
          expect(parseInt(preMarketBal)).to.equal(0);

          await signerOneConnected.setBid(0, mainBid);

          const postBidBal: string = await token.balanceOf(
            await signerOne.getAddress()
          );
          expect(parseInt(postBidBal)).to.equal(0);

          const postMarketBal: string = await token.balanceOf(
            zapMarket.address
          );
          expect(parseInt(postMarketBal)).to.equal(mainBid.amount);

          await signerOneConnected
            .removeBid(200)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (removeBid): The token id does not exist."
            );
        });

        it("Should reject if the token id does not exist on a custom media", async () => {
          const preBidBal: string = await token.balanceOf(
            await signer.getAddress()
          );
          expect(parseInt(preBidBal)).to.equal(520000000e18);

          const preMarketBal: string = await token.balanceOf(zapMarket.address);
          expect(parseInt(preMarketBal)).to.equal(0);

          await bidderCustomConnected.setBid(0, customBid);

          const postBidBal: string = await token.balanceOf(
            await signer.getAddress()
          );
          expect(parseInt(postBidBal)).to.equal(520000000e18 - 200);

          const postMarketBal: string = await token.balanceOf(
            zapMarket.address
          );
          expect(parseInt(postMarketBal)).to.equal(customBid.amount);

          await bidderCustomConnected
            .removeBid(200)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (removeBid): The token id does not exist."
            );
        });

        it("Should remove a bid on the main media", async () => {
          const preBidBal: string = await token.balanceOf(
            await signerOne.getAddress()
          );
          expect(parseInt(preBidBal)).to.equal(mainBid.amount);

          const preMarketBal: string = await token.balanceOf(zapMarket.address);
          expect(parseInt(preMarketBal)).to.equal(0);

          await signerOneConnected.setBid(0, mainBid);

          const postBidBal: string = await token.balanceOf(
            await signerOne.getAddress()
          );
          expect(parseInt(postBidBal)).to.equal(0);

          const postMarketBal: string = await token.balanceOf(
            zapMarket.address
          );
          expect(parseInt(postMarketBal)).to.equal(mainBid.amount);

          await signerOneConnected.removeBid(0);

          const bidderRemoveBal = await token.balanceOf(
            await signerOne.getAddress()
          );

          expect(parseInt(bidderRemoveBal)).to.equal(parseInt(preBidBal));

          const marketRemoveBal = await token.balanceOf(zapMarket.address);
          expect(parseInt(marketRemoveBal)).to.equal(parseInt(preMarketBal));
        });

        it("Should remove a bid on a custom media", async () => {
          const preBidBal: string = await token.balanceOf(
            await signer.getAddress()
          );
          expect(parseInt(preBidBal)).to.equal(520000000e18);

          const preMarketBal: string = await token.balanceOf(zapMarket.address);
          expect(parseInt(preMarketBal)).to.equal(0);

          await bidderCustomConnected.setBid(0, customBid);

          const postBidBal: string = await token.balanceOf(
            await signer.getAddress()
          );
          expect(parseInt(postBidBal)).to.equal(520000000e18 - 200);

          const postMarketBal: string = await token.balanceOf(
            zapMarket.address
          );
          expect(parseInt(postMarketBal)).to.equal(customBid.amount);

          await bidderCustomConnected.removeBid(0);

          const bidderRemoveBal = await token.balanceOf(
            await signer.getAddress()
          );

          expect(parseInt(bidderRemoveBal)).to.equal(parseInt(preBidBal));

          const marketRemoveBal = await token.balanceOf(zapMarket.address);
          expect(parseInt(marketRemoveBal)).to.equal(parseInt(preMarketBal));
        });
      });

      describe("#revokeApproval", () => {
        it("Should reject if the token id does not exist on the main media", async () => {
          await ownerConnected
            .revokeApproval(400)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (revokeApproval): The token id does not exist."
            );
        });

        it("Should reject if the token id does not exist on a custom media", async () => {
          await customMediaSigner1
            .revokeApproval(400)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (revokeApproval): The token id does not exist."
            );
        });

        it("Should reject if the caller is not approved nor the owner on the main media", async () => {
          await signerOneConnected
            .revokeApproval(0)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (revokeApproval): Caller is not approved nor the owner."
            );
        });

        it("Should reject if the caller is not approved nor the owner on a custom media", async () => {
          await customMediaSigner0
            .revokeApproval(0)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (revokeApproval): Caller is not approved nor the owner."
            );
        });

        it("Should revoke approval by the approved on the main media", async () => {
          const preApproveAddr: string = await ownerConnected.fetchApproved(0);
          expect(preApproveAddr).to.equal(ethers.constants.AddressZero);

          await ownerConnected.approve(await signerOne.getAddress(), 0);

          const postApproveAddr: string = await ownerConnected.fetchApproved(0);
          expect(postApproveAddr).to.equal(await signerOne.getAddress());

          await signerOneConnected.revokeApproval(0);

          const postRevokedAddr: string = await ownerConnected.fetchApproved(0);
          expect(postRevokedAddr).to.equal(preApproveAddr);
        });

        it("Should revoke approval by the approved on a custom media", async () => {
          const preApproveAddr: string = await customMediaSigner0.fetchApproved(
            0
          );
          expect(preApproveAddr).to.equal(ethers.constants.AddressZero);

          await customMediaSigner1.approve(await signer.getAddress(), 0);

          const postApproveAddr: string =
            await customMediaSigner0.fetchApproved(0);
          expect(postApproveAddr).to.equal(await signer.getAddress());

          await customMediaSigner0.revokeApproval(0);

          const postRevokedAddr: string =
            await customMediaSigner0.fetchApproved(0);
          expect(postRevokedAddr).to.equal(preApproveAddr);
        });

        it("Should revoke approval by the owner on the main media", async () => {
          const preApproveAddr: string = await ownerConnected.fetchApproved(0);
          expect(preApproveAddr).to.equal(ethers.constants.AddressZero);

          await ownerConnected.approve(await signerOne.getAddress(), 0);

          const postApprovedAddr: string = await ownerConnected.fetchApproved(
            0
          );
          expect(postApprovedAddr).to.equal(await signerOne.getAddress());

          await ownerConnected.revokeApproval(0);

          const postRevokedAddr: string = await ownerConnected.fetchApproved(0);

          expect(postRevokedAddr).to.equal(preApproveAddr);
        });

        it("Should revoke approval by the owner on a custom media", async () => {
          const preApproveAddr: string = await customMediaSigner0.fetchApproved(
            0
          );
          expect(preApproveAddr).to.equal(ethers.constants.AddressZero);

          await customMediaSigner1.approve(await signer.getAddress(), 0);

          const postApprovedAddr: string =
            await customMediaSigner0.fetchApproved(0);
          expect(postApprovedAddr).to.equal(await signer.getAddress());

          await customMediaSigner1.revokeApproval(0);

          const postRevokedAddr: string =
            await customMediaSigner0.fetchApproved(0);

          expect(postRevokedAddr).to.equal(preApproveAddr);
        });
      });

      describe("#burn", () => {
        it("Should reject if the token id does not exist on the main media", async () => {
          await ownerConnected
            .burn(3)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (burn): TokenId does not exist."
            );
        });

        it("Should reject if the token id does not exist on a custom media", async () => {
          await customMediaSigner1
            .burn(3)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (burn): TokenId does not exist."
            );
        });

        it("Should reject if the caller is not approved nor the owner on the main media", async () => {
          await signerOneConnected
            .burn(0)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (burn): Caller is not approved nor the owner."
            );
        });

        it("Should reject if the caller is not approved nor the owner on a custom media", async () => {
          await customMediaSigner0
            .burn(0)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (burn): Caller is not approved nor the owner."
            );
        });

        it("Should burn a token if the caller is approved on the main media", async () => {
          const preTotalSupply: BigNumberish =
            await ownerConnected.fetchTotalMedia();
          expect(preTotalSupply.toNumber()).to.equal(2);

          const preApprovedAddr: string = await ownerConnected.fetchApproved(0);
          expect(preApprovedAddr).to.equal(ethers.constants.AddressZero);

          await ownerConnected.approve(await signerOne.getAddress(), 0);

          const postApprovedAddr: string = await ownerConnected.fetchApproved(
            0
          );

          expect(postApprovedAddr).to.equal(await signerOne.getAddress());

          await signerOneConnected.burn(0);

          const postTotalSupply: BigNumberish =
            await ownerConnected.fetchTotalMedia();
          expect(postTotalSupply.toNumber()).to.equal(1);
        });

        it("Should burn a token if the caller is approved on a custom media", async () => {
          const preTotalSupply: BigNumberish =
            await customMediaSigner1.fetchTotalMedia();
          expect(preTotalSupply.toNumber()).to.equal(1);

          const preApprovedAddr: string =
            await customMediaSigner0.fetchApproved(0);
          expect(preApprovedAddr).to.equal(ethers.constants.AddressZero);

          await customMediaSigner1.approve(await signer.getAddress(), 0);

          const postApprovedAddr: string =
            await customMediaSigner0.fetchApproved(0);

          expect(postApprovedAddr).to.equal(await signer.getAddress());

          await customMediaSigner0.burn(0);

          const postTotalSupply: BigNumberish =
            await customMediaSigner0.fetchTotalMedia();
          expect(postTotalSupply.toNumber()).to.equal(0);
        });

        it("Should burn the token if the caller is approved for all on the main media", async () => {
          const preTotalSupply: BigNumberish =
            await ownerConnected.fetchTotalMedia();
          expect(preTotalSupply.toNumber()).to.equal(2);

          const preApprovedStatus: boolean =
            await ownerConnected.fetchIsApprovedForAll(
              await signer.getAddress(),
              await signerOne.getAddress()
            );
          expect(preApprovedStatus).to.equal(false);

          await ownerConnected.setApprovalForAll(
            await signerOne.getAddress(),
            true
          );

          const postApprovedStatus: boolean =
            await ownerConnected.fetchIsApprovedForAll(
              await signer.getAddress(),
              await signerOne.getAddress()
            );

          expect(postApprovedStatus).to.equal(true);

          await signerOneConnected.burn(0);

          const postTotalSupply: BigNumberish =
            await ownerConnected.fetchTotalMedia();
          expect(postTotalSupply.toNumber()).to.equal(1);
        });

        it("Should burn the token if the caller is approved for all on a custom media", async () => {
          const preTotalSupply: BigNumberish =
            await customMediaSigner1.fetchTotalMedia();
          expect(preTotalSupply.toNumber()).to.equal(1);

          const preApprovedStatus: boolean =
            await customMediaSigner1.fetchIsApprovedForAll(
              await signerOne.getAddress(),
              await signer.getAddress()
            );
          expect(preApprovedStatus).to.equal(false);

          await customMediaSigner1.setApprovalForAll(
            await signer.getAddress(),
            true
          );

          const postApprovedStatus: boolean =
            await customMediaSigner1.fetchIsApprovedForAll(
              await signerOne.getAddress(),
              await signer.getAddress()
            );

          expect(postApprovedStatus).to.equal(true);

          await customMediaSigner0.burn(0);

          const postTotalSupply: BigNumberish =
            await customMediaSigner0.fetchTotalMedia();
          expect(postTotalSupply.toNumber()).to.equal(0);
        });

        it("Should burn a token if the caller is the owner on the main media", async () => {
          const owner: string = await ownerConnected.fetchOwnerOf(0);
          expect(owner).to.equal(await signer.getAddress());

          const preTotalSupply: BigNumberish =
            await ownerConnected.fetchTotalMedia();
          expect(preTotalSupply.toNumber()).to.equal(2);

          await ownerConnected.burn(0);

          const postTotalSupply: BigNumberish =
            await ownerConnected.fetchTotalMedia();
          expect(postTotalSupply.toNumber()).to.equal(1);
        });

        it("Should burn a token if the caller is the owner on a custom media", async () => {
          const preTotalSupply: BigNumberish =
            await customMediaSigner0.fetchTotalMedia();
          expect(preTotalSupply.toNumber()).to.equal(1);

          await customMediaSigner1.burn(0);

          const postTotalSupply: BigNumberish =
            await customMediaSigner1.fetchTotalMedia();
          expect(postTotalSupply.toNumber()).to.equal(0);
        });
      });

      describe("#approve", () => {
        it("Should reject if the token id does not exist on the main media", async () => {
          // Will throw an error due to the token id not existing
          await ownerConnected
            .approve(await signerOne.getAddress(), 400)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (approve): TokenId does not exist."
            );
        });

        it("Should reject if the token id does not exist on a custom media", async () => {
          // Will throw an error due to the token id not existing on the custom media
          await customMediaSigner1
            .approve(await signer.getAddress(), 400)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (approve): TokenId does not exist."
            );
        });

        it("Should reject if the caller is not the owner nor approved for all on the main media", async () => {
          // Will throw an error if the caller is not approved or the owner
          await signerOneConnected
            .approve(await signers[2].getAddress(), 0)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (approve): Caller is not the owner nor approved for all."
            );
        });

        it("Should reject if the caller is not the owner nor approved for all on a custom media", async () => {
          // Will throw an error if the caller is not approved or the owner on a custom media
          await customMediaSigner0
            .approve(await signers[2].getAddress(), 0)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (approve): Caller is not the owner nor approved for all."
            );
        });

        it("Should approve another address for a token on the main media", async () => {
          // Return the address approved for token id 0 before approval
          const preApprovedAddr: string = await ownerConnected.fetchApproved(0);

          // Expect the address to equal a zero address
          expect(preApprovedAddr).to.equal(ethers.constants.AddressZero);

          // The owner (signers[0]) approves signerOne for token id 0
          await ownerConnected.approve(await signerOne.getAddress(), 0);

          // Returns the address approved for token id  0 after approval
          const postApprovedAddr: string = await ownerConnected.fetchApproved(
            0
          );

          // Expect the address to equal the address of signerOne
          expect(postApprovedAddr).to.equal(await signerOne.getAddress());
        });

        it("Should approve another address for a token on a custom media", async () => {
          // Returns the approved address on a custom media before the approval
          const preApprovedAddr: string =
            await customMediaSigner1.fetchApproved(0);

          // Expect the address to equal a zero address
          expect(preApprovedAddr).to.equal(ethers.constants.AddressZero);

          // signerOne (signers[1]) approves signers[0] for token id 0 on a custom media
          await customMediaSigner1.approve(await signer.getAddress(), 0);

          // Returns the approved address after the approval
          const postApprovedAddr: string =
            await customMediaSigner1.fetchApproved(0);

          // Expect the address to equal the address of signer (signers[0])
          expect(postApprovedAddr).to.equal(await signer.getAddress());
        });

        it("Should approve another address for a token by a caller who is approved for all", async () => {
          // Returns the approval for all status before approval for all is set
          const preApprovedStatus: boolean =
            await ownerConnected.fetchIsApprovedForAll(
              await signer.getAddress(),
              await signerOne.getAddress()
            );

          // Expect the approval for all status to equal false
          expect(preApprovedStatus).to.equal(false);

          // The owner (signers[0]) sets the approval for all for token id 0
          await ownerConnected.setApprovalForAll(
            await signerOne.getAddress(),
            true
          );

          // Returns the approval for all status after approval for all is set
          const postApprovedStatus: boolean =
            await ownerConnected.fetchIsApprovedForAll(
              await signer.getAddress(),
              await signerOne.getAddress()
            );

          // Expect the approval for all status to equal true
          expect(postApprovedStatus).to.equal(true);

          // Returns the approved address for token id 0 before approval
          const preApprovedAddr: string =
            await signerOneConnected.fetchApproved(0);

          // Expect the approved address for token id 0 to equal a zero address
          expect(preApprovedAddr).to.equal(ethers.constants.AddressZero);

          // signerOne (signers[2]) is approved for all for token id 0 and is able to approve (signers[2])
          await signerOneConnected.approve(await signers[2].getAddress(), 0);

          // Returns the address approved for token id 0
          const postApprovedAddr: string =
            await signerOneConnected.fetchApproved(0);

          // Expect the approved address for token id 0 to equal the address of signers[2]
          expect(postApprovedAddr).to.equal(await signers[2].getAddress());
        });
      });

      describe("#fetchApproved", () => {
        it("Should reject if the token id does not exist on the main media", async () => {
          await ownerConnected
            .fetchApproved(200)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (fetchApproved): TokenId does not exist."
            );
        });

        it("Should reject if the token id does not exist on a custom media", async () => {
          await customMediaSigner1
            .fetchApproved(200)
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (fetchApproved): TokenId does not exist."
            );
        });

        it("Should fetch the approved address on the main media", async () => {
          // The owner (signer[0]) approves signerOne (signers[1]) for token id 0 on the main media
          await ownerConnected.approve(await signerOne.getAddress(), 0);

          // Returns the address approved on the main media
          const approvedAddr: string = await ownerConnected.fetchApproved(0);

          // Expect the address to equal signerOne address
          expect(approvedAddr).to.equal(await signerOne.getAddress());
        });

        it("Should fetch the approved address on a custom media", async () => {
          // signerOne (signer[1]) approves signer (signers[0]) for token id 0 on a custom media
          await customMediaSigner1.approve(await signer.getAddress(), 0);

          // Returns the address approved on the custom media
          const approvedAddr: string = await customMediaSigner1.fetchApproved(
            0
          );

          // Expect the address to equal signer (signers[0]) address
          expect(approvedAddr).to.equal(await signer.getAddress());
        });
      });

      describe("#setApprovalForAll", () => {
        it("Should set approval for another address for all tokens owned by owner", async () => {
          const preApprovalStatus = await ownerConnected.fetchIsApprovedForAll(
            await signer.getAddress(),
            await signerOne.getAddress()
          );

          expect(preApprovalStatus).to.be.false;

          await ownerConnected.setApprovalForAll(
            await signerOne.getAddress(),
            true
          );

          const postApprovalStatus = await ownerConnected.fetchIsApprovedForAll(
            await signer.getAddress(),
            await signerOne.getAddress()
          );

          expect(postApprovalStatus).to.be.true;

          await ownerConnected.setApprovalForAll(
            await signerOne.getAddress(),
            false
          );

          const revoked = await ownerConnected.fetchIsApprovedForAll(
            await signer.getAddress(),
            await signerOne.getAddress()
          );

          expect(revoked).to.be.false;
        });
      });

      describe.only("#transferFrom", () => {
        it("Should reject if the (from) is a zero address on the main media", async () => {
          await ownerConnected
            .transferFrom(
              ethers.constants.AddressZero,
              await signerOne.getAddress(),
              0
            )
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (transferFrom): The (from) address cannot be a zero address."
            );
        });

        it("Should reject if the (from) is a zero address on a custom media", async () => {
          await customMediaSigner1
            .transferFrom(
              ethers.constants.AddressZero,
              await signer.getAddress(),
              0
            )
            .should.be.rejectedWith(
              "Invariant failed: ZapMedia (transferFrom): The (from) address cannot be a zero address."
            );
        });

        it("Should transfer token to another address", async () => {
          const recipient = await signerOne.getAddress();

          const owner = await ownerConnected.fetchOwnerOf(0);

          expect(owner).to.equal(await signer.getAddress());

          await ownerConnected.transferFrom(owner, recipient, 0);

          const newOwner = await ownerConnected.fetchOwnerOf(0);

          expect(newOwner).to.equal(recipient);
        });
      });

      describe("#safeTransferFrom", () => {
        it("Should revert if the tokenId does not exist", async () => {
          const recipient = await signerOne.getAddress();

          await ownerConnected
            .safeTransferFrom(await signer.getAddress(), recipient, 0)
            .catch((err) => {
              expect(err.message).to.equal(
                "Invariant failed: ZapMedia (safeTransferFrom): TokenId does not exist."
              );
            });
        });

        it("Should revert if the (from) is a zero address", async () => {
          const recipient = await signerOne.getAddress();

          await ownerConnected
            .safeTransferFrom(ethers.constants.AddressZero, recipient, 0)
            .catch((err) => {
              expect(err.message).to.equal(
                "Invariant failed: ZapMedia (safeTransferFrom): The (from) address cannot be a zero address."
              );
            });
        });

        it("Should revert if the (to) is a zero address", async () => {
          await ownerConnected
            .safeTransferFrom(
              await signer.getAddress(),
              ethers.constants.AddressZero,
              0
            )
            .catch((err) => {
              expect(err.message).to.equal(
                "Invariant failed: ZapMedia (safeTransferFrom): The (to) address cannot be a zero address."
              );
            });
        });

        it("Should safe transfer a token to an address", async () => {
          const recipient = await signerOne.getAddress();

          await ownerConnected.safeTransferFrom(
            await signer.getAddress(),
            recipient,
            0
          );
        });
      });

      describe("#permit", () => {
        it("should allow a wallet to set themselves to approved with a valid signature", async () => {
          // created wallets using privateKey because we need a wallet instance when creating a signature
          const mainWallet: Wallet = new ethers.Wallet(
            "0x89e2d8a81beffed50f4d29f642127f18b5c8c1212c54b18ef66a784d0a172819"
          );
          const otherWallet: Wallet = new ethers.Wallet(
            "0x043192f7a8fb472d04ef7bb0ba1fbb3667198253cc8046e9e56626b804966cb3"
          );

          const deadline =
            Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24; // 24 hours
          const domain = ownerConnected.eip712Domain();

          const nonce = await (
            await ownerConnected.fetchPermitNonce(mainWallet.address, 0)
          ).toNumber();

          const eipSig = await signPermitMessage(
            mainWallet,
            otherWallet.address,
            0,
            nonce,
            deadline,
            domain
          );

          await ownerConnected.permit(otherWallet.address, 0, eipSig);
          const approved = await ownerConnected.fetchApproved(0);

          expect(approved.toLowerCase()).to.equal(
            otherWallet.address.toLowerCase()
          );

          // test to see if approved for another token. should fail.
          await ownerConnected.fetchApproved(1).catch((err) => {
            expect(err.message).to.equal(
              "Invariant failed: ZapMedia (fetchApproved): TokenId does not exist."
            );
          });
        });
      });

      describe("#fetchMedia", () => {
        it("Should get media instance by index in the media contract", async () => {
          const tokenId = await ownerConnected.fetchMediaByIndex(0);

          expect(parseInt(tokenId._hex)).to.equal(0);
        });

        it("Should throw an error index out of range", async () => {
          await ownerConnected.fetchMediaByIndex(1).catch((err) => {
            expect(err.message).to.equal(
              "Invariant failed: ZapMedia (tokenByIndex): Index out of range."
            );
          });
        });
      });

      describe("#fetchSignature", () => {
        it("Should fetch the signature of the newly minted nonce", async () => {
          const sigNonce = await ownerConnected.fetchMintWithSigNonce(
            await signer.getAddress()
          );

          expect(parseInt(sigNonce._hex)).to.equal(0);
        });

        it("Should Revert if address does not exist", async () => {
          await ownerConnected
            .fetchMintWithSigNonce("0x9b713D5416884d12a5BbF13Ee08B6038E74CDe")
            .catch((err) => {
              expect(err).to.equal(
                `Invariant failed: 0x9b713D5416884d12a5BbF13Ee08B6038E74CDe is not a valid address.`
              );
            });
        });
      });
    });
  });
});
