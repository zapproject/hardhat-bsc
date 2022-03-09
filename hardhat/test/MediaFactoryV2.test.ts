import { ethers, deployments, upgrades } from 'hardhat';

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';

// Relevant OpenZeppelin imports
import {
  hashBytecodeWithoutMetadata,
  Manifest
} from '@openzeppelin/upgrades-core';

import {
  Media1155Factory,
  Media1155,
  ZapMarket,
  ZapMarketV2,
  MediaFactoryV2,
  MediaFactory,
  ZapMedia,
  Upgradable
} from '../typechain';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DeployResult } from 'hardhat-deploy/dist/types';
import { deploy } from '@openzeppelin/hardhat-upgrades/dist/utils';

chai.use(solidity);

describe('MediaFactoryV2', () => {
  let signers: SignerWithAddress[];
  let zapMarket: ZapMarket;
  let zapMarketV2: ZapMarketV2;
  let mediaFactory: MediaFactory;
  let mediaFactoryV2: MediaFactoryV2;
  let zapMedia: ZapMedia;
  let deployMediaV1: any;

  beforeEach(async () => {
    signers = await ethers.getSigners();
    await deployments.fixture();

    const zapMarketFixture = await deployments.get('ZapMarket');

    const mediaFactoryFixture = await deployments.get('MediaFactory');

    // ZapMarketV2 contract factory
    const marketV2Factory = await ethers.getContractFactory(
      'ZapMarketV2',
      signers[0]
    );

    // Creates an instance of ZapMarketV1
    zapMarket = (await ethers.getContractAt(
      'ZapMarket',
      zapMarketFixture.address,
      signers[0]
    )) as ZapMarket;

    // Returns the address of ZapMediaV1
    const zapMediaAddress = await zapMarket.mediaContracts(
      signers[0].address,
      0
    );

    // Creates an instance of MediaFactoryV1
    mediaFactory = (await ethers.getContractAt(
      'MediaFactory',
      mediaFactoryFixture.address,
      signers[0]
    )) as MediaFactory;

    // Creates an instane of ZapMediaV1
    zapMedia = (await ethers.getContractAt(
      'ZapMedia',
      zapMediaAddress,
      signers[0]
    )) as ZapMedia;

    // Upgrade ZapMarket to ZapMarketV2
    zapMarketV2 = (await upgrades.upgradeProxy(
      zapMarket.address,
      marketV2Factory
    )) as ZapMarketV2;
  });

  describe('#upgrade', () => {
    let mediaFactoryV2Factory: any;

    beforeEach(async () => {
      // MediaFactoryV2 contract factory
      mediaFactoryV2Factory = await ethers.getContractFactory(
        'MediaFactoryV2',
        signers[0]
      );
    });

    it.only('Should upgrade MediaFactory to MediaFactoryV2', async () => {
      // Upgraded MediaFactory to MediaFactoryV2
      const mediaFactoryV2 = await upgrades.upgradeProxy(
        mediaFactory.address,
        mediaFactoryV2Factory
      );

      // MediaFactoryV2 address should equal MediaFactoryV1 address after upgrading
      expect(mediaFactoryV2.address).to.equal(mediaFactory.address);
    });
  });
});
