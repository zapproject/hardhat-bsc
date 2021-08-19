import { deployments, ethers } from "hardhat"

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';

import { ZapTokenBSC } from '../typechain/ZapTokenBSC';


chai.use(solidity);

describe("ZapMarket Test", () => {

    let zapMarket: any
    let zapMedia1: any
    let zapMedia2: any
    let zapTokenBsc: any
    let signers: any

    let bidShares1 = {

        prevOwner: {
            value: BigInt(10000000000000000000)
        },
        owner: {
            value: BigInt(80000000000000000000)
        },
        creator: {
            value: BigInt(10000000000000000000)
        },
    };

    let bidShares2 = {

        prevOwner: {
            value: BigInt(15000000000000000000)
        },
        owner: {
            value: BigInt(70000000000000000000)
        },
        creator: {
            value: BigInt(15000000000000000000)
        },
    };

    let invalidBidShares = {

        prevOwner: {
            value: BigInt(90000000000000000000)
        },
        owner: {
            value: BigInt(79000000000000000000)
        },
        creator: {
            value: BigInt(90000000000000000000)
        },
    };

    let ask = {
        amount: 100,
        currency: '',
        sellOnShare: 0
    }

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

            const zapTokenFactory = await ethers.getContractFactory(
                'ZapTokenBSC',
                signers[0]
            );

            zapTokenBsc = (await zapTokenFactory.deploy()) as ZapTokenBSC;
            await zapTokenBsc.deployed();

            ask.currency = zapTokenBsc.address

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

            await expect(zapMarket.connect(signers[3]).setBidShares(
                zapMedia1.address,
                1, bidShares1
            ))
                .to.be.revertedWith(
                    'Market: Only media contract'
                );

            await expect(zapMarket.connect(signers[4]).setBidShares(
                zapMedia2.address,
                1,
                bidShares1
            ))
                .to.be.revertedWith(
                    'Market: Only media contract'
                );

        });

        it.only('Should set the bid shares if called by the media address', async () => {

            await zapMarket.connect(signers[1]).setBidShares(zapMedia1.address, 1, bidShares1);

            await zapMarket.connect(signers[2]).setBidShares(zapMedia2.address, 1, bidShares2);

            const sharesForToken1 = await zapMarket.bidSharesForToken(zapMedia1.address, 1);

            const sharesForToken2 = await zapMarket.bidSharesForToken(zapMedia2.address, 1);

            expect(BigInt(parseInt(sharesForToken1.prevOwner.value))).to.be.equal(bidShares1.prevOwner.value);

            expect(BigInt(parseInt(sharesForToken1.creator.value))).to.be.equal(bidShares1.creator.value);

            expect(BigInt(parseInt(sharesForToken1.owner.value))).to.be.equal(bidShares1.owner.value);

            expect(BigInt(parseInt(sharesForToken2.prevOwner.value))).to.be.equal(bidShares2.prevOwner.value);

            expect(BigInt(parseInt(sharesForToken2.creator.value))).to.be.equal(bidShares2.creator.value);

            expect(BigInt(parseInt(sharesForToken2.owner.value))).to.be.equal(bidShares2.owner.value);

        })

        it.only('Should emit an event when bid shares are updated', async () => {

            const bidShares1Tx = await zapMarket.connect(signers[1]).setBidShares(
                zapMedia1.address,
                1,
                bidShares1
            );

            const bidShares2Tx = await zapMarket.connect(signers[2]).setBidShares(
                zapMedia2.address,
                1,
                bidShares2
            );

            const receipt1 = await bidShares1Tx.wait();

            const eventLog1 = receipt1.events[0];

            const receipt2 = await bidShares2Tx.wait();

            const eventLog2 = receipt2.events[0];

            expect(eventLog1.event).to.be.equal('BidShareUpdated');

            expect(eventLog1.args.tokenId.toNumber()).to.be.equal(1);

            expect(BigInt(parseInt(eventLog1.args.bidShares.prevOwner.value))).to
                .be.equal(bidShares1.prevOwner.value);

            expect(BigInt(parseInt(eventLog1.args.bidShares.creator.value))).to
                .be.equal(bidShares1.creator.value);

            expect(BigInt(parseInt(eventLog1.args.bidShares.owner.value))).to
                .be.equal(bidShares1.owner.value);

            expect(eventLog2.event).to.be.equal('BidShareUpdated');

            expect(eventLog2.args.tokenId.toNumber()).to.be.equal(1);

            expect(BigInt(parseInt(eventLog2.args.bidShares.prevOwner.value))).to
                .be.equal(bidShares2.prevOwner.value);

            expect(BigInt(parseInt(eventLog2.args.bidShares.creator.value))).to
                .be.equal(bidShares2.creator.value);

            expect(BigInt(parseInt(eventLog2.args.bidShares.owner.value))).to
                .be.equal(bidShares2.owner.value);

        });

        it('Should reject if the bid shares are invalid', async () => {

            await expect(zapMarket.connect(signers[1]).setBidShares(1, invalidBidShares)).to.
                be.revertedWith(
                    'Market: Invalid bid shares, must sum to 100'
                )

            await expect(zapMarket.connect(signers[2]).setBidShares(1, invalidBidShares)).to.
                be.revertedWith(
                    'Market: Invalid bid shares, must sum to 100'
                )
        });
    })

    describe("#setAsk", () => {

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

        it('Should reject if not called by the media address', async () => {

            await expect(zapMarket.connect(signers[5]).setAsk(1, ask)).to.be.revertedWith(
                'Market: Only media contract'
            )
        });

        it('Should set the ask if called by the media address', async () => {

            await zapMarket.connect(signers[1]).setBidShares(1, bidShares1);

            await zapMarket.connect(signers[1]).setAsk(1, ask);

            const getAsk = await zapMarket.currentAskForToken(1)

            expect(getAsk.amount.toNumber()).to.equal(ask.amount);

            expect(getAsk.currency).to.equal(zapTokenBsc.address);

        });

        it('should emit an event if the ask is updated', async () => {


        });

        it('Should reject if the ask is too low', async () => {

            await zapMarket.connect(signers[1]).setBidShares(1, bidShares1);

            await expect(zapMarket.connect(signers[1]).setAsk(1, {
                amount: 1,
                currency: zapTokenBsc.address
            })).to.be.revertedWith('Market: Ask invalid for share splitting')

        });

        it("Should reject if the bid shares haven't been set yet", async () => {

            await expect(zapMarket.connect(signers[1]).setAsk(1, ask)).to.be.revertedWith(
                'Market: Invalid bid shares for token'
            )

        });

    })

    describe("#setBid", () => {

        const bid = {
            amount: 100,
            currency: '',
            bidder: '',
            recipient: '',
            spender: '',
            sellOnShare: {
                value: BigInt(10000000000000000000)
            }
        };
        let zapMedia1: any

        beforeEach(async () => {


            const marketFixture = await deployments.fixture(['ZapMarket'])

            zapMarket = await ethers.getContractAt("ZapMarket", marketFixture.ZapMarket.address)

            const mediaFactory = await ethers.getContractFactory("ZapMedia", signers[1]);

            zapMedia1 = (await mediaFactory.deploy("TEST MEDIA 1", "TM1", zapMarket.address))

            await zapMedia1.deployed();

            const zapTokenFactory = await ethers.getContractFactory(
                'ZapTokenBSC',
                signers[0]
            );

            zapTokenBsc = (await zapTokenFactory.deploy()) as ZapTokenBSC;
            await zapTokenBsc.deployed();

            bid.currency = zapTokenBsc.address
            bid.bidder = signers[7].address
            bid.recipient = signers[8].address
            bid.spender = signers[9].address

        })

        it('should revert if not called by the media contract', async () => {

            await expect(zapMarket.connect(signers[4]).setBid(1, bid, bid.spender)).to.
                be.revertedWith(
                    'Market: Only media contract'
                )


        });

        it('Should revert if the bidder does not have a high enough allowance for their bidding currency', async () => {

            await zapTokenBsc.mint(zapTokenBsc.address, 100000)

            await zapMarket.connect(signers[1]).setBid(1, bid, bid.spender)

        });

        it('Should revert if the bid currency is 0 address', async () => {

            await zapMarket.connect(signers[1]).setBidShares(1, bidShares1);

            await zapTokenBsc.mint(bid.bidder, bid.amount);

            await zapTokenBsc.connect(signers[0]).approve(bid.bidder, bid.amount)

            bid.currency = '0x0000000000000000000000000000000000000000';

            await expect(zapMarket.connect(signers[1]).setBid(1, bid, bid.spender)).to.be.revertedWith(
                'Market: bid currency cannot be 0 address'
            )

        });

        it('Should revert if the bid recipient is 0 address', async () => {

            await zapMarket.connect(signers[1]).setBidShares(1, bidShares1);

            await zapTokenBsc.mint(bid.bidder, bid.amount);

            await zapTokenBsc.connect(signers[0]).approve(bid.bidder, bid.amount)

            bid.recipient = '0x0000000000000000000000000000000000000000';

            await expect(zapMarket.connect(signers[1]).setBid(1, bid, bid.spender)).to.be.revertedWith(
                'Market: bid recipient cannot be 0 address'
            )

        });

        it('Should revert if the bidder bids 0 tokens', async () => {

            await zapMarket.connect(signers[1]).setBidShares(1, bidShares1);

            await zapTokenBsc.mint(bid.bidder, bid.amount);

            await zapTokenBsc.connect(signers[0]).approve(bid.bidder, bid.amount)

            bid.amount = 0

            await expect(zapMarket.connect(signers[1]).setBid(1, bid, bid.spender)).to.be.revertedWith(
                'Market: cannot bid amount of 0'
            )

        });

        it('should accept a valid bid', async () => {

            bid.amount = 100

            await zapMarket.connect(signers[1]).setBidShares(1, bidShares1);

            await zapTokenBsc.mint(bid.bidder, bid.amount);

            await zapTokenBsc.connect(signers[0]).approve(bid.bidder, bid.amount)

            const beforeBalance = await zapTokenBsc.balanceOf(bid.bidder)

            await zapMarket.connect(signers[1]).setBid(1, bid, bid.spender)
        })

    });

})