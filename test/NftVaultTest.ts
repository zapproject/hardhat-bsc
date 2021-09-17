import { ethers, upgrades } from 'hardhat';

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';

import { ZapTokenBSC } from '../typechain/ZapTokenBSC';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { ZapVault } from '../typechain/ZapVault';
import { ContractReceipt } from '@ethersproject/contracts';

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

        signers.forEach(async (signer: any) => await zapTokenBsc.allocate(signer.address, 1000));

        await zapTokenBsc.allocate(zapVault.address, 1000);

    });

    it("Should get the Vault owner", async () => {

        const vaultOwner = await zapVault.getOwner();

        expect(vaultOwner).to.equal(signers[0].address);
    });

    it("Should transfer ownership of the Vault", async () => {

        const initialOwner = await zapVault.getOwner();

        await zapVault.transferOwnership(signers[1].address);

        const zapVaultFilter =
            zapVault.filters.OwnershipTransferred(null, null);

        const event = (await zapVault.queryFilter(zapVaultFilter))[0];

        const newOwner = await zapVault.getOwner();

        expect(event.event).to.equal('OwnershipTransferred');

        expect(event.args?.previousOwner).to.equal(initialOwner);

        expect(event.args?.newOwner).to.equal(newOwner);

        expect(newOwner).to.not.equal(initialOwner);

        expect(newOwner).to.equal(signers[1].address);
    });

    it("Should revert if there is an attempt to initialize the vault twice", async () => {

        await expect(zapVault.initializeVault(zapTokenBsc.address)).to.be.revertedWith(
            'Initializable: contract is already initialized'
        );

    });

    it('Should withdraw tokens from the vault', async () => {

        const initalBal = parseInt(await (await zapVault.vaultBalance())._hex);

        const ownerPreBal = parseInt(await (await zapTokenBsc.balanceOf(signers[0].address))._hex);

        await zapVault.withdraw(initalBal);

        const ownerPostBal = parseInt(await (await zapTokenBsc.balanceOf(signers[0].address))._hex);

        const postBal = parseInt(await (await zapVault.vaultBalance())._hex);

        expect(postBal).to.be.equal(0);

        expect(ownerPostBal).to.be.equal(ownerPreBal + initalBal);

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

})
