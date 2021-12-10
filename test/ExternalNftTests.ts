import { ethers, upgrades, deployments, getNamedAccounts, } from 'hardhat';

import { BigNumber, ContractFactory, Event, EventFilter } from 'ethers';

import { ZapMarket, ZapMedia, Creature, MockProxyRegistry, ZapVault, ZapMarketV2, NewProxyAdmin, MediaFactory, MediaFactoryV2, ZapTokenBSC } from '../typechain';

import { getProxyAdminFactory } from '@openzeppelin/hardhat-upgrades/dist/utils';

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';
import { sign } from 'crypto';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe("External NFT, ZapMarketV2, MediaFactoryV2 Tests", () => {

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

        // Signer[0] mints a token on zapMediaV1
        // tokenId is currently 0
        await zapMedia.mint(data, bidShares);

        // Set the ask currency to zapTokenBSC
        ask.currency = zapTokenBsc.address;

        // Ask set tokenId 0 
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

        // Mints the external token to signers[0]
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

            // The isRegistered status is true
            const isRegistered = await zapMarketV2.isRegistered(osCreature.address);

            // Expext the external contract to be registered to MediaFactoryV2
            expect(isRegistered).to.be.true;

        })

        it("Should be configured to ZapMarketV2", async () => {

            // The isConfigured status is true
            const isConfigured = await zapMarketV2._isConfigured(osCreature.address);

            // Expect the external contract to be configured to ZapMarketV2
            expect(isConfigured).to.be.true;

        })

        it("Should emit a MediaContractCreated event after an external contract is ", async () => {

            // Filters for the MediaContractCreated event on zapMarketV2 
            const filter: EventFilter = zapMarketV2.filters.MediaContractCreated(
                null,
                null,
                null
            );

            // Query the MediaContractCreated event
            const event: Event = (
                await zapMarketV2.queryFilter(filter)
            )[2]

            // Expect the emitted event name to be MediaContractCreated
            expect(event.event).to.be.equal("MediaContractCreated");

            // Expect the emitted mediaContract address to be the external contract address
            expect(event.args?.mediaContract).to.equal(osCreature.address);

            // Expect the emitted collection name to equal the external collection name
            expect(ethers.utils.parseBytes32String(event.args?.name)).to.be.equal(await osCreature.name());

            // Expect the emitted collection symbol to equal the external collection symbol
            expect(ethers.utils.parseBytes32String(event.args?.symbol)).to.be.equal(await osCreature.symbol());

        });

        it("Should emit a BidShareUpdated event", async () => {

            // Filter ZapMarketV2 for the BidSharUpdated event
            const filter: EventFilter = zapMarketV2.filters.BidShareUpdated(
                null,
                null,
                null
            );

            // Query ZapMarketV2 for the BidShareUpdated event
            const event: Event = (
                await zapMarketV2.queryFilter(filter)
            )[1]

            // Expect the emitted event name to be BidShareUpdated
            expect(event.event).to.be.equal("BidShareUpdated");

            // Expect the emitted tokenId to equal 1
            expect(event.args?.tokenId).to.be.equal(1);

            // Expect the emitted creator value to equal the creator value set on external configuration
            expect(event.args?.bidShares.creator.value).to.equal(bidShares.creator.value);

            // Expect the emitted owner value to equal the owner value set on external configuration
            expect(event.args?.bidShares.owner.value).to.equal(bidShares.owner.value);

            // Expect the emitted collaborator addresses to equal the set collaborator addresses
            expect(event.args?.bidShares.collaborators).to.eql(bidShares.collaborators);

            // Expect the emitted collaboShares to equal the set collabShare values
            expect(event.args?.bidShares.collabShares).to.eql(bidShares.collabShares);

            // Expect the emitted meidaContract to equal the external contract address
            expect(event.args?.mediaContract).to.equal(osCreature.address);

        });

        it("Should revert if a non owner tries to configure an existing external tokenId", async () => {

            // Expect the owner of the external token to not equal the address attempting to configure
            expect(await osCreature.ownerOf(1)).to.not.equal(signers[11].address);

            // The configureExternalToken function will fail due to a non owner
            // attempting to configure the tokenId
            await expect(mediaFactoryV2
                .connect(signers[11])
                .configureExternalToken(
                    osCreature.address,
                    1,
                    bidShares
                )).to.be.revertedWith('MediaFactory: Only token owner can configure to ZapMarket');

        })

        it("Should revert if there is an attempt to configure a tokenId twice", async () => {

            // The configureExternalToken function will fail due to the tokenId
            // already configured to the markeplace
            await expect(mediaFactoryV2
                .connect(signers[0])
                .configureExternalToken(
                    osCreature.address,
                    1,
                    bidShares
                )).to.be.revertedWith('Market: External token already configured');

        })

        it("Should revert if there is an attempt to configure a nonexistent tokenId", async () => {

            // The configureExternalToken function will fail due to the tokenId
            // not existing
            await expect(mediaFactoryV2
                .connect(signers[0])
                .configureExternalToken(
                    osCreature.address,
                    101,
                    bidShares
                )).to.be.revertedWith('ERC721: owner query for nonexistent token')

        });

    })

    describe("#setBidShares", () => {

        it("Should get the bidShares for the external NFT", async () => {

            // Returns the external NFT bidShares set on the configureExternalToken function
            const bidSharesForToken = await zapMarketV2.bidSharesForToken(osCreature.address, 1);

            // Expect the returned creator value to equal the creator value set on configuration
            expect(bidSharesForToken.creator.value).to.equal(bidShares.creator.value);

            // Expect the returned owner value to equal the owner value set on configuration
            expect(bidSharesForToken.owner.value).to.equal(bidShares.owner.value);

            for (var i = 0; i < bidShares.collaborators.length; i++) {

                // Expect the returned collaborator addresses to equal the collaborator
                // addresses set on configuration
                expect(bidSharesForToken.collaborators[i]).to.equal(bidShares.collaborators[i]);

                // Expect the returned collabShare values to equal the collabShare values
                // set on configuration
                expect(bidSharesForToken.collabShares[i]).to.equal(bidShares.collabShares[i]);

            }

        })
    })

    describe('#setAsk', () => {

        it('Should reject setAsk if not called by external token owner', async () => {

            // Expect the owner of the external token to not equal the address attempting to setAsk
            expect(await osCreature.ownerOf(1)).to.not.equal(signers[4].address);

            // The setAsk function will fail due to a non token owner attempting to setAsk
            await expect(zapMarketV2.connect(signers[4]).setAsk(osCreature.address, 1, ask))
                .to.be.revertedWith('Market: Only owner of token can call this method');

        });

        it('Should set the ask if called by the owner of the external token ', async () => {

            // Expect the owner of external tokenId to equal the address of signers[0]
            expect(await osCreature.ownerOf(1)).to.equal(signers[0].address);

            // The owner of the external token succesfully calls the setAsk function
            await zapMarketV2.connect(signers[0]).setAsk(
                osCreature.address,
                1,
                ask
            );

            // Return the  ask associated with external token
            const getAsk = await zapMarketV2.currentAskForToken(osCreature.address, 1);

            // Expect the returned ask amount to equal the amount set 
            expect(getAsk.amount.toNumber()).to.equal(ask.amount);

            // Expect the currency returned to equal the currency set
            expect(getAsk.currency).to.equal(zapTokenBsc.address);

        });

        it('Should emit an event if the ask is updated', async () => {

            // The owner of the external token succesfully calls the setAsk function
            await zapMarketV2.connect(signers[0]).setAsk(
                osCreature.address,
                1,
                ask
            );

            // Filter zapMarketV2 for the AskCreated event
            const filter: EventFilter = zapMarketV2.filters.AskCreated(
                osCreature.address,
                null,
                null
            );

            // Query fot the AskCreated event
            const event: Event = (
                await zapMarketV2.queryFilter(filter)
            )[0];

            // Expect the emitted event name to equal AskCreated
            expect(event.event).to.be.equal('AskCreated');

            // Expect the emitted tokenId to equal 1
            expect(event.args?.tokenId.toNumber()).to.be.equal(1);

            // Expect the emitted ask amount to equal the amount set
            expect(event.args?.ask.amount.toNumber()).to.be.equal(ask.amount);

            // Expect the emitted currency to equal the currenct set
            expect(event.args?.ask.currency).to.be.equal(zapTokenBsc.address);

        });

        it('Should reject if the ask is too low', async () => {

            // The setAsk function will revert if the amount cannit be equally split in the bidShares
            await expect(
                zapMarketV2.connect(signers[0]).setAsk(osCreature.address, 1, {
                    amount: 13,
                    currency: zapTokenBsc.address
                }
                )).to.be.revertedWith('Market: Ask invalid for share splitting');

        });

        it("Should remove an external ask", async () => {

            // The owner of the external tokenId successfully setAsk
            await zapMarketV2.connect(signers[0]).setAsk(
                osCreature.address,
                1,
                ask
            );

            // Filter zapMarketV2 for the AskCreated event
            const filter: EventFilter = zapMarketV2.filters.AskCreated(
                osCreature.address,
                null,
                null
            );

            // Query for the AskCreated event
            const event: Event = (
                await zapMarketV2.queryFilter(filter)
            )[0];

            // The emitted event name should equal AskCreated
            expect(event.event).to.be.equal('AskCreated');

            // The emitted tokenId should equal 1
            expect(event.args?.tokenId.toNumber()).to.be.equal(1);

            // The emitted ask amount should equal the amount set
            expect(event.args?.ask.amount.toNumber()).to.be.equal(ask.amount);

            // The emitted ask currency should equal the currency set
            expect(event.args?.ask.currency).to.be.equal(zapTokenBsc.address);

            // Remove the ask set by the owner
            await zapMarketV2.connect(signers[0]).removeAsk(osCreature.address, 1);

            // Filter for the AskRemoved event
            const askRemovedFilter: EventFilter = zapMarketV2.filters.AskRemoved(
                null,
                null,
                null
            );

            // Query for the AskRemoved event
            const askRemovedEvent: Event = (
                await zapMarketV2.queryFilter(askRemovedFilter)
            )[0]

            // Expect the emitted event name to equal AskRemoved
            expect(askRemovedEvent.event).to.be.equal('AskRemoved');

            // Expect the emitted tokenId to equal 1
            expect(askRemovedEvent.args?.tokenId.toNumber()).to.be.equal(1);

            // Expect the emitted amount removed to equal the amount set
            expect(askRemovedEvent.args?.ask.amount.toNumber()).to.be.equal(ask.amount);

            // Expect the emitted currency removed to equal the currency set
            expect(askRemovedEvent.args?.ask.currency).to.be.equal(zapTokenBsc.address);

            // Expect the emitted mediaContract the ask was removed on to equal the external contract address
            expect(askRemovedEvent.args?.mediaContract).to.be.equal(osCreature.address);

            // Since the ask was removed, we are checking that it is zero for the ask object
            const getAsk = await zapMarketV2.currentAskForToken(osCreature.address, 1);

            // Expect the returned ask amount after removing to equal 0
            expect(getAsk.amount.toNumber()).to.be.equal(0);

            // Expect the returned ask currency after removing to equal 0x0000000000000000000000000000000000000000
            expect(getAsk.currency).to.be.equal(ethers.constants.AddressZero);

        })
    });

    describe("#setBid", () => {

        let unAuthMedia: Creature
        let unAuthProxy: MockProxyRegistry
        let bid: any
        let newBid: any
        let largeBid: any

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

            newBid = {
                amount: 400,
                currency: zapTokenBsc.address,
                bidder: signers[1].address,
                recipient: signers[1].address,
                spender: signers[1].address,
                sellOnShare: {
                    value: BigInt(10000000000000000000)
                }
            };

            largeBid = {
                amount: 600,
                currency: zapTokenBsc.address,
                bidder: signers[2].address,
                recipient: signers[2].address,
                spender: signers[2].address,
                sellOnShare: {
                    value: BigInt(10000000000000000000)
                }
            };

        })

        it('Should revert if not called by the external media contract', async () => {

            // Send the tokens to the bidder to cover the bid amount
            await zapTokenBsc.mint(bid.bidder, bid.amount);

            // Approves ZapMarketV2 to hold the bid amount until the bid is over
            await zapTokenBsc.connect(signers[1]).approve(zapMarketV2.address, bid.amount);

            // unAuthMedia was not registered to the MediaFactory and will return false
            const isRegistered = await zapMarketV2.isRegistered(unAuthMedia.address);

            // unAuthMedia was not configured to ZapMarket and will return false
            const isConfigured = await zapMarketV2.isConfigured(unAuthMedia.address);

            // ERC721 contracts that are not registered to the MediaFactory or configured
            // to ZapMarket have no access to the Markeplace functions
            await expect(zapMarketV2.connect(signers[1]).setBid(
                unAuthMedia.address,
                1,
                bid,
                bid.spender
            )).to.be.revertedWith('Market: Only media or AuctionHouse contract');

            // Expect the value of isRegistered to be false
            expect(isRegistered).to.be.false;

            // Expect the value of isConfigured to be false
            expect(isConfigured).to.be.false;

        });

        it('Should revert if the bidder does not have a high enough allowance for their bidding currency', async () => {

            // Send the tokens to the bidder to cover the bid amount
            await zapTokenBsc.mint(bid.bidder, bid.amount);

            // Approves ZapMarketV2 for an amount less than the bid amount
            await zapTokenBsc.connect(signers[1]).approve(zapMarketV2.address, bid.amount - 1);

            // Bidder balance before bidding
            const bidPreBal = await zapTokenBsc.balanceOf(signers[1].address);

            // Market baalnce before bidding
            const marketPreBal = await zapTokenBsc.balanceOf(zapMarketV2.address);

            // Bidders who attempt to place a bid with an amount less than their allowance will revert
            await expect(zapMarketV2.connect(signers[1]).setBid(
                osCreature.address,
                1,
                bid,
                bid.spender
            )).to.be.revertedWith('SafeERC20: low-level call failed');

            // Bidder balance after failed bid
            const bidPostBal = await zapTokenBsc.balanceOf(signers[1].address);

            // Market balance after failed bid
            const marketPostBal = await zapTokenBsc.balanceOf(zapMarketV2.address);

            // Expect the token balance after the failed bid to equal the before balance
            // Bidders bid will transfer to ZapMarket on a failed setBid
            expect(bidPostBal).to.equal(bidPreBal);

            // Expect ZapMarketV2 to have a balance of zero before and after the failed transaction 
            expect(marketPostBal).to.equal(marketPreBal);

        });

        it('Should revert if the bidder does not have enough tokens to bid with', async () => {

            // Sends the bid amount subtracted by 1 to not afford the bid amount
            await zapTokenBsc.mint(bid.bidder, bid.amount - 1);

            // Approves ZapMarketV2 to hold the bid amount until the bid is over
            await zapTokenBsc.connect(signers[1]).approve(zapMarketV2.address, bid.amount);

            // Bidder balance before bidding
            const bidPreBal = await zapTokenBsc.balanceOf(signers[1].address);

            // Market baalnce before bidding
            const marketPreBal = await zapTokenBsc.balanceOf(zapMarketV2.address);

            // Bidders who attempt to place a bid with a balance less than their allowance will revert
            await expect(zapMarketV2.connect(signers[1]).setBid(
                osCreature.address,
                1,
                bid,
                bid.spender
            )).to.be.revertedWith('SafeERC20: low-level call failed');

            // Bidder balance after failed bid
            const bidPostBal = await zapTokenBsc.balanceOf(signers[1].address);

            // Market balance after failed bid
            const marketPostBal = await zapTokenBsc.balanceOf(zapMarketV2.address);

            // Expects the bidder balance after the failed setBid to equal the original mint amount
            expect(bidPostBal).to.equal(bid.amount - 1);

            // Expects the market balance to equal zero after a failed setBid
            expect(marketPostBal).to.equal(0);

        });

        it('Should revert if the bid currency is a zero address', async () => {

            // Send the tokens to the bidder to cover the bid amount
            await zapTokenBsc.mint(bid.bidder, bid.amount);

            // Approves ZapMarketV2 to hold the bid amount until the bid is over
            await zapTokenBsc.connect(signers[1]).approve(zapMarketV2.address, bid.amount);

            // Sets the bid currency to 0x0000000000000000000000000000000000000000
            bid.currency = ethers.constants.AddressZero;

            // Bidder balance after failed bid
            const bidPreBal = await zapTokenBsc.balanceOf(signers[1].address);

            // Market balance after failed bid
            const marketPreBal = await zapTokenBsc.balanceOf(zapMarketV2.address);

            // Bidders who try to setBid without a valid currency address will revert
            await expect(
                zapMarketV2.connect(signers[1]).setBid(
                    osCreature.address,
                    1,
                    bid,
                    bid.spender
                )).to.be.revertedWith('Market: bid currency cannot be 0 address');

            // Bidder balance after failed bid
            const bidPostBal = await zapTokenBsc.balanceOf(signers[1].address);

            // Market balance after failed bid
            const marketPostBal = await zapTokenBsc.balanceOf(zapMarketV2.address);

            // Expect the token balance after the failed bid to equal the before balance
            // Bidders bid will transfer to ZapMarket on a failed setBid
            expect(bidPostBal).to.equal(bidPreBal);

            // Expect ZapMarketV2 to have a balance of zero before and after the failed transaction 
            expect(marketPostBal).to.equal(marketPreBal);

        });

        it('Should revert if the bid recipient is a zero address', async () => {

            // Send the tokens to the bidder to cover the bid amount
            await zapTokenBsc.mint(bid.bidder, bid.amount);

            // Approves ZapMarketV2 to hold the bid amount until the bid is over
            await zapTokenBsc
                .connect(signers[1])
                .approve(zapMarketV2.address, bid.amount);

            // Sets the bid recipient to 0x0000000000000000000000000000000000000000
            bid.recipient = ethers.constants.AddressZero;

            // Bidder balance after failed bid
            const bidPreBal = await zapTokenBsc.balanceOf(signers[1].address);

            // Market balance after failed bid
            const marketPreBal = await zapTokenBsc.balanceOf(zapMarketV2.address);

            // Bids placed without a valid recipient address will revert
            await expect(
                zapMarketV2.connect(signers[1]).setBid(
                    osCreature.address,
                    1,
                    bid,
                    bid.spender
                )).to.be.revertedWith('Market: bid recipient cannot be 0 address');

            // Bidder balance after failed bid
            const bidPostBal = await zapTokenBsc.balanceOf(signers[1].address);

            // Market balance after failed bid
            const marketPostBal = await zapTokenBsc.balanceOf(zapMarketV2.address);

            // Expect the token balance after the failed bid to equal the before balance
            // Bidders bid will transfer to ZapMarket on a failed setBid
            expect(bidPostBal).to.equal(bidPreBal);

            // Expect ZapMarketV2 to have a balance of zero before and after the failed transaction 
            expect(marketPostBal).to.equal(marketPreBal);

        });

        it('Should revert if the bidder bids 0 tokens', async () => {

            // Send the tokens to the bidder to cover the bid amount
            await zapTokenBsc.mint(bid.bidder, bid.amount);

            // Approves ZapMarketV2 to hold the bid amount until the bid is over
            await zapTokenBsc
                .connect(signers[1])
                .approve(zapMarketV2.address, bid.amount);

            // Sets the bid amount to 0
            bid.amount = 0;

            // Bidder balance after failed bid
            const bidPreBal = await zapTokenBsc.balanceOf(signers[1].address);

            // Market balance after failed bid
            const marketPreBal = await zapTokenBsc.balanceOf(zapMarketV2.address);

            // Bidders who attempt to place a bid amount if 0 tokens will revert
            await expect(
                zapMarketV2.connect(signers[1]).setBid(
                    osCreature.address,
                    1,
                    bid,
                    bid.spender
                )).to.be.revertedWith('Market: cannot bid amount of 0');

            // Bidder balance after failed bid
            const bidPostBal = await zapTokenBsc.balanceOf(signers[1].address);

            // Market balance after failed bid
            const marketPostBal = await zapTokenBsc.balanceOf(zapMarketV2.address);

            // Expect the token balance after the failed bid to equal the before balance
            // Bidders bid will transfer to ZapMarket on a failed setBid
            expect(bidPostBal).to.equal(bidPreBal);

            // Expect ZapMarketV2 to have a balance of zero before and after the failed transaction 
            expect(marketPostBal).to.equal(marketPreBal);

        });

        it('Should set a valid bid', async () => {

            // Send the tokens to the bidder to cover the bid amount
            await zapTokenBsc.mint(bid.bidder, bid.amount);

            // Approves ZapMarketV2 to hold the bid amount until the bid is over
            await zapTokenBsc
                .connect(signers[1])
                .approve(zapMarketV2.address, bid.amount);

            // Bidder successully sets a bid on an external token
            await zapMarketV2.connect(signers[1]).setBid(
                osCreature.address,
                1,
                bid,
                bid.spender
            );

            // Filters ZapMarketV2 for the BidCreated event
            const filter = zapMarketV2.filters.BidCreated(
                null,
                null,
                null
            );

            // Query ZapMarketV2 for the BidCreated event that emits after the setBid function invokes
            const bidCreatedEvent: Event = (await zapMarketV2.queryFilter(filter))[0];

            // Stores the name of the event that emits after setBid is invoked
            const eventName = bidCreatedEvent.event;

            // The bid amount should be withdrawn from the bidders balance
            const bidderPostBal = await zapTokenBsc.balanceOf(bid.bidder);

            // The bid amount should be transferred to ZapMarketV2's balance 
            const marketPostBal = await zapTokenBsc.balanceOf(zapMarketV2.address);

            // Returns the bid a bidder placed on an external token
            const getBid = await zapMarketV2.bidForTokenBidder(
                osCreature.address,
                1,
                bid.bidder
            );

            // Expect the name of the event emitted to be BidCreated
            expect(eventName).to.equal('BidCreated');

            // Expect the emitted external contract address to equal the address of osCreature
            expect(bidCreatedEvent.args?.mediaContract).to.equal(osCreature.address);

            // Expect the emitted external tokenId the bid was set on to equal 1
            expect(bidCreatedEvent.args?.tokenId).to.equal(1);

            // Expect the emitted bid amount to equal the bid amount placed
            expect(bidCreatedEvent.args?.bid.amount).to.equal(bid.amount);

            // Expect the emitted bid currency to equal the bid currency placed
            expect(bidCreatedEvent.args?.bid.currency).to.equal(zapTokenBsc.address);

            // Expect the emitted bidder address to equal the address of who the bid was placed by
            expect(bidCreatedEvent.args?.bid.bidder).to.equal(bid.bidder);

            // Expect the emitted recipient address to equal the 
            expect(bidCreatedEvent.args?.bid.recipient).to.equal(bid.recipient);

            // Expect the emitted sellOnShare value to equal the sellOnShare set
            expect(bidCreatedEvent.args?.bid.sellOnShare.value).to.equal(bid.sellOnShare.value);

            // Expect the returned currency to equal the currency set
            expect(getBid.currency).to.equal(bid.currency);

            // Expect the returned amount to equal the amount set
            expect(getBid.amount.toNumber()).to.equal(bid.amount);

            // Expect the returned bidder address to equal the address of the bidder set
            expect(getBid.bidder).to.equal(bid.bidder);

            // Expect the bidders balance to equal zero due to their funds matching the bid amount
            // On setBid the bid amount will be withrdrawn from the bidders balance
            expect(bidderPostBal).to.equal(0);

            // Expect the market balance to equal the bid amount due to the bidder bid amount
            expect(marketPostBal).to.equal(bid.amount);

        });

        it("Should set a larger valid bid than the minimum bid", async () => {

            // Send the tokens to the bidder to cover the first small bid amount
            await zapTokenBsc.mint(bid.bidder, bid.amount);

            // Approves ZapMarketV2 to hold the first bid amount until the bid is over
            await zapTokenBsc.connect(signers[1]).approve(zapMarketV2.address, bid.amount);

            // Successfully sets the first small bid
            await zapMarketV2.connect(signers[1]).setBid(
                osCreature.address,
                1,
                bid,
                bid.spender
            );

            // Send the tokens to the bidder to cover the second large bid amount
            await zapTokenBsc.mint(largeBid.bidder, largeBid.amount);

            await zapTokenBsc.connect(signers[2]).approve(zapMarketV2.address, largeBid.amount);

            // Successfully sets the second large bid
            await zapMarketV2.connect(signers[2]).setBid(
                osCreature.address,
                1,
                largeBid,
                largeBid.spender
            );

        })

        it('Should refund the original bid if the bidder bids again', async () => {

            // Send the tokens to the bidder to cover the first small bid and the second large bid
            await zapTokenBsc.mint(signers[1].address, bid.amount + newBid.amount);

            // Approves ZapMarketV2 to hold the first small and second large bid amount
            await zapTokenBsc.connect(signers[1]).approve(zapMarketV2.address, bid.amount + newBid.amount);

            // Bidder balance before placing the first small bid
            const bidPreBal = await zapTokenBsc.balanceOf(bid.bidder);

            // Successully sets the first small bid
            await zapMarketV2.connect(signers[1]).setBid(
                osCreature.address,
                1,
                bid,
                bid.spender
            );

            // Returns the balance of bidder after setting the bid
            const bidPostBal = await zapTokenBsc.balanceOf(bid.bidder);

            // Returns the balance of the market after the bid was placed
            const marketPostBal = await zapTokenBsc.balanceOf(zapMarketV2.address);

            // Returns the balance of the bidder before making a second bid
            const newBidPreBal = await zapTokenBsc.balanceOf(newBid.bidder);

            // Set the second bid of 400 tokens
            await zapMarketV2.connect(signers[1]).setBid(
                osCreature.address,
                1,
                newBid,
                newBid.spender
            );

            // Filfter for the BidRemoved event
            const removeBidFilter = zapMarketV2.filters.BidRemoved(
                null,
                null,
                null
            );

            // Query for the BidRemoved event
            const removeBidEvent = (await zapMarketV2.queryFilter(removeBidFilter))[0]

            // The emitted event name of BidRemoved
            const eventName = removeBidEvent.event;

            // Returns the balance of the bidder after making the second bid
            // The bidders balance should increase from the first bid and
            // decrease by the second bid
            const newBidPostBal = await zapTokenBsc.balanceOf(newBid.bidder);

            // Returns the balance of the market after the second bid was placed
            // The market balance should decrease from the first bid and
            // increase from the second bid
            const newMarketPostBal = await zapTokenBsc.balanceOf(zapMarketV2.address);

            // Expect the event name emitted to equal BidRemoved
            expect(eventName).to.equal('BidRemoved');

            // Expect the emitted mediaContract address to equal the external contract address
            expect(removeBidEvent.args?.mediaContract).to.equal(osCreature.address);

            // Expect the emitted tokenId to equal 1
            expect(removeBidEvent.args?.tokenId).to.equal(1);
            expect(removeBidEvent.args?.bid.amount).to.equal(bid.amount);
            expect(removeBidEvent.args?.bid.currency).to.equal(zapTokenBsc.address);
            expect(removeBidEvent.args?.bid.bidder).to.equal(bid.bidder);
            expect(removeBidEvent.args?.bid.recipient).to.equal(bid.recipient);
            expect(removeBidEvent.args?.bid.sellOnShare.value).to.equal(bid.sellOnShare.value);


            expect(bidPostBal).to.equal(bidPreBal.toNumber() - bid.amount);
            expect(marketPostBal).to.equal(bid.amount);

            expect(newBidPreBal).to.equal(bidPostBal);
            expect(newBidPostBal).to.equal(bid.amount);
            expect(newMarketPostBal).to.equal(newBid.amount);

        })

        it("Should remove a bid", async () => {

            await zapTokenBsc.mint(bid.bidder, bid.amount);

            await zapTokenBsc.connect(signers[1]).approve(zapMarketV2.address, bid.amount);

            const bidPreBal = await zapTokenBsc.balanceOf(bid.bidder);
            const marketPreBal = await zapTokenBsc.balanceOf(zapMarketV2.address);

            await zapMarketV2.connect(signers[1]).setBid(
                osCreature.address,
                1,
                bid,
                bid.spender
            );

            const bidPostBal = await zapTokenBsc.balanceOf(bid.bidder)
            const marketPostBal = await zapTokenBsc.balanceOf(zapMarketV2.address);

            await zapMarketV2.connect(signers[1]).removeBid(osCreature.address, 1, bid.bidder);

            const removePostBal = await zapTokenBsc.balanceOf(bid.bidder)
            const marketRemovePostBal = await zapTokenBsc.balanceOf(zapMarketV2.address);

            const removeBidFilter = zapMarketV2.filters.BidRemoved(
                null,
                null,
                null
            );

            const removeBidEvent = (await zapMarketV2.queryFilter(removeBidFilter))[0]
            const eventName = removeBidEvent.event;

            expect(bidPostBal).to.equal(0);
            expect(marketPostBal).to.equal(bid.amount);

            expect(removePostBal).to.equal(bidPreBal);
            expect(marketRemovePostBal).to.equal(marketPreBal);

            expect(eventName).to.equal('BidRemoved');
            expect(removeBidEvent.args?.mediaContract).to.equal(osCreature.address);
            expect(removeBidEvent.args?.tokenId).to.equal(1);
            expect(removeBidEvent.args?.bid.amount).to.equal(bid.amount);
            expect(removeBidEvent.args?.bid.currency).to.equal(zapTokenBsc.address);
            expect(removeBidEvent.args?.bid.bidder).to.equal(bid.bidder);
            expect(removeBidEvent.args?.bid.recipient).to.equal(bid.recipient);
            expect(removeBidEvent.args?.bid.sellOnShare.value).to.equal(bid.sellOnShare.value);

        })

        it("Should accept a bid on an external NFt", async () => {

            // The owner of the token allows an operator to transfer ERC721's on their behalf
            await osCreature.setApprovalForAll(zapMarketV2.address, true);

            // Send the tokens to the bidder to cover the bid amount
            await zapTokenBsc.mint(bid.bidder, bid.amount);

            // 
            await zapTokenBsc.connect(signers[1]).approve(zapMarketV2.address, bid.amount);

            await zapMarketV2.connect(signers[1]).setBid(
                osCreature.address,
                1,
                bid,
                bid.spender
            );

            // Original address that owns tokenId 1 on the external contract before the bid is accepted
            const originalOwner = await osCreature.ownerOf(1);

            // The owner of the external tokenId accepts the winning bid
            await zapMarketV2.connect(signers[0]).acceptBid(osCreature.address, 1, bid);

            const bidFinalizedFilter = zapMarketV2.filters.BidFinalized(
                null,
                null,
                null
            );

            const bidFinalizedEvent = (await zapMarketV2.queryFilter(bidFinalizedFilter))[0];

            // The winning bidder should receive the auctioned token
            const newTokenOwner = await osCreature.ownerOf(1);

            expect(bidFinalizedEvent.event).to.equal("BidFinalized");
            expect(bidFinalizedEvent.args.mediaContract).to.equal(osCreature.address);
            expect(bidFinalizedEvent.args.tokenId).to.equal(1);
            expect(bidFinalizedEvent.args.bid.amount).to.equal(bid.amount);
            expect(bidFinalizedEvent.args.bid.currency).to.equal(bid.currency);
            expect(bidFinalizedEvent.args.bid.bidder).to.equal(bid.bidder);
            expect(bidFinalizedEvent.args.bid.recipient).to.equal(bid.recipient);
            expect(bidFinalizedEvent.args.bid.sellOnShare.value).to.equal(bid.sellOnShare.value);
            expect(originalOwner).to.equal(signers[0].address);
            expect(newTokenOwner).to.equal(bid.recipient)

        })

    })
})
