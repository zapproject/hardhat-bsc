import { ethers, upgrades } from 'hardhat';

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';

import { ZapTokenBSC } from '../typechain/ZapTokenBSC';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { ZapVault } from '../typechain/ZapVault';

chai.use(solidity);

describe('NFT Platform Vault Test', () => {

    let zapVault: ZapVault
    let zapTokenBsc: ZapTokenBSC
    let signers: SignerWithAddress[]

    beforeEach(async () => {

        signers = await ethers.getSigners();

        const zapTokenFactory = await ethers.getContractFactory('ZapTokenBSC', signers[0]);

        zapTokenBsc = (await zapTokenFactory.deploy()) as ZapTokenBSC;
        zapTokenBsc.deployed();

        const zapVaultFactory = await ethers.getContractFactory('ZapVault', signers[0]);

        zapVault = (await upgrades.deployProxy(zapVaultFactory, [zapTokenBsc.address], {
            initializer: 'initializeVault'
        })) as ZapVault;

        signers.forEach(async signer => await zapTokenBsc.allocate(signer.address, 1000));

    });

    it("Should get the Vault owner", async () => {

        const vaultOwner = await zapVault.getOwner();

        expect(vaultOwner).to.equal(signers[0].address);
    });

    it("Should get the owner whitelist status", async () => {

        const status = await zapVault.whitelistStatus(signers[0].address);

        const whitelistAddresses = await zapVault.getWhitelisted();

        expect(status).to.be.equal(true);

        expect(whitelistAddresses.length).to.equal(1);

    });

})