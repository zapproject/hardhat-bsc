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

        await zapTokenBsc.allocate(zapVault.address, 1000);

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

    it('Should only allow a whitelisted address to view the balance', async () => {

        const balance = await zapVault.vaultBalance();

        expect(parseInt(balance._hex)).to.equal(1000);

    });

    it("Should revert if there is an attempt to initialize the vault twice", async () => {

        await expect(zapVault.initializeVault(zapTokenBsc.address)).to.be.revertedWith(
            'Initializable: contract is already initialized'
        );

    });

    it('Should revert if a non whitelisted address tries to view the balance', async () => {

        await expect(zapVault.connect(signers[2]).vaultBalance()).to.be.revertedWith(
            'Vault: Address is not whitelisted'
        );

    });

    it('Should add a new whitelisted address', async () => {

        const preAdd = await zapVault.getWhitelisted();

        const whitelistedTx = await zapVault.addWhitelist(signers[1].address);

        const receipt = await whitelistedTx.wait();

        const status = await zapVault.whitelistStatus(signers[1].address);

        const postAdd = await zapVault.getWhitelisted();

        expect(status).to.equal(true);

        expect(postAdd.length).to.equal(preAdd.length + 1);

    });

    it('Should revert if there is an attempt to whitelist an already whitelisted address', async () => {

        const preAdd = await zapVault.getWhitelisted();

        await zapVault.addWhitelist(signers[1].address);

        const status = await zapVault.whitelistStatus(signers[1].address);

        await expect(zapVault.addWhitelist(signers[1].address)).to.be.revertedWith(

            'Vault: Address is already whitelisted'
        );

        const postAdd = await zapVault.getWhitelisted();

        expect(preAdd.length).to.equal(1);

        expect(status).to.equal(true);

        expect(postAdd.length).to.equal(preAdd.length + 1);

    })

    it('Should revert if a non whitelisted address tries to whitelist an address', async () => {

        await expect(zapVault.connect(signers[1]).addWhitelist(signers[2].address)).to.be.revertedWith(
            'Ownable: Only owner has access to this function'
        );

    });

    it('Should revert if a whitelisted address tries to whitelist an address', async () => {

        await zapVault.addWhitelist(signers[1].address);

        await expect(zapVault.connect(signers[1]).addWhitelist(signers[2].address)).to.be.revertedWith(
            'Ownable: Only owner has access to this function'
        );

    });

    it('Should withdraw tokens from the vault', async () => {

        const initalBal = parseInt(await (await zapVault.vaultBalance())._hex);

        await zapVault.withdraw(initalBal);

        const postBal = parseInt(await (await zapVault.vaultBalance())._hex);

        expect(postBal).to.be.equal(0);

    });

    it('Should revert if withdraw amount exceeds balance amount', async () => {

        const initalBal = parseInt(await (await zapVault.vaultBalance())._hex);

        await expect(zapVault.withdraw(initalBal + 1)).to.be.revertedWith(
            'Vault: Withdraw amount is insufficient.'
        );

        const postBal = parseInt(await (await zapVault.vaultBalance())._hex);

        expect(postBal).to.be.equal(initalBal);

    });

    it('Should revert if withdraw is not done by the owner', async () => {

        const initalBal = parseInt(await (await zapVault.vaultBalance())._hex);

        await expect(zapVault.connect(signers[1]).withdraw(initalBal)).to.be.revertedWith(
            'Ownable: Only owner has access to this function'
        );

        const postBal = parseInt(await (await zapVault.vaultBalance())._hex);

        expect(postBal).to.be.equal(initalBal);

    });

    it('Should revert if withdraw is done by a whitelisted address', async () => {

        const initalBal = parseInt(await (await zapVault.vaultBalance())._hex);

        await expect(zapVault.connect(signers[1]).withdraw(initalBal)).to.be.revertedWith(
            'Ownable: Only owner has access to this function'
        );

        const postBal = parseInt(await (await zapVault.vaultBalance())._hex);

        expect(postBal).to.be.equal(initalBal);

    })

})