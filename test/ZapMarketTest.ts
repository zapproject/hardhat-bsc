import { deployments, ethers } from "hardhat"

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';

import { ZapMedia } from '../typechain/ZapMedia';

chai.use(solidity);

describe("ZapMarket Test", () => {

    let zapMarket: any
    let zapMedia1: any
    let zapMedia2: any
    let signers: any

    describe("Configure", () => {

        beforeEach(async () => {

            signers = await ethers.getSigners()

            const marketFixture = await deployments.fixture(['ZapMarket'])

            zapMarket = await ethers.getContractAt("ZapMarket", marketFixture.ZapMarket.address)


            const mediaFactory = await ethers.getContractFactory("ZapMedia", signers[1]);

            zapMedia1 = (await mediaFactory.deploy("TEST MEDIA 1", "TM1", zapMarket.address))

            await zapMedia1.deployed();

            const mediaFactory2 = await ethers.getContractFactory("ZapMedia", signers[2]);

            zapMedia2 = (await mediaFactory2.deploy("TEST MEDIA 2", "TM2", zapMarket.address))

            await zapMedia2.deployed();

        })

        it('Should reject if called twice', async () => {

            await expect(zapMarket.configure(zapMedia1.address))
                .to.be.revertedWith("Market: Already configured");

            await expect(zapMarket.configure(zapMedia2.address))
                .to.be.revertedWith("Market: Already configured");

            expect(await zapMarket.isConfigured(zapMedia1.address)).to.be.true

            expect(await zapMarket.isConfigured(zapMedia2.address)).to.be.true

        });

    })
})