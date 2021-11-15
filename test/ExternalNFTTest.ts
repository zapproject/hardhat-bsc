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

    tokenContractAddress = osCreature.address;
    tokenContractName = await osCreature.name();
    tokenContractSymbol = await osCreature.symbol();
    tokenByIndex = await osCreature.tokenByIndex(0);

    bidShares = {
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

    // TokenID 1 is owned by signer 10
    // Signer 10 is the only address able to configure this token
    await mediaDeployer.connect(signers[10]).configureExternalToken(
      tokenContractName,
      tokenContractSymbol,
      tokenContractAddress,
      tokenByIndex,
      bidShares
    );

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


  })


});
