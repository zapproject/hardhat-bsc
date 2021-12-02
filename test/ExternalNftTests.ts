import { ethers, upgrades, deployments, getNamedAccounts } from 'hardhat';

import { ZapMarket, ZapMedia, ZapVault, ZapMarketV2, NewProxyAdmin, MediaFactory } from '../typechain';

import { getProxyAdminFactory } from '@openzeppelin/hardhat-upgrades/dist/utils';

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';
import { sign } from 'crypto';


describe("Testing", () => {

    let zapVault: ZapVault
    let zapMarket: ZapMarket
    let mediaFactory: MediaFactory
    let zapMedia: ZapMedia
    let zapMarketV2: ZapMarketV2

    beforeEach(async () => {

        // 20 accoun
        const signers = await ethers.getSigners();

        // Gets the deployed NFT contract fixtures from the 
        await deployments.fixture(['ZapTokenBSC', 'ZapVault', 'ZapMarket', 'MediaFactory']);

        // Gets the ZapVault contract deployment
        const zapVaultFactory = await deployments.get('ZapVault');

        // Gets the ZapMarket contract deployment
        const zapMarketFactory = await deployments.get('ZapMarket');

        // Gets the MediaFactory contract deployment
        const mediaFactoryFactory = await await deployments.get('MediaFactory');

        // Deploy NewProxyAdmin contract
        const newProxyAdminFactory = await ethers.getContractFactory("NewProxyAdmin", signers[0]);
        const newProxyAdmin = await newProxyAdminFactory.deploy() as NewProxyAdmin;
        await newProxyAdmin.deployed();

        const defaultProxyAdminDeployment = await deployments.get('DefaultProxyAdmin');

        // zapVault = await ethers.getContractAt('ZapVault', vaultFactory.address) as ZapVault;

        // ZapMarket contract instance
        zapMarket = await ethers.getContractAt(
            'ZapMarket',
            zapMarketFactory.address,
            signers[0]
        ) as ZapMarket;

        // MediaFactory contract instance
        mediaFactory = await ethers.getContractAt(
            'MediaFactory',
            mediaFactoryFactory.address,
            signers[0]
        ) as MediaFactory;

        const defaultProxyAdmin = new ethers.Contract(
            defaultProxyAdminDeployment.address,
            defaultProxyAdminDeployment.abi,
            signers[0]
        );

        // const ZapMarketV2 = await ethers.getContractFactory('ZapMarketV2', signers[0])
        // const proxyAdmin = await upgrades.erc1967.getAdminAddress(zapMarketFactory.address);

        // await deployments.deploy('ZapMarket', {
        //     from: deployer,
        //     contract: "ZapMarketV2",
        //     proxy: {
        //         proxyContract: 'OpenZeppelinTransparentProxy',
        //     },
        //     log: true,
        // })

        // zapMarketV2 = new ethers.Contract(
        //     zapMarketFactory.address, ZapMarketV2.interface, signers[0]
        // ) as ZapMarketV2;


        // // const zapMarketV2 = await upgrades.upgradeProxy(zapMarket.address, ZapMarketV2, {})


    })

    it('testing', async function () {

        await expect(zapMarketV2._isConfigured(ethers.constants.AddressZero)).to.not.be.false

    });


});

