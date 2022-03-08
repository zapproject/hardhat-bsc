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

    // Creates an instance of ZapMarket
    zapMarket = (await ethers.getContractAt(
      'ZapMarket',
      zapMarketFixture.address,
      signers[0]
    )) as ZapMarket;

    const marketFactory = await ethers.getContractFactory('ZapMarket');
    // await upgrades.forceImport(zapMarket.address, marketFactory);

    const marketV2 = await ethers.getContractFactory('ZapMarketV2', signers[0]);

    const market = await upgrades.upgradeProxy(zapMarket.address, marketV2);
  });

  it.only('Testing', async () => {});
});
