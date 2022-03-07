import { ethers, deployments } from 'hardhat';

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';

import {
  Media1155Factory,
  Media1155,
  ZapMarket,
  ZapMarketV2,
  ZapVault,
  ZapMedia,
  ZapMedia__factory
} from '../typechain';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DeployResult } from 'hardhat-deploy/dist/types';

import * as zapMediaAbi from '../artifacts/contracts/nft/ZapMedia.sol/ZapMedia.json';

chai.use(solidity);

describe.only('ZapMarketV2', () => {
  let signers: SignerWithAddress[];
  let zapMarket: ZapMarket;
  let zapMarketV2: ZapMarketV2;
  let zapVault: ZapVault;
  let media1155Factory: Media1155Factory;
  let zapMedia: ZapMedia;
  let media1155: Media1155;

  beforeEach(async () => {
    signers = await ethers.getSigners();
    await deployments.fixture();

    const zapVaultFixture = await deployments.get('ZapVault');

    // Creates an instance of ZapVault
    zapVault = (await ethers.getContractAt(
      'ZapMarket',
      zapVaultFixture.address,
      signers[0]
    )) as ZapVault;

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

    zapMedia = (await ethers.getContractAt(
      'Media1155Factory',
      media1155FactoryAddress,
      signers[0]
    )) as ZapMedia;
  });

  describe('#intitialize', () => {
    it('Should not initialize twice', async () => {
      await expect(
        zapMarketV2.initializeMarket(zapVault.address)
      ).to.be.revertedWith('Initializable: contract is already initialized');
    });

    it('Should get the market owner', async () => {
      const owner = await zapMarketV2.getOwner();

      expect(owner).to.equal(signers[0].address);
    });

    it('Should get the the platform fee', async () => {
      const fee = await zapMarketV2.viewFee();
      expect(parseInt(fee.value._hex)).to.equal(5e18);
    });

    it('Should revert if a non owner tries to set the plaform fee', async () => {
      let platformFee = {
        fee: {
          value: ethers.BigNumber.from('5000000000000000000')
        }
      };
      await expect(
        zapMarketV2.connect(signers[2]).setFee(platformFee)
      ).to.be.revertedWith('Ownable: Only owner has access to this function');
    });

    it('Should get an owners media contract', async () => {
      const zapMediaAddress = await zapMarketV2.mediaContracts(
        signers[0].address,
        ethers.BigNumber.from('0')
      );

      const registerStatus = await zapMarketV2.isRegistered(zapMediaAddress);

      const configureStatus = await zapMarketV2.isConfigured(zapMediaAddress);

      expect(registerStatus).to.be.true;

      expect(configureStatus).to.be.true;
    });

    it('Should revert if configure is not called by the media factory', async () => {
      await expect(
        zapMarketV2.configure(
          signers[0].address,
          (
            await deployments.get('ZapMedia')
          ).address,
          ethers.utils.formatBytes32String('Test Media'),
          ethers.utils.formatBytes32String('TM')
        )
      ).to.be.revertedWith('Market: Only the media factory can do this action');
    });
  });
});
