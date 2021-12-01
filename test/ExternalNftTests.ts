import { ethers, upgrades } from 'hardhat';

import { ZapMarket, ZapMedia, ZapVault } from '../typechain';

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';

const { deployments } = require('hardhat');


describe("Testing", () => {

    let zapVault: ZapVault

    beforeEach(async () => {

        await deployments.fixture();

        const vaultFactory = await deployments.get('ZapVault');

        zapVault = await ethers.getContractAt('ZapVault', vaultFactory.address) as ZapVault;

    })

    it('testing 1 2 3', async function () {


    });


});

