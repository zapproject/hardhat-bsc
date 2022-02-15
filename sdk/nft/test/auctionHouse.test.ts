import { expect } from "chai";

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

const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

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
  let ownerConnected: ZapMedia;
  let mediaAddress: string;
  let bidShares: BidShares;

  const signers = getSigners(provider);

  const duration = 60 * 60 * 24;

  const reservePrice = BigNumber.from(10).pow(18).div(2);

  let tokenURI =
    "https://bafkreievpmtbofalpowrcbr5oaok33e6xivii62r6fxh6fontaglngme2m.ipfs.dweb.link/";
  let metadataURI =
    "https://bafkreihhu7xo7knc3vn42jj26gz3jkvh3uu3rwurkb4djsoo5ayqs2s25a.ipfs.dweb.link/";

  beforeEach(async () => {
    signer = signers[0];

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

    ownerConnected = new ZapMedia(1337, signer);

    await ownerConnected.mint(mediaData, bidShares);
  });

  describe("Contract Functions", () => {
    describe("#constructor", () => {
      it("Should throw an error if the networkId is invalid", async () => {
        expect(() => {
          new AuctionHouse(300, signer);
        }).to.throw("Constructor: Network Id is not supported.");
      });
    });

    describe("Write Functions", () => {
      describe("#createAuction", () => {
        it("Should reject if the auctionHouse is not approved", async () => {
          const auctionHouse = new AuctionHouse(1337, signer);

          await auctionHouse
            .createAuction(
              0,
              mediaAddress,
              duration,
              reservePrice,
              "0x0000000000000000000000000000000000000000",
              0,
              token.address
            )
            .catch((err) => {
              expect(err.message).to.equal(
                "Invariant failed: AuctionHouse (createAuction): Transfer caller is not owner nor approved."
              );
            });
        });

        it("Should reject if the caller is not approved", async () => {
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
              "0x0000000000000000000000000000000000000000",
              0,
              token.address
            )
            .catch((err) => {
              expect(err.message).to.equal(
                "Invariant failed: AuctionHouse (createAuction): Caller is not approved or token owner."
              );
            });
        });

        it("Should reject if the curator fee is 100", async () => {
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
              token.address
            )
            .catch((err) => {
              expect(err.message).to.equal(
                "Invariant failed: AuctionHouse (createAuction): CuratorFeePercentage must be less than 100."
              );
            });
        });

        it("Should reject if the tokenId does not exist", async () => {
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
              "0x0000000000000000000000000000000000000000",
              0,
              token.address
            )
            .catch((err) => {
              expect(err.message).to.equal(
                "Invariant failed: AuctionHouse (createAuction): TokenId does not exist."
              );
            });
        });

        it("Should reject if the mediaContract is a zero address", async () => {
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
              "0x0000000000000000000000000000000000000000",
              0,
              token.address
            )
            .catch((err) => {
              expect(err.message).to.equal(
                "Invariant failed: AuctionHouse (createAuction): Media cannot be a zero address."
              );
            });
        });

        it("Should create an auction", async () => {
          const duration = 60 * 60 * 24;
          const reservePrice = BigNumber.from(10).pow(18).div(2);

          const auctionHouse = new AuctionHouse(1337, signer);

          await media.approve(auctionHouse.auctionHouse.address, 0);

          await auctionHouse.createAuction(
            0,
            mediaAddress,
            duration,
            reservePrice,
            "0x0000000000000000000000000000000000000000",
            0,
            token.address
          );

          const createdAuction = await auctionHouse.fetchAuction(0);

          expect(parseInt(createdAuction.token.tokenId.toString())).to.equal(0);

          expect(createdAuction.token.mediaContract).to.equal(mediaAddress);
          expect(createdAuction.approved).to.be.true;
          expect(parseInt(createdAuction.duration._hex)).to.equal(60 * 60 * 24);
          expect(createdAuction.curatorFeePercentage).to.equal(0);
          expect(parseInt(createdAuction.reservePrice._hex)).to.equal(
            parseInt(reservePrice._hex)
          );
          expect(createdAuction.tokenOwner).to.equal(await signer.getAddress());
          expect(createdAuction.curator).to.equal(ethers.constants.AddressZero);
          expect(createdAuction.auctionCurrency).to.equal(token.address);
        });
      });

      describe("#startAuction", () => {
        let auctionHouse: AuctionHouse;
        let curatorConnected: AuctionHouse;
        let curator: Signer;

        beforeEach(async () => {
          curator = signers[9];
          auctionHouse = new AuctionHouse(1337, signer);
          curatorConnected = new AuctionHouse(1337, curator);

          await media.approve(auctionHouse.auctionHouse.address, 0);
        });

        it("Should reject if the auctionId does not exist", async () => {
          await curatorConnected.startAuction(0, true).catch((err) => {
            expect(err.message).to.equal(
              "Invariant failed: AuctionHouse (fetchAuction): AuctionId does not exist."
            );
          });
        });

        it("Should reject if the auction has already started", async () => {
          const duration = 60 * 60 * 24;
          const reservePrice = BigNumber.from(10).pow(18).div(2);

          await auctionHouse.createAuction(
            0,
            mediaAddress,
            duration,
            reservePrice,
            await curator.getAddress(),
            0,
            token.address
          );

          await curatorConnected.startAuction(0, true);

          await curatorConnected.startAuction(0, true).catch((err) => {
            expect(err.message).to.equal(
              "Invariant failed: AuctionHouse (startAuction): Auction has already started."
            );
          });
        });

        it("Should reject if a valid curator does not start the auction", async () => {
          const duration = 60 * 60 * 24;
          const reservePrice = BigNumber.from(10).pow(18).div(2);

          await auctionHouse.createAuction(
            0,
            mediaAddress,
            duration,
            reservePrice,
            await curator.getAddress(),
            0,
            token.address
          );

          await auctionHouse.startAuction(0, true).catch((err) => {
            expect(err.message).to.equal(
              "Invariant failed: AuctionHouse (startAuction): Only the curator can start this auction."
            );
          });
        });

        it("Should start auction if the curator is not a zero address or token owner", async () => {
          const duration = 60 * 60 * 24;
          const reservePrice = BigNumber.from(10).pow(18).div(2);

          await auctionHouse.createAuction(
            0,
            mediaAddress,
            duration,
            reservePrice,
            await curator.getAddress(),
            0,
            token.address
          );

          await curatorConnected.startAuction(0, true);

          const createdAuction = await auctionHouse.fetchAuction(0);

          expect(parseInt(createdAuction.token.tokenId.toString())).to.equal(0);
          expect(createdAuction.token.mediaContract).to.equal(mediaAddress);
          expect(createdAuction.approved).to.be.true;
          expect(parseInt(createdAuction.duration._hex)).to.equal(60 * 60 * 24);
          expect(createdAuction.curatorFeePercentage).to.equal(0);
          expect(parseInt(createdAuction.reservePrice._hex)).to.equal(
            parseInt(reservePrice._hex)
          );
          expect(createdAuction.tokenOwner).to.equal(await signer.getAddress());
          expect(createdAuction.curator).to.equal(await curator.getAddress());
          expect(createdAuction.auctionCurrency).to.equal(token.address);
        });
      });

      describe("#setAuctionReservePrice", () => {
        const duration = 60 * 60 * 24;
        const reservePrice = BigNumber.from(10).pow(18).div(2);

        // An instance of the AuctionHouse class that will be connected to signer[0]
        let auctionHouse: AuctionHouse;

        // An instance of the AuctionHouse class that will be connected to signer[9]
        let curatorConnected: AuctionHouse;

        // Will be set to signers[9]
        let curator: Signer;

        // Will be set to signers[4]
        let bidder: Signer;

        beforeEach(async () => {
          // Assign the curator to signer[9]
          curator = signers[9];

          // Assign the bidder to signer[4]
          bidder = signers[4];

          // The owner(signers[0]) connected to the AuctionHouse class as a signer
          auctionHouse = new AuctionHouse(1337, signer);

          // The curator(signers[9]) connected to the AuctionHouse class as a signer
          curatorConnected = new AuctionHouse(1337, curator);

          // The owner(signer[0]) of tokenId 0 approves the auctionHouse
          await media.approve(auctionHouse.auctionHouse.address, 0);

          // The owner(signer[0]) creates the auction
          // The curator is neither a zero address or token owner so the curator has to invoke startAuction
          await auctionHouse.createAuction(
            0,
            mediaAddress,
            duration,
            0,
            await curator.getAddress(),
            0,
            token.address
          );

          // Transfer 1000 tokens to the bidder
          await token.mint(await bidder.getAddress(), 1000);
        });

        it("Should reject if the auction id does not exist", async () => {
          // The owner(signer[0]) connected to the AuctionHouse class
          // The owner attempts invoke the setAuctionReservePrice on a non existent auction id
          await auctionHouse.setAuctionReservePrice(1, 200).catch((err) => {
            expect(err.message).to.equal(
              "Invariant failed: AuctionHouse (fetchAuction): AuctionId does not exist."
            );
          });
        });

        it("Should reject if not called by the curator or owner", async () => {
          // Bad signer
          const badSigner = signers[8];

          // AuctionHouse class instance
          const badSignerConnected = new AuctionHouse(1337, badSigner);

          // The badSigner(signer[8]) connected to the AuctionHouse class
          // The badSigner attempts invoke the setAuctionReservePrice when its not the curator or token owner
          await badSignerConnected
            .setAuctionReservePrice(0, 200)
            .catch((err) => {
              expect(err.message).to.equal(
                "Invariant failed: AuctionHouse (setAuctionReservePrice): Caller must be the curator or token owner"
              );
            });
        });

        it("Should reject if the auction already started", async () => {
          // The owner(signer[0]) connected to the AuctionHouse class
          // The owner invokes the setAuctionReservePrice
          await auctionHouse.setAuctionReservePrice(0, 200);

          // The curator invokes startAuction
          await curatorConnected.startAuction(0, true);

          // The owner attempts to invoke the setAuctionReserverPrice after the auction has already started
          await auctionHouse.setAuctionReservePrice(0, 200).catch((err) => {
            expect(err.message).to.equal(
              "Invariant failed: AuctionHouse (setAuctionReservePrice): Auction has already started."
            );
          });
        });

        it("Should set the auction reserve price when called by the token owner", async () => {
          // The owner(signer[0]) connected to the AuctionHouse class
          // The owner invokes the setAuctionReservePrice
          await auctionHouse.setAuctionReservePrice(0, 200);

          // The curator invokes startAuction
          await curatorConnected.startAuction(0, true);
        });

        it("Should set the auction reserve price when called by the curator", async () => {
          // The curator(signer[4]) connected to the AuctionHouse class
          // The curator invokes the setAuctionReservePrice
          await curatorConnected.setAuctionReservePrice(0, 200);

          // The curator invokes startAuction
          await curatorConnected.startAuction(0, true);

          // Fetches the details from auction id 0
          const createdAuction = await curatorConnected.fetchAuction(0);

          // The returned tokenId should equal 0
          expect(parseInt(createdAuction.token.tokenId.toString())).to.equal(0);

          // The returned mediaContract address should equal the address the tokenId belongs to
          expect(createdAuction.token.mediaContract).to.equal(mediaAddress);

          // The returned auction approval status should equal true after the curator invokes startAuction
          expect(createdAuction.approved).to.be.true;

          // The returned duration should equal the duration set on createAuction
          expect(parseInt(createdAuction.duration._hex)).to.equal(duration);

          // The returned curatorFeePercentage should equal the fee set on createAuction
          expect(createdAuction.curatorFeePercentage).to.equal(0);

          // The returned reservePrice should equal the amount the curator set on setAuctionReservePrice
          expect(parseInt(createdAuction.reservePrice._hex)).to.equal(200);

          // The returned tokenId owner should equal the address who minted
          expect(createdAuction.tokenOwner).to.equal(await signer.getAddress());

          // The returned curator should equal the address set on createAuction
          expect(createdAuction.curator).to.equal(await curator.getAddress());

          // The returned currency should equal the currency set on createAuction
          expect(createdAuction.auctionCurrency).to.equal(token.address);
        });
      });

      describe("#createBid", () => {
        const duration = 60 * 60 * 24;
        const reservePrice = 200;
        const bidAmtOne = 300;
        const bidAmtTwo = 400;

        let bidderOne: Signer;
        let bidderTwo: Signer;
        let ownerConnected: AuctionHouse;
        let bidderOneConnected: AuctionHouse;
        let bidderTwoConnected: AuctionHouse;

        beforeEach(async () => {
          bidderOne = signers[1];
          bidderTwo = signers[2];
          ownerConnected = new AuctionHouse(1337, signer);
          bidderOneConnected = new AuctionHouse(1337, bidderOne);
          bidderTwoConnected = new AuctionHouse(1337, bidderTwo);

          await media.approve(ownerConnected.auctionHouse.address, 0);

          await ownerConnected.createAuction(
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
            .approve(ownerConnected.auctionHouse.address, 1000);

          await token
            .connect(bidderTwo)
            .approve(ownerConnected.auctionHouse.address, 1000);
        });

        it("Should reject if the auction id does not exist", async () => {
          await bidderOneConnected
            .createBid(12, bidAmtOne, mediaAddress)
            .catch((err) => {
              expect(err.message).to.equal(
                "Invariant failed: AuctionHouse (fetchAuction): AuctionId does not exist."
              );
            });
        });

        it("Should reject if the media contract is a zero address", async () => {
          await bidderOneConnected
            .createBid(0, bidAmtOne, ethers.constants.AddressZero)
            .catch((err) => {
              expect(err.message).to.equal(
                "Invariant failed: AuctionHouse (createBid): Media cannot be a zero address."
              );
            });
        });

        it("Should reject if the bid does not meet the reserve price", async () => {
          await bidderOneConnected
            .createBid(0, reservePrice - 1, mediaAddress)
            .catch((err) => {
              expect(err.message).to.equal(
                "Invariant failed: AuctionHouse (createBid): Must send at least reserve price."
              );
            });
        });

        it("Should create a bid", async () => {
          const aHousePreBal = await token.balanceOf(auctionHouse.address);
          expect(parseInt(aHousePreBal._hex)).to.equal(0);

          const bidderOnePreBal = await token.balanceOf(
            await bidderOne.getAddress()
          );
          expect(parseInt(bidderOnePreBal._hex)).to.equal(1000);

          await bidderOneConnected.createBid(0, bidAmtOne, mediaAddress);

          const bidderOnePostBal = await token.balanceOf(
            await bidderOne.getAddress()
          );
          expect(parseInt(bidderOnePostBal._hex)).to.equal(1000 - bidAmtOne);

          const aHousePostBalOne = await token.balanceOf(auctionHouse.address);
          expect(parseInt(aHousePostBalOne._hex)).to.equal(bidAmtOne);

          const firstBid = await ownerConnected.fetchAuction(0);
          expect(firstBid.bidder).to.equal(await bidderOne.getAddress());
          expect(parseInt(firstBid.amount._hex)).to.equal(bidAmtOne);

          const bidderTwoPreBal = await token.balanceOf(
            await bidderTwo.getAddress()
          );
          expect(parseInt(bidderTwoPreBal._hex)).to.equal(1000);

          await bidderTwoConnected.createBid(0, bidAmtTwo, mediaAddress);

          const bidderTwoPostBal = await token.balanceOf(
            await bidderTwo.getAddress()
          );
          expect(parseInt(bidderTwoPostBal._hex)).to.equal(1000 - bidAmtTwo);

          const aHousePostBalTwo = await token.balanceOf(auctionHouse.address);
          expect(parseInt(aHousePostBalTwo._hex)).to.equal(bidAmtTwo);

          const secondBid = await ownerConnected.fetchAuction(0);
          expect(secondBid.bidder).to.equal(await bidderTwo.getAddress());
          expect(parseInt(secondBid.amount._hex)).to.equal(bidAmtTwo);
        });

        it("Should not update the auctions duration", async () => {
          const beforeDuration = (await ownerConnected.fetchAuction(0))
            .duration;

          await bidderOneConnected.createBid(0, bidAmtOne, mediaAddress);

          const afterDuration = (await ownerConnected.fetchAuction(0)).duration;

          expect(parseInt(beforeDuration._hex)).to.equal(
            parseInt(afterDuration._hex)
          );
        });
      });

      describe.only("#cancelAuction", () => {
        it("Should reject if the auctionId does not exist on the main media", async () => {
          const duration = 60 * 60 * 24;
          const reservePrice = BigNumber.from(10).pow(18).div(2);

          const auctionHouse = new AuctionHouse(1337, signer);

          await media.approve(auctionHouse.auctionHouse.address, 0);

          await auctionHouse.createAuction(
            0,
            mediaAddress,
            duration,
            reservePrice,
            "0x0000000000000000000000000000000000000000",
            0,
            token.address
          );
          //Step 1 create an auction
          //step 2 allow the cancelAuction to throw an error if the auctionId does not exist
          //Step 3 add in assertion that it should throw error
        });
      });
    });

    describe("View Functions", () => {
      let media: any;
      let mediaAddress: any;
      let mediaData: any;
      let bidShares: any;

      let tokenURI =
        "https://bafkreievpmtbofalpowrcbr5oaok33e6xivii62r6fxh6fontaglngme2m.ipfs.dweb.link/";
      let metadataURI =
        "https://bafkreihhu7xo7knc3vn42jj26gz3jkvh3uu3rwurkb4djsoo5ayqs2s25a.ipfs.dweb.link/";

      beforeEach(async () => {
        let metadataHex = ethers.utils.formatBytes32String("Test");
        let metadataHashRaw = ethers.utils.keccak256(metadataHex);
        let metadataHashBytes = ethers.utils.arrayify(metadataHashRaw);

        let contentHex = ethers.utils.formatBytes32String("Test Car");
        let contentHashRaw = ethers.utils.keccak256(contentHex);
        let contentHashBytes = ethers.utils.arrayify(contentHashRaw);

        let contentHash = contentHashBytes;
        let metadataHash = metadataHashBytes;

        media = new ZapMedia(1337, signer);
        mediaAddress = zapMediaAddresses["1337"];

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

        mediaData = constructMediaData(
          tokenURI,
          metadataURI,
          contentHash,
          metadataHash
        );

        await media.mint(mediaData, bidShares);
      });

      describe("#fetchAuction, #fetchAuctionFromTransactionReceipt", () => {
        it("Should reject if the auction id does not exist", async () => {
          let auctionHouse = new AuctionHouse(1337, signer);
          await auctionHouse.fetchAuction(3).catch((err) => {
            expect(err.message).to.equal(
              "Invariant failed: AuctionHouse (fetchAuction): AuctionId does not exist."
            );
          });
        });

        it("Should fetch an auction from the create auction transaction receipt", async () => {
          const duration = 60 * 60 * 24;
          const reservePrice = BigNumber.from(10).pow(18).div(2);

          let auctionHouse = new AuctionHouse(1337, signer);

          await media.approve(auctionHouse.auctionHouse.address, 0);

          const tx = await auctionHouse.createAuction(
            0,
            mediaAddress,
            duration,
            reservePrice,
            "0x0000000000000000000000000000000000000000",
            0,
            token.address
          );
          let receipt = await tx.wait();
          const receiptfetch =
            await auctionHouse.fetchAuctionFromTransactionReceipt(receipt);

          expect(parseInt(receiptfetch?.token.tokenId.toString()!)).to.equal(0);
          expect(receiptfetch?.token.mediaContract).to.equal(mediaAddress);
          expect(receiptfetch?.approved).to.be.true;
          expect(parseInt(receiptfetch?.duration._hex!)).to.equal(60 * 60 * 24);
          expect(receiptfetch?.curatorFeePercentage).to.equal(0);
          expect(parseInt(receiptfetch?.reservePrice._hex!)).to.equal(
            parseInt(reservePrice._hex)
          );
          expect(receiptfetch?.tokenOwner).to.equal(await signer.getAddress());
          expect(receiptfetch?.curator).to.equal(ethers.constants.AddressZero);
          expect(receiptfetch?.auctionCurrency).to.equal(token.address);
        });
        it("Should fetch an auction from the start auction transaction receipt", async () => {
          const duration = 60 * 60 * 24;
          const reservePrice = BigNumber.from(10).pow(18).div(2);

          let curator = signers[9];
          let auctionHouse = new AuctionHouse(1337, signer);
          let curatorConnected = new AuctionHouse(1337, curator);
          await media.approve(auctionHouse.auctionHouse.address, 0);

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
            await auctionHouse.fetchAuctionFromTransactionReceipt(receipt);

          expect(parseInt(receiptfetch?.token.tokenId.toString()!)).to.equal(0);
          expect(receiptfetch?.token.mediaContract).to.equal(mediaAddress);
          expect(receiptfetch?.approved).to.be.true;
          expect(parseInt(receiptfetch?.duration._hex!)).to.equal(60 * 60 * 24);
          expect(receiptfetch?.curatorFeePercentage).to.equal(0);
          expect(parseInt(receiptfetch?.reservePrice._hex!)).to.equal(
            parseInt(reservePrice._hex)
          );
          expect(receiptfetch?.tokenOwner).to.equal(await signer.getAddress());
          expect(receiptfetch?.curator).to.equal(await curator.getAddress());
          expect(receiptfetch?.auctionCurrency).to.equal(token.address);
        });
        it("Should return null if fetching transaction without auction ID event", async () => {
          const duration = 60 * 60 * 24;
          const reservePrice = BigNumber.from(10).pow(18).div(2);

          let auctionHouse = new AuctionHouse(1337, signer);

          const tx = await media.approve(auctionHouse.auctionHouse.address, 0);

          await auctionHouse.createAuction(
            0,
            mediaAddress,
            duration,
            reservePrice,
            "0x0000000000000000000000000000000000000000",
            0,
            token.address
          );
          let receipt = await tx.wait();

          const receiptfetch =
            await auctionHouse.fetchAuctionFromTransactionReceipt(receipt); //.catch((err) => {
          expect(receiptfetch).to.be.null;
        });

        it("Should fetch an auction from the setAuctionReservePrice receipt", async () => {
          const duration = 60 * 60 * 24;

          const reservePrice = BigNumber.from(10).pow(18).div(2);

          let curator = signers[9];

          let auctionHouse = new AuctionHouse(1337, signer);

          let curatorConnected = new AuctionHouse(1337, curator);

          await media.approve(auctionHouse.auctionHouse.address, 0);

          await auctionHouse.createAuction(
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
            await auctionHouse.fetchAuctionFromTransactionReceipt(
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
