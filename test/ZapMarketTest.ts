import { deployments, ethers } from "hardhat"

import { solidity } from 'ethereum-waffle';

import chai from 'chai';

import { ZapMedia } from '../typechain/ZapMedia';

chai.use(solidity);

describe("ZapMarket Test", () => {

    let zapMarket: any
    let zapMedia: ZapMedia
    let signers: any

    describe("Configure", () => {

        beforeEach(async () => {

            signers = await ethers.getSigners()

            const test = await deployments.fixture(['ZapMarket'])

            zapMarket = await ethers.getContractAt("ZapMarket", test.ZapMarket.address)

            // const mediaFactory = await ethers.getContractAt()

            // zapMedia = (await mediaFactory.deploy(zapMarket.address)) as ZapMedia


        })

        it('should revert if not called by the owner', async () => {

        });

    })
})