import { expect } from "chai";
import { deployments, ethers, upgrades } from "hardhat";
import {
//   AuctionHouse,
  BadBidder,
  BadERC721,
  TestERC1155,
  ZapMarket,
  ZapMarketV2,
  Media1155,
  AuctionHouseV2__factory,
  ZapTokenBSC,
  ZapVault,
  WETH,
  MediaFactory,
  BadMedia,
  Media1155Factory,
  AuctionHouseV2,
  ZapMediaV2
} from "../typechain";
import { } from "../typechain";
import { BigNumber, Contract } from "ethers";

import {
  approveAuction,
  deployBidder,
  deployOtherNFTs,
  deployWETH,
  deployZapNFTMarketplace,
  deploy1155Medias,
  deployOneMedia,
  mint,
  ONE_ETH,
  TWO_ETH,
  deployV2ZapNFTMarketplace,
} from "./utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployResult } from 'hardhat-deploy/dist/types';

describe("AuctionHouseV2", () => {
  let market: ZapMarketV2;
  let zapMarket: ZapMarket;
  let media1: Media1155;
  let media2: Media1155;
  let media3: Media1155;
  let media4: ZapMediaV2;
  let mediaFactory: Media1155Factory;
  let weth: Contract;
  let zapTokenBsc: ZapTokenBSC;
  let zapVault: ZapVault;
  let badERC721: BadERC721;
  let testERC721: TestERC1155;
  let signers: SignerWithAddress[];
  let collaborators: any;
  let bidShares = {
    collaborators: ['', '', ''],
    collabShares: [
      BigNumber.from('15000000000000000000'),
      BigNumber.from('15000000000000000000'),
      BigNumber.from('15000000000000000000')
    ],
    creator: {
      value: BigNumber.from('15000000000000000000')
    },
    owner: {
      value: BigNumber.from('35000000000000000000')
    }
  };
  let tokenURI: any;

  beforeEach(async () => {
    await ethers.provider.send("hardhat_reset", []);
    // Hardhat test accounts
    signers = await ethers.getSigners();

    // Localhost deployment fixtures from the hardhat-deploy plugin
    await deployments.fixture();

    // ZapTokenBSC fixture
    const zapTokenBscFixture = await deployments.get('ZapTokenBSC');

    // Creates the ZapTokenBSC instance
    zapTokenBsc = (await ethers.getContractAt(
      'ZapTokenBSC',
      zapTokenBscFixture.address,
      signers[0]
    )) as ZapTokenBSC;

    // ZapMarket deployment fixture
    const zapMarketFixture = await deployments.get('ZapMarket');

    // Creates an instance of ZapMarket
    zapMarket = (await ethers.getContractAt(
      'ZapMarket',
      zapMarketFixture.address,
      signers[0]
    )) as ZapMarket;

    // Collaborators set on mint
    collaborators = {
      collaboratorTwo: signers[10].address,
      collaboratorThree: signers[11].address,
      collaboratorFour: signers[12].address,
      creator: signers[1].address
    };

    // BidShares set on mint
    bidShares = {
      ...bidShares,
      collaborators: [
        signers[9].address,
        signers[10].address,
        signers[12].address
      ]
    };

    tokenURI = String('media contract 1 - token 1 uri');

    // Upgrade ZapMarket to ZapMarketV2
    const marketUpgradeTx = await deployments.deploy('ZapMarket', {
      from: signers[0].address,
      contract: 'ZapMarketV2',
      proxy: {
        proxyContract: 'OpenZeppelinTransparentProxy'
      }
    });

    // Fetch the address of ZapMarketV2 from the transaction receipt
    const zapMarketV2Address: string | any =
      marketUpgradeTx.receipt?.contractAddress;

    // Create the ZapMarketV2 contract instance
    market = (await ethers.getContractAt(
      'ZapMarketV2',
      zapMarketV2Address,
      signers[0]
    )) as ZapMarketV2;

    // Deploy the Media1155 implementation through hardhat-deploy
    const deployMedia1155ImpTx: DeployResult = await deployments.deploy(
      'Media1155',
      {
        from: signers[0].address,
        args: []
      }
    );

    // Fetch the address of Media1155 implementation from the transaction receipt
    const media1155ImpAddress: string | any =
      deployMedia1155ImpTx.receipt?.contractAddress;

    // Deploy the Media1155Factory through hardhat-deploy
    const deployMedia1155Factory: DeployResult = await deployments.deploy(
      'Media1155Factory',
      {
        from: signers[0].address,
        proxy: {
          proxyContract: 'OpenZeppelinTransparentProxy',
          execute: {
            methodName: 'initialize',
            args: [market.address, media1155ImpAddress]
          }
        }
      }
    );

    // Fetch the Media1155Factory address from the transaction receipt
    const media1155FactoryAddress: string | any =
      deployMedia1155Factory.receipt?.contractAddress;

    // Creates the Media1155 contract instance
    mediaFactory = (await ethers.getContractAt(
      'Media1155Factory',
      media1155FactoryAddress,
      signers[0]
    )) as Media1155Factory;

    // Deploys the
    const medias1155: Media1155[] = await deploy1155Medias(
      signers,
      market,
      mediaFactory
    );

    // Owned by signers[1]
    media1 = medias1155[0];

    // Owned by signers[2]
    media2 = medias1155[1];

    // Owned by signers[3]
    media3 = medias1155[2];

    // signers[1] claims ownership
    await media1.claimTransferOwnership();

    // signers[2] claims ownership
    await media2.claimTransferOwnership();

    // signers[3] claims ownership
    await media3.claimTransferOwnership();

    // signer[1] is the owner of media1 and is minting a batch on their collection
    await media1.mintBatch(
      signers[1].address,
      [1, 2, 3],
      [1, 2, 3],
      [bidShares, bidShares, bidShares]
    );
    // const nfts = await deployOtherNFTs();

    weth = await deployWETH();
    badERC721 = (await (
        await ethers.getContractFactory('BadERC721')
      ).deploy()) as BadERC721;
    testERC721 = (await (
        await ethers.getContractFactory('TestERC1155')
      ).deploy()) as TestERC1155;

    let [_, two, three, bidder] = await ethers.getSigners();

    await zapTokenBsc.mint(bidder.address, BigNumber.from("10000000000000000000"));
  });

  async function deploy(signer: SignerWithAddress): Promise<AuctionHouseV2> {
    let auctionHouse: AuctionHouseV2;
    
    const auctionHouseUpgradeTx = await deployments.deploy("AuctionHouse", {
        from: signers[0].address,
        contract: "AuctionHouseV2",
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy"
        }
    });

    const auctionHouseV2Address: string | any =
      auctionHouseUpgradeTx.receipt?.contractAddress;
    
    auctionHouse = (await ethers.getContractAt(
        'AuctionHouseV2',
        auctionHouseV2Address,
        signers[0]
    )) as AuctionHouseV2;

    return auctionHouse;
  }

  async function createAuction(
    auctionHouse: AuctionHouseV2,
    curator: string,
    currency: string,
    duration?: number,
    media?: string
  ) {
    const tokenId = 0;
    if (!duration) duration = 60 * 60 * 24;
    const reservePrice = BigNumber.from(10).pow(18).div(2);

    await auctionHouse.connect(signers[0]).createAuction(
      tokenId,
      media == null ? media1.address : media,
      duration,
      reservePrice,
      curator,
      5,
      currency
    );

  }

  describe("#constructor", () => {

    it("should be able to deploy", async () => {

      BigNumber.from(10).pow(18).div(2)

      const AuctionHouse = await ethers.getContractFactory("AuctionHouseV2");

      const auctionHouse = await upgrades.deployProxy(
        AuctionHouse,
        [zapTokenBsc.address, market.address],
        { initializer: 'initialize' }
      );

      // ASSERTION NOT NEEDED AT THE MOMENT DUE TO THE CONSTRUCTOR ONLY ACCEPTING A TOKEN ADDRESS
      // expect(await auctionHouse.zap()).to.eq(
      //   media1.address,
      //   "incorrect zap address"
      // );

      expect(parseInt(await auctionHouse.timeBuffer(), 0)).to.eq(
        900,
        "time buffer should equal 900"
      );

      expect(await auctionHouse.minBidIncrementPercentage()).to.eq(
        5,
        "minBidIncrementPercentage should equal 5%"
      );

    });

    // ASSERTION NOT NEEDED AT THE MOMENT DUE TO THE CONSTRUCTOR ONLY ACCEPTING A TOKEN ADDRESS
    // it("should not allow a configuration address that is not the Zap Media Protocol", async () => {

    //   const AuctionHouse = await ethers.getContractFactory("AuctionHouse");

    //   await expect(
    //     AuctionHouse.deploy(zapTokenBsc.address)
    //   ).to.be.revertedWith("Transaction reverted without a reason");

    // });

  });


  describe("Fallback Function", () => {
    let auctionHouse: AuctionHouseV2;

    beforeEach(async () => {

      signers = await ethers.getSigners();
      
      auctionHouse = await deploy(signers[0]);

      await media1.connect(signers[1]).setApprovalForAll(auctionHouse.address, true);
    });

    it("should fail as non WETH signer", async () => {
      expect(signers[0].sendTransaction({ to: auctionHouse.address, value: 1 })).to.revertedWith("AuctionHouse: Fallback function receive() - sender is not WETH");
      let prevBal = await weth.balanceOf(auctionHouse.address);

      // deposit weth balance
      signers[1].sendTransaction({ to: weth.address, value: 10 });

      // transfer weth to auction house, this ends with hitting the fallback function receive() in AuctionHouse contract
      await weth.connect(signers[1]).transferFrom2(signers[1].address, auctionHouse.address, 1);
      let newBal = await weth.balanceOf(auctionHouse.address);
      expect(prevBal).to.eq(newBal - 1);
    });
  });

  describe("#createAuction", () => {

    let auctionHouse: AuctionHouseV2;

    beforeEach(async () => {

      signers = await ethers.getSigners();

      auctionHouse = await deploy(signers[0]);

      const contracts = await deployV2ZapNFTMarketplace(market);

      media4 = contracts.medias[0];

      await media4.connect(signers[0]).setApprovalForAll(auctionHouse.address, true);
    });

    it("should revert if the token contract does not support the ERC721 interface", async () => {
      const duration = 60 * 60 * 24;
      const reservePrice = BigNumber.from(10).pow(18).div(2);
      const [_, curator] = await ethers.getSigners();

      await expect(
        auctionHouse.createAuction(
          0,
          badERC721.address,
          duration,
          reservePrice,
          curator.address,
          5,
          ethers.constants.AddressZero
        )
      ).revertedWith(
        `tokenContract does not support ERC721 interface`
      );
    });

    it("should revert if the caller is not approved", async () => {
      const duration = 60 * 60 * 24;
      const reservePrice = BigNumber.from(10).pow(18).div(2);
      const [_, curator, __, ___, unapproved] = await ethers.getSigners();
      await expect(
        auctionHouse
          .connect(unapproved)
          .createAuction(
            0,
            media4.address,
            duration,
            reservePrice,
            curator.address,
            5,
            ethers.constants.AddressZero
          )
      ).revertedWith(
        `Caller must be approved or owner for token id`
      );
    });

    it("should revert if the token ID does not exist", async () => {
      const tokenId = 999;
      const duration = 60 * 60 * 24;
      const reservePrice = BigNumber.from(10).pow(18).div(2);
      const owner = await media4.ownerOf(0);
      const [admin, curator] = await ethers.getSigners();

      await expect(
        auctionHouse
          .connect(admin)
          .createAuction(
            tokenId,
            media4.address,
            duration,
            reservePrice,
            curator.address,
            5,
            ethers.constants.AddressZero
          )
      ).revertedWith(
        `ERC721: owner query for nonexistent token`
      );
    });

    it("should revert if the curator fee percentage is >= 100", async () => {
      const duration = 60 * 60 * 24;
      const reservePrice = BigNumber.from(10).pow(18).div(2);
      const owner = await media4.ownerOf(0);
      const [_, curator] = await ethers.getSigners();

      await expect(
        auctionHouse.createAuction(
          0,
          media4.address,
          duration,
          reservePrice,
          curator.address,
          100,
          ethers.constants.AddressZero
        )
      ).revertedWith(
        `curatorFeePercentage must be less than 100`
      );
    });

    it("should revert if the duration is not 24 hrs", async () => {
      const [_, expectedCurator] = await ethers.getSigners();
      await expect(
        createAuction(auctionHouse, expectedCurator.address, zapTokenBsc.address, 60 * 14)
      ).to.be.revertedWith("Your auction needs to go on for at least 15 minutes");
    })

    it("should create an auction", async () => {
      const owner = await media4.ownerOf(0);

      const [_, expectedCurator] = await ethers.getSigners();

      await createAuction(auctionHouse, await expectedCurator.getAddress(), zapTokenBsc.address, 60 * 60 * 24, media4.address);

      let createdAuction = await auctionHouse.auctions(0);

      expect(createdAuction.duration).to.eq(24 * 60 * 60);
      expect(createdAuction.reservePrice).to.eq(
        BigNumber.from(10).pow(18).div(2)
      );
      expect(createdAuction.curatorFeePercentage).to.eq(5);
      expect(createdAuction.tokenOwner).to.eq(owner);
      expect(createdAuction.curator).to.eq(expectedCurator.address);
      // since curator address is not the token owner's address, needs approval
      expect(createdAuction.approved).to.eq(false);

      await auctionHouse.connect(expectedCurator).startAuction(0, true);

      createdAuction = await auctionHouse.auctions(0);
      expect(createdAuction.duration).to.eq(24 * 60 * 60);
      expect(createdAuction.reservePrice).to.eq(
        BigNumber.from(10).pow(18).div(2)
      );
      expect(createdAuction.curatorFeePercentage).to.eq(5);
      expect(createdAuction.tokenOwner).to.eq(owner);
      expect(createdAuction.curator).to.eq(expectedCurator.address);
      // since curator address is not the token owner's address, needs approval
      expect(createdAuction.approved).to.eq(true);
    });

    it("should revert if the media contract address is the zero address", async () => {
      const duration = 60 * 60 * 24;
      const reservePrice = BigNumber.from(10).pow(18).div(2);
      await expect(
        auctionHouse.createAuction(
          0, ethers.constants.AddressZero, duration, reservePrice,
          signers[1].address, 5, zapTokenBsc.address
        )
      ).to.be.revertedWith("function call to a non-contract account")
    });

    // it("should revert if a non-standard market and media is used to create an auction on the Zap platform", async () => {
    //   const badMarketFact = await ethers.getContractFactory("ZapMarketV2", signers[5]);
    //   const badMarket = await upgrades.deployProxy(
    //     badMarketFact, [zapVault.address],
    //     { initializer: "initializeMarket" }) as ZapMarketV2;
    //   // await badMarketFact.deploy(zapVault.address);

    //   const { ...mediaArgs } = {
    //     name: "TEST MEDIA " + `${5}`,
    //     symbol: "TM" + `${5}`,
    //     marketContractAddr: badMarket.address,
    //     permissive: false,
    //     collectionURI: "https://ipfs.moralis.io:2053/ipfs/QmeWPdpXmNP4UF9Urxyrp7NQZ9unaHfE2d43fbuur6hWWV"
    //   }
    //   const badMediaFact = await ethers.getContractFactory("BadMedia", signers[5]);
    //   const badMedia = await upgrades.deployProxy(
    //     badMediaFact,
    //     [
    //       mediaArgs.name, mediaArgs.symbol,
    //       mediaArgs.marketContractAddr, mediaArgs.permissive,
    //       mediaArgs.collectionURI
    //     ]
    //   ) as BadMedia;
    //   // const badMedia = await badMediaFact.deploy(mediaArgs);

    //   await badMedia.connect(signers[5]).mint();
    //   await approveAuction((badMedia as unknown) as Media1155, auctionHouse);
    //   await expect(
    //     createAuction(
    //       auctionHouse.connect(signers[5]),
    //       signers[5].address,
    //       zapTokenBsc.address,
    //       undefined,
    //       badMedia.address)).to.be.revertedWith(
    //         "This market contract is not from Zap's NFT MarketPlace"
    //       );
    // });

    it.skip("should revert if the given media contract address differs from the one that is already set", async () => {
      // don't mind this, this test will always fail
      // tokens and their medias/collections have a 1-to-1 relationship, not 1-to-many
      const [_, curator] = await ethers.getSigners();
      await createAuction(auctionHouse, curator.address, zapTokenBsc.address);

      await media2.connect(signers[2]).mint(signers[2].address, 6, 1, bidShares);

      await media1.connect(signers[1]).setApprovalForAll(auctionHouse.address, true);

      await expect(
        createAuction(auctionHouse.connect(signers[2]), curator.address, zapTokenBsc.address, undefined, media2.address)
      ).to.be.revertedWith("Token is already set for a different collection");
    });

    it("should be automatically approved if the creator is the curator", async () => {
      const owner = await media4.ownerOf(0);
      await createAuction(auctionHouse, owner, zapTokenBsc.address, 60 * 60 * 24, media4.address);

      const createdAuction = await auctionHouse.auctions(0);

      expect(createdAuction.approved).to.eq(true);

    });

    it("should be automatically approved if the creator is the Zero Address", async () => {

      await createAuction(auctionHouse, ethers.constants.AddressZero, zapTokenBsc.address, 60 * 60 * 24, media4.address);

      const createdAuction = await auctionHouse.auctions(0);

      expect(createdAuction.approved).to.eq(true);
    });

    // it("should emit an AuctionCreated event", async () => {
    //   const owner = await media1.ownerOf(0);
    //   const [_, expectedCurator] = await ethers.getSigners();

    //   const block = await ethers.provider.getBlockNumber();
    //   await createAuction(auctionHouse, await expectedCurator.getAddress(), zapTokenBsc.address);
    //   const currAuction = await auctionHouse.auctions(0);
    //   const events = await auctionHouse.queryFilter(
    //     auctionHouse.filters.AuctionCreated(
    //       null,
    //       null,
    //       null,
    //       null,
    //       null,
    //       null,
    //       null,
    //       null,
    //       null
    //     ),
    //     block
    //   );
    //   expect(events.length).eq(1);
    //   const logDescription = auctionHouse.interface.parseLog(events[0]);
    //   expect(logDescription.name).to.eq("AuctionCreated");
    //   expect(logDescription.args.duration).to.eq(currAuction.duration);
    //   expect(logDescription.args.reservePrice).to.eq(currAuction.reservePrice);
    //   expect(logDescription.args.tokenOwner).to.eq(currAuction.tokenOwner);
    //   expect(logDescription.args.curator).to.eq(currAuction.curator);
    //   expect(logDescription.args.curatorFeePercentage).to.eq(
    //     currAuction.curatorFeePercentage
    //   );
    //   expect(logDescription.args.auctionCurrency).to.eq(
    //     zapTokenBsc.address
    //   );
    // });
  });
});