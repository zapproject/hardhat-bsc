import { ethers, upgrades } from 'hardhat';

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';

import { ZapTokenBSC } from '../typechain/ZapTokenBSC';

import {
  keccak256,
  parseBytes32String,
  formatBytes32String
} from 'ethers/lib/utils';

import { BigNumber, Bytes, EventFilter, Event } from 'ethers';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { ZapMedia } from '../typechain/ZapMedia';

import { ZapMarket } from '../typechain/ZapMarket';

import { MediaFactory } from '../typechain/MediaFactory';

import { ZapVault } from '../typechain/ZapVault';

import { ZapMarket__factory } from '../typechain';

import { deployJustMedias } from './utils';

import { BadBidder2 } from '../typechain/BadBidder2';

import { Creature } from '../typechain/Creature';

import { MockProxyRegistry } from '../typechain/MockProxyRegistry';

chai.use(solidity);

type MediaData = {
  tokenURI: string;
  metadataURI: string;
  contentHash: Bytes;
  metadataHash: Bytes;
};

let tokenURI = 'www.example.com';
let metadataURI = 'www.example2.com';

let contentHashBytes: Bytes;
let metadataHashBytes: Bytes;
let vault: ZapVault;
let mint_tx1: any;
let mint_tx2: any;

let platformFee = {
  fee: {
    value: BigNumber.from('5000000000000000000')
  }
};

describe('ExternalNFT Test', () => {
  let zapTokenBsc: any;
  let owner: SignerWithAddress;
  let proxyForOwner: SignerWithAddress;
  let proxy: MockProxyRegistry;
  let osCreature: Creature;

  let zapMarket: ZapMarket;
  let zapVault: ZapVault;
  let mediaDeployer: MediaFactory;
  let signers: SignerWithAddress[];
  let bidShares: any;
  let tokenContractAddress: string;
  let tokenContractName: string;
  let tokenContractSymbol: string;
  let tokenByIndex: BigNumber;

  let collaborators = {
    collaboratorTwo: '',
    collaboratorThree: '',
    collaboratorFour: ''
  };

  let invalidBidShares = {
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
      value: BigNumber.from('40000000000000000000')
    }
  };

  let ask1 = {
    amount: 100,
    currency: '',
    sellOnShare: 0
  };

  let ask2 = {
    amount: 200,
    currency: '',
    sellOnShare: 0
  };

  beforeEach(async () => {
    signers = await ethers.getSigners();
    owner = signers[0];
    proxyForOwner = signers[8];

    const zapTokenFactory = await ethers.getContractFactory(
      'ZapTokenBSC',
      signers[0]
    );

    zapTokenBsc = await zapTokenFactory.deploy();
    await zapTokenBsc.deployed();

    const zapVaultFactory = await ethers.getContractFactory('ZapVault');

    zapVault = (await upgrades.deployProxy(
      zapVaultFactory,
      [zapTokenBsc.address],
      {
        initializer: 'initializeVault'
      }
    )) as ZapVault;

    let zapMarketFactory: ZapMarket__factory = (await ethers.getContractFactory(
      'ZapMarket'
    )) as ZapMarket__factory;

    zapMarket = (await upgrades.deployProxy(
      zapMarketFactory,
      [zapVault.address],
      {
        initializer: 'initializeMarket'
      }
    )) as ZapMarket;

    await zapMarket.setFee(platformFee);

    const mediaDeployerFactory = await ethers.getContractFactory(
      'MediaFactory',
      signers[0]
    );

    mediaDeployer = (await upgrades.deployProxy(
      mediaDeployerFactory,
      [zapMarket.address],
      {
        initializer: 'initialize'
      }
    )) as MediaFactory;

    await mediaDeployer.deployed();

    await zapMarket.setMediaFactory(mediaDeployer.address);

    // external Contract

    const proxyFactory = await ethers.getContractFactory(
      'MockProxyRegistry',
      signers[0]
    );

    proxy = (await proxyFactory.deploy()) as MockProxyRegistry;
    await proxy.deployed();
    await proxy.setProxy(owner.address, proxyForOwner.address);

    const oscreatureFactory = await ethers.getContractFactory(
      'Creature',
      signers[0]
    );

    osCreature = (await oscreatureFactory.deploy(proxy.address)) as Creature;
    await osCreature.deployed();

    // mint a creature which is the external NFT
    await osCreature.mintTo(signers[10].address);
    expect(await osCreature.balanceOf(signers[10].address)).to.equal(1);
<<<<<<< HEAD
  });

  it('Should configure external token contract as a media in ZapMarket', async () => {
    const tokenContractAddress: string = osCreature.address;
    const tokenContractName: string = await osCreature.name();
    const tokenContractSymbol: string = await osCreature.symbol();
    const tokenByIndex = await osCreature.tokenByIndex(0);

    const bidShares = {
=======

    tokenContractAddress = osCreature.address;
    tokenContractName = await osCreature.name();
    tokenContractSymbol = await osCreature.symbol();
    tokenByIndex = await osCreature.tokenByIndex(0);

    bidShares = {
>>>>>>> dd3afe750c423053f89dd7c5cd84530f2e9a9000
      collaborators: [
        signers[10].address,
        signers[11].address,
        signers[12].address
      ],
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

<<<<<<< HEAD
    // configure external tokens.
    // in this case that means we are registering the contract that minted the token being brough into the market.
    // configureExternalToken also includes setting bidShares
    await mediaDeployer
      .connect(signers[10])
      .configureExternalToken(
        tokenContractName,
        tokenContractSymbol,
        tokenContractAddress,
        tokenByIndex,
        bidShares
      );
    const bidSharesForTokens = await zapMarket.bidSharesForToken(
=======
    // TokenID 1 is owned by signer 10
    // Signer 10 is the only address able to configure this token
    await mediaDeployer.connect(signers[10]).configureExternalToken(
      tokenContractName,
      tokenContractSymbol,
>>>>>>> dd3afe750c423053f89dd7c5cd84530f2e9a9000
      tokenContractAddress,
      tokenByIndex
    );

<<<<<<< HEAD
    expect(await zapMarket.isConfigured(tokenContractAddress)).to.be.true;
    expect(await zapMarket.isInternal(tokenContractAddress)).to.be.false;
    expect(bidSharesForTokens.creator.value).to.be.equal(
      bidShares.creator.value
    );
    expect(bidSharesForTokens.owner.value).to.be.equal(bidShares.owner.value);
    expect(bidSharesForTokens.collabShares).to.be.eql(bidShares.collabShares);
    expect(bidSharesForTokens.collaborators).to.eql(
      bidSharesForTokens.collaborators
    );
  });

  it('Should setAsk for external token', async () => {
    const tokenContractAddress: string = osCreature.address;
    const tokenContractName: string = await osCreature.name();
    const tokenContractSymbol: string = await osCreature.symbol();
    const tokenByIndex = await osCreature.tokenByIndex(0);

    ask1.currency = zapTokenBsc.address;


    const bidShares = {
      collaborators: [
        signers[10].address,
        signers[11].address,
        signers[12].address
      ],
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

    // configure external tokens.
    // in this case that means we are registering the contract that minted the token being brough into the market.
    // configureExternalToken also includes setting bidShares
    await mediaDeployer
      .connect(signers[10])
      .configureExternalToken(
        tokenContractName,
        tokenContractSymbol,
        tokenContractAddress,
        tokenByIndex,
        bidShares
      );

    console.log('zapMarket: ', zapMarket.address);
    // console.log("zapMedia2: ", zapMedia2.address);

    console.log(signers[10].address)
    await zapMarket.connect(signers[10]).setAsk(tokenContractAddress, 1, ask1);
=======
  });

  describe("Configure", () => {

    it('Should configure external token contract as a media in ZapMarket', async () => {

      // BidShares for tokenID 1
      const bidSharesForTokens = await zapMarket.bidSharesForToken(tokenContractAddress, tokenByIndex);

      expect(await zapMarket.isConfigured(tokenContractAddress)).to.be.true;
      expect(await zapMarket.isInternal(tokenContractAddress)).to.be.false;
      expect(bidSharesForTokens.creator.value).to.be.equal(bidShares.creator.value);
      expect(bidSharesForTokens.owner.value).to.be.equal(bidShares.owner.value);
      expect(bidSharesForTokens.collabShares).to.be.eql(bidShares.collabShares);
      expect(bidSharesForTokens.collaborators).to.eql(bidSharesForTokens.collaborators);

    });

    it("Should emit a MediaContractCreated event", async () => {

      const filter: EventFilter = zapMarket.filters.MediaContractCreated(
        null,
        null,
        null
      );

      const event: Event = (
        await zapMarket.queryFilter(filter)
      )[0]

      expect(event.event).to.be.equal("MediaContractCreated");
      expect(event.args?.mediaContract).to.equal(tokenContractAddress);
      expect(ethers.utils.parseBytes32String(event.args?.name)).to.be.equal(tokenContractName);
      expect(ethers.utils.parseBytes32String(event.args?.symbol)).to.be.equal(tokenContractSymbol);

    });

    it("Should emit a BidSharesUpdated event", async () => {

      const filter: EventFilter = zapMarket.filters.BidShareUpdated(
        null,
        null,
        null
      );

      const event: Event = (
        await zapMarket.queryFilter(filter)
      )[0]

      expect(event.event).to.be.equal("BidShareUpdated");
    });


  });

  describe('#setBid', () => {
    let bid1: any;
    let bid2: any;
    let zapMedia1: any;
    let zapMedia2: any;
    let zapMedia3: any;
    let unAuthMedia: any;
    let bidShares1: any;
    let bidshares2: any;


    beforeEach(async () => {

      const zapTokenFactory = await ethers.getContractFactory(
        'ZapTokenBSC',
        signers[0]
      );

      zapTokenBsc = await zapTokenFactory.deploy();
      await zapTokenBsc.deployed();

      const zapVaultFactory = await ethers.getContractFactory('ZapVault');

      zapVault = (await upgrades.deployProxy(zapVaultFactory, [zapTokenBsc.address], {
        initializer: 'initializeVault'
      })) as ZapVault;

      const zapMarketFactory = await ethers.getContractFactory('ZapMarket', signers[0]);

      zapMarket = (await upgrades.deployProxy(zapMarketFactory, [zapVault.address], {
        initializer: 'initializeMarket'
      })) as ZapMarket;

      await zapMarket.setFee(platformFee);

      const mediaDeployerFactory = await ethers.getContractFactory("MediaFactory");

      mediaDeployer = (await upgrades.deployProxy(mediaDeployerFactory, [zapMarket.address], {
        initializer: 'initialize'
      })) as MediaFactory;

      zapMarket.setMediaFactory(mediaDeployer.address);

      const medias = await deployJustMedias(signers, zapMarket, mediaDeployer);

      zapMedia1 = medias[0];
      zapMedia2 = medias[1];
      zapMedia3 = medias[2];

      await zapMedia1.claimTransferOwnership();
      await zapMedia2.claimTransferOwnership();
      await zapMedia3.claimTransferOwnership();

      const mediaParams = {
        name: "Unauthorised Media Contract",
        symbol: "UMC",
        marketContractAddr: zapMarket.address,
        permissive: false,
        _collectionMetadata: "https://ipfs.moralis.io:2053/ipfs/QmXtZVM1JwnCXax1y5r6i4ARxADUMLm9JSq5Rnn3vq9qsN"
      }
      const unAuthMediaFact = await ethers.getContractFactory("ZapMedia", signers[9]);
      unAuthMedia = await upgrades.deployProxy(
        unAuthMediaFact,
        [
          mediaParams.name,
          mediaParams.symbol,
          mediaParams.marketContractAddr,
          mediaParams.permissive,
          mediaParams._collectionMetadata
        ]
      ) as ZapMedia;
      await unAuthMedia.deployed();

      bid1 = {
        amount: 200,
        currency: zapTokenBsc.address,
        bidder: signers[1].address,
        recipient: signers[8].address,
        spender: signers[1].address,
        sellOnShare: {
          value: BigInt(10000000000000000000)
        }
      };

      bid2 = {
        amount: 200,
        currency: zapTokenBsc.address,
        bidder: signers[2].address,
        recipient: signers[9].address,
        spender: signers[2].address,
        sellOnShare: {
          value: BigInt(10000000000000000000)
        }
      };

      let metadataHex = ethers.utils.formatBytes32String('{}');
      let metadataHashRaw = keccak256(metadataHex);
      metadataHashBytes = ethers.utils.arrayify(metadataHashRaw);

      let contentHex = ethers.utils.formatBytes32String('invert');
      let contentHashRaw = keccak256(contentHex);
      contentHashBytes = ethers.utils.arrayify(contentHashRaw);

      let contentHash = contentHashBytes;
      let metadataHash = metadataHashBytes;

      const data: MediaData = {
        tokenURI,
        metadataURI,
        contentHash,
        metadataHash
      };

      // bidShares1.collaborators = [signers[10].address, signers[11].address, signers[12].address];
      // bidShares2.collaborators = [signers[10].address, signers[11].address, signers[12].address];

      // await zapMedia1.connect(signers[1]).mint(data, bidShares1);
      // await zapMedia2.connect(signers[2]).mint(data, bidShares2);

    });
>>>>>>> dd3afe750c423053f89dd7c5cd84530f2e9a9000
  });

});
