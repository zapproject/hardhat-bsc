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

describe.only('MediaFactoryV2', () => {
  let signers: SignerWithAddress[];
  let zapMarket: ZapMarket;
  let zapMarketV2: ZapMarketV2;
  let mediaFactory: MediaFactory;
  let zapMedia: ZapMedia;

  const zapMediaV2Interface = async () => {
    const deploy = await deployments.deploy('ZapMediaV2', {
      from: signers[0].address,
      args: []
    });

    return deploy.address;
  };

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

    // Creates an instance of ZapMediaV1
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
    let mediaFactoryV2: MediaFactoryV2;
    let mediaFactoryV2Factory: any;

    beforeEach(async () => {
      // MediaFactoryV2 contract factory
      mediaFactoryV2Factory = await ethers.getContractFactory(
        'MediaFactoryV2',
        signers[0]
      );

      // Upgraded MediaFactory to MediaFactoryV2
      mediaFactoryV2 = (await upgrades.upgradeProxy(
        mediaFactory.address,
        mediaFactoryV2Factory
      )) as MediaFactoryV2;
    });

    describe('#upgradeMediaFactory', () => {
      it('Should revert if a non owner attempts to upgrade MediaFactoryV2', async () => {
        // A non owner connected to tbe MediaFactoryV2 contract factory
        const invalidMediaFactoryV2 = await ethers.getContractFactory(
          'MediaFactoryV2',
          signers[1]
        );

        // Only the owner of MediaFactory can upgrade the contract
        await expect(
          upgrades.upgradeProxy(mediaFactory.address, invalidMediaFactoryV2)
        ).to.be.revertedWith('Ownable: caller is not the owner');
      });

      it('Should upgrade MediaFactory to MediaFactoryV2', async () => {
        // MediaFactoryV2 address should equal MediaFactoryV1 address after upgrading
        expect(mediaFactoryV2.address).to.equal(mediaFactory.address);
      });
    });

    describe('#upgradeZapMedia', () => {
      it('Should revert if a non owner tries to upgrade the ZapMedia implementation', async () => {
        // Only the owner of the MediaFactory can upgrade the implementation
        await expect(
          mediaFactoryV2
            .connect(signers[1])
            .upgradeMedia(await zapMediaV2Interface())
        ).to.be.revertedWith('Ownable: caller is not the owner');
      });

      it('Should upgrade the ZapMedia implementation and deploy ZapMediaV2', async () => {
        // Upgrades the implementation contract from ZapMedia to ZapMediaV2
        await mediaFactoryV2.upgradeMedia(await zapMediaV2Interface());

        // Deploys an instance of ZapMediaV2 from MediaFactoryV2
        const deployMediaV2 = await mediaFactoryV2
          .connect(signers[1])
          .deployMedia(
            'ZapMediaV2',
            'ZMV2',
            zapMarketV2.address,
            true,
            'www.testing.com'
          );

        // Transaction receipt
        const receipt = await deployMediaV2.wait();

        // Filters through the transaction reciept event log
        const mediaDeployedEvent: any = receipt.events?.slice(-1);

        // The ZapMediaV2 address emitted from deployMedia
        const emittedMediaAddress = mediaDeployedEvent[0].args?.mediaContract;

        // The ZapMediaV2 address owned by signers[1]
        const ownersMediaAddress = await zapMarketV2.mediaContracts(
          signers[1].address,
          0
        );

        // The ZapMediaV2 address emitted should equal the address stored in ZapMarketV2 owned by signers[1]
        expect(emittedMediaAddress).to.equal(ownersMediaAddress);

        // The ZapMediaV2 configuration status to ZapMarketV2
        const isConfiguredStatus = await zapMarketV2.isConfigured(
          emittedMediaAddress
        );

        // The configuration status should be true
        expect(isConfiguredStatus).to.be.true;

        // The ZapMediaV2 registration status to ZapMarketV2
        const isRegisteredStatus = await zapMarketV2.isRegistered(
          emittedMediaAddress
        );

        // The registration status should be true
        expect(isRegisteredStatus).to.be.true;
      });
    });
  });
});
