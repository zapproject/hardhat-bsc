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
  BadMedia1155,
  Media1155Factory,
  AuctionHouseV2,
  ZapMediaV2
} from "../typechain";
import { } from "../typechain";
import { BigNumber, Contract } from "ethers";

import {
  approveAuction,
  approveAuctionBatch,
  deployBidder,
  deployOtherNFTs,
  deployWETH,
  deployZapNFTMarketplace,
  deploy1155Medias,
  deployOneMedia,
  mint,
  ONE_ETH,
  TWO_ETH,
  THREE_ETH,
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
  let media5: ZapMediaV2;
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

    // ZapVault fixture
    const zapVaultFixture = await deployments.get('ZapVault');

    zapVault = (await ethers.getContractAt(
      'ZapVault',
      zapVaultFixture.address,
      signers[0]
    )) as ZapVault;

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
    await media1.connect(signers[0]).mintBatch(
      signers[0].address,
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

  async function createAuctionBatch(
    auctionHouse: AuctionHouseV2,
    curator: string,
    currency: string,
    duration?: number,
    media?: string,
    signer?: string
  ) {
    const tokenId = 1;
    if (!duration) duration = 60 * 60 * 24;
    const reservePrice = BigNumber.from(10).pow(18).div(2);

    await media1.connect(signers[0]).setApprovalForAll(auctionHouse.address, true);

    await auctionHouse.connect(signers[0]).createAuctionBatch(
      tokenId,
      1,
      signer == null ? signers[0].address : signer,
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

      media5 = contracts.medias[1];

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

    it("should revert if a non-standard market and media is used to create an auction on the Zap platform", async () => {
      const badMarketFact = await ethers.getContractFactory("ZapMarketV2", signers[5]);
      const badMarket = await upgrades.deployProxy(
        badMarketFact, [zapVault.address],
        { initializer: "initializeMarket" }) as ZapMarketV2;
      // await badMarketFact.deploy(zapVault.address);

      const { ...mediaArgs } = {
        name: "TEST MEDIA " + `${5}`,
        symbol: "TM" + `${5}`,
        marketContractAddr: badMarket.address,
        permissive: false,
        collectionURI: "https://ipfs.moralis.io:2053/ipfs/QmeWPdpXmNP4UF9Urxyrp7NQZ9unaHfE2d43fbuur6hWWV"
      }
      const badMediaFact = await ethers.getContractFactory("BadMedia", signers[5]);
      const badMedia = await upgrades.deployProxy(
        badMediaFact,
        [
          mediaArgs.name, mediaArgs.symbol,
          mediaArgs.marketContractAddr, mediaArgs.permissive,
          mediaArgs.collectionURI
        ]
      ) as BadMedia;
      // const badMedia = await badMediaFact.deploy(mediaArgs);

      await badMedia.connect(signers[5]).mint();
      await approveAuction((badMedia as unknown) as ZapMediaV2, auctionHouse);
      await expect(
        createAuction(
          auctionHouse.connect(signers[5]),
          signers[5].address,
          zapTokenBsc.address,
          undefined,
          badMedia.address)).to.be.revertedWith(
            "This market contract is not from Zap's NFT MarketPlace"
          );
    });

    // it.only("should revert if the given media contract address differs from the one that is already set", async () => {
    //   // don't mind this, this test will always fail
    //   // tokens and their medias/collections have a 1-to-1 relationship, not 1-to-many
    //   const [_, curator] = await ethers.getSigners();
    //   // await createAuction(auctionHouse, curator.address, zapTokenBsc.address, 60 * 60 * 24, media4.address);

    //   // await media4.connect(signers[2]).mint(signers[2].address, 6, 1, bidShares);

    //   await media4.connect(signers[0]).setApprovalForAll(auctionHouse.address, true);

    //   await expect(
    //     createAuction(auctionHouse.connect(signers[2]), curator.address, zapTokenBsc.address, undefined, media4.address)
    //   ).to.be.revertedWith("Token is already set for a different collection");
    // });

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

    it("should emit an AuctionCreated event", async () => {
      const owner = await media4.ownerOf(0);
      const [_, expectedCurator] = await ethers.getSigners();

      const block = await ethers.provider.getBlockNumber();
      await createAuction(auctionHouse, await expectedCurator.getAddress(), zapTokenBsc.address, 60 * 60 * 24, media4.address);
      const currAuction = await auctionHouse.auctions(0);
      const events = await auctionHouse.queryFilter(
        auctionHouse.filters.AuctionCreated(
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null
        ),
        block
      );
      expect(events.length).eq(1);
      const logDescription = auctionHouse.interface.parseLog(events[0]);
      expect(logDescription.name).to.eq("AuctionCreated");
      expect(logDescription.args.duration).to.eq(currAuction.duration);
      expect(logDescription.args.reservePrice).to.eq(currAuction.reservePrice);
      expect(logDescription.args.tokenOwner).to.eq(currAuction.tokenOwner);
      expect(logDescription.args.curator).to.eq(currAuction.curator);
      expect(logDescription.args.curatorFeePercentage).to.eq(
        currAuction.curatorFeePercentage
      );
      expect(logDescription.args.auctionCurrency).to.eq(
        zapTokenBsc.address
      );
    });
  });

  describe("#createAuctionBatch", () => {

    let auctionHouse: AuctionHouseV2;

    beforeEach(async () => {

      signers = await ethers.getSigners();

      auctionHouse = await deploy(signers[0]);

      // const contracts = await deployV2ZapNFTMarketplace(market);

      // media4 = contracts.medias[0];

      // media5 = contracts.medias[1];

      // await media4.connect(signers[0]).setApprovalForAll(auctionHouse.address, true);
    });

    it("should revert if the token contract does not support the ERC1155 interface", async () => {
      const duration = 60 * 60 * 24;
      const reservePrice = BigNumber.from(10).pow(18).div(2);
      const [_, curator] = await ethers.getSigners();

      await expect(
        auctionHouse.createAuctionBatch(
          0,
          1,
          signers[0].address,
          badERC721.address,
          duration,
          reservePrice,
          curator.address,
          5,
          ethers.constants.AddressZero
        )
      ).revertedWith(
        `tokenContract does not support ERC1155 interface`
      );
    });

    it("should revert if the caller is not approved", async () => {
      const duration = 60 * 60 * 24;
      const reservePrice = BigNumber.from(10).pow(18).div(2);
      const [_, curator, __, ___, unapproved] = await ethers.getSigners();
      await expect(
        auctionHouse
          .connect(unapproved)
          .createAuctionBatch(
            1,
            1,
            signers[0].address,
            media1.address,
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

    it("should revert if owner does not have a balance of token ID", async () => {
      const tokenId = 999;
      const duration = 60 * 60 * 24;
      const reservePrice = BigNumber.from(10).pow(18).div(2);
      const [admin, curator] = await ethers.getSigners();

      await expect(
        auctionHouse
          .connect(admin)
          .createAuctionBatch(
            tokenId,
            1,
            signers[0].address,
            media1.address,
            duration,
            reservePrice,
            curator.address,
            5,
            ethers.constants.AddressZero
          )
      ).revertedWith(
        `Owner does not have sufficient balances`
      );
    });

    it("should revert if the curator fee percentage is >= 100", async () => {
      const duration = 60 * 60 * 24;
      const reservePrice = BigNumber.from(10).pow(18).div(2);
      const [_, curator] = await ethers.getSigners();

      await expect(
        auctionHouse.createAuctionBatch(
          1,
          1,
          signers[0].address,
          media1.address,
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
        createAuctionBatch(auctionHouse, expectedCurator.address, zapTokenBsc.address, 60 * 14)
      ).to.be.revertedWith("Your auction needs to go on for at least 15 minutes");
    })

    it("should create an auction", async () => {
      const [_, expectedCurator] = await ethers.getSigners();

      await createAuctionBatch(auctionHouse, await expectedCurator.getAddress(), zapTokenBsc.address);

      let createdAuction = await auctionHouse.auctions(0);

      expect(createdAuction.duration).to.eq(24 * 60 * 60);
      expect(createdAuction.reservePrice).to.eq(
        BigNumber.from(10).pow(18).div(2)
      );
      expect(createdAuction.curatorFeePercentage).to.eq(5);
      expect(createdAuction.tokenOwner).to.eq(signers[0].address);
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
      expect(createdAuction.tokenOwner).to.eq(signers[0].address);
      expect(createdAuction.curator).to.eq(expectedCurator.address);
      // since curator address is not the token owner's address, needs approval
      expect(createdAuction.approved).to.eq(true);
    });

    it("should revert if the media contract address is the zero address", async () => {
      const duration = 60 * 60 * 24;
      const reservePrice = BigNumber.from(10).pow(18).div(2);
      await expect(
        auctionHouse.createAuctionBatch(
          1, 1, signers[0].address, ethers.constants.AddressZero, duration, reservePrice,
          signers[1].address, 5, zapTokenBsc.address
        )
      ).to.be.revertedWith("function call to a non-contract account")
    });

    it("should revert if a non-standard market and media is used to create an auction on the Zap platform", async () => {
      const badMarketFact = await ethers.getContractFactory("ZapMarketV2", signers[5]);
      const badMarket = await upgrades.deployProxy(
        badMarketFact, [zapVault.address],
        { initializer: "initializeMarket" }) as ZapMarketV2;
      // await badMarketFact.deploy(zapVault.address);

      const { ...mediaArgs } = {
        _uri: "test uri",
        marketContractAddr: badMarket.address,
        permissive: false,
        collectionURI: "https://ipfs.moralis.io:2053/ipfs/QmeWPdpXmNP4UF9Urxyrp7NQZ9unaHfE2d43fbuur6hWWV"
      }
      const badMediaFact = await ethers.getContractFactory("BadMedia1155", signers[5]);
      const badMedia = await upgrades.deployProxy(
        badMediaFact,
        [
          mediaArgs._uri,
          mediaArgs.marketContractAddr, mediaArgs.permissive,
          mediaArgs.collectionURI
        ]
      ) as BadMedia1155;
      // const badMedia = await badMediaFact.deploy(mediaArgs);

      await badMedia.connect(signers[5]).mint(signers[5].address, [1], [1]);
      await approveAuctionBatch(badMedia, auctionHouse);
      await expect(
        createAuctionBatch(
          auctionHouse.connect(signers[5]),
          signers[5].address,
          zapTokenBsc.address,
          undefined,
          badMedia.address)).to.be.revertedWith(
            "This market contract is not from Zap's NFT MarketPlace"
          );
    });

    it("should be automatically approved if the creator is the curator", async () => {
      await createAuctionBatch(auctionHouse, signers[0].address, zapTokenBsc.address);

      const createdAuction = await auctionHouse.auctions(0);

      expect(createdAuction.approved).to.eq(true);

    });

    it("should be automatically approved if the creator is the Zero Address", async () => {

      await createAuctionBatch(auctionHouse, ethers.constants.AddressZero, zapTokenBsc.address);

      const createdAuction = await auctionHouse.auctions(0);

      expect(createdAuction.approved).to.eq(true);
    });

    it("should emit an AuctionCreated event", async () => {
      const [_, expectedCurator] = await ethers.getSigners();

      const block = await ethers.provider.getBlockNumber();
      await createAuctionBatch(auctionHouse, await expectedCurator.getAddress(), zapTokenBsc.address);
      const currAuction = await auctionHouse.auctions(0);
      const events = await auctionHouse.queryFilter(
        auctionHouse.filters.AuctionCreated(
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null
        ),
        block
      );
      expect(events.length).eq(1);
      const logDescription = auctionHouse.interface.parseLog(events[0]);
      expect(logDescription.name).to.eq("AuctionCreated");
      expect(logDescription.args.duration).to.eq(currAuction.duration);
      expect(logDescription.args.reservePrice).to.eq(currAuction.reservePrice);
      expect(logDescription.args.tokenOwner).to.eq(currAuction.tokenOwner);
      expect(logDescription.args.curator).to.eq(currAuction.curator);
      expect(logDescription.args.curatorFeePercentage).to.eq(
        currAuction.curatorFeePercentage
      );
      expect(logDescription.args.auctionCurrency).to.eq(
        zapTokenBsc.address
      );
    });
  });

  describe("#setAuctionReservePrice", () => {
    let auctionHouse: AuctionHouseV2;
    let deity: SignerWithAddress;
    let admin: SignerWithAddress;
    let creator: SignerWithAddress;
    let curator: SignerWithAddress;
    let bidder: SignerWithAddress;

    beforeEach(async () => {
      [deity, admin, creator, curator, bidder] = await ethers.getSigners();
      auctionHouse = (await deploy(admin)).connect(curator) as AuctionHouseV2;

      const contracts = await deployV2ZapNFTMarketplace(market);

      media4 = contracts.medias[0];

      media5 = contracts.medias[1];

      await approveAuction(
        media4.connect(signers[0]),
        auctionHouse.connect(signers[0])
      );

      await createAuction(
        auctionHouse.connect(signers[0]),
        curator.address,
        zapTokenBsc.address,
        undefined,
        media4.address
      );

      media1.connect(signers[0]).setApprovalForAll(auctionHouse.address, true);

      await createAuctionBatch(
        auctionHouse.connect(signers[0]),
        curator.address,
        zapTokenBsc.address,
        undefined,
        media1.address
      );

      zapTokenBsc.connect(bidder).approve(auctionHouse.address, TWO_ETH);
    });

    it("[721] should revert if the auctionHouse does not exist", async () => {
      await expect(
        auctionHouse.setAuctionReservePrice(2, TWO_ETH)
      ).revertedWith(`Auction doesn't exist`);
    });

    it("[721] should revert if not called by the curator or owner", async () => {
      await expect(
        auctionHouse.connect(admin).setAuctionReservePrice(0, TWO_ETH)
      ).revertedWith(`Must be auction curator`);
    });

    it("[721] should revert if the auction has already started", async () => {
      await zapTokenBsc.mint(bidder.address, TWO_ETH);
      await zapTokenBsc.connect(bidder).approve(auctionHouse.address, TWO_ETH);
      await auctionHouse.setAuctionReservePrice(0, TWO_ETH);
      await auctionHouse.startAuction(0, true);
      await auctionHouse
        .connect(bidder)
        .createBid(0, TWO_ETH, media1.address);
      await expect(
        auctionHouse.setAuctionReservePrice(0, ONE_ETH)
      ).revertedWith(`Auction has already started`);
    });

    it("[721] should set the auction reserve price when called by the curator", async () => {
      await auctionHouse.setAuctionReservePrice(0, TWO_ETH);

      expect((await auctionHouse.auctions(0)).reservePrice).to.eq(TWO_ETH);
    });

    it("[721] should set the auction reserve price when called by the token owner", async () => {
      await auctionHouse.connect(signers[0]).setAuctionReservePrice(0, TWO_ETH);

      expect((await auctionHouse.auctions(0)).reservePrice).to.eq(TWO_ETH);
    });

    it("[721] should emit an AuctionReservePriceUpdated event", async () => {
      const block = await ethers.provider.getBlockNumber();
      await auctionHouse.setAuctionReservePrice(0, TWO_ETH);
      const events = await auctionHouse.queryFilter(
        auctionHouse.filters.AuctionReservePriceUpdated(null, null, null, null, null),
        block
      );
      expect(events.length).eq(1);
      const logDescription = auctionHouse.interface.parseLog(events[0]);

      expect(logDescription.args.reservePrice).to.eq(TWO_ETH);
    });

    it("[1155] should revert if the auctionHouse does not exist", async () => {
      await expect(
        auctionHouse.setAuctionReservePrice(2, TWO_ETH)
      ).revertedWith(`Auction doesn't exist`);
    });

    it("[1155] should revert if not called by the curator or owner", async () => {
      await expect(
        auctionHouse.connect(admin).setAuctionReservePrice(1, TWO_ETH)
      ).revertedWith(`Must be auction curator`);
    });

    it("[1155] should revert if the auction has already started", async () => {
      await zapTokenBsc.mint(bidder.address, TWO_ETH);
      await zapTokenBsc.connect(bidder).approve(auctionHouse.address, TWO_ETH);
      await auctionHouse.setAuctionReservePrice(1, TWO_ETH);
      await auctionHouse.startAuction(1, true);
      await auctionHouse
        .connect(bidder)
        .createBid(1, TWO_ETH, media1.address);
      await expect(
        auctionHouse.setAuctionReservePrice(1, ONE_ETH)
      ).revertedWith(`Auction has already started`);
    });

    it("[1155] should set the auction reserve price when called by the curator", async () => {
      await auctionHouse.setAuctionReservePrice(1, TWO_ETH);

      expect((await auctionHouse.auctions(1)).reservePrice).to.eq(TWO_ETH);
    });

    it("[1155] should set the auction reserve price when called by the token owner", async () => {
      await auctionHouse.connect(signers[0]).setAuctionReservePrice(1, TWO_ETH);

      expect((await auctionHouse.auctions(1)).reservePrice).to.eq(TWO_ETH);
    });

    it("[1155] should emit an AuctionReservePriceUpdated event", async () => {
      const block = await ethers.provider.getBlockNumber();
      await auctionHouse.setAuctionReservePrice(1, TWO_ETH);
      const events = await auctionHouse.queryFilter(
        auctionHouse.filters.AuctionReservePriceUpdated(null, null, null, null, null),
        block
      );
      expect(events.length).eq(1);
      const logDescription = auctionHouse.interface.parseLog(events[0]);

      expect(logDescription.args.reservePrice).to.eq(TWO_ETH);
    });
  });


  describe("#createBid", () => {
    let auctionHouse: AuctionHouseV2;
    let admin: SignerWithAddress;
    let curator: SignerWithAddress;
    let bidderA: SignerWithAddress;
    let bidderB: SignerWithAddress;

    beforeEach(async () => {
      [admin, curator, bidderA, bidderB] = await ethers.getSigners();

      const signers = await ethers.getSigners();

      curator = signers[4];

      auctionHouse = (await (await deploy(admin)).connect(bidderA)) as AuctionHouseV2;

      const contracts = await deployV2ZapNFTMarketplace(market);

      media4 = contracts.medias[0];

      media5 = contracts.medias[1];

      await approveAuction(
        media4.connect(signers[0]),
        auctionHouse.connect(signers[0])
      );

      await createAuction(
        auctionHouse.connect(signers[0]),
        await curator.getAddress(),
        zapTokenBsc.address,
        undefined,
        media4.address
      );

      media1.connect(signers[0]).setApprovalForAll(auctionHouse.address, true);

      await createAuctionBatch(
        auctionHouse.connect(signers[0]),
        curator.address,
        zapTokenBsc.address,
        undefined,
        media1.address
      );

      await zapTokenBsc.mint(bidderA.address, ethers.utils.parseEther("10.0"));

      await zapTokenBsc.connect(bidderA).approve(auctionHouse.address, ethers.utils.parseEther("10.0"));

      await zapTokenBsc.mint(bidderB.address, ethers.utils.parseEther("10.0"));

      await zapTokenBsc.connect(bidderB).approve(auctionHouse.address, ethers.utils.parseEther("10.0"));

    });

    it("[721] should revert if the specified auction does not exist", async () => {
      await auctionHouse.connect(curator).startAuction(0, true);
      await expect(
        auctionHouse.createBid(11111, ONE_ETH, media4.address)
      ).revertedWith(`Auction doesn't exist`);

    });

    it("[721] should revert if the specified auction is not approved", async () => {
      await auctionHouse.connect(curator).startAuction(0, false);
      await expect(
        auctionHouse.createBid(0, ONE_ETH, media4.address)
      ).revertedWith(`Auction must be approved by curator`);
    });

    it("[721] should revert if the bid is less than the reserve price", async () => {
      await auctionHouse.connect(curator).startAuction(0, true);
      await expect(
        auctionHouse.createBid(0, 0, media4.address, { value: 0 })
      ).revertedWith(`Must send at least reservePrice`);
    });

    it("[721] should revert if the bid is invalid for share splitting", async () => {
      await auctionHouse.connect(curator).startAuction(0, true);
      await expect(
        auctionHouse.createBid(0, ONE_ETH.add(1), media4.address)
      ).revertedWith(`Bid invalid for share splitting`);
    });

    it("[1155] should revert if the specified auction does not exist", async () => {
      await auctionHouse.connect(curator).startAuction(1, true);
      await expect(
        auctionHouse.createBid(11111, ONE_ETH, media1.address)
      ).revertedWith(`Auction doesn't exist`);

    });

    it("[1155] should revert if the specified auction is not approved", async () => {
      await auctionHouse.connect(curator).startAuction(1, false);
      await expect(
        auctionHouse.createBid(1, ONE_ETH, media1.address)
      ).revertedWith(`Auction must be approved by curator`);
    });

    it("[1155] should revert if the bid is less than the reserve price", async () => {
      await auctionHouse.connect(curator).startAuction(1, true);
      await expect(
        auctionHouse.createBid(1, 0, media1.address, { value: 0 })
      ).revertedWith(`Must send at least reservePrice`);
    });

    it("[1155] should revert if the bid is invalid for share splitting", async () => {
      await auctionHouse.connect(curator).startAuction(1, true);
      await expect(
        auctionHouse.createBid(1, ONE_ETH.add(1), media1.address)
      ).revertedWith(`Bid invalid for share splitting`);
    });

    describe("first bid", () => {

      it("[721] should set the first bid time", async () => {

        await ethers.provider.send("evm_setNextBlockTimestamp", [9617249934]);

        await auctionHouse.connect(curator).startAuction(0, true);
        await auctionHouse.createBid(0, ONE_ETH, media4.address);

        expect((await auctionHouse.auctions(0)).firstBidTime).to.eq(9617249934);
      });

      it("[721] should store the transferred ZAP", async () => {

        await auctionHouse.connect(curator).startAuction(0, true);
        await auctionHouse.createBid(0, ONE_ETH, media4.address);

        expect(await zapTokenBsc.balanceOf(auctionHouse.address)).to.eq(ONE_ETH);

      });

      it("[721] should not transfer any Ether since a currency (ZAP) was set", async () => {
        const ethBalanceBefore = await ethers.provider.getBalance(bidderA.address);

        await auctionHouse.connect(curator).startAuction(0, true);
        await expect(auctionHouse.connect(bidderA).createBid(
          0, ONE_ETH, media4.address, { value: ONE_ETH })
        ).to.be.revertedWith("AuctionHouse: Ether is not required for this transaction");

        expect(
          await ethers.provider.getBalance(bidderA.address),
          "ethBalanceBefore minus gas, should be gt ethBalanceBefore minus One Eth."
        ).to.be.gt(ethBalanceBefore.sub(ONE_ETH));
      });

      it("[721] should not update the auction's duration", async () => {

        const beforeDuration = (await auctionHouse.auctions(0)).duration;

        await auctionHouse.connect(curator).startAuction(0, true);
        await auctionHouse.createBid(0, ONE_ETH, media4.address);

        const afterDuration = (await auctionHouse.auctions(0)).duration;

        expect(beforeDuration).to.eq(afterDuration);

      });

      it("[721] should store the bidder's information", async () => {

        await auctionHouse.connect(curator).startAuction(0, true);
        await auctionHouse.createBid(0, ONE_ETH, media4.address);

        const currAuction = await auctionHouse.auctions(0);

        expect(currAuction.bidder).to.eq(await bidderA.getAddress());

        expect(currAuction.amount).to.eq(ONE_ETH);
      });

      it("[721] should emit an AuctionBid event", async () => {

        const block = await ethers.provider.getBlockNumber();

        await auctionHouse.connect(curator).startAuction(0, true);
        await auctionHouse.createBid(0, ONE_ETH, media4.address);

        const events = await auctionHouse.queryFilter(
          auctionHouse.filters.AuctionBid(
            null,
            null,
            null,
            null,
            null,
            null,
            null
          ),
          block
        );
        expect(events.length).eq(1);
        const logDescription = auctionHouse.interface.parseLog(events[0]);

        expect(logDescription.name).to.eq("AuctionBid");
        expect(logDescription.args.auctionId).to.eq(0);
        expect(logDescription.args.sender).to.eq(await bidderA.getAddress());
        expect(logDescription.args.value).to.eq(ONE_ETH);
        expect(logDescription.args.firstBid).to.eq(true);
        expect(logDescription.args.extended).to.eq(false);
      });

      it("[1155] should set the first bid time", async () => {

        await ethers.provider.send("evm_setNextBlockTimestamp", [9617249934]);

        await auctionHouse.connect(curator).startAuction(1, true);
        await auctionHouse.createBid(1, ONE_ETH, media1.address);

        expect((await auctionHouse.auctions(1)).firstBidTime).to.eq(9617249934);
      });

      it("[1155] should store the transferred ZAP", async () => {

        await auctionHouse.connect(curator).startAuction(1, true);
        await auctionHouse.createBid(1, ONE_ETH, media1.address);

        expect(await zapTokenBsc.balanceOf(auctionHouse.address)).to.eq(ONE_ETH);

      });

      it("[1155] should not transfer any Ether since a currency (ZAP) was set", async () => {
        const ethBalanceBefore = await ethers.provider.getBalance(bidderA.address);

        await auctionHouse.connect(curator).startAuction(1, true);
        await expect(auctionHouse.connect(bidderA).createBid(
          1, ONE_ETH, media1.address, { value: ONE_ETH })
        ).to.be.revertedWith("AuctionHouse: Ether is not required for this transaction");

        expect(
          await ethers.provider.getBalance(bidderA.address),
          "ethBalanceBefore minus gas, should be gt ethBalanceBefore minus One Eth."
        ).to.be.gt(ethBalanceBefore.sub(ONE_ETH));
      });

      it("[1155] should not update the auction's duration", async () => {

        const beforeDuration = (await auctionHouse.auctions(1)).duration;

        await auctionHouse.connect(curator).startAuction(1, true);
        await auctionHouse.createBid(1, ONE_ETH, media1.address);

        const afterDuration = (await auctionHouse.auctions(1)).duration;

        expect(beforeDuration).to.eq(afterDuration);

      });

      it("[1155] should store the bidder's information", async () => {

        await auctionHouse.connect(curator).startAuction(1, true);
        await auctionHouse.createBid(1, ONE_ETH, media1.address);

        const currAuction = await auctionHouse.auctions(1);

        expect(currAuction.bidder).to.eq(await bidderA.getAddress());

        expect(currAuction.amount).to.eq(ONE_ETH);
      });

      it("[1155] should emit an AuctionBid event", async () => {

        const block = await ethers.provider.getBlockNumber();

        await auctionHouse.connect(curator).startAuction(1, true);
        await auctionHouse.createBid(1, ONE_ETH, media1.address);

        const events = await auctionHouse.queryFilter(
          auctionHouse.filters.AuctionBid(
            null,
            null,
            null,
            null,
            null,
            null,
            null
          ),
          block
        );
        expect(events.length).eq(1);
        const logDescription = auctionHouse.interface.parseLog(events[0]);

        expect(logDescription.name).to.eq("AuctionBid");
        expect(logDescription.args.auctionId).to.eq(1);
        expect(logDescription.args.sender).to.eq(await bidderA.getAddress());
        expect(logDescription.args.value).to.eq(ONE_ETH);
        expect(logDescription.args.firstBid).to.eq(true);
        expect(logDescription.args.extended).to.eq(false);
      });
    });

    describe("second bid", () => {

      beforeEach(async () => {
        auctionHouse = auctionHouse.connect(bidderB) as AuctionHouseV2;
        await auctionHouse.connect(curator).startAuction(0, true);
        await auctionHouse
          .connect(bidderA)
          .createBid(0, ONE_ETH, media4.address);

        await auctionHouse.connect(curator).startAuction(1, true);
        await auctionHouse
          .connect(bidderA)
          .createBid(1, ONE_ETH, media1.address);
      });

      it("[721] should revert if the bid is smaller than the last bid + minBid", async () => {

        await expect(
          auctionHouse.createBid(0, ONE_ETH.add(1), media4.address)
        ).revertedWith(
          `Must send more than last bid by minBidIncrementPercentage amount`
        );
      });

      it("[721] should refund the previous bid", async () => {
        const beforeBalance = await zapTokenBsc.balanceOf(bidderA.address);

        const beforeBidAmount = (await auctionHouse.auctions(0)).amount;

        await auctionHouse.createBid(0, TWO_ETH, media4.address);

        const afterBalance = await zapTokenBsc.balanceOf(bidderA.address);

        expect(afterBalance).to.eq(beforeBalance.add(beforeBidAmount))
      });

      it("[721] should not update the firstBidTime", async () => {

        const firstBidTime = (await auctionHouse.auctions(0)).firstBidTime;

        await auctionHouse.createBid(0, TWO_ETH, media4.address);

        expect((await auctionHouse.auctions(0)).firstBidTime).to.eq(
          firstBidTime
        );

      });

      it("[721] should transfer the bid to the contract and store it as Zap", async () => {

        await auctionHouse.createBid(0, TWO_ETH, media4.address);

        expect(await zapTokenBsc.balanceOf(auctionHouse.address)).to.eq(THREE_ETH);
      });

      it("[721] should update the stored bid information", async () => {

        await auctionHouse.createBid(0, TWO_ETH, media4.address);

        const currAuction = await auctionHouse.auctions(0);

        expect(currAuction.amount).to.eq(TWO_ETH);
        expect(currAuction.bidder).to.eq(await bidderB.getAddress());
      });

      it("[721] should not extend the duration of the bid if outside of the time buffer", async () => {

        const beforeDuration = (await auctionHouse.auctions(0)).duration;

        await auctionHouse.createBid(0, TWO_ETH, media4.address);

        const afterDuration = (await auctionHouse.auctions(0)).duration;

        expect(beforeDuration).to.eq(afterDuration);
      });

      it("[721] should emit an AuctionBid event", async () => {
        const block = await ethers.provider.getBlockNumber();
        await auctionHouse.createBid(0, TWO_ETH, media4.address);
        const events = await auctionHouse.queryFilter(
          auctionHouse.filters.AuctionBid(
            null,
            null,
            null,
            null,
            null,
            null,
            null
          ),
          block
        );
        expect(events.length).eq(2);
        const logDescription = auctionHouse.interface.parseLog(events[1]);

        expect(logDescription.name).to.eq("AuctionBid");
        expect(logDescription.args.sender).to.eq(await bidderB.getAddress());
        expect(logDescription.args.value).to.eq(TWO_ETH);
        expect(logDescription.args.firstBid).to.eq(false);
        expect(logDescription.args.extended).to.eq(false);
      });

      it("[1155] should revert if the bid is smaller than the last bid + minBid", async () => {

        await expect(
          auctionHouse.createBid(1, ONE_ETH.add(1), media1.address)
        ).revertedWith(
          `Must send more than last bid by minBidIncrementPercentage amount`
        );
      });

      it("[1155] should refund the previous bid", async () => {
        const beforeBalance = await zapTokenBsc.balanceOf(bidderA.address);

        const beforeBidAmount = (await auctionHouse.auctions(1)).amount;

        await auctionHouse.createBid(1, TWO_ETH, media1.address);

        const afterBalance = await zapTokenBsc.balanceOf(bidderA.address);

        expect(afterBalance).to.eq(beforeBalance.add(beforeBidAmount))
      });

      it("[721] should not update the firstBidTime", async () => {

        const firstBidTime = (await auctionHouse.auctions(1)).firstBidTime;

        await auctionHouse.createBid(1, TWO_ETH, media1.address);

        expect((await auctionHouse.auctions(1)).firstBidTime).to.eq(
          firstBidTime
        );

      });

      it("[1155] should transfer the bid to the contract and store it as Zap", async () => {

        await auctionHouse.createBid(1, TWO_ETH, media1.address);

        expect(await zapTokenBsc.balanceOf(auctionHouse.address)).to.eq(THREE_ETH);
      });

      it("[1155] should update the stored bid information", async () => {

        await auctionHouse.createBid(1, TWO_ETH, media1.address);

        const currAuction = await auctionHouse.auctions(1);

        expect(currAuction.amount).to.eq(TWO_ETH);
        expect(currAuction.bidder).to.eq(await bidderB.getAddress());
      });

      it("[1155] should not extend the duration of the bid if outside of the time buffer", async () => {

        const beforeDuration = (await auctionHouse.auctions(1)).duration;

        await auctionHouse.createBid(1, TWO_ETH, media1.address);

        const afterDuration = (await auctionHouse.auctions(1)).duration;

        expect(beforeDuration).to.eq(afterDuration);
      });

      it("[1155] should emit an AuctionBid event", async () => {
        const block = await ethers.provider.getBlockNumber();
        await auctionHouse.createBid(1, TWO_ETH, media1.address);
        const events = await auctionHouse.queryFilter(
          auctionHouse.filters.AuctionBid(
            null,
            null,
            null,
            null,
            null,
            null,
            null
          ),
          block
        );
        expect(events.length).eq(2);
        const logDescription = auctionHouse.interface.parseLog(events[1]);

        expect(logDescription.name).to.eq("AuctionBid");
        expect(logDescription.args.sender).to.eq(await bidderB.getAddress());
        expect(logDescription.args.value).to.eq(TWO_ETH);
        expect(logDescription.args.firstBid).to.eq(false);
        expect(logDescription.args.extended).to.eq(false);
      });

      describe("last minute bid", () => {
        beforeEach(async () => {
          const currAuction = await auctionHouse.auctions(0);
          await ethers.provider.send("evm_setNextBlockTimestamp", [
            currAuction.firstBidTime
              .add(currAuction.duration)
              .sub(1)
              .toNumber(),
          ]);
        });

        it("[721] should extend the duration of the bid if inside of the time buffer", async () => {
          const beforeDuration = (await auctionHouse.auctions(0)).duration;
          await auctionHouse.createBid(0, TWO_ETH, media4.address);

          const currAuction = await auctionHouse.auctions(0);
          expect(currAuction.duration).to.eq(
            beforeDuration.add(await auctionHouse.timeBuffer()).sub(1)
          );
        });

        it("[721] should emit an AuctionBid event", async () => {
          const block = await ethers.provider.getBlockNumber();
          await auctionHouse.createBid(0, TWO_ETH, media4.address);
          const events = await auctionHouse.queryFilter(
            auctionHouse.filters.AuctionBid(
              null,
              null,
              null,
              null,
              null,
              null,
              null
            ),
            block
          );
          expect(events.length).eq(2);
          const logDescription = auctionHouse.interface.parseLog(events[1]);

          expect(logDescription.name).to.eq("AuctionBid");
          expect(logDescription.args.sender).to.eq(await bidderB.getAddress());
          expect(logDescription.args.value).to.eq(TWO_ETH);
          expect(logDescription.args.firstBid).to.eq(false);
          expect(logDescription.args.extended).to.eq(true);
        });

        it("[1155] should extend the duration of the bid if inside of the time buffer", async () => {
          const currAuction1 = await auctionHouse.auctions(1);
          await ethers.provider.send("evm_setNextBlockTimestamp", [
            currAuction1.firstBidTime
              .add(currAuction1.duration)
              .sub(1)
              .toNumber(),
          ]);

          const beforeDuration = (await auctionHouse.auctions(1)).duration;
          await auctionHouse.createBid(1, TWO_ETH, media1.address);

          const currAuction = await auctionHouse.auctions(1);
          expect(currAuction.duration).to.eq(
            beforeDuration.add(await auctionHouse.timeBuffer()).sub(1)
          );
        });

        it("[1155] should emit an AuctionBid event", async () => {
          const block = await ethers.provider.getBlockNumber();
          await auctionHouse.createBid(1, TWO_ETH, media1.address);
          const events = await auctionHouse.queryFilter(
            auctionHouse.filters.AuctionBid(
              null,
              null,
              null,
              null,
              null,
              null,
              null
            ),
            block
          );
          expect(events.length).eq(2);
          const logDescription = auctionHouse.interface.parseLog(events[1]);

          expect(logDescription.name).to.eq("AuctionBid");
          expect(logDescription.args.sender).to.eq(await bidderB.getAddress());
          expect(logDescription.args.value).to.eq(TWO_ETH);
          expect(logDescription.args.firstBid).to.eq(false);
          expect(logDescription.args.extended).to.eq(true);
        });
      });

      describe("late bid", () => {
        it("[721] should revert if the bid is placed after expiry", async () => {
          const currAuction = await auctionHouse.auctions(0);
          await ethers.provider.send("evm_setNextBlockTimestamp", [
            currAuction.firstBidTime
              .add(currAuction.duration)
              .add(1)
              .toNumber(),
          ]);

          await expect(
            auctionHouse.createBid(0, TWO_ETH, media4.address, {
              value: TWO_ETH,
            })
          ).revertedWith(`Auction expired`);
        });

        it("[1155] should revert if the bid is placed after expiry", async () => {
          const currAuction = await auctionHouse.auctions(1);
          await ethers.provider.send("evm_setNextBlockTimestamp", [
            currAuction.firstBidTime
              .add(currAuction.duration)
              .add(1)
              .toNumber(),
          ]);

          await expect(
            auctionHouse.createBid(1, TWO_ETH, media1.address)
          ).revertedWith(`Auction expired`);
        });
      });
    });
  });

  describe.only("#endAuction", () => {
    let auctionHouse: AuctionHouseV2;
    let admin: SignerWithAddress;
    let creator: SignerWithAddress;
    let curator: SignerWithAddress;
    let bidder: SignerWithAddress;
    let other: SignerWithAddress;
    let badBidder: BadBidder;
    let badBidder2: BadBidder;
    let weth: WETH;

    beforeEach(async () => {
      [admin, creator, curator, bidder, other] = await ethers.getSigners();
      auctionHouse = (await deploy(signers[0])) as AuctionHouseV2;

      const contracts = await deployV2ZapNFTMarketplace(market);

      media4 = contracts.medias[0];

      media5 = contracts.medias[1];

      await approveAuction(media4.connect(signers[0]), auctionHouse);

      await createAuction(
        auctionHouse.connect(signers[0]),
        await curator.getAddress(),
        zapTokenBsc.address,
        undefined,
        media4.address
      );
      badBidder = await deployBidder(auctionHouse.address, media4.address);


      media1.connect(signers[0]).setApprovalForAll(auctionHouse.address, true);

      await createAuctionBatch(
        auctionHouse.connect(signers[0]),
        curator.address,
        zapTokenBsc.address,
        undefined,
        media1.address
      );

      badBidder2 = await deployBidder(auctionHouse.address, media1.address);

      await zapTokenBsc.connect(bidder).approve(auctionHouse.address, BigNumber.from("10000000000000000000"));
    });

    it("[721] should revert if the auction does not exist", async () => {
      await auctionHouse.connect(curator).startAuction(0, true);
      await expect(auctionHouse.endAuction(1110, media4.address, signers[0].address)).revertedWith(
        `Auction doesn't exist`
      );
    });

    it("[721] should revert if the auction has not begun", async () => {
      await expect(auctionHouse.endAuction(0, media4.address, signers[0].address)).revertedWith(
        `Auction hasn't begun`
      );
    });

    it("[721] should revert if the auction has not completed", async () => {
      await auctionHouse.connect(curator).startAuction(0, true);
      await auctionHouse.connect(bidder).createBid(0, ONE_ETH, media4.address);

      await expect(auctionHouse.endAuction(0, media4.address, signers[0].address)).revertedWith(
        `Auction hasn't completed`
      );
    });

    it("[721] should cancel the auction if the winning bidder is unable to receive NFTs", async () => {
      await zapTokenBsc.mint(badBidder.address, TWO_ETH);
      await zapTokenBsc.connect(bidder).approve(badBidder.address, TWO_ETH);
      await auctionHouse.connect(curator).startAuction(0, true);
      await badBidder.connect(bidder).placeBid(0, TWO_ETH, media4.address, zapTokenBsc.address);
      const endTime =
        (await auctionHouse.auctions(0)).duration.toNumber() +
        (await auctionHouse.auctions(0)).firstBidTime.toNumber();
      await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 1]);

      await auctionHouse.endAuction(0, media4.address, signers[0].address);

      expect(await media4.ownerOf(0)).to.eq(signers[0].address);
      expect(await zapTokenBsc.balanceOf(badBidder.address)).to.eq(
        TWO_ETH
      );
    });

    it("[1155] should revert if the auction does not exist", async () => {
      await auctionHouse.connect(curator).startAuction(1, true);
      await expect(auctionHouse.endAuction(1110, media1.address, signers[0].address)).revertedWith(
        `Auction doesn't exist`
      );
    });

    it("[1155] should revert if the auction has not begun", async () => {
      await expect(auctionHouse.endAuction(1, media1.address, signers[0].address)).revertedWith(
        `Auction hasn't begun`
      );
    });

    it("[1155] should revert if the auction has not completed", async () => {
      await auctionHouse.connect(curator).startAuction(1, true);
      await auctionHouse.connect(bidder).createBid(1, ONE_ETH, media1.address);

      await expect(auctionHouse.endAuction(1, media1.address, signers[0].address)).revertedWith(
        `Auction hasn't completed`
      );
    });

    it("[1155] should cancel the auction if the winning bidder is unable to receive NFTs", async () => {
      await zapTokenBsc.mint(badBidder2.address, TWO_ETH);
      await zapTokenBsc.connect(bidder).approve(badBidder2.address, TWO_ETH);
      await auctionHouse.connect(curator).startAuction(1, true);
      await badBidder2.connect(bidder).placeBid(1, TWO_ETH, media1.address, zapTokenBsc.address);
      const endTime =
        (await auctionHouse.auctions(1)).duration.toNumber() +
        (await auctionHouse.auctions(1)).firstBidTime.toNumber();
      await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 1]);

      await auctionHouse.endAuction(1, media1.address, signers[0].address);

      expect(await media1.balanceOf(signers[0].address, 1)).to.eq(1);
      expect(await zapTokenBsc.balanceOf(badBidder2.address)).to.eq(
        TWO_ETH
      );
    });

    describe("[721] ETH auction", () => {
      // We may need to think this over, AH is using ZapToken for
      // these tests, not (W)ETH

      beforeEach(async () => {
        //  const [ deity ] = await ethers.getSigners();
        //   auctionHouse = await deploy(deity, ethers.constants.AddressZero);
        await auctionHouse.connect(curator).startAuction(0, true);
        await auctionHouse
          .connect(bidder)
          .createBid(0, ONE_ETH, media4.address);

        const endTime =
          (await auctionHouse.auctions(0)).duration.toNumber() +
          (await auctionHouse.auctions(0)).firstBidTime.toNumber();


        await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 1]);

      });

      it("[721] should transfer the NFT to the winning bidder", async () => {

        await auctionHouse.endAuction(0, media4.address, signers[0].address);

        const zapMarketFilter = market.filters.BidFinalized(null, null, null);

        const event = (await market.queryFilter(zapMarketFilter));

        expect(await media4.ownerOf(0)).to.eq(await bidder.getAddress());

        expect(event[0].args[2]).to.equal(media4.address)

      });

      it("[721] should pay the curator their curatorFee percentage", async () => {

        const beforeBalance = await zapTokenBsc.balanceOf(
          curator.address
        );

        await auctionHouse.endAuction(0, media4.address, signers[0].address);

        const expectedCuratorFee = "17500000000000000";

        const curatorBalance = await zapTokenBsc.balanceOf(
          curator.address
        );

        await expect(curatorBalance.sub(beforeBalance).toString()).to.eq(
          expectedCuratorFee
        );

      });

      it("[721] should pay the creator the remainder of the winning bid", async () => {
        const beforeBalance = await zapTokenBsc.balanceOf(signers[0].address);

        await auctionHouse.endAuction(0, media4.address, signers[0].address);
        const expectedProfit = "482500000000000000";
        const creatorBalance = await zapTokenBsc.balanceOf(signers[0].address);
        weth = await deployWETH();
        const wethBalance = await weth.balanceOf(await creator.getAddress());
        await expect(
          creatorBalance.sub(beforeBalance).add(wethBalance).toString()
        ).to.eq(expectedProfit);
      });

      it("[721] should emit an AuctionEnded event", async () => {
        const block = await ethers.provider.getBlockNumber();
        const auctionData = await auctionHouse.auctions(0);
        await auctionHouse.endAuction(0, media4.address, signers[0].address);
        const events = await auctionHouse.queryFilter(
          auctionHouse.filters.AuctionEnded(
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
          ),
          block
        );
        expect(events.length).eq(1);
        const logDescription = auctionHouse.interface.parseLog(events[0]);

        expect(logDescription.args.tokenId).to.eq(0);
        expect(logDescription.args.tokenOwner).to.eq(auctionData.tokenOwner);
        expect(logDescription.args.curator).to.eq(auctionData.curator);
        expect(logDescription.args.winner).to.eq(auctionData.bidder);

        expect(logDescription.args.amount.toString()).to.eq(
          "332500000000000000"
        );
        expect(logDescription.args.curatorFee.toString()).to.eq(
          "17500000000000000"
        );
        expect(logDescription.args.auctionCurrency).to.eq(zapTokenBsc.address);
      });

      it("[721] should delete the auction", async () => {

        await auctionHouse.endAuction(0, media4.address, signers[0].address);

        const auctionResult = await auctionHouse.auctions(0);

        expect(auctionResult.amount.toNumber()).to.eq(0);
        expect(auctionResult.duration.toNumber()).to.eq(0);
        expect(auctionResult.firstBidTime.toNumber()).to.eq(0);
        expect(auctionResult.reservePrice.toNumber()).to.eq(0);
        expect(auctionResult.curatorFeePercentage).to.eq(0);
        expect(auctionResult.tokenOwner).to.eq(ethers.constants.AddressZero);
        expect(auctionResult.bidder).to.eq(ethers.constants.AddressZero);
        expect(auctionResult.curator).to.eq(ethers.constants.AddressZero);
        expect(auctionResult.auctionCurrency).to.eq(
          ethers.constants.AddressZero
        );
      });
    });

    describe("[1155] ETH auction", () => {
      // We may need to think this over, AH is using ZapToken for
      // these tests, not (W)ETH

      beforeEach(async () => {
        //  const [ deity ] = await ethers.getSigners();
        //   auctionHouse = await deploy(deity, ethers.constants.AddressZero);
        await auctionHouse.connect(curator).startAuction(1, true);
        await auctionHouse
          .connect(bidder)
          .createBid(1, ONE_ETH, media1.address);

        const endTime =
          (await auctionHouse.auctions(1)).duration.toNumber() +
          (await auctionHouse.auctions(1)).firstBidTime.toNumber();


        await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 1]);

      });

      it("[1155] should transfer the NFT to the winning bidder", async () => {

        await auctionHouse.endAuction(1, media1.address, signers[0].address);

        const zapMarketFilter = market.filters.BidFinalized(null, null, null);

        const event = (await market.queryFilter(zapMarketFilter));

        expect(await media1.balanceOf(bidder.address, 1)).to.eq(1);

        expect(event[0].args[2]).to.equal(media1.address)

      });

      it("[1155] should pay the curator their curatorFee percentage", async () => {

        const beforeBalance = await zapTokenBsc.balanceOf(
          curator.address
        );

        await auctionHouse.endAuction(1, media1.address, signers[0].address);

        const expectedCuratorFee = "17500000000000000";

        const curatorBalance = await zapTokenBsc.balanceOf(
          curator.address
        );

        await expect(curatorBalance.sub(beforeBalance).toString()).to.eq(
          expectedCuratorFee
        );

      });

      it("[1155] should pay the creator the remainder of the winning bid", async () => {
        const beforeBalance = await zapTokenBsc.balanceOf(signers[0].address);

        await auctionHouse.endAuction(1, media1.address, signers[0].address);
        const expectedProfit = "482500000000000000";
        const creatorBalance = await zapTokenBsc.balanceOf(signers[0].address);
        weth = await deployWETH();
        const wethBalance = await weth.balanceOf(await creator.getAddress());
        await expect(
          creatorBalance.sub(beforeBalance).add(wethBalance).toString()
        ).to.eq(expectedProfit);
      });

      it("[1155] should emit an AuctionEnded event", async () => {
        const block = await ethers.provider.getBlockNumber();
        const auctionData = await auctionHouse.auctions(1);
        await auctionHouse.endAuction(1, media1.address, signers[0].address);
        const events = await auctionHouse.queryFilter(
          auctionHouse.filters.AuctionEnded(
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
          ),
          block
        );
        expect(events.length).eq(1);
        const logDescription = auctionHouse.interface.parseLog(events[0]);

        expect(logDescription.args.tokenId).to.eq(1);
        expect(logDescription.args.tokenOwner).to.eq(auctionData.tokenOwner);
        expect(logDescription.args.curator).to.eq(auctionData.curator);
        expect(logDescription.args.winner).to.eq(auctionData.bidder);

        expect(logDescription.args.amount.toString()).to.eq(
          "332500000000000000"
        );
        expect(logDescription.args.curatorFee.toString()).to.eq(
          "17500000000000000"
        );
        expect(logDescription.args.auctionCurrency).to.eq(zapTokenBsc.address);
      });

      it("[1155] should delete the auction", async () => {

        await auctionHouse.endAuction(1, media1.address, signers[0].address);

        const auctionResult = await auctionHouse.auctions(0);

        expect(auctionResult.amount.toNumber()).to.eq(0);
        expect(auctionResult.duration.toNumber()).to.eq(0);
        expect(auctionResult.firstBidTime.toNumber()).to.eq(0);
        expect(auctionResult.reservePrice.toNumber()).to.eq(0);
        expect(auctionResult.curatorFeePercentage).to.eq(0);
        expect(auctionResult.tokenOwner).to.eq(ethers.constants.AddressZero);
        expect(auctionResult.bidder).to.eq(ethers.constants.AddressZero);
        expect(auctionResult.curator).to.eq(ethers.constants.AddressZero);
        expect(auctionResult.auctionCurrency).to.eq(
          ethers.constants.AddressZero
        );
      });
    });
  });
});