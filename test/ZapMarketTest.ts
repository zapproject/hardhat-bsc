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

    let bidShares = {

        prevOwner: {
            value: 10
        },
        owner: {
            value: 80
        },
        creator: {
            value: 10
        },
    };

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

        it.only('Should get media owner', async () => {

            const zapMedia1Address = await zapMarket.mediaContract(zapMedia1.address);

            const zapMedia2Address = await zapMarket.mediaContract(zapMedia2.address);

            expect(await zapMedia1Address).to.equal(signers[1].address);

            expect(await zapMedia2Address).to.equal(signers[2].address);


        });

        it.only('Should reject if called twice', async () => {

            await expect(zapMarket.configure(signers[1].address))
                .to.be.revertedWith("Market: Already configured");

            await expect(zapMarket.configure(signers[2].address))
                .to.be.revertedWith("Market: Already configured");

            expect(await zapMarket.isConfigured(signers[1].address)).to.be.true

            expect(await zapMarket.isConfigured(signers[2].address)).to.be.true

        });
    })

    describe('#setBidShares', () => {

        it.only('Should reject if not called by the media address', async () => {

            // await expect(zapMarket.connect(signers[]).setBidShares(1, bidShares)).to.be.revertedWith(
            //     "Market: Only media contract"
            // )

            console.log("ZapMedia 1 address:", zapMedia1.address)
            await zapMarket.connect(signers[1]).setBidShares(1, bidShares)

        });

        it('should set the bid shares if called by the media address', async () => {

            await zapMarket.connect(signers[1]).setBidShares(1, bidShares)
        })
    })
})