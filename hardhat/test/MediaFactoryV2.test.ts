import { ethers, deployments, upgrades } from 'hardhat';

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';

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

    const zapMedia = (await ethers.getContractAt(
      'ZapMedia',
      '0x18998c7E38ede4dF09cEec08E5372Bf8fe5719ea',
      signers[0]
    )) as ZapMedia;

    const v2Factory = await ethers.getContractFactory('ZapMediaV2', signers[0]);

    const x = await upgrades.erc1967.getBeaconAddress(zapMedia.address);

    await upgrades.upgradeProxy(x, v2Factory);
  });

  it.only('Testing', async () => {});
});
