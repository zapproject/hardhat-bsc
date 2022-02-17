import chai, { expect } from "chai";

import chaiAsPromised from "chai-as-promised";

import { BigNumber, Contract, ethers, Signer } from "ethers";

import { constructBidShares, constructMediaData } from "../src/utils";

import { BidShares, MediaData } from "../src/types";

import {
  zapMarketAddresses,
  mediaFactoryAddresses,
  zapMediaAddresses,
  zapAuctionAddresses,
} from "../src/contract/addresses";

import {
  deployZapToken,
  deployZapVault,
  deployZapMarket,
  deployZapMediaImpl,
  deployMediaFactory,
  deployZapMedia,
  deployAuctionHouse,
} from "../src/deploy";

import AuctionHouse, { Auction } from "../src/auctionHouse";
import ZapMedia from "../src/zapMedia";

import { getSigners } from "./test_utils";
import { SuiteConstants } from "mocha";

const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
chai.use(chaiAsPromised);

chai.should();

describe("AuctionHouse", () => {
  let token: Contract;
  let zapVault: Contract;
  let zapMarket: Contract;
  let zapMediaImpl: Contract;
  let mediaFactory: Contract;
  let zapMedia: Contract;
  let auctionHouse: Contract;
  let signer: Signer;
  let mediaData: MediaData;
  let ownerMediaConnected: ZapMedia;
  let ownerAuctionConnected: AuctionHouse;
  let mediaAddress: string;
  let bidShares: BidShares;
  let curator: Signer;
  let curatorMainConnected: AuctionHouse;

  const signers = getSigners(provider);

  const duration = 60 * 60 * 24;

  const reservePrice = 200;

  const curatorFeePercentage = 0;

  let tokenURI =
    "https://bafkreievpmtbofalpowrcbr5oaok33e6xivii62r6fxh6fontaglngme2m.ipfs.dweb.link/";
  let metadataURI =
    "https://bafkreihhu7xo7knc3vn42jj26gz3jkvh3uu3rwurkb4djsoo5ayqs2s25a.ipfs.dweb.link/";

  beforeEach(async () => {
    signer = signers[0];
    curator = signers[9];

    token = await deployZapToken();
    zapVault = await deployZapVault();
    zapMarket = await deployZapMarket();
    zapMediaImpl = await deployZapMediaImpl();
    mediaFactory = await deployMediaFactory();
    zapMedia = await deployZapMedia();
    auctionHouse = await deployAuctionHouse();

    zapMarketAddresses["1337"] = zapMarket.address;
    mediaFactoryAddresses["1337"] = mediaFactory.address;
    zapMediaAddresses["1337"] = zapMedia.address;
    zapAuctionAddresses["1337"] = auctionHouse.address;

    mediaAddress = zapMediaAddresses["1337"];

    let metadataHex = ethers.utils.formatBytes32String("Test");
    let metadataHashRaw = ethers.utils.keccak256(metadataHex);
    let metadataHashBytes = ethers.utils.arrayify(metadataHashRaw);

    let contentHex = ethers.utils.formatBytes32String("Test Car");
    let contentHashRaw = ethers.utils.keccak256(contentHex);
    let contentHashBytes = ethers.utils.arrayify(contentHashRaw);

    let contentHash = contentHashBytes;
    let metadataHash = metadataHashBytes;

    mediaData = constructMediaData(
      tokenURI,
      metadataURI,
      contentHash,
      metadataHash
    );

    bidShares = constructBidShares(
      [
        await provider.getSigner(2).getAddress(),
        await provider.getSigner(3).getAddress(),
        await provider.getSigner(4).getAddress(),
      ],
      [15, 15, 15],
      15,
      35
    );

    ownerMediaConnected = new ZapMedia(1337, signer);
    ownerAuctionConnected = new AuctionHouse(1337, signer);
    curatorMainConnected = new AuctionHouse(1337, curator);

    await ownerMediaConnected.mint(mediaData, bidShares);
  });

  describe("Contract Functions", () => {
    describe("#constructor", () => {
      it("Should throw an error if the networkId is invalid", async () => {
        expect(() => {
          new AuctionHouse(300, signer);
        }).to.throw("Constructor: Network Id is not supported.");
      });

      it("Should reject if the customMediaAddress is a zero address", async () => {
        expect(() => {
          new AuctionHouse(1337, signer, ethers.constants.AddressZero);
        }).to.throw(
          "Invariant failed: AuctionHouse (constructor): The (customMediaAddress) cannot be a zero address."
        );
      });
    });

    describe("Write Functions", () => {
      describe("#createAuction", () => {
        beforeEach(async () => {
          await ownerMediaConnected.approve(
            ownerAuctionConnected.auctionHouse.address,
            0
          );
        });

        it("Should reject if the auctionHouse is not approved on the main media", async () => {
          await ownerMediaConnected.revokeApproval(0);

          await ownerAuctionConnected
            .createAuction(
              0,
              mediaAddress,
              duration,
              reservePrice,
              ethers.constants.AddressZero,
              0,
              token.address
            )
            .should.be.rejectedWith(
              "Invariant failed: AuctionHouse (createAuction): Transfer caller is not owner nor approved."
            );
        });

        it("Should reject if the caller is not approved nor token owner on the main media", async () => {
          const invalidSigner: Signer = signers[1];

          const invalidMainConnected: AuctionHouse = new AuctionHouse(
            1337,
            invalidSigner
          );

          await invalidMainConnected
            .createAuction(
              0,
              mediaAddress,
              duration,
              reservePrice,
              ethers.constants.AddressZero,
              0,
              token.address
            )
            .should.be.rejectedWith(
              "Invariant failed: AuctionHouse (createAuction): Caller is not approved or token owner."
            );
        });

        it("Should reject if the curator fee is 100 on the main media", async () => {
          await ownerAuctionConnected
            .createAuction(
              0,
              mediaAddress,
              duration,
              reservePrice,
              ethers.constants.AddressZero,
              100,
              token.address
            )
            .should.be.rejectedWith(
              "Invariant failed: AuctionHouse (createAuction): CuratorFeePercentage must be less than 100."
            );
        });

        it("Should reject if the tokenId does not exist on the main media", async () => {
          await ownerAuctionConnected
            .createAuction(
              300,
              mediaAddress,
              duration,
              reservePrice,
              ethers.constants.AddressZero,
              0,
              token.address
            )
            .should.be.rejectedWith(
              "Invariant failed: AuctionHouse (createAuction): TokenId does not exist."
            );
        });

        it("Should reject if the media is a zero address on the main media", async () => {
          await ownerAuctionConnected
            .createAuction(
              0,
              ethers.constants.AddressZero,
              duration,
              reservePrice,
              ethers.constants.AddressZero,
              0,
              token.address
            )
            .should.be.rejectedWith(
              "Invariant failed: AuctionHouse (createAuction): Media cannot be a zero address."
            );
        });

        it("Should create an auction on the main media", async () => {
          await ownerAuctionConnected.createAuction(
            0,
            mediaAddress,
            duration,
            reservePrice,
            ethers.constants.AddressZero,
            0,
            token.address
          );

          const createdAuction: Auction =
            await ownerAuctionConnected.fetchAuction(0);

          expect(parseInt(createdAuction.token.tokenId.toString())).to.equal(0);

          expect(createdAuction.token.mediaContract).to.equal(mediaAddress);
          expect(createdAuction.approved).to.be.true;
          expect(parseInt(createdAuction.duration._hex)).to.equal(60 * 60 * 24);
          expect(createdAuction.curatorFeePercentage).to.equal(0);
          expect(parseInt(createdAuction.reservePrice._hex)).to.equal(
            reservePrice
          );
          expect(createdAuction.tokenOwner).to.equal(await signer.getAddress());
          expect(createdAuction.curator).to.equal(ethers.constants.AddressZero);
          expect(createdAuction.auctionCurrency).to.equal(token.address);
        });
      });

      describe("#startAuction", () => {
        beforeEach(async () => {
          await ownerMediaConnected.approve(
            ownerAuctionConnected.auctionHouse.address,
            0
          );

          await ownerAuctionConnected.createAuction(
            0,
            mediaAddress,
            duration,
            reservePrice,
            await curator.getAddress(),
            0,
            token.address
          );
        });

        it("Should reject if the auctionId does not exist on the main media", async () => {
          await curatorMainConnected
            .startAuction(21, true)
            .should.be.rejectedWith(
              "Invariant failed: AuctionHouse (startAuction): AuctionId does not exist."
            );
        });

        it("Should reject if the auction has already started on the main media", async () => {
          await curatorMainConnected.startAuction(0, true);

          await curatorMainConnected
            .startAuction(0, true)
            .should.be.rejectedWith(
              "Invariant failed: AuctionHouse (startAuction): Auction has already started."
            );
        });

        it("Should reject if an invalid curator tries to start the auction on the main media", async () => {
          const invalidCurator: AuctionHouse = new AuctionHouse(
            1337,
            signers[8]
          );

          await invalidCurator
            .startAuction(0, true)
            .should.be.rejectedWith(
              "Invariant failed: AuctionHouse (startAuction): Only the curator can start this auction."
            );
        });

        it("Should start auction if the curator is not a zero address or token owner on the main media", async () => {
          await curatorMainConnected.startAuction(0, true);

          const createdAuction: Auction =
            await ownerAuctionConnected.fetchAuction(0);

          expect(parseInt(createdAuction.token.tokenId.toString())).to.equal(0);
          expect(createdAuction.token.mediaContract).to.equal(mediaAddress);
          expect(createdAuction.approved).to.be.true;
          expect(parseInt(createdAuction.duration._hex)).to.equal(60 * 60 * 24);
          expect(createdAuction.curatorFeePercentage).to.equal(0);
          expect(parseInt(createdAuction.reservePrice._hex)).to.equal(
            reservePrice
          );

          expect(createdAuction.tokenOwner).to.equal(await signer.getAddress());
          expect(createdAuction.curator).to.equal(await curator.getAddress());
          expect(createdAuction.auctionCurrency).to.equal(token.address);
        });
      });

      describe("#setAuctionReservePrice", () => {
        let invalidSigner: AuctionHouse;

        beforeEach(async () => {
          invalidSigner = new AuctionHouse(1337, signers[8]);

          await ownerMediaConnected.approve(
            ownerAuctionConnected.auctionHouse.address,
            0
          );

          await ownerAuctionConnected.createAuction(
            0,
            mediaAddress,
            duration,
            reservePrice,
            await curator.getAddress(),
            0,
            token.address
          );
        });

        it("Should reject if the auction id does not exist on the main media", async () => {
          await ownerAuctionConnected
            .setAuctionReservePrice(1, 200)
            .should.be.rejectedWith(
              "Invariant failed: AuctionHouse (setAuctionReservePrice): AuctionId does not exist."
            );
        });

        it("Should reject if the caller is not the curator or owner on the main media", async () => {
          await invalidSigner
            .setAuctionReservePrice(0, 200)
            .should.be.rejectedWith(
              "Invariant failed: AuctionHouse (setAuctionReservePrice): Caller must be the curator or token owner"
            );
        });

        it("Should reject if the auction already started on the main media", async () => {
          await ownerAuctionConnected.setAuctionReservePrice(0, 200);

          await curatorMainConnected.startAuction(0, true);

          await ownerAuctionConnected
            .setAuctionReservePrice(0, 200)
            .should.be.rejectedWith(
              "Invariant failed: AuctionHouse (setAuctionReservePrice): Auction has already started."
            );
        });

        it("Should set the auction reserve price when called by the token owner on the main media", async () => {
          await ownerAuctionConnected.setAuctionReservePrice(0, 200);

          await curatorMainConnected.startAuction(0, true);

          const createdAuction: Auction =
            await curatorMainConnected.fetchAuction(0);

          expect(parseInt(createdAuction.token.tokenId.toString())).to.equal(0);
          expect(createdAuction.token.mediaContract).to.equal(mediaAddress);
          expect(createdAuction.approved).to.be.true;
          expect(parseInt(createdAuction.duration._hex)).to.equal(duration);
          expect(createdAuction.curatorFeePercentage).to.equal(0);
          expect(parseInt(createdAuction.reservePrice._hex)).to.equal(200);
          expect(createdAuction.tokenOwner).to.equal(await signer.getAddress());
          expect(createdAuction.curator).to.equal(await curator.getAddress());
          expect(createdAuction.auctionCurrency).to.equal(token.address);
        });

        it("Should set the auction reserve price when called by the curator on the main media", async () => {
          await curatorMainConnected.setAuctionReservePrice(0, 200);

          await curatorMainConnected.startAuction(0, true);

          const createdAuction: Auction =
            await curatorMainConnected.fetchAuction(0);

          expect(parseInt(createdAuction.token.tokenId.toString())).to.equal(0);
          expect(createdAuction.token.mediaContract).to.equal(mediaAddress);
          expect(createdAuction.approved).to.be.true;
          expect(parseInt(createdAuction.duration._hex)).to.equal(duration);
          expect(createdAuction.curatorFeePercentage).to.equal(0);
          expect(parseInt(createdAuction.reservePrice._hex)).to.equal(200);
          expect(createdAuction.tokenOwner).to.equal(await signer.getAddress());
          expect(createdAuction.curator).to.equal(await curator.getAddress());
          expect(createdAuction.auctionCurrency).to.equal(token.address);
        });
      });

      describe("#createBid", () => {
        const bidAmtOne = 300;
        const bidAmtTwo = 400;

        let bidderOne: Signer;
        let bidderTwo: Signer;
        let bidderOneMainConnected: AuctionHouse;
        let bidderTwoMainConnected: AuctionHouse;

        beforeEach(async () => {
          bidderOne = signers[3];
          bidderTwo = signers[4];
          bidderOneMainConnected = new AuctionHouse(1337, bidderOne);
          bidderTwoMainConnected = new AuctionHouse(1337, bidderTwo);

          await ownerMediaConnected.approve(
            ownerAuctionConnected.auctionHouse.address,
            0
          );

          await ownerAuctionConnected.createAuction(
            0,
            mediaAddress,
            duration,
            reservePrice,
            ethers.constants.AddressZero,
            0,
            token.address
          );

          await token.mint(await bidderOne.getAddress(), 1000);

          await token.mint(await bidderTwo.getAddress(), 1000);

          await token
            .connect(bidderOne)
            .approve(ownerAuctionConnected.auctionHouse.address, 1000);

          await token
            .connect(bidderTwo)
            .approve(ownerAuctionConnected.auctionHouse.address, 1000);
        });

        it("Should reject if the auction id does not exist on the main media", async () => {
          await bidderOneMainConnected
            .createBid(12, bidAmtOne, mediaAddress)
            .should.be.rejectedWith(
              "Invariant failed: AuctionHouse (createBid): AuctionId does not exist."
            );
        });

        it("Should reject if the media contract is a zero address on the main media", async () => {
          await bidderOneMainConnected
            .createBid(0, bidAmtOne, ethers.constants.AddressZero)
            .should.be.rejectedWith(
              "Invariant failed: AuctionHouse (createBid): Media cannot be a zero address."
            );
        });

        it("Should reject if the bid does not meet the reserve price on the main media", async () => {
          await bidderOneMainConnected
            .createBid(0, reservePrice - 1, mediaAddress)
            .should.be.rejectedWith(
              "Invariant failed: AuctionHouse (createBid): Must send at least reserve price."
            );
        });

        it("Should create a bid on the main media", async () => {
          const aHousePreBal = await token.balanceOf(auctionHouse.address);
          expect(parseInt(aHousePreBal._hex)).to.equal(0);

          const bidderOnePreBal = await token.balanceOf(
            await bidderOne.getAddress()
          );
          expect(parseInt(bidderOnePreBal._hex)).to.equal(1000);

          await bidderOneMainConnected.createBid(0, bidAmtOne, mediaAddress);

          const bidderOnePostBal = await token.balanceOf(
            await bidderOne.getAddress()
          );
          expect(parseInt(bidderOnePostBal._hex)).to.equal(1000 - bidAmtOne);

          const aHousePostBalOne = await token.balanceOf(auctionHouse.address);
          expect(parseInt(aHousePostBalOne._hex)).to.equal(bidAmtOne);

          const firstBid = await ownerAuctionConnected.fetchAuction(0);
          expect(firstBid.bidder).to.equal(await bidderOne.getAddress());
          expect(parseInt(firstBid.amount._hex)).to.equal(bidAmtOne);

          const bidderTwoPreBal = await token.balanceOf(
            await bidderTwo.getAddress()
          );
          expect(parseInt(bidderTwoPreBal._hex)).to.equal(1000);

          await bidderTwoMainConnected.createBid(0, bidAmtTwo, mediaAddress);

          const bidderTwoPostBal = await token.balanceOf(
            await bidderTwo.getAddress()
          );
          expect(parseInt(bidderTwoPostBal._hex)).to.equal(1000 - bidAmtTwo);

          const aHousePostBalTwo = await token.balanceOf(auctionHouse.address);
          expect(parseInt(aHousePostBalTwo._hex)).to.equal(bidAmtTwo);

          const secondBid = await ownerAuctionConnected.fetchAuction(0);
          expect(secondBid.bidder).to.equal(await bidderTwo.getAddress());
          expect(parseInt(secondBid.amount._hex)).to.equal(bidAmtTwo);
        });

        it("Should not update the auctions duration on the main media", async () => {
          const beforeDuration = (await ownerAuctionConnected.fetchAuction(0))
            .duration;

          await bidderOneMainConnected.createBid(0, bidAmtOne, mediaAddress);

          const afterDuration = (await ownerAuctionConnected.fetchAuction(0))
            .duration;

          expect(parseInt(beforeDuration._hex)).to.equal(
            parseInt(afterDuration._hex)
          );
        });
      });

      describe("#cancelAuction", () => {
        let invalidSigner: Signer;
        let curator: Signer;
        let bidder: Signer;
        let invalidSignerConnected: AuctionHouse;
        let bidderMainConnected: AuctionHouse;
        let curatorMainConnected: AuctionHouse;

        beforeEach(async () => {
          const mintAmt = 300;
          const bidAmt = 200;
          curator = signers[4];
          invalidSigner = signers[5];
          bidder = signers[5];

          await ownerMediaConnected.approve(auctionHouse.address, 0);

          await ownerAuctionConnected.createAuction(
            0,
            mediaAddress,
            duration,
            reservePrice,
            await curator.getAddress(),
            0,
            token.address
          );

          curatorMainConnected = new AuctionHouse(1337, curator);

          await curatorMainConnected.startAuction(0, true);

          invalidSignerConnected = new AuctionHouse(1337, invalidSigner);
          bidderMainConnected = new AuctionHouse(1337, bidder);

          await token.mint(await bidder.getAddress(), mintAmt);
          await token.connect(bidder).approve(auctionHouse.address, bidAmt);
        });

        it("Should reject if the auctionId does not exist on the main media", async () => {
          await ownerAuctionConnected
            .cancelAuction(53)
            .should.be.rejectedWith(
              "Invariant failed: AuctionHouse (cancelAuction): Caller is not the auction creator or curator."
            );
        });

        it("Should reject if the caller is not the auction creator or curator on the main media", async () => {
          await invalidSignerConnected
            .cancelAuction(0)
            .should.be.rejectedWith(
              "Invariant failed: AuctionHouse (cancelAuction): Caller is not the auction creator or curator."
            );
        });

        it("Should reject if the auction has a bid on the main media", async () => {
          await bidderMainConnected.createBid(0, 200, mediaAddress);

          await curatorMainConnected
            .cancelAuction(0)
            .should.be.rejectedWith(
              "Invariant failed: AuctionHouse (cancelAuction): You can't cancel an auction that has a bid."
            );
        });

        it("Should cancel the auction by the curator on the main media", async () => {
          const preCancelAuction = await curatorMainConnected.fetchAuction(0);

          expect(parseInt(preCancelAuction.token.tokenId._hex)).to.equal(0);
          expect(preCancelAuction.token.mediaContract).to.equal(mediaAddress);
          expect(preCancelAuction.approved).to.be.true;
          expect(parseInt(preCancelAuction.amount._hex)).to.equal(0);
          expect(parseInt(preCancelAuction.duration._hex)).to.equal(duration);
          expect(parseInt(preCancelAuction.reservePrice._hex)).to.equal(
            reservePrice
          );
          expect(curatorFeePercentage).to.equal(0);
          expect(preCancelAuction.tokenOwner).to.equal(
            await signer.getAddress()
          );
          expect(preCancelAuction.bidder).to.equal(
            ethers.constants.AddressZero
          );
          expect(preCancelAuction.curator).to.equal(await curator.getAddress());
          expect(preCancelAuction.auctionCurrency).to.equal(token.address);

          await curatorMainConnected.cancelAuction(0);

          const postCancelAuction = await curatorMainConnected.fetchAuction(0);

          expect(parseInt(postCancelAuction.token.tokenId._hex)).to.equal(0);
          expect(postCancelAuction.token.mediaContract).to.equal(
            ethers.constants.AddressZero
          );
          expect(postCancelAuction.approved).to.be.false;
          expect(parseInt(postCancelAuction.amount._hex)).to.equal(0);
          expect(parseInt(postCancelAuction.duration._hex)).to.equal(0);
          expect(parseInt(postCancelAuction.reservePrice._hex)).to.equal(0);
          expect(curatorFeePercentage).to.equal(0);
          expect(postCancelAuction.tokenOwner).to.equal(
            ethers.constants.AddressZero
          );
          expect(postCancelAuction.bidder).to.equal(
            ethers.constants.AddressZero
          );
          expect(postCancelAuction.curator).to.equal(
            ethers.constants.AddressZero
          );
          expect(postCancelAuction.auctionCurrency).to.equal(
            ethers.constants.AddressZero
          );
        });

        it("Should cancel the auction by the owner on the main media", async () => {
          const preCancelAuction = await ownerAuctionConnected.fetchAuction(0);

          expect(parseInt(preCancelAuction.token.tokenId._hex)).to.equal(0);
          expect(preCancelAuction.token.mediaContract).to.equal(mediaAddress);
          expect(preCancelAuction.approved).to.be.true;
          expect(parseInt(preCancelAuction.amount._hex)).to.equal(0);
          expect(parseInt(preCancelAuction.duration._hex)).to.equal(duration);
          expect(parseInt(preCancelAuction.reservePrice._hex)).to.equal(
            reservePrice
          );

          expect(parseInt(preCancelAuction.curatorFeePercentage)).to.equal(0);

          expect(preCancelAuction.tokenOwner).to.equal(
            await signer.getAddress()
          );
          expect(preCancelAuction.bidder).to.equal(
            ethers.constants.AddressZero
          );
          expect(preCancelAuction.curator).to.equal(await curator.getAddress());
          expect(preCancelAuction.auctionCurrency).to.equal(token.address);

          await ownerAuctionConnected.cancelAuction(0);

          const postCancelAuction = await ownerAuctionConnected.fetchAuction(0);

          expect(parseInt(postCancelAuction.token.tokenId._hex)).to.equal(0);
          expect(postCancelAuction.token.mediaContract).to.equal(
            ethers.constants.AddressZero
          );
          expect(postCancelAuction.approved).to.be.false;
          expect(parseInt(postCancelAuction.amount._hex)).to.equal(0);
          expect(parseInt(postCancelAuction.duration._hex)).to.equal(0);

          expect(parseInt(postCancelAuction.reservePrice._hex)).to.equal(0);
          expect(parseInt(postCancelAuction.curatorFeePercentage)).to.equal(0);
          expect(postCancelAuction.tokenOwner).to.equal(
            ethers.constants.AddressZero
          );
          expect(postCancelAuction.bidder).to.equal(
            ethers.constants.AddressZero
          );
          expect(postCancelAuction.curator).to.equal(
            ethers.constants.AddressZero
          );
          expect(postCancelAuction.auctionCurrency).to.equal(
            ethers.constants.AddressZero
          );
        });
      });
    });

    describe.only("#endAuction", () => {
      let invalidSigner: Signer;
      let curator: Signer;
      let bidder: Signer;
      let invalidSignerConnected: AuctionHouse;
      let bidderMainConnected: AuctionHouse;
      let curatorMainConnected: AuctionHouse;

      beforeEach(async () => {
        const mintAmt = 300;
        const bidAmt = 200;
        curator = signers[4];
        invalidSigner = signers[5];
        bidder = signers[5];

        await ownerMediaConnected.approve(auctionHouse.address, 0);

        await ownerAuctionConnected.createAuction(
          0,
          mediaAddress,
          duration,
          reservePrice,
          await curator.getAddress(),
          0,
          token.address
        );

        curatorMainConnected = new AuctionHouse(1337, curator);
        invalidSignerConnected = new AuctionHouse(1337, invalidSigner);
        bidderMainConnected = new AuctionHouse(1337, bidder);

        await token.mint(await bidder.getAddress(), mintAmt);
        await token.connect(bidder).approve(auctionHouse.address, bidAmt);
      });

      it("Should reject if the auctionId does not exist on the main media", async () => {
        await curatorMainConnected.startAuction(0, true);
        await bidderMainConnected.createBid(0, 200, mediaAddress);
        await ownerAuctionConnected
          .endAuction(30, mediaAddress)
          .should.be.rejectedWith(
            "Invariant failed: AuctionHouse (endAuction): AuctionId does not exist."
          );
      });

      it("Should reject if the auction hasn't begun on the main media", async () => {
        await curatorMainConnected
          .endAuction(0, mediaAddress)
          .should.be.rejectedWith(
            "Invariant failed: AuctionHouse (endAuction): Auction has already started."
          );
      });

      it("should reject if the caller is not the curator on the main media", async () => {

      });

    });

    describe("View Functions", () => {
      let mediaAddress: any;
      let curatorConnected: AuctionHouse;

      beforeEach(async () => {
        mediaAddress = zapMedia.address;

        curatorConnected = new AuctionHouse(1337, curator);
      });

      describe("#fetchAuction, #fetchAuctionFromTransactionReceipt", () => {
        it("Should return null values if the auctionId does not exist on the main media", async () => {
          const nullAuction = await ownerAuctionConnected.fetchAuction(3);

          expect(parseInt(nullAuction.token.tokenId._hex)).to.equal(0);
          expect(nullAuction.token.mediaContract).to.equal(
            ethers.constants.AddressZero
          );
          expect(nullAuction.approved).to.be.false;
          expect(parseInt(nullAuction.amount._hex)).to.equal(0);
          expect(parseInt(nullAuction.duration._hex)).to.equal(0);

          expect(parseInt(nullAuction.reservePrice._hex)).to.equal(0);
          expect(parseInt(nullAuction.curatorFeePercentage)).to.equal(0);
          expect(nullAuction.tokenOwner).to.equal(ethers.constants.AddressZero);
          expect(nullAuction.bidder).to.equal(ethers.constants.AddressZero);
          expect(nullAuction.curator).to.equal(ethers.constants.AddressZero);
          expect(nullAuction.auctionCurrency).to.equal(
            ethers.constants.AddressZero
          );
        });

        it("Should fetch an auction from the create auction transaction receipt on the main media", async () => {
          await ownerMediaConnected.approve(
            ownerAuctionConnected.auctionHouse.address,
            0
          );

          const tx = await ownerAuctionConnected.createAuction(
            0,
            mediaAddress,
            duration,
            reservePrice,
            ethers.constants.AddressZero,
            0,
            token.address
          );

          let receipt = await tx.wait();

          const receiptfetch =
            await ownerAuctionConnected.fetchAuctionFromTransactionReceipt(
              receipt
            );

          expect(parseInt(receiptfetch?.token.tokenId.toString()!)).to.equal(0);
          expect(receiptfetch?.token.mediaContract).to.equal(mediaAddress);
          expect(receiptfetch?.approved).to.be.true;
          expect(parseInt(receiptfetch?.duration._hex!)).to.equal(60 * 60 * 24);
          expect(receiptfetch?.curatorFeePercentage).to.equal(0);
          expect(parseInt(receiptfetch?.reservePrice._hex!)).to.equal(
            reservePrice
          );
          expect(receiptfetch?.tokenOwner).to.equal(await signer.getAddress());
          expect(receiptfetch?.curator).to.equal(ethers.constants.AddressZero);
          expect(receiptfetch?.auctionCurrency).to.equal(token.address);
        });

        it("Should fetch an auction from the start auction transaction receipt on the main media", async () => {
          await ownerMediaConnected.approve(
            ownerAuctionConnected.auctionHouse.address,
            0
          );

          await auctionHouse.createAuction(
            0,
            mediaAddress,
            duration,
            reservePrice,
            await curator.getAddress(),
            0,
            token.address
          );

          let tx = await curatorConnected.startAuction(0, true);

          let receipt = await tx.wait();

          const receiptfetch =
            await ownerAuctionConnected.fetchAuctionFromTransactionReceipt(
              receipt
            );

          expect(parseInt(receiptfetch?.token.tokenId.toString()!)).to.equal(0);
          expect(receiptfetch?.token.mediaContract).to.equal(mediaAddress);
          expect(receiptfetch?.approved).to.be.true;
          expect(parseInt(receiptfetch?.duration._hex!)).to.equal(60 * 60 * 24);
          expect(receiptfetch?.curatorFeePercentage).to.equal(0);
          expect(parseInt(receiptfetch?.reservePrice._hex!)).to.equal(
            reservePrice
          );
          expect(receiptfetch?.tokenOwner).to.equal(await signer.getAddress());
          expect(receiptfetch?.curator).to.equal(await curator.getAddress());
          expect(receiptfetch?.auctionCurrency).to.equal(token.address);
        });

        it.skip("Should return null if fetching transaction without auction ID event on the main media", async () => {
          await ownerMediaConnected.approve(
            ownerAuctionConnected.auctionHouse.address,
            0
          );

          const tx = await ownerAuctionConnected.createAuction(
            0,
            mediaAddress,
            duration,
            reservePrice,
            ethers.constants.AddressZero,
            0,
            token.address
          );

          let receipt = await tx.wait();

          const receiptfetch =
            await ownerAuctionConnected.fetchAuctionFromTransactionReceipt(
              receipt
            );
          expect(receiptfetch).to.be.null;
        });

        it("Should fetch an auction from the setAuctionReservePrice receipt on the main media", async () => {
          await ownerMediaConnected.approve(
            ownerAuctionConnected.auctionHouse.address,
            0
          );

          await ownerAuctionConnected.createAuction(
            0,
            mediaAddress,
            duration,
            reservePrice,
            await curator.getAddress(),
            0,
            token.address
          );

          let tx = await curatorConnected.setAuctionReservePrice(0, 200);

          let transactionReceipt = await tx.wait();

          const fetchReceipt =
            await ownerAuctionConnected.fetchAuctionFromTransactionReceipt(
              transactionReceipt
            );

          expect(parseInt(fetchReceipt?.token.tokenId.toString()!)).to.equal(0);

          expect(fetchReceipt?.token.mediaContract).to.equal(mediaAddress);

          expect(fetchReceipt?.approved).to.be.false;

          expect(parseInt(fetchReceipt?.duration._hex!)).to.equal(duration);

          expect(fetchReceipt?.curatorFeePercentage).to.equal(0);

          expect(fetchReceipt?.tokenOwner).to.equal(await signer.getAddress());

          expect(fetchReceipt?.auctionCurrency).to.equal(token.address);
        });
      });
    });
  });
});
