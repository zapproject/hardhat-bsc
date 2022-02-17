import { ethers, upgrades } from "hardhat";

import { EventFilter, Event, ContractFactory } from "ethers";

import { solidity } from "ethereum-waffle";

import chai, { expect } from "chai";

import { ZapTokenBSC } from "../typechain/ZapTokenBSC";

import { deploy1155Medias } from "./utils";

import { Media1155 } from '../typechain/Media1155';
import { ZapMarket } from "../typechain/ZapMarket";
import { ZapVault } from "../typechain/ZapVault"
import { Media1155Factory } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
    keccak256,
    formatBytes32String,
    arrayify
} from 'ethers/lib/utils';
import { intToBuffer } from "ethjs-util";

const { BigNumber } = ethers;

chai.use(solidity);

describe("ZapMedia Test", async () => {
    let zapMarket: ZapMarket;
    let media1: Media1155;
    let media2: Media1155;
    let media3: Media1155;
    let unInitMedia: Media1155;
    let mediaDeployer: Media1155Factory;
    let zapVault: ZapVault;
    let zapTokenBsc: any;
    let signers: any;

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

    let platformFee = {
        fee: {
            value: BigInt(5000000000000000000)
        },

    };

    let ask = {
        amount: 100,
        currency: "",
        sellOnShare: 0,
    };

    let tokenURI: any;
    let collaborators: any

    before(async () => {
        signers = await ethers.getSigners();
        const zapTokenFactory = await ethers.getContractFactory(
            "ZapTokenBSC",
            signers[0]
        );

        zapTokenBsc = (await zapTokenFactory.deploy()) as ZapTokenBSC;
        await zapTokenBsc.deployed();

        const zapVaultFactory = await ethers.getContractFactory('ZapVault');

        zapVault = (await upgrades.deployProxy(zapVaultFactory, [zapTokenBsc.address], {
            initializer: 'initializeVault'
        })) as ZapVault;
        await zapVault.deployed();

        const zapMarketFactory = await ethers.getContractFactory('ZapMarket');

        zapMarket = (await upgrades.deployProxy(zapMarketFactory, [zapVault.address], {
            initializer: 'initializeMarket'
        })) as ZapMarket;

        await zapMarket.setFee(platformFee);

        collaborators = {
            collaboratorTwo: signers[10].address,
            collaboratorThree: signers[11].address,
            collaboratorFour: signers[12].address,
            creator: signers[1].address
        }

        bidShares = {
            ...bidShares, collaborators: [
                signers[9].address,
                signers[10].address,
                signers[12].address
            ]
        }

        const unInitMediaFactory = await ethers.getContractFactory('Media1155');

        unInitMedia = (await unInitMediaFactory.deploy()) as Media1155;

    })


    describe("Configure", () => {

        beforeEach(async () => {

            tokenURI = String("media contract 1 - token 1 uri");

            const mediaDeployerFactory = await ethers.getContractFactory("Media1155Factory", signers[0]);

            mediaDeployer = (await upgrades.deployProxy(mediaDeployerFactory, [zapMarket.address, unInitMedia.address], {
                initializer: 'initialize'
            })) as Media1155Factory;

            await mediaDeployer.deployed();

            await zapMarket.setMediaFactory(mediaDeployer.address);

            const medias = await deploy1155Medias(signers, zapMarket, mediaDeployer);

            media1 = medias[0];
            media2 = medias[1];
            media3 = medias[2];

            await media1.claimTransferOwnership();
            await media2.claimTransferOwnership();
            await media3.claimTransferOwnership();

            ask.currency = zapTokenBsc.address;
        });

        it("Should get media owner", async () => {

            const media1Address = await zapMarket.mediaContracts(
                signers[1].address,
                BigNumber.from("0")
            );

            const media2Address = await zapMarket.mediaContracts(
                signers[2].address,
                BigNumber.from("0")
            );

            expect(await media1Address).to.equal(media1.address);

            expect(await media2Address).to.equal(media2.address);
        });

        it("Should reject if called twice", async () => {

            await expect(
                zapMarket
                    .connect(signers[1])
                    .configure(
                        signers[1].address,
                        media1.address,
                        formatBytes32String("TEST MEDIA 1"),
                        formatBytes32String("TM1")
                    )
            ).to.be.reverted;

            await expect(
                zapMarket
                    .connect(signers[2])
                    .configure(
                        signers[2].address,
                        media2.address,
                        formatBytes32String("TEST MEDIA 2"),
                        formatBytes32String("TM2")
                    )
            ).to.be.reverted;

            expect(await zapMarket.isConfigured(media1.address)).to.be.true;

            expect(await zapMarket.isConfigured(media2.address)).to.be.true;

        });
    });

    describe("#mint", () => {

        beforeEach(async () => {
            tokenURI = String('media contract 1 - token 1 uri');

            const mediaDeployerFactory = await ethers.getContractFactory("Media1155Factory", signers[0]);

            mediaDeployer = (await upgrades.deployProxy(mediaDeployerFactory, [zapMarket.address, unInitMedia.address], {
                initializer: 'initialize'
            })) as Media1155Factory;

            await mediaDeployer.deployed();

            await zapMarket.setMediaFactory(mediaDeployer.address);

            const medias = await deploy1155Medias(signers, zapMarket, mediaDeployer);

            media1 = medias[0];
            media2 = medias[1];
            media3 = medias[2];

            await media1.claimTransferOwnership();
            await media2.claimTransferOwnership();
            await media3.claimTransferOwnership();
        });

        it("should not mint token if caller is not approved", async () => {

            await expect(
                media2.connect(signers[4]).mint(signers[4].address, 1, 1, bidShares)
            ).revertedWith("Media: Only Approved users can mint");
        });

        it("should not mint if a collaborator's share has not been defined", async () => {
            let testBidShares = bidShares;
            testBidShares = {
                ...testBidShares, collabShares:
                    [
                        BigNumber.from('15000000000000000000'),
                        BigNumber.from('15000000000000000000'),
                        BigNumber.from('0')
                    ]
            }

            await expect(
                media2.mint(signers[0].address, 1, 1, testBidShares)
            ).to.be.revertedWith("Media: Each collaborator must have a share of the nft")

        });

        it("should mint token if caller is approved", async () => {

            expect(await media2.approveToMint(signers[3].address)).to.be.ok;

            expect(
                await media2.connect(signers[3]).mint(signers[3].address, 1, 1, bidShares)
            ).to.be.ok;

            const balance = await media2.balanceOf(signers[3].address, 1);
            expect(balance.eq(1));
        });

        it('should mint a permissive token without approval', async () => {

            expect(
                await media1.connect(signers[4]).mint(signers[4].address, 1, 1, bidShares)
            ).to.be.ok;

            const balance = await media2.balanceOf(signers[3].address, 1);
            expect(balance.eq(1));
        });

        it("should mint token", async () => {

            await media1.connect(signers[5]).mint(signers[5].address, 1, 1, bidShares);

            const balance = await media2.balanceOf(signers[3].address, 1);
            expect(balance.eq(1));
        });

        it('should not be able to mint a token with bid shares summing to less than 100', async () => {

            await expect(media1.mint(signers[1].address, 1, 1, {
                ...bidShares, creator: {
                    value: BigInt(50000000000000000000)
                }
            })).to.be.revertedWith("Market: Invalid bid shares, must sum to 100");

        });

        it('should not be able to mint a token if token exists and call is not creator', async () => {
            await media1.connect(signers[5]).mint(signers[5].address, 1, 1, bidShares);

            const balance = await media2.balanceOf(signers[3].address, 1);
            expect(balance.eq(1));

            await expect(media1.connect(signers[4]).mint(signers[6].address, 1, 10, bidShares)).
            to.be.revertedWith("Media: Cannot mint an existing token as non creator");


        });
    });
    describe("#mintBatch", () => {

        beforeEach(async () => {
            tokenURI = String('media contract 1 - token 1 uri');

            const mediaDeployerFactory = await ethers.getContractFactory("Media1155Factory", signers[0]);

            mediaDeployer = (await upgrades.deployProxy(mediaDeployerFactory, [zapMarket.address, unInitMedia.address], {
                initializer: 'initialize'
            })) as Media1155Factory;

            await mediaDeployer.deployed();

            await zapMarket.setMediaFactory(mediaDeployer.address);

            const medias = await deploy1155Medias(signers, zapMarket, mediaDeployer);

            media1 = medias[0];
            media2 = medias[1];
            media3 = medias[2];

            await media1.claimTransferOwnership();
            await media2.claimTransferOwnership();
            await media3.claimTransferOwnership();
        });

        it("Should not mint batch if caller is unapproved", async () => {

            await expect(
                media2.connect(signers[4]).mintBatch(signers[1].address, [2], [2], [bidShares])
            ).to.be.revertedWith("Media: Only Approved users can mint batch");
        });

        it("should not mint batch if a collaborator's share has not been defined", async () => {
            let testBidShares = bidShares;
            testBidShares = {
                ...testBidShares, collabShares:
                    [
                        BigNumber.from('15000000000000000000'),
                        BigNumber.from('15000000000000000000'),
                        BigNumber.from('0')
                    ]
            }

            await expect(
                media2.mintBatch(signers[0].address, [1], [1], [testBidShares])
            ).to.be.revertedWith("Media: Each collaborator must have a share of the nft")

        });

        it("should mint batch token if caller is approved", async () => {

            expect(await media2.approveToMint(signers[3].address)).to.be.ok;

            expect(
                await media2.connect(signers[3]).mintBatch(signers[3].address, [1], [1], [bidShares])
            ).to.be.ok;

            const balance = await media2.balanceOf(signers[3].address, 1);
            expect(balance.eq(1));
        });

        it('should mint batch a permissive token without approval', async () => {

            expect(
                await media1.connect(signers[4]).mintBatch(signers[4].address, [1], [1], [bidShares])
            ).to.be.ok;

            const balance = await media2.balanceOf(signers[3].address, 1);
            expect(balance.eq(1));
        });

        it("should mint token", async () => {

            await media1.connect(signers[5]).mintBatch(signers[5].address, [1, 2], [1, 2], [bidShares, bidShares]);

            const balance1 = await media2.balanceOf(signers[3].address, 1);
            expect(balance1.eq(1));

            const balance2 = await media2.balanceOf(signers[3].address, 2);
            expect(balance2.eq(2));
        });

        it('should not be able to mint a token with bid shares summing to less than 100', async () => {

            await expect(media1.mintBatch(signers[1].address, [1], [1], [{
                ...bidShares, creator: {
                    value: BigInt(50000000000000000000)
                }
            }])).to.be.revertedWith("Market: Invalid bid shares, must sum to 100");

        });

        it('should not be able to mint a token if token exists and call is not creator', async () => {
            await media1.connect(signers[5]).mintBatch(signers[5].address, [1], [1], [bidShares]);

            const balance = await media2.balanceOf(signers[3].address, 1);
            expect(balance.eq(1));

            await expect(media1.connect(signers[4]).mintBatch(signers[6].address, [1], [10], [bidShares])).
            to.be.revertedWith("Media: Cannot mint an existing token as non creator");
        });
    });

    describe('#setAsk', () => {
        beforeEach(async () => {
            tokenURI = String('media contract 1 - token 1 uri');

            await media3.mintBatch(signers[0].address, [1,2,3], [1,2,3], [bidShares, bidShares, bidShares]);
        });

        it("should set the ask", async () => {
            await media3.setAsk(1, ask);
            let currentAsk = await zapMarket.currentAskForToken(media3.address, 1);
            expect(currentAsk.amount.toNumber() == ask.amount);
            expect(currentAsk.currency == ask.currency);
        });

        it('should reject if the ask is 0', async () => {
            await expect(
                media3.setAsk(1, { ...ask, amount: 0 })
            ).revertedWith("Market: Ask invalid for share splitting");
        });

        it('should reject if the ask amount is invalid and cannot be split', async () => {
            await expect(
                media3.setAsk(1, { ...ask, amount: 101 })
            ).revertedWith("Market: Ask invalid for share splitting");
        });
    });

    describe('#setAskBatch', () => {
        beforeEach(async () => {
            tokenURI = String('media contract 1 - token 1 uri');

            await media3.mintBatch(signers[0].address, [1,2,3], [1,2,3], [bidShares, bidShares, bidShares]);
        });

        it("should set the ask of batch", async () => {
            await media3.setAskBatch([1,2,3], [ask, ask, ask]);
            let currentAsk = await zapMarket.currentAskForToken(media3.address, 1);
            expect(currentAsk.amount.toNumber() == ask.amount);
            expect(currentAsk.currency == ask.currency);

            currentAsk = await zapMarket.currentAskForToken(media3.address, 2);
            expect(currentAsk.amount.toNumber() == ask.amount);
            expect(currentAsk.currency == ask.currency);

            currentAsk = await zapMarket.currentAskForToken(media3.address, 3);
            expect(currentAsk.amount.toNumber() == ask.amount);
            expect(currentAsk.currency == ask.currency);
        });

        it('should reject if the ask batch is 0', async () => {
            await expect(
                media3.setAskBatch([1], [{ ...ask, amount: 0 }])
            ).revertedWith("Market: Ask invalid for share splitting");
        });

        it('should reject if the ask amount is invalid and cannot be split', async () => {
            await expect(
                media3.setAskBatch([1], [{ ...ask, amount: 101 }])
            ).revertedWith("Market: Ask invalid for share splitting");
        });
    });

    describe("#setBid-without-setupAuction", () => {
        let bid1: any;
        let bid2: any;

        beforeEach(async () => {
            bid1 = {
                amount: 100,
                currency: zapTokenBsc.address,
                bidder: signers[1].address,
                recipient: signers[0].address,
                spender: signers[1].address,
                sellOnShare: {
                    value: BigInt(0),
                },
            };

            bid2 = {
                amount: 200,
                currency: zapTokenBsc.address,
                bidder: signers[2].address,
                recipient: signers[9].address,
                spender: signers[2].address,
                sellOnShare: {
                    value: BigInt(0),
                },
            };

            tokenURI = String('media contract 1 - token 1 uri');
            await media3.mint(signers[0].address, 1, 1, bidShares);
        });

        it("should revert if the token bidder does not have a high enough allowance for their bidding currency", async () => {
            await zapTokenBsc.mint(signers[1].address, bid1.amount);

            await zapTokenBsc
                .connect(signers[1])
                .approve(zapMarket.address, bid1.amount - 1);

            await expect(
                media3.connect(signers[1]).setBid(1, bid1)
            ).to.be.revertedWith("SafeERC20: low-level call failed");
        });

        it("should revert if the token bidder does not have a high enough balance for their bidding currency", async () => {
            await zapTokenBsc.mint(signers[1].address, bid1.amount / 2);

            await zapTokenBsc
                .connect(signers[1])
                .approve(zapMarket.address, bid1.amount / 2);

            await expect(
                media3.connect(signers[1]).setBid(1, bid1)
            ).to.be.revertedWith("SafeERC20: low-level call failed");
        });

        it("should set a bid", async () => {

            let id = await media3.getInterfaceId();
            console.log(id);
            await zapTokenBsc.mint(signers[1].address, 100000);

            await zapTokenBsc
                .connect(signers[1])
                .approve(zapMarket.address, 100000);
            await zapTokenBsc
            .connect(signers[1])
            .approve(media3.address, 100000);
            expect(await media3.connect(signers[1]).setBid(1, bid1));

            const balance = await zapTokenBsc.balanceOf(signers[1].address);
            expect(balance.toNumber()).eq(100000 - 100);
        });
    });

})