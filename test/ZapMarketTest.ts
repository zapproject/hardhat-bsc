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
            value: BigInt(10000000000000000000)
        },
        owner: {
            value: BigInt(0x04563918244f400000)
        },
        creator: {
            value: BigInt(0x8ac7230489e80000)
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

            await expect(zapMarket.connect(signers[3]).setBidShares(1, bidShares)).to.be.revertedWith(
                'Market: Only media contract'
            );

            await expect(zapMarket.connect(signers[4]).setBidShares(1, bidShares)).to.be.revertedWith(
                'Market: Only media contract'
            );

        });

        it.only('Should set the bid shares if called by the media address', async () => {

            const tokenBidShares1 = await zapMarket.connect(signers[1]).setBidShares(1, bidShares);

            const bidSharesReceipt1 = await tokenBidShares1.wait();

            const eventLog1 = bidSharesReceipt1.events[0]

            expect(eventLog1.event).to.equal("BidShareUpdated");

            expect(eventLog1.args.tokenId.toNumber()).to.equal(1);

            // expect(eventLog1.args)

            // const tokenBidShares2 = await zapMarket.connect(signers[2]).setBidShares(1, bidShares);
        })
    })
})