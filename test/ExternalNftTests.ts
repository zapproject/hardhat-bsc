import { ethers, upgrades, deployments } from 'hardhat';

import { ZapMarket, ZapMedia, ZapVault, ZapMarketV2, NewProxyAdmin } from '../typechain';

import { getProxyAdminFactory } from '@openzeppelin/hardhat-upgrades/dist/utils';

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';


describe("Testing", () => {

    let zapVault: ZapVault
    let zapMarket: ZapMarket
    let zapMarketV2: ZapMarketV2

    beforeEach(async () => {

        const signers = await ethers.getSigners()
        await deployments.fixture(['ZapTokenBSC', 'ZapVault', 'ZapMarket']);

        const newProxyAdminFactory = await ethers.getContractFactory("NewProxyAdmin", signers[0]);
        const newProxyAdmin = await newProxyAdminFactory.deploy() as NewProxyAdmin;
        await newProxyAdmin.deployed();
        const zapMarketFactory = await deployments.get('ZapMarket');
        const defaultProxyAdminDeployment = await deployments.get('DefaultProxyAdmin');

        // zapVault = await ethers.getContractAt('ZapVault', vaultFactory.address) as ZapVault;
        zapMarket = await ethers.getContractAt('ZapMarket', zapMarketFactory.address, signers[0]) as ZapMarket;
        const defaultProxyAdmin = new ethers.Contract(
            defaultProxyAdminDeployment.address,
            defaultProxyAdminDeployment.abi,
            signers[0]
        );

        const ZapMarketV2 = await ethers.getContractFactory('ZapMarketV2', signers[0])
        const proxyAdmin = await upgrades.erc1967.getAdminAddress(zapMarketFactory.address);

        const newImplAddress = await upgrades.prepareUpgrade(
            zapMarket,
            ZapMarketV2
        );

        console.log("deployed impl address: ", newImplAddress);
        await upgrades.admin.changeProxyAdmin(zapMarket.address, newProxyAdmin.address);

        await newProxyAdmin.upgrade(zapMarket.address, newImplAddress);

        zapMarketV2 = (zapMarket as unknown) as ZapMarketV2;


        // const zapMarketV2 = await upgrades.upgradeProxy(zapMarket.address, ZapMarketV2, {})


    })

    it('testing', async function () {
        await expect(zapMarket._isConfigured(ethers.constants.AddressZero)).to.not.be.reverted
    });


});

