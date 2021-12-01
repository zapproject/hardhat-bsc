import { ethers, upgrades } from 'hardhat';

import { ZapMarket, ZapMedia, ZapVault, ZapMarketV2 } from '../typechain';

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';

const { deployments } = require('hardhat');


describe("Testing", () => {

    let zapVault: ZapVault

    beforeEach(async () => {

        const signers = await ethers.getSigners()
        await deployments.fixture();

        const vaultFactory = await deployments.get('ZapVault');
        const zapMarketFactory = await deployments.get('ZapMarket')

        zapVault = await ethers.getContractAt('ZapVault', vaultFactory.address) as ZapVault;
        const zapMarket = await ethers.getContractAt('ZapMarket', zapMarketFactory.address)

        const ZapMarketV2 = await ethers.getContractFactory('ZapMarketV2', signers[0])

        const zapMarketV2 = await upgrades.upgradeProxy(zapMarket.address, ZapMarketV2)


    })

    it('testing', async function () {


    });


});

