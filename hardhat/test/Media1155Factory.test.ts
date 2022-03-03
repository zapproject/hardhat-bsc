import { ethers, deployments } from 'hardhat';

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';

import {
  Media1155Factory,
  Media1155,
  ZapMarket,
  ZapMarketV2
} from '../typechain';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DeployResult } from 'hardhat-deploy/dist/types';

chai.use(solidity);

describe('Media1155Factory', () => {
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

    // ZapMarketV2 sets the Media1155Factory
    await zapMarketV2.setMediaFactory(media1155Factory.address);
  });

  describe('#deployMedia', () => {
    let deployMedia: any;
    let mediaAddress: string;

    beforeEach(async () => {
      //   Deployes an instance of Media1155 through the Media1155Factory
      deployMedia = await media1155Factory.deployMedia(
        'https://www.testing.com',
        zapMarketV2.address,
        true,
        'https://www.testing.com'
      );

      //   Creates a filter for the Media1155Deployed event on the Media1155Factory contract
      const filter = media1155Factory.filters.Media1155Deployed(null);

      // Returns the event log for the Media1155Deployed event on the Media1155Factory contract
      let eventLog = (await media1155Factory.queryFilter(filter))[0];

      // Returns the Media1155 contract address
      mediaAddress = eventLog.args?.mediaContract;
    });

    describe('#Ownership', () => {
      it('Should revert if a caller other than the owner attempts to claim ownership', async () => {
        // Creates the Media115 contract instance
        const media1155 = (await ethers.getContractAt(
          'Media1155',
          mediaAddress,
          signers[0]
        )) as Media1155;

        // Only the deployer of the media
        await expect(
          media1155.connect(signers[2]).claimTransferOwnership()
        ).to.be.revertedWith(
          'Ownable: Caller is not the appointed owner of this contract'
        );
      });
    });

    it('Should be registered to ZapMarketV2 after deployment', async () => {
      // Returns the registraton status of the deployed media contract
      const registeredStatus: boolean = await zapMarketV2.isRegistered(
        mediaAddress
      );

      // The deployed media contract registration status should equal true
      expect(registeredStatus).to.be.true;
    });

    it('Should be configured to ZapMarketV2 after deployment', async () => {
      // Returns the configure status of the deployed media contract
      const registeredStatus: boolean = await zapMarketV2.isConfigured(
        mediaAddress
      );

      // The deployed media contract configure status should equal true
      expect(registeredStatus).to.be.true;
    });

    it('Should deploy a Media1155 contract through the Media1155Factory and create an instance', async () => {
      // Creates the Media115 contract instance
      const media1155 = (await ethers.getContractAt(
        'Media1155',
        mediaAddress,
        signers[0]
      )) as Media1155;

      // Signers[0] is the owner of the media1155 and is then only address allowed to claim ownership
      await media1155.claimTransferOwnership();

      // The address returned from the Media1155Deployed event should equal the address of the Media1155 contract
      expect(mediaAddress).to.equal(media1155.address);

      // After claiming ownership the owner of media1155 should equal the deployers address
      expect(await media1155.getOwner()).to.equal(signers[0].address);
    });
  });
});
