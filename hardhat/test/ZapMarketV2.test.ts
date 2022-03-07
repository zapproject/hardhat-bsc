import { ethers, deployments } from 'hardhat';

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';

import {
  Media1155Factory,
  Media1155,
  ZapMarket,
  ZapMarketV2,
  ZapVault
} from '../typechain';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DeployResult } from 'hardhat-deploy/dist/types';

chai.use(solidity);

describe('ZapMarketV2', () => {
  let signers: SignerWithAddress[];
  let zapMarket: ZapMarket;
  let zapMarketV2: ZapMarketV2;
  let zapVault: ZapVault;

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
  });

  describe.only('#intitialize', () => {
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

      console.log(zapMarket.address == zapMarketV2.address);
    });
  });
});
