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

  beforeEach(async () => {
    signers = await ethers.getSigners();
    await deployments.fixture();

    const zapMarketFixture = await deployments.get('ZapMarket');

    const mediaFactoryFixture = await deployments.get('MediaFactory');

    // Creates an instance of ZapMarket
    zapMarket = (await ethers.getContractAt(
      'ZapMarket',
      zapMarketFixture.address,
      signers[0]
    )) as ZapMarket;

    mediaFactory = (await ethers.getContractAt(
      'MediaFactory',
      mediaFactoryFixture.address,
      signers[0]
    )) as MediaFactory;

    const marketV1Factory = await ethers.getContractFactory(
      'ZapMarket',
      signers[0]
    );

    const marketV2Factory = await ethers.getContractFactory(
      'ZapMarketV2',
      signers[0]
    );

    zapMarketV2 = (await upgrades.upgradeProxy(
      zapMarket.address,
      marketV1Factory
    )) as ZapMarketV2;
  });

  describe('#deployMedia', () => {
    let deployMedia: any;
    let mediaAddress: string;

    beforeEach(async () => {
      //   Deploys an instance of ZapMedia through the MediaFactory
      deployMedia = await mediaFactory.deployMedia(
        'TEST COLLECTION',
        'TC',
        zapMarket.address,
        true,
        'https://www.testing.com'
      );
    });

    it('Testing', async () => {});
  });
});
