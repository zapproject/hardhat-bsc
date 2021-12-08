import { ethers, upgrades, deployments, getNamedAccounts, } from 'hardhat';

import { BigNumber, ContractFactory, Event, EventFilter } from 'ethers';

import { ZapMarket, ZapMedia, Creature, MockProxyRegistry, ZapVault, ZapMarketV2, NewProxyAdmin, MediaFactory, MediaFactoryV2, ZapTokenBSC } from '../typechain';

import { getProxyAdminFactory } from '@openzeppelin/hardhat-upgrades/dist/utils';

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';
import { sign } from 'crypto';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe("Testing", () => {

    let signers: SignerWithAddress[]
    let zapTokenBsc: ZapTokenBSC
    let zapVault: ZapVault
    let zapMarket: ZapMarket
    let zapMarketFactory: any
    let zapMediaFactory: any
    let mediaFactoryFactory: any
    let mediaImpl: ZapMedia;
    let mediaFactory: MediaFactory
    let zapMedia: ZapMedia
    let zapMarketV2: ZapMarketV2
    let proxy: MockProxyRegistry
    let osCreature: Creature

    const name = 'Zap Collection';
    const symbol = 'ZAP';
    const contractURI = 'https://bafybeiev76hwk2gu7xmy5h3dn2f6iquxkhu4dhwpjgmt6ookrn6ykbtfi4.ipfs.dweb.link/';

    let tokenURI = 'https://bafybeiev76hwk2gu7xmy5h3dn2f6iquxkhu4dhwpjgmt6ookrn6ykbtfi4.ipfs.dweb.link/rinkeby'
    let metadataURI = 'https://bafybeiev76hwk2gu7xmy5h3dn2f6iquxkhu4dhwpjgmt6ookrn6ykbtfi4.ipfs.dweb.link/rinkeby'

    let metadataHex = ethers.utils.formatBytes32String('Testing');
    let metadataHashRaw = ethers.utils.keccak256(metadataHex);
    let metadataHashBytes = ethers.utils.arrayify(metadataHashRaw);

    let contentHex = ethers.utils.formatBytes32String('Testing');
    let contentHashRaw = ethers.utils.keccak256(contentHex);
    let contentHashBytes = ethers.utils.arrayify(contentHashRaw);

    let contentHash = contentHashBytes;
    let metadataHash = metadataHashBytes;

    const data = {
        tokenURI,
        metadataURI,
        contentHash,
        metadataHash
    };

    let bidShares = {
        collaborators: ["", "", ""],
        collabShares: [
            BigNumber.from('15000000000000000000'),
            BigNumber.from('15000000000000000000'),
            BigNumber.from('15000000000000000000')
        ],
        creator: {
            value: BigNumber.from('15000000000000000000')
        },
        owner: {
            value: BigNumber.from('35000000000000000000')
        },
    };

    let ask = {
        amount: 100,
        currency: '',
        sellOnShare: 0
    };



    let mediaFactoryV2: MediaFactoryV2

    beforeEach(async () => {

        signers = await ethers.getSigners();

        // Gets the deployed NFT contract fixtures from the 
        await deployments.fixture();

        // Gets the ZapTokenBSC contract deployment
        const zapTokenBscFactory = await deployments.get('ZapTokenBSC');

        // Gets the ZapVault contract deployment
        const zapVaultFactory = await deployments.get('ZapVault');

        // Gets the ZapMarket contract deployment
        zapMarketFactory = await deployments.get('ZapMarket');

        // Gets the MediaFactory contract deployment
        mediaFactoryFactory = await deployments.get('MediaFactory');

        // Gets the ZapMedia implementation deployment
        zapMediaFactory = await deployments.get('ZapMedia');

        // Deploy NewProxyAdmin contract
        const newProxyAdminFactory = await ethers.getContractFactory("NewProxyAdmin", signers[0]);
        const newProxyAdmin = await newProxyAdminFactory.deploy() as NewProxyAdmin;
        await newProxyAdmin.deployed();

        const defaultProxyAdminDeployment = await deployments.get('DefaultProxyAdmin');

        const defaultProxyAdmin = new ethers.Contract(
            defaultProxyAdminDeployment.address,
            defaultProxyAdminDeployment.abi,
            signers[0]
        );

        zapTokenBsc = await ethers.getContractAt(
            'ZapTokenBSC',
            zapTokenBscFactory.address,
            signers[0]
        ) as ZapTokenBSC;

        zapVault = await ethers.getContractAt(
            'ZapVault',
            zapVaultFactory.address,
            signers[0]
        ) as ZapVault;

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

        // Deploy ZapMedia
        await mediaFactory.deployMedia(
            name,
            symbol,
            zapMarket.address,
            true,
            contractURI,
        );

        // Filter for the MediaDeployed event
        const filter = mediaFactory.filters.MediaDeployed(null);

        // Query for the MediaDeployed event
        const event = (await mediaFactory.queryFilter(filter))[0];

        // Store the zapMedia address
        const mediaAddress = event.args.mediaContract;

        // ZapMedia contract instance
        zapMedia = new ethers.Contract(mediaAddress, zapMediaFactory.abi, signers[0]) as ZapMedia;

        // Sets the token collaborators
        bidShares.collaborators = [signers[1].address, signers[2].address, signers[3].address];

        // Signer[0] mints a token
        // tokenId is currently 0
        await zapMedia.mint(data, bidShares);

        ask.currency = zapTokenBsc.address;

        await zapMedia.setAsk(
            0,
            ask
        );

        const proxyFactory = await ethers.getContractFactory(
            'MockProxyRegistry',
            signers[0]
        )

        proxy = (await proxyFactory.deploy()) as MockProxyRegistry;
        await proxy.deployed();

        await proxy.setProxy(signers[0].address, signers[0].address);
        const oscreatureFactory = await ethers.getContractFactory(
            'Creature',
            signers[0]
        )

        osCreature = (await oscreatureFactory.deploy(proxy.address)) as Creature;
        await osCreature.deployed();

        await osCreature.mintTo(signers[0].address);

        //*****************************************************************************
        //  UPGRADING TO ZapMarketV2 & MediaFactoryV2
        //*****************************************************************************

        const ZapMarketV2 = await ethers.getContractFactory('ZapMarketV2', signers[0]);
        const MediaFactoryV2 = await ethers.getContractFactory('MediaFactoryV2', signers[0]);

        const proxyAdmin = await upgrades.erc1967.getAdminAddress(zapMarketFactory.address);

        await deployments.deploy('ZapMarket', {
            from: signers[0].address,
            contract: "ZapMarketV2",
            proxy: {
                proxyContract: 'OpenZeppelinTransparentProxy',
            },
            log: true,
        })

        await deployments.deploy('MediaFactory', {
            from: signers[0].address,
            contract: "MediaFactoryV2",
            proxy: {
                proxyContract: 'OpenZeppelinTransparentProxy',
            },
            log: true,
        })

        zapMarketV2 = new ethers.Contract(
            zapMarketFactory.address, ZapMarketV2.interface, signers[0]
        ) as ZapMarketV2;

        mediaFactoryV2 = new ethers.Contract(
            mediaFactoryFactory.address, MediaFactoryV2.interface, signers[0]
        ) as MediaFactoryV2

        mediaFactoryV2.configureExternalToken(
            osCreature.address,
            1,
            bidShares
        );
    })

    describe("#Upgradeablity: External NFT Initialization", () => {

        it("Should be registered to MediaFactoryV2", async () => {

            const isRegistered = await zapMarketV2.isRegistered(osCreature.address);

            expect(isRegistered).to.be.true;

        })

        it("Should be configured to ZapMarketV2", async () => {

            const isConfigured = await zapMarketV2._isConfigured(osCreature.address);

            expect(isConfigured).to.be.true;

        })

        it("Should emit a MediaContractCreated event", async () => {

            const filter: EventFilter = zapMarketV2.filters.MediaContractCreated(
                null,
                null,
                null
            );

            const event: Event = (
                await zapMarketV2.queryFilter(filter)
            )[2]

            expect(event.event).to.be.equal("MediaContractCreated");
            expect(event.args?.mediaContract).to.equal(osCreature.address);
            expect(ethers.utils.parseBytes32String(event.args?.name)).to.be.equal(await osCreature.name());
            expect(ethers.utils.parseBytes32String(event.args?.symbol)).to.be.equal(await osCreature.symbol());

        });

        it("Should emit a BidShareUpdated event", async () => {

            const filter: EventFilter = zapMarketV2.filters.BidShareUpdated(
                null,
                null,
                null
            );

            const event: Event = (
                await zapMarketV2.queryFilter(filter)
            )[1]

            expect(event.event).to.be.equal("BidShareUpdated");
            expect(event.args?.tokenId).to.be.equal(1);
            expect(event.args?.bidShares.creator.value).to.equal(bidShares.creator.value);
            expect(event.args?.bidShares.owner.value).to.equal(bidShares.owner.value);
            expect(event.args?.bidShares.collaborators).to.eql(bidShares.collaborators);
            expect(event.args?.bidShares.collabShares).to.eql(bidShares.collabShares);
            expect(event.args?.mediaContract).to.equal(osCreature.address);

        });

        it("Should revert if a non owner tries to configure an existing tokenID", async () => {

            const tokenID = await osCreature.tokenByIndex(0);

            await expect(mediaFactoryV2
                .connect(signers[11])
                .configureExternalToken(
                    osCreature.address,
                    1,
                    bidShares
                )).to.be.revertedWith('MediaFactory: Only token owner can configure to ZapMarket');
        })

        it("Should revert if there is an attempt to configure a tokenID twice", async () => {

            await expect(mediaFactoryV2
                .connect(signers[0])
                .configureExternalToken(
                    osCreature.address,
                    1,
                    bidShares
                )).to.be.revertedWith('Market: External token already configured');
        })

        it("Should revert if there is an attempt to configure a nonexistent tokenID", async () => {

            await expect(mediaFactoryV2
                .connect(signers[0])
                .configureExternalToken(
                    osCreature.address,
                    101,
                    bidShares
                )).to.be.revertedWith('ERC721: owner query for nonexistent token')
        })
    })

    describe("#setBidShares", () => {

        it("Should get the bidShares for the external NFT", async () => {

            const bidSharesForToken = await zapMarketV2.bidSharesForToken(osCreature.address, 1)

            expect(bidSharesForToken.creator.value).to.equal(bidShares.creator.value);
            expect(bidSharesForToken.owner.value).to.equal(bidShares.owner.value);

            for (var i = 0; i < bidShares.collaborators.length; i++) {

                expect(bidSharesForToken.collaborators[i]).to.equal(bidShares.collaborators[i]);
                expect(bidSharesForToken.collabShares[i]).to.equal(bidShares.collabShares[i]);

            }

        })
    })

    describe('#setAsk', () => {

        it('Should reject setAsk if not called by token owner', async () => {

            await expect(zapMarketV2.connect(signers[4]).setAsk(osCreature.address, 1, ask))
                .to.be.revertedWith('Market: Only owner of token can call this method');
        });

        it('Should set the ask if called by the owner of the token ', async () => {

            await zapMarketV2.connect(signers[0]).setAsk(
                osCreature.address,
                1,
                ask
            );

            // get ask associated with external token
            const getAsk = await zapMarketV2.currentAskForToken(osCreature.address, 1);

            expect(getAsk.amount.toNumber()).to.equal(ask.amount);
            expect(getAsk.currency).to.equal(zapTokenBsc.address);

        });

        it('Should emit an event if the ask is updated', async () => {

            await zapMarketV2.connect(signers[0]).setAsk(
                osCreature.address,
                1,
                ask
            );

            const filter: EventFilter = zapMarketV2.filters.AskCreated(
                osCreature.address,
                null,
                null
            );

            const event: Event = (
                await zapMarketV2.queryFilter(filter)
            )[0];

            expect(event.event).to.be.equal('AskCreated');
            expect(event.args?.tokenId.toNumber()).to.be.equal(1);
            expect(event.args?.ask.amount.toNumber()).to.be.equal(ask.amount);
            expect(event.args?.ask.currency).to.be.equal(zapTokenBsc.address);

        });

        it('Should reject if the ask is too low', async () => {

            await expect(
                zapMarketV2.connect(signers[0]).setAsk(osCreature.address, 1, {
                    amount: 13,
                    currency: zapTokenBsc.address
                }
                )).to.be.revertedWith('Market: Ask invalid for share splitting');

        });

        it("Should remove an ask", async () => {

            await zapMarketV2.connect(signers[0]).setAsk(
                osCreature.address,
                1,
                ask
            );

            const filter: EventFilter = zapMarketV2.filters.AskCreated(
                osCreature.address,
                null,
                null
            );

            const event: Event = (
                await zapMarketV2.queryFilter(filter)
            )[0];

            expect(event.event).to.be.equal('AskCreated');
            expect(event.args?.tokenId.toNumber()).to.be.equal(1);
            expect(event.args?.ask.amount.toNumber()).to.be.equal(ask.amount);
            expect(event.args?.ask.currency).to.be.equal(zapTokenBsc.address);

            // remove the ask that was set above
            await zapMarketV2.connect(signers[0]).removeAsk(osCreature.address, 1);

            const askRemovedFilter: EventFilter = zapMarketV2.filters.AskRemoved(
                null,
                null,
                null
            );

            const askRemovedEvent: Event = (
                await zapMarketV2.queryFilter(askRemovedFilter)
            )[0]

            expect(askRemovedEvent.event).to.be.equal('AskRemoved');
            expect(askRemovedEvent.args?.tokenId.toNumber()).to.be.equal(1);
            expect(askRemovedEvent.args?.ask.amount.toNumber()).to.be.equal(ask.amount);
            expect(askRemovedEvent.args?.ask.currency).to.be.equal(zapTokenBsc.address);
            expect(askRemovedEvent.args?.mediaContract).to.be.equal(osCreature.address);

            // since the ask was removed, we are checking that it is not zero for the ask object
            const getAsk = await zapMarketV2.currentAskForToken(osCreature.address, 1);

            expect(getAsk.amount.toNumber()).to.be.equal(0);
            expect(getAsk.currency).to.be.equal(ethers.constants.AddressZero);

        })
    });

    describe.only("#setBid", () => {

        let unAuthMedia: Creature
        let unAuthProxy: MockProxyRegistry
        let bid: any

        beforeEach(async () => {

            const proxyFactory = await ethers.getContractFactory(
                'MockProxyRegistry',
                signers[0]
            );

            unAuthProxy = (await proxyFactory.deploy()) as MockProxyRegistry;
            await unAuthProxy.deployed();

            await unAuthProxy.setProxy(signers[0].address, signers[0].address);
            const oscreatureFactory = await ethers.getContractFactory(
                'Creature',
                signers[0]
            )

            unAuthMedia = (await oscreatureFactory.deploy(unAuthProxy.address)) as Creature;
            await unAuthMedia.deployed();

            bid = {
                amount: 200,
                currency: zapTokenBsc.address,
                bidder: signers[1].address,
                recipient: signers[1].address,
                spender: signers[1].address,
                sellOnShare: {
                    value: BigInt(10000000000000000000)
                }
            };
        })

        it('Should revert if not called by the media contract', async () => {

            await zapTokenBsc.mint(bid.bidder, bid.amount);

            await zapTokenBsc.connect(signers[1]).approve(zapMarketV2.address, bid.amount - 1);

            await expect(zapMarketV2.connect(signers[1]).setBid(
                unAuthMedia.address,
                1,
                bid,
                bid.spender
            )).to.be.revertedWith('Market: Only media or AuctionHouse contract');

        });

        it('Should revert if the bidder does not have a high enough allowance for their bidding currency', async () => {

            await zapTokenBsc.mint(bid.bidder, bid.amount);

            await zapTokenBsc.connect(signers[1]).approve(zapMarketV2.address, bid.amount - 1);

            await expect(zapMarketV2.connect(signers[1]).setBid(
                osCreature.address,
                1,
                bid,
                bid.spender
            )).to.be.revertedWith('SafeERC20: low-level call failed');

        });

        it('Should revert if the bidder does not have enough tokens to bid with', async () => {

            await zapTokenBsc.mint(bid.bidder, bid.amount - 1);

            await zapTokenBsc.connect(signers[1]).approve(zapMarketV2.address, bid.amount);

            await expect(zapMarketV2.connect(signers[1]).setBid(
                osCreature.address,
                1,
                bid,
                bid.spender
            )).to.be.revertedWith('SafeERC20: low-level call failed');

        });

        it('Should revert if the bid currency is zero address', async () => {

            await zapTokenBsc.mint(bid.bidder, bid.amount);

            await zapTokenBsc.connect(signers[1]).approve(zapMarketV2.address, bid.amount);

            bid.currency = ethers.constants.AddressZero;

            await expect(
                zapMarketV2.connect(signers[1]).setBid(
                    osCreature.address,
                    1,
                    bid,
                    bid.spender
                )).to.be.revertedWith('Market: bid currency cannot be 0 address');
        });

        it('Should revert if the bid recipient is zero address', async () => {

            await zapTokenBsc.mint(bid.bidder, bid.amount);

            await zapTokenBsc
                .connect(signers[1])
                .approve(zapMarketV2.address, bid.amount);

            bid.recipient = ethers.constants.AddressZero;

            await expect(
                zapMarketV2.connect(signers[1]).setBid(
                    osCreature.address,
                    1,
                    bid,
                    bid.spender
                )).to.be.revertedWith('Market: bid recipient cannot be 0 address');
        });

        it('Should revert if the bidder bids 0 tokens', async () => {

            await zapTokenBsc.mint(bid.bidder, bid.amount);

            await zapTokenBsc
                .connect(signers[1])
                .approve(zapMarketV2.address, bid.amount);

            bid.amount = 0;

            await expect(
                zapMarketV2.connect(signers[1]).setBid(
                    osCreature.address,
                    1,
                    bid,
                    bid.spender
                )).to.be.revertedWith('Market: cannot bid amount of 0');

        });

        it('Should set a valid bid', async () => {

            await zapTokenBsc.mint(signers[1].address, bid.amount);

            await zapTokenBsc
                .connect(signers[1])
                .approve(zapMarketV2.address, bid.amount);

            const bidderPreBal = await zapTokenBsc.balanceOf(bid.bidder);

            await zapMarketV2.connect(signers[1]).setBid(
                osCreature.address,
                1,
                bid,
                bid.spender
            );

            const bidderPostBal = await zapTokenBsc.balanceOf(bid.bidder);

            const getBid = await zapMarket.bidForTokenBidder(
                osCreature.address,
                1,
                bid.bidder
            );

            console.log(getBid)

            // const getBid2 = await zapMarket.bidForTokenBidder(
            //     zapMedia2.address,
            //     0,
            //     bid2.bidder
            // );

            // expect(getBid1.currency).to.equal(zapTokenBsc.address);

            // expect(getBid1.amount.toNumber()).to.equal(bid1.amount);

            // expect(getBid1.bidder).to.equal(bid1.bidder);

            // expect(beforeBalance1.toNumber()).to.equal(
            //     afterBalance1.toNumber() + bid1.amount
            // );

            // expect(getBid2.currency).to.equal(zapTokenBsc.address);

            // expect(getBid2.amount.toNumber()).to.equal(bid2.amount);

            // expect(getBid2.bidder).to.equal(bid2.bidder);

            // expect(beforeBalance2.toNumber()).to.equal(
            //     afterBalance2.toNumber() + bid2.amount
            // );

        });


    })
})
