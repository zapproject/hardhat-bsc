import { deployments, ethers } from "hardhat"

import { solidity } from 'ethereum-waffle';

import chai from 'chai';

import { ZapMedia } from '../typechain/ZapMedia';

chai.use(solidity);

describe("ZapMarket Test", () => {

    let zapMarket: any
    let zapMedia1: ZapMedia
    let zapMedia2: any
    let signers: any

    describe("Configure", () => {

        beforeEach(async () => {

            signers = await ethers.getSigners()

            const marketFixture = await deployments.fixture(['ZapMarket'])

            zapMarket = await ethers.getContractAt("ZapMarket", marketFixture.ZapMarket.address)


            const mediaFactory = await ethers.getContractFactory("ZapMedia", signers[0]);

            zapMedia1 = (await mediaFactory.deploy("TEST MEDIA 1", "TM1", zapMarket.address)) as ZapMedia

            await zapMedia1.deployed();

            await zapMarket.configure(zapMedia1.address)


            const mediaFactory2 = await ethers.getContractFactory("ZapMedia", signers[1]);

            zapMedia2 = (await mediaFactory2.deploy("TEST MEDIA 2", "TM2", zapMarket.address)) as ZapMedia

            await zapMedia2.deployed();

            await zapMarket.configure(zapMedia2.address)

        })

        it('should revert if not called by the owner', async () => {

        });

    })
})