import { ethers, deployments } from 'hardhat';

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';

import { Media1155Factory, ZapMarket, ZapMarketV2 } from '../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DeployResult } from 'hardhat-deploy/dist/types';

chai.use(solidity);

describe.only('Media1155Factory', () => {
  let signers: SignerWithAddress[];
  let zapMarket: ZapMarket;
  let zapMarketV2: ZapMarketV2;
  let media1155Factory: Media1155Factory;

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

    // Upgrade ZapMarket to ZapMarketV2
    const marketUpgradeTx = await deployments.deploy('ZapMarket', {
      from: signers[0].address,
      contract: 'ZapMarketV2',
      proxy: {
        proxyContract: 'OpenZeppelinTransparentProxy'
      },
      log: true
    });

    // Fetch the address of ZapMarketV2 from the transaction receipt
    const zapMarketV2Address: string | any =
      marketUpgradeTx.receipt?.contractAddress;

    // Create the ZapMarketV2 contract instance
    zapMarketV2 = (await ethers.getContractAt(
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
            args: [zapMarketV2.address, media1155ImpAddress]
          }
        }
      }
    );

    // Fetch the Media1155Factory address from the transaction receipt
    const media1155FactoryAddress: string | any =
      deployMedia1155Factory.receipt?.contractAddress;

    // Creates the Media1155 contract instance
    media1155Factory = (await ethers.getContractAt(
      'Media1155Factory',
      media1155FactoryAddress,
      signers[0]
    )) as Media1155Factory;
  });

  it('', async () => {});
});
