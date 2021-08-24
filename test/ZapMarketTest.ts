import { deployments, ethers } from "hardhat"

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';

import { ZapTokenBSC } from '../typechain/ZapTokenBSC';

import { sha256 } from 'ethers/lib/utils'
import { BigNumber, Bytes } from 'ethers'

import { ZapMedia } from '../typechain/ZapMedia';

import { ZapMarket } from '../typechain/ZapMarket'


chai.use(solidity);

type MediaData = {
    tokenURI: string;
    metadataURI: string;
    contentHash: Bytes;
    metadataHash: Bytes;
};

let tokenURI = 'www.example.com';
let metadataURI = 'www.example2.com';
let contentHashBytes: Bytes;
let metadataHashBytes: Bytes;

let mint_tx1: any;
let mint_tx2: any;

describe("ZapMarket Test", () => {

    beforeEach(async () => {
        signers = await ethers.getSigners()
        
        const zapTokenFactory = await ethers.getContractFactory(
                        'ZapTokenBSC',
                        signers[0]
                    );
        
        zapTokenBsc = (await zapTokenFactory.deploy()) as ZapTokenBSC;
        await zapTokenBsc.deployed();
    });

    let zapMarket: any
    let zapMedia1: any
    let zapMedia2: any
    let zapTokenBsc: any
    let signers: any

    let bidShares1 = {

        prevOwner: {
            value: BigNumber.from("10000000000000000000")
        },
        owner: {
            value: BigNumber.from("80000000000000000000")
        },
        creator: {
            value: BigNumber.from("10000000000000000000")
        },
    };

    let bidShares2 = {

        prevOwner: {
            value: BigNumber.from("15000000000000000000")
        },
        owner: {
            value: BigNumber.from("70000000000000000000")
        },
        creator: {
            value: BigNumber.from("15000000000000000000")
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

    let ask1 = {
        amount: 100,
        currency: '',
        sellOnShare: 0
    }

    let ask2 = {
        amount: 200,
        currency: '',
        sellOnShare: 0
    }

    describe("Configure", () => {

        beforeEach(async () => {

            const marketFixture = await deployments.fixture(['ZapMarket'])

            zapMarket = await ethers.getContractAt("ZapMarket", marketFixture.ZapMarket.address)


            const mediaFactory = await ethers.getContractFactory("ZapMedia", signers[1]);

            zapMedia1 = (await mediaFactory.deploy("TEST MEDIA 1", "TM1", zapMarket.address)) as ZapMedia

            await zapMedia1.deployed();

            const mediaFactory2 = await ethers.getContractFactory("ZapMedia", signers[2]);

            zapMedia2 = (await mediaFactory2.deploy("TEST MEDIA 2", "TM2", zapMarket.address)) as ZapMedia

            await zapMedia2.deployed();

            ask1.currency = zapTokenBsc.address

            let metadataHex = ethers.utils.formatBytes32String('{}');
            let metadataHash = await sha256(metadataHex);
            metadataHashBytes = ethers.utils.arrayify(metadataHash);

            let contentHex = ethers.utils.formatBytes32String('invert');
            let contentHash = await sha256(contentHex);
            contentHashBytes = ethers.utils.arrayify(contentHash);

        })

        it('Should get media owner', async () => {

            const zapMedia1Address = await zapMarket.mediaContract(zapMedia1.address);

            const zapMedia2Address = await zapMarket.mediaContract(zapMedia2.address);

            expect(await zapMedia1Address).to.equal(signers[1].address);

            expect(await zapMedia2Address).to.equal(signers[2].address);

        });

        it('Should reject if called twice', async () => {

            await expect(zapMarket.configure(zapMedia1.address))
                .to.be.revertedWith("Market: Already configured");

            await expect(zapMarket.configure(zapMedia2.address))
                .to.be.revertedWith("Market: Already configured");

            expect(await zapMarket.isConfigured(zapMedia1.address)).to.be.true

            expect(await zapMarket.isConfigured(zapMedia2.address)).to.be.true

        });
    })

    describe('#setBidShares', () => {

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

            ask1.currency = zapTokenBsc.address

            let metadataHex = ethers.utils.formatBytes32String('{}');
            let metadataHashRaw = await sha256(metadataHex);
            metadataHashBytes = ethers.utils.arrayify(metadataHashRaw);

            let contentHex = ethers.utils.formatBytes32String('invert');
            let contentHashRaw = await sha256(contentHex);
            contentHashBytes = ethers.utils.arrayify(contentHashRaw);

            let contentHash = contentHashBytes;
            let metadataHash = metadataHashBytes;
            
            const data: MediaData = {
                tokenURI,
                metadataURI,
                contentHash,
                metadataHash,
            };

            mint_tx1 = await zapMedia1.connect(signers[1]).mint(data, bidShares1);
            mint_tx2 = await zapMedia2.connect(signers[2]).mint(data, bidShares2);

        })

        it('Should reject if not called by the media address', async () => {

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

        it('Should set the bid shares if called by the media address', async () => {

            const sharesForToken1 = await zapMarket.bidSharesForToken(zapMedia1.address, 0);

            const sharesForToken2 = await zapMarket.bidSharesForToken(zapMedia2.address, 0);

            expect(BigInt(parseInt(sharesForToken1.prevOwner.value))).to.be.equal(bidShares1.prevOwner.value);

            expect(BigInt(parseInt(sharesForToken1.creator.value))).to.be.equal(bidShares1.creator.value);

            expect(BigInt(parseInt(sharesForToken1.owner.value))).to.be.equal(bidShares1.owner.value);

            expect(BigInt(parseInt(sharesForToken2.prevOwner.value))).to.be.equal(bidShares2.prevOwner.value);

            expect(BigInt(parseInt(sharesForToken2.creator.value))).to.be.equal(bidShares2.creator.value);

            expect(BigInt(parseInt(sharesForToken2.owner.value))).to.be.equal(bidShares2.owner.value);

        })

        it('Should emit an event when bid shares are updated', async () => {

            const receipt1 = await mint_tx1.wait();

            const eventLog1 = receipt1.events[0];

            const receipt2 = await mint_tx2.wait();

            const eventLog2 = receipt2.events[0];

            console.log(receipt1.events);

            expect(eventLog1.event).to.be.equal('Transfer');

            expect(eventLog1.args.tokenId.toNumber()).to.be.equal(0);

            expect(eventLog2.event).to.be.equal('Transfer');

            expect(eventLog2.args.tokenId.toNumber()).to.be.equal(0);

        });

        it('Should reject if the bid shares are invalid', async () => {

            let metadataHex = ethers.utils.formatBytes32String('{tool: box}');
            let metadataHashRaw = await sha256(metadataHex);
            metadataHashBytes = ethers.utils.arrayify(metadataHashRaw);

            let contentHex = ethers.utils.formatBytes32String('re-invert');
            let contentHashRaw = await sha256(contentHex);
            contentHashBytes = ethers.utils.arrayify(contentHashRaw);

            let contentHash = contentHashBytes;
            let metadataHash = metadataHashBytes;
            
            const data: MediaData = {
                tokenURI,
                metadataURI,
                contentHash,
                metadataHash,
            };


            await expect(zapMedia1.connect(signers[1]).mint(data, invalidBidShares)).to.
                be.revertedWith(
                    'Market: Invalid bid shares, must sum to 100'
                )
        });
    })

    describe("#setAsk", () => {

        beforeEach(async () => {

            const marketFixture = await deployments.fixture(['ZapMarket'])

            zapMarket = await ethers.getContractAt("ZapMarket", marketFixture.ZapMarket.address)


            const mediaFactory = await ethers.getContractFactory("ZapMedia", signers[1]);

            zapMedia1 = (await mediaFactory.deploy("TEST MEDIA 1", "TM1", zapMarket.address))

            await zapMedia1.deployed();

            const mediaFactory2 = await ethers.getContractFactory("ZapMedia", signers[2]);

            zapMedia2 = (await mediaFactory2.deploy("TEST MEDIA 2", "TM2", zapMarket.address))

            await zapMedia2.deployed();

            ask1.currency = zapTokenBsc.address
            ask2.currency = zapTokenBsc.address

            let metadataHex = ethers.utils.formatBytes32String('{}');
            let metadataHashRaw = await sha256(metadataHex);
            metadataHashBytes = ethers.utils.arrayify(metadataHashRaw);

            let contentHex = ethers.utils.formatBytes32String('invert');
            let contentHashRaw = await sha256(contentHex);
            contentHashBytes = ethers.utils.arrayify(contentHashRaw);

            let contentHash = contentHashBytes;
            let metadataHash = metadataHashBytes;
            
            const data: MediaData = {
                tokenURI,
                metadataURI,
                contentHash,
                metadataHash,
            };

            mint_tx1 = await zapMedia1.connect(signers[1]).mint(data, bidShares1);
            mint_tx2 = await zapMedia2.connect(signers[2]).mint(data, bidShares2);

        })

        it('Should reject if not called by the media address', async () => {

            await expect(zapMarket.connect(signers[5]).setAsk(zapMedia1.address, 1, ask1))
                .to.be.revertedWith(
                    'Market: Only media contract'
                )

            await expect(zapMarket.connect(signers[5]).setAsk(zapMedia2.address, 1, ask1))
                .to.be.revertedWith(
                    'Market: Only media contract'
                )
        });

        it('Should set the ask if called by the media address', async () => {

            await zapMedia1.connect(signers[1]).setAsk(
                0,
                ask1
            );

            await zapMedia2.connect(signers[2]).setAsk(
                0,
                ask2
            )

            const getAsk1 = await zapMarket.currentAskForToken(zapMedia1.address, 0);

            const getAsk2 = await zapMarket.currentAskForToken(zapMedia2.address, 0);

            expect(getAsk1.amount.toNumber()).to.equal(ask1.amount);

            expect(getAsk2.amount.toNumber()).to.equal(ask2.amount);

            expect(getAsk1.currency).to.equal(zapTokenBsc.address);

        });

        it('Should emit an event if the ask is updated', async () => {

            await zapMarket.connect(signers[1]).setBidShares(
                zapMedia1.address,
                1,
                bidShares1
            );

            await zapMarket.connect(signers[2]).setBidShares(
                zapMedia2.address,
                1,
                bidShares2
            );

            const askTx1 = await zapMarket.connect(signers[1]).setAsk(
                zapMedia1.address,
                1,
                ask1
            );

            const askTx2 = await zapMarket.connect(signers[2]).setAsk(
                zapMedia2.address,
                1,
                ask2
            );

            const receipt1 = await askTx1.wait();

            const eventLog1 = receipt1.events[0];

            const receipt2 = await askTx2.wait();

            const eventLog2 = receipt2.events[0];

            expect(eventLog1.event).to.be.equal('AskCreated');

            expect(eventLog1.args.tokenId.toNumber()).to.be.equal(1);

            expect(eventLog1.args.ask.amount.toNumber()).to.be.equal(ask1.amount);

            expect(eventLog1.args.ask.currency).to.be.equal(zapTokenBsc.address);

            expect(eventLog2.event).to.be.equal('AskCreated');

            expect(eventLog2.args.tokenId.toNumber()).to.be.equal(1);

            expect(eventLog2.args.ask.amount.toNumber()).to.be.equal(ask2.amount);

            expect(eventLog2.args.ask.currency).to.be.equal(zapTokenBsc.address);

        });

        it('Should reject if the ask is too low', async () => {

            await zapMarket.connect(signers[1]).setBidShares(
                zapMedia1.address,
                1,
                bidShares1
            );

            await zapMarket.connect(signers[2]).setBidShares(
                zapMedia2.address,
                1,
                bidShares2
            );

            await expect(zapMarket.connect(signers[1]).setAsk(
                zapMedia1.address,
                1,
                {
                    amount: 1,
                    currency: zapTokenBsc.address
                }))
                .to.be.revertedWith('Market: Ask invalid for share splitting')

            await expect(zapMarket.connect(signers[2]).setAsk(
                zapMedia2.address,
                1,
                {
                    amount: 13,
                    currency: zapTokenBsc.address
                }))
                .to.be.revertedWith('Market: Ask invalid for share splitting')

        });

        it("Should reject if the bid shares haven't been set yet", async () => {

            await expect(zapMarket.connect(signers[1]).setAsk(
                zapMedia1.address,
                1,
                ask1
            )).to.be.revertedWith(
                'Market: Invalid bid shares for token'
            );

            await expect(zapMarket.connect(signers[2]).setAsk(
                zapMedia2.address,
                1,
                ask1
            )).to.be.revertedWith(
                'Market: Invalid bid shares for token'
            );

        });

    })

    describe("#setBid", () => {

        let bid1: any;
        let bid2: any;

        beforeEach(async () => {

            const marketFixture = await deployments.fixture(['ZapMarket'])

            zapMarket = await ethers.getContractAt("ZapMarket", marketFixture.ZapMarket.address)

            const mediaFactory = await ethers.getContractFactory("ZapMedia", signers[1]);

            zapMedia1 = (await mediaFactory.deploy("TEST MEDIA 1", "TM1", zapMarket.address)) as ZapMedia

            await zapMedia1.deployed();

            const mediaFactory2 = await ethers.getContractFactory("ZapMedia", signers[2]);

            zapMedia2 = (await mediaFactory2.deploy("TEST MEDIA 2", "TM2", zapMarket.address)) as ZapMedia

            await zapMedia2.deployed();

            const zapTokenFactory = await ethers.getContractFactory(
                'ZapTokenBSC',
                signers[0]
            );

            zapTokenBsc = (await zapTokenFactory.deploy())
            await zapTokenBsc.deployed();

            bid1 = {
                amount: 100,
                currency: zapTokenBsc.address,
                bidder: signers[1].address,
                recipient: signers[8].address,
                spender: signers[1].address,
                sellOnShare: {
                    value: BigInt(10000000000000000000)
                }
            };

            bid2 = {
                amount: 200,
                currency: zapTokenBsc.address,
                bidder: signers[2].address,
                recipient: signers[9].address,
                spender: signers[2].address,
                sellOnShare: {
                    value: BigInt(10000000000000000000)
                }
            };

        })

        it('Should revert if not called by the media contract', async () => {

            await expect(zapMarket.connect(signers[4]).setBid(
                zapMedia1.address,
                1,
                bid1,
                bid1.spender
            )).to.be.revertedWith(
                'Market: Only media contract'
            )

            await expect(zapMarket.connect(signers[5]).setBid(
                zapMedia2.address,
                1,
                bid1,
                bid1.spender
            )).to.be.revertedWith(
                'Market: Only media contract'
            )

        });

        it('Should revert if the bidder does not have a high enough allowance for their bidding currency', async () => {

            await zapTokenBsc.mint(signers[1].address, bid1.amount);
            await zapTokenBsc.mint(signers[2].address, bid2.amount);

            await zapTokenBsc.connect(signers[1]).approve(zapMarket.address, bid1.amount - 1);
            await zapTokenBsc.connect(signers[2]).approve(zapMarket.address, bid2.amount - 1);

            await expect(zapMarket.connect(signers[1]).setBid(
                zapMedia1.address,
                1,
                bid1,
                bid1.spender
            )).to.be.revertedWith('SafeERC20: low-level call failed');

            await expect(zapMarket.connect(signers[2]).setBid(
                zapMedia2.address,
                1,
                bid2,
                bid2.spender
            )).to.be.revertedWith('SafeERC20: low-level call failed');

        });

        it('Should revert if the bidder does not have enough tokens to bid with', async () => {

            await zapTokenBsc.mint(signers[1].address, bid1.amount - 1);
            await zapTokenBsc.mint(signers[2].address, bid2.amount - 1);

            await zapTokenBsc.connect(signers[1]).approve(zapMarket.address, bid1.amount);
            await zapTokenBsc.connect(signers[2]).approve(zapMarket.address, bid2.amount);

            await expect(zapMarket.connect(signers[1]).setBid(
                zapMedia1.address,
                1,
                bid1,
                bid1.spender
            )).to.be.revertedWith('SafeERC20: low-level call failed')

            await expect(zapMarket.connect(signers[2]).setBid(
                zapMedia2.address,
                1,
                bid2,
                bid2.spender
            )).to.be.revertedWith('SafeERC20: low-level call failed')

        });

        it('Should revert if the bid currency is 0 address', async () => {

            await zapMarket.connect(signers[1]).setBidShares(
                zapMedia1.address,
                1,
                bidShares1
            );

            await zapMarket.connect(signers[2]).setBidShares(
                zapMedia2.address,
                1,
                bidShares2
            );

            await zapTokenBsc.mint(bid1.bidder, bid1.amount);
            await zapTokenBsc.mint(bid2.bidder, bid2.amount);

            await zapTokenBsc.connect(signers[0]).approve(bid1.bidder, bid1.amount);
            await zapTokenBsc.connect(signers[0]).approve(bid2.bidder, bid2.amount)

            bid1.currency = '0x0000000000000000000000000000000000000000';
            bid2.currency = '0x0000000000000000000000000000000000000000';

            await expect(zapMarket.connect(signers[1]).setBid(
                zapMedia1.address,
                1,
                bid1,
                bid1.spender
            )).to.be.revertedWith(
                'Market: bid currency cannot be 0 address'
            )

            await expect(zapMarket.connect(signers[2]).setBid(
                zapMedia2.address,
                1,
                bid2,
                bid2.spender
            )).to.be.revertedWith(
                'Market: bid currency cannot be 0 address'
            )

        });

        it('Should revert if the bid recipient is 0 address', async () => {

            await zapTokenBsc.mint(signers[1].address, bid1.amount);
            await zapTokenBsc.mint(signers[2].address, bid2.amount);

            await zapTokenBsc.connect(signers[1]).approve(zapMarket.address, bid1.amount - 1);
            await zapTokenBsc.connect(signers[2]).approve(zapMarket.address, bid2.amount - 1);

            bid1.recipient = '0x0000000000000000000000000000000000000000';
            bid2.recipient = '0x0000000000000000000000000000000000000000';

            await expect(zapMarket.connect(signers[1]).setBid(
                zapMedia1.address,
                1,
                bid1,
                bid1.spender
            )).to.be.revertedWith(
                'Market: bid recipient cannot be 0 address'
            )

            await expect(zapMarket.connect(signers[2]).setBid(
                zapMedia2.address,
                1,
                bid2,
                bid2.spender
            )).to.be.revertedWith(
                'Market: bid recipient cannot be 0 address'
            )

        });

        it('Should revert if the bidder bids 0 tokens', async () => {

            await zapTokenBsc.mint(signers[1].address, bid1.amount);
            await zapTokenBsc.mint(signers[2].address, bid2.amount);

            await zapTokenBsc.connect(signers[1]).approve(zapMarket.address, bid1.amount);
            await zapTokenBsc.connect(signers[2]).approve(zapMarket.address, bid2.amount);

            bid1.amount = 0
            bid2.amount = 0

            await expect(zapMarket.connect(signers[1]).setBid(
                zapMedia1.address,
                1,
                bid1,
                bid1.spender
            )).to.be.revertedWith(
                'Market: cannot bid amount of 0'
            )

            await expect(zapMarket.connect(signers[2]).setBid(
                zapMedia2.address,
                1,
                bid2,
                bid2.spender
            )).to.be.revertedWith(
                'Market: cannot bid amount of 0'
            )

        });

        it('Should accept a valid bid', async () => {

            await zapTokenBsc.mint(signers[1].address, bid1.amount);
            await zapTokenBsc.mint(signers[2].address, bid2.amount);

            await zapTokenBsc.connect(signers[1]).approve(zapMarket.address, bid1.amount);
            await zapTokenBsc.connect(signers[2]).approve(zapMarket.address, bid2.amount);

            await zapMarket.connect(signers[1]).setBidShares(zapMedia1.address, 1, bidShares1);
            await zapMarket.connect(signers[2]).setBidShares(zapMedia2.address, 1, bidShares2);

            const beforeBalance1 = await zapTokenBsc.balanceOf(bid1.bidder);
            const beforeBalance2 = await zapTokenBsc.balanceOf(bid2.bidder)

            await zapMarket.connect(signers[1]).setBid(
                zapMedia1.address,
                1,
                bid1,
                bid1.spender
            );

            await zapMarket.connect(signers[2]).setBid(
                zapMedia2.address,
                1,
                bid2,
                bid2.spender
            );

            const afterBalance1 = await zapTokenBsc.balanceOf(bid1.bidder);
            const afterBalance2 = await zapTokenBsc.balanceOf(bid2.bidder);

            const getBid1 = await zapMarket.bidForTokenBidder(
                zapMedia1.address,
                1,
                bid1.bidder
            );

            const getBid2 = await zapMarket.bidForTokenBidder(
                zapMedia2.address,
                1,
                bid2.bidder
            );

            expect(getBid1.currency).to.equal(zapTokenBsc.address);

            expect(getBid1.amount.toNumber()).to.equal(bid1.amount);

            expect(getBid1.bidder).to.equal(bid1.bidder);

            expect(beforeBalance1.toNumber()).to.equal(afterBalance1.toNumber() + bid1.amount);

            expect(getBid2.currency).to.equal(zapTokenBsc.address);

            expect(getBid2.amount.toNumber()).to.equal(bid2.amount);

            expect(getBid2.bidder).to.equal(bid2.bidder);

            expect(beforeBalance2.toNumber()).to.equal(afterBalance2.toNumber() + bid2.amount);

        })

        it('Should accept a valid bid larger than the min bid', async () => {

            await zapMarket.connect(signers[1]).setBidShares(zapMedia1.address, 1, bidShares1);
            await zapMarket.connect(signers[2]).setBidShares(zapMedia2.address, 1, bidShares2);

            const largerBid1 = {
                amount: 1000,
                currency: zapTokenBsc.address,
                bidder: signers[1].address,
                recipient: signers[8].address,
                spender: signers[1].address,
                sellOnShare: {
                    value: BigInt(10000000000000000000)
                }
            };

            const largerBid2 = {
                amount: 2000,
                currency: zapTokenBsc.address,
                bidder: signers[2].address,
                recipient: signers[9].address,
                spender: signers[2].address,
                sellOnShare: {
                    value: BigInt(10000000000000000000)
                }
            };

            await zapTokenBsc.mint(signers[1].address, largerBid1.amount);
            await zapTokenBsc.mint(signers[2].address, largerBid2.amount);

            await zapTokenBsc.connect(signers[1]).approve(zapMarket.address, largerBid1.amount);
            await zapTokenBsc.connect(signers[2]).approve(zapMarket.address, largerBid2.amount);

            await zapTokenBsc.connect(signers[1]).approve(zapMarket.address, largerBid1.amount);
            await zapTokenBsc.connect(signers[2]).approve(zapMarket.address, largerBid2.amount);

            const beforeBalance1 = await zapTokenBsc.balanceOf(largerBid1.bidder);
            const beforeBalance2 = await zapTokenBsc.balanceOf(largerBid2.bidder);

            await zapMarket.connect(signers[1]).setBid(
                zapMedia1.address,
                1,
                largerBid1,
                largerBid1.spender
            );

            await zapMarket.connect(signers[2]).setBid(
                zapMedia2.address,
                1,
                largerBid2,
                largerBid2.spender
            );

            const afterBalance1 = await zapTokenBsc.balanceOf(largerBid1.bidder);
            const afterBalance2 = await zapTokenBsc.balanceOf(largerBid2.bidder);

            const getBid1 = await zapMarket.bidForTokenBidder(
                zapMedia1.address,
                1,
                largerBid1.bidder
            );

            const getBid2 = await zapMarket.bidForTokenBidder(
                zapMedia2.address,
                1,
                largerBid2.bidder
            );

            expect(getBid1.currency).to.equal(zapTokenBsc.address);

            expect(getBid1.amount.toNumber()).to.equal(largerBid1.amount);

            expect(getBid1.bidder).to.equal(largerBid1.bidder);

            expect(beforeBalance1.toNumber()).to.equal(afterBalance1.toNumber() + largerBid1.amount);

            expect(getBid2.currency).to.equal(zapTokenBsc.address);

            expect(getBid2.amount.toNumber()).to.equal(largerBid2.amount);

            expect(getBid2.bidder).to.equal(largerBid2.bidder);

            expect(beforeBalance2.toNumber()).to.equal(afterBalance2.toNumber() + largerBid2.amount);

        });

        it('Should refund the original bid if the bidder bids again', async () => {

            await zapTokenBsc.mint(signers[1].address, 5000);
            await zapTokenBsc.mint(signers[2].address, 5000);

            await zapTokenBsc.connect(signers[1]).approve(zapMarket.address, 10000);
            await zapTokenBsc.connect(signers[2]).approve(zapMarket.address, 10000);

            await zapMarket.connect(signers[1]).setBidShares(zapMedia1.address, 1, bidShares1);
            await zapMarket.connect(signers[2]).setBidShares(zapMedia2.address, 1, bidShares2);

            const bidderBal1 = await zapTokenBsc.balanceOf(bid1.bidder);

            const bidderBal2 = await zapTokenBsc.balanceOf(bid2.bidder);

            await zapMarket.connect(signers[1]).setBid(
                zapMedia1.address,
                1,
                bid1,
                bid1.spender
            );

            await zapMarket.connect(signers[2]).setBid(
                zapMedia2.address,
                1,
                bid2,
                bid2.spender
            );

            bid1.amount = bid1.amount * 2
            bid2.amount = bid2.amount * 2

            await zapMarket.connect(signers[1]).setBid(
                zapMedia1.address,
                1,
                bid1,
                bid1.spender
            );

            await zapMarket.connect(signers[2]).setBid(
                zapMedia2.address,
                1,
                bid2,
                bid2.spender
            );

            const afterBalance1 = await zapTokenBsc.balanceOf(bid1.bidder);

            const afterBalance2 = await zapTokenBsc.balanceOf(bid2.bidder);

            expect(afterBalance1.toNumber()).to.equal(bidderBal1.toNumber() - bid1.amount);
            expect(afterBalance2.toNumber()).to.equal(bidderBal2.toNumber() - bid2.amount);

        })

        it('Should emit a bid event', async () => {

            await zapTokenBsc.mint(signers[1].address, 5000);
            await zapTokenBsc.mint(signers[2].address, 5000);

            await zapTokenBsc.connect(signers[1]).approve(zapMarket.address, 10000);
            await zapTokenBsc.connect(signers[2]).approve(zapMarket.address, 10000);

            await zapMarket.connect(signers[1]).setBidShares(zapMedia1.address, 1, bidShares1);
            await zapMarket.connect(signers[2]).setBidShares(zapMedia2.address, 1, bidShares2);

            const setBid1 = await zapMarket.connect(signers[1]).setBid(
                zapMedia1.address,
                1,
                bid1,
                bid1.spender
            );

            const setBid2 = await zapMarket.connect(signers[2]).setBid(
                zapMedia2.address,
                1,
                bid2,
                bid2.spender
            );

            const receipt1 = await setBid1.wait()

            const receipt2 = await setBid2.wait()

            const eventLog1 = receipt1.events[1]

            const eventLog2 = receipt2.events[1]

            expect(eventLog1.event).to.be.equal('BidCreated');

            expect(eventLog1.args.tokenId).to.equal(1);

            expect(eventLog1.args.bid.amount.toNumber()).to.equal(bid1.amount);

            expect(eventLog1.args.bid.currency).to.equal(bid1.currency);

            expect(eventLog2.event).to.be.equal('BidCreated');

            expect(eventLog2.args.tokenId).to.equal(1);

            expect(eventLog2.args.bid.amount.toNumber()).to.equal(bid2.amount);

            expect(eventLog2.args.bid.currency).to.equal(bid2.currency);


        });

    });

})