import { ethers, upgrades } from "hardhat";

import { EventFilter, Event, ContractFactory } from "ethers";

import { solidity } from "ethereum-waffle";

import chai, { expect } from "chai";

import { ZapTokenBSC } from "../typechain/ZapTokenBSC";

import { signPermit, signMintWithSig, deployOneMedia } from "./utils";

import { ZapMedia } from '../typechain/ZapMedia';
import { ZapMarket } from "../typechain/ZapMarket";
import { ZapVault } from "../typechain/ZapVault"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deployJustMedias } from "./utils";


import {
    keccak256,
    formatBytes32String,
    arrayify
} from 'ethers/lib/utils';
import { MediaFactory, MediaProxy } from "../typechain";

const { BigNumber } = ethers;

chai.use(solidity);

describe("ZapMedia Test", async () => {
    let zapMarket: ZapMarket;
    let zapMedia1: ZapMedia;
    let zapMedia2: ZapMedia;
    let zapMedia3: ZapMedia;
    let unInitMedia: ZapMedia;
    let mediaDeployer: MediaFactory;
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
    let metadataURI: any;
    let metadataHex: any;
    let metadataHash: any;
    let metadataHashBytes: any;
    let contentHex: any;
    let contentHash: any;
    let contentHashBytes: any;
    let otherContentHex: string;
    let otherContentHash: string;
    let otherContentHashBytes: any;
    let zeroContentHashBytes: any;
    let mediaData: any;
    let randomString: any;
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

        const unInitMediaFactory = await ethers.getContractFactory('ZapMedia');

        unInitMedia = (await unInitMediaFactory.deploy()) as ZapMedia;

    })

    describe("Configure", () => {

        beforeEach(async () => {

            tokenURI = String("media contract 1 - token 1 uri");
            metadataURI = String("media contract 1 - metadata 1 uri");

            tokenURI = String('media contract 1 - token 1 uri');
            metadataURI = String('media contract 1 - metadata 1 uri');

            metadataHex = formatBytes32String('{}');
            metadataHash = keccak256(metadataHex);
            metadataHashBytes = arrayify(metadataHash);

            randomString = Date.now().toString();
            contentHex = formatBytes32String(randomString);
            contentHash = keccak256(contentHex);
            contentHashBytes = arrayify(contentHash);

            randomString = Date.now().toString();
            otherContentHex = formatBytes32String(randomString);
            otherContentHash = keccak256(otherContentHex);
            otherContentHashBytes = arrayify(otherContentHash);

            zeroContentHashBytes = arrayify(
                ethers.constants.HashZero
            );

            mediaData = {
                tokenURI,
                metadataURI,
                contentHash: contentHashBytes,
                metadataHash: metadataHashBytes,
            };

            const zapMediaFactory = await ethers.getContractFactory("ZapMedia");
            const zapMediaInterface = await zapMediaFactory.deploy();

            const mediaDeployerFactory = await ethers.getContractFactory("MediaFactory", signers[0]);

            mediaDeployer = (await upgrades.deployProxy(mediaDeployerFactory, [zapMarket.address, unInitMedia.address], {
                initializer: 'initialize'
            })) as MediaFactory;

            await mediaDeployer.deployed();

            await zapMarket.setMediaFactory(mediaDeployer.address);

            const medias = await deployJustMedias(signers, zapMarket, mediaDeployer);

            zapMedia1 = medias[0];
            zapMedia2 = medias[1];
            zapMedia3 = medias[2];

            await zapMedia1.claimTransferOwnership();
            await zapMedia2.claimTransferOwnership();
            await zapMedia3.claimTransferOwnership();

            ask.currency = zapTokenBsc.address;
        });

        it("Should get media owner", async () => {

            const zapMedia1Address = await zapMarket.mediaContracts(
                signers[1].address,
                BigNumber.from("0")
            );

            const zapMedia2Address = await zapMarket.mediaContracts(
                signers[2].address,
                BigNumber.from("0")
            );

            expect(await zapMedia1Address).to.equal(zapMedia1.address);

            expect(await zapMedia2Address).to.equal(zapMedia2.address);
        });

        it("Should reject if called twice", async () => {

            await expect(
                zapMarket
                    .connect(signers[1])
                    .configure(
                        signers[1].address,
                        zapMedia1.address,
                        formatBytes32String("TEST MEDIA 1"),
                        formatBytes32String("TM1"),
                        true
                    )
            ).to.be.reverted;

            await expect(
                zapMarket
                    .connect(signers[2])
                    .configure(
                        signers[2].address,
                        zapMedia2.address,
                        formatBytes32String("TEST MEDIA 2"),
                        formatBytes32String("TM2"),
                        true
                    )
            ).to.be.reverted;

            expect(await zapMarket.isConfigured(zapMedia1.address)).to.be.true;

            expect(await zapMarket.isConfigured(zapMedia2.address)).to.be.true;

        });
    });

    describe("#mint", () => {

        beforeEach(async () => {

            tokenURI = String('media contract 1 - token 1 uri');
            metadataURI = String('media contract 1 - metadata 1 uri');

            metadataHex = formatBytes32String("{}");
            metadataHash = keccak256(metadataHex);
            metadataHashBytes = arrayify(metadataHash);

            randomString = Date.now().toString();
            contentHex = formatBytes32String(randomString);
            contentHash = keccak256(contentHex);
            contentHashBytes = arrayify(contentHash);

            zeroContentHashBytes = arrayify(ethers.constants.HashZero);

            mediaData = {
                tokenURI,
                metadataURI,
                contentHash: contentHashBytes,
                metadataHash: metadataHashBytes,
            };

            const zapMediaFactory = await ethers.getContractFactory("ZapMedia");
            const zapMediaInterface = await zapMediaFactory.deploy();

            const mediaDeployerFactory = await ethers.getContractFactory("MediaFactory", signers[0]);

            mediaDeployer = (await upgrades.deployProxy(mediaDeployerFactory, [zapMarket.address, unInitMedia.address], {
                initializer: 'initialize'
            })) as MediaFactory;

            await mediaDeployer.deployed();

            await zapMarket.setMediaFactory(mediaDeployer.address);

            const medias = await deployJustMedias(signers, zapMarket, mediaDeployer);

            zapMedia1 = medias[0];
            zapMedia2 = medias[1];
            zapMedia3 = medias[2];

            await zapMedia1.claimTransferOwnership();
            await zapMedia2.claimTransferOwnership();
            await zapMedia3.claimTransferOwnership();
        });

        it("should not mint token if caller is not approved", async () => {

            await expect(
                zapMedia2.connect(signers[3]).mint(mediaData, bidShares)
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
                zapMedia2.mint(mediaData, testBidShares)
            ).to.be.revertedWith("Media: Each collaborator must have a share of the nft")

        });

        it("should mint token if caller is approved", async () => {

            expect(await zapMedia2.approveToMint(signers[3].address)).to.be.ok;

            expect(
                await zapMedia2.connect(signers[3]).mint(mediaData, bidShares)
            ).to.be.ok;



            const ownerOf = await zapMedia2.ownerOf(0);
            const creator = await zapMedia2.getTokenCreators(0);

            const tokenContentHash = await zapMedia2.getTokenContentHashes(0);
            const metadataContentHash = await zapMedia2.getTokenMetadataHashes(
                0
            );
            const savedTokenURI = await zapMedia2.tokenURI(0);
            const savedMetadataURI = await zapMedia2.tokenMetadataURI(0);
            const currentSupply = await zapMedia2.totalSupply();

            expect(ownerOf).eq(signers[3].address);
            expect(creator).eq(signers[3].address);

            expect(tokenContentHash).eq(contentHash);
            expect(metadataContentHash).eq(metadataHash);
            expect(savedTokenURI).eq(tokenURI);
            expect(savedMetadataURI).eq(metadataURI);
            expect(currentSupply).eq(1);
        });

        it('should mint a permissive token without approval', async () => {

            expect(
                await zapMedia1.connect(signers[4]).mint(mediaData, bidShares)
            ).to.be.ok;

            const ownerOf = await zapMedia1.ownerOf(0);
            const creator = await zapMedia1.getTokenCreators(0);

            const tokenContentHash = await zapMedia1.getTokenContentHashes(0);
            const metadataContentHash = await zapMedia1.getTokenMetadataHashes(0);

            const savedTokenURI = await zapMedia1.tokenURI(0);
            const savedMetadataURI = await zapMedia1.tokenMetadataURI(0);

            expect(ownerOf).eq(signers[4].address);
            expect(creator).eq(signers[4].address);
            expect(tokenContentHash).eq(contentHash);
            expect(metadataContentHash).eq(metadataHash);
            expect(savedTokenURI).eq(tokenURI);
            expect(savedMetadataURI).eq(metadataURI);

        });

        it("should mint token", async () => {

            await zapMedia1.connect(signers[5]).mint(mediaData, bidShares);

            const ownerOf = await zapMedia1.ownerOf(0);

            const creator = await zapMedia1.getTokenCreators(0);

            const tokenContentHash = await zapMedia1.getTokenContentHashes(0);
            const metadataContentHash = await zapMedia1.getTokenMetadataHashes(0);

            const savedTokenURI = await zapMedia1.tokenURI(0);
            const savedMetadataURI = await zapMedia1.tokenMetadataURI(0);

            expect(ownerOf).eq(signers[5].address);
            expect(creator).eq(signers[5].address);
            expect(tokenContentHash).eq(contentHash);
            expect(metadataContentHash).eq(metadataHash);
            expect(savedTokenURI).eq(tokenURI);
            expect(savedMetadataURI).eq(metadataURI);

        });

        it('should revert if an empty content hash is specified', async () => {
            await expect(
                zapMedia1.mint(
                    { ...mediaData, contentHash: zeroContentHashBytes }, bidShares
                )
            ).revertedWith("Media: content hash must be non-zero");

        });

        it('should revert if the content hash already exists for a created token', async () => {
            await zapMedia2.mint(mediaData, bidShares);

            await expect(
                zapMedia2.mint(mediaData, bidShares)
            ).revertedWith('Media: a token has already been created with this content hash');

        });

        it('should revert if the metadataHash is empty', async () => {
            const secondContentHex = formatBytes32String('invert2');
            const secondContentHash = keccak256(secondContentHex);

            await expect(
                zapMedia1.mint(
                    { ...mediaData, contentHash: secondContentHash, metadataHash: zeroContentHashBytes },
                    bidShares
                )
            ).revertedWith("Media: metadata hash must be non-zero");
        });

        it('should revert if the tokenURI is empty', async () => {
            await expect(
                zapMedia1.mint({ ...mediaData, tokenURI: '' }, bidShares)
            ).revertedWith('Media: specified uri must be non-empty');
        });

        it('should revert if the metadataURI is empty', async () => {

            await expect(
                zapMedia1.mint({ ...mediaData, metadataURI: '' }, bidShares)
            ).revertedWith('Media: specified uri must be non-empty');

        });

        it('should not be able to mint a token with bid shares summing to less than 100', async () => {

            await expect(zapMedia1.mint(mediaData, {
                ...bidShares, creator: {
                    value: BigInt(50000000000000000000)
                }
            })).to.be.revertedWith("Market: Invalid bid shares, must sum to 100");

        });

    });

    describe("#mintWithSig", () => {

        const version = "1";

        beforeEach(async () => {
            tokenURI = String('media contract 1 - token 1 uri');
            metadataURI = String('media contract 1 - metadata 1 uri');

            metadataHex = formatBytes32String("{}");
            metadataHash = keccak256(metadataHex);
            metadataHashBytes = arrayify(metadataHash);

            randomString = Date.now().toString();
            contentHex = formatBytes32String(randomString);
            contentHash = keccak256(contentHex);
            contentHashBytes = arrayify(contentHash);

            zeroContentHashBytes = arrayify(ethers.constants.HashZero);

            mediaData = {
                tokenURI,
                metadataURI,
                contentHash: contentHashBytes,
                metadataHash: metadataHashBytes,
            };

            const zapMediaFactory = await ethers.getContractFactory("ZapMedia");
            const zapMediaInterface = await zapMediaFactory.deploy();

            const mediaDeployerFactory = await ethers.getContractFactory("MediaFactory", signers[0]);

            mediaDeployer = (await upgrades.deployProxy(mediaDeployerFactory, [zapMarket.address, unInitMedia.address], {
                initializer: 'initialize'
            })) as MediaFactory;

            await mediaDeployer.deployed();

            await zapMarket.setMediaFactory(mediaDeployer.address);

            const medias = await deployJustMedias(signers, zapMarket, mediaDeployer);

            zapMedia1 = medias[0];
            zapMedia2 = medias[1];
            zapMedia3 = medias[2];

            await zapMedia1.claimTransferOwnership();
            await zapMedia2.claimTransferOwnership();
            await zapMedia3.claimTransferOwnership();
        })

        it("should mint a token for a given creator with a valid signature", async () => {

            const sig = await signMintWithSig(
                zapMedia1,
                signers,
                contentHash,
                metadataHash,
                version
            );

            const beforeNonce = (
                await zapMedia1.getSigNonces(signers[1].address)
            ).toNumber();

            await zapMedia1.connect(signers[1]).mintWithSig(
                signers[1].address,
                mediaData,
                bidShares,
                sig
            );

            const recovered = await zapMedia1.getTokenCreators(0);
            const recoveredTokenURI = await zapMedia1.tokenURI(0);
            const recoveredMetadataURI = await zapMedia1.tokenMetadataURI(0);
            const recoveredContentHash = await zapMedia1.getTokenContentHashes(0);
            const recoveredMetadataHash = await zapMedia1.getTokenMetadataHashes(0);

            const recoveredCreatorBidShare = (
                await zapMarket.bidSharesForToken(zapMedia1.address, 0)
            ).creator.value;

            const afterNonce = await zapMedia1.getSigNonces(signers[1].address);

            expect(recovered).to.eq(signers[1].address);
            expect(recoveredTokenURI).to.eq(tokenURI);
            expect(recoveredMetadataURI).to.eq(metadataURI);
            expect(recoveredContentHash).to.eq(contentHash);
            expect(recoveredMetadataHash).to.eq(metadataHash);

            expect(recoveredCreatorBidShare).to.eq(
                BigInt(parseInt(bidShares.creator.value._hex))
            );
            expect(afterNonce).to.eq(BigNumber.from(beforeNonce + 1));

        });

        it("should not mint token if caller is not approved", async () => {

            const sig = await signMintWithSig(
                zapMedia2,
                signers,
                contentHashBytes,
                metadataHashBytes,
                version
            );

            await expect(
                zapMedia2
                    .connect(signers[1])
                    .mintWithSig(signers[2].address, mediaData, bidShares, sig)
            ).revertedWith("Media: Only Approved users can mint");

        });

        it("should mint token if caller is approved", async () => {

            const sig = await signMintWithSig(
                zapMedia2,
                signers,
                contentHashBytes,
                metadataHashBytes,
                version
            );

            await zapMedia2.approveToMint(signers[1].address);

            const beforeNonce = (
                await zapMedia2.getSigNonces(signers[1].address)
            ).toNumber();

            await zapMedia2.connect(signers[1]).mintWithSig(
                signers[1].address,
                mediaData,
                bidShares,
                sig
            );

            const recovered = await zapMedia2.getTokenCreators(0);
            const recoveredTokenURI = await zapMedia2.tokenURI(0);
            const recoveredMetadataURI = await zapMedia2.tokenMetadataURI(0);
            const recoveredContentHash = await zapMedia2.getTokenContentHashes(
                0
            );
            const recoveredMetadataHash = await zapMedia2.getTokenMetadataHashes(0);

            const recoveredCreatorBidShare = (await zapMarket.bidSharesForToken(zapMedia2.address, 0)
            ).creator.value;

            const afterNonce = await zapMedia2.getSigNonces(signers[1].address);

            expect(recovered).to.eq(signers[1].address);
            expect(recoveredTokenURI).to.eq(tokenURI);
            expect(recoveredMetadataURI).to.eq(metadataURI);
            expect(recoveredContentHash).to.eq(contentHash);
            expect(recoveredMetadataHash).to.eq(metadataHash);

            expect(recoveredCreatorBidShare).to.eq(
                BigInt(parseInt(bidShares.creator.value._hex))
            );
            expect(afterNonce).to.eq(BigNumber.from(beforeNonce + 1));

        });

        it("should not mint a token for a different creator", async () => {

            const sig = await signMintWithSig(
                zapMedia1,
                signers,
                contentHashBytes,
                metadataHashBytes,
                version
            );

            await expect(
                zapMedia1.mintWithSig(
                    signers[2].address,
                    mediaData,
                    bidShares,
                    sig
                )
            ).revertedWith("Media: Signature invalid");
        });

        it("should not mint a token for a different contentHash", async () => {
            const badContent = "bad bad bad";
            const badContentHex = formatBytes32String(badContent);
            const badContentHashBytes = arrayify(badContentHex);

            const sig = await signMintWithSig(
                zapMedia1,
                signers,
                badContentHashBytes,
                metadataHashBytes,
                version
            );

            await expect(
                zapMedia1.mintWithSig(
                    signers[1].address,
                    mediaData,
                    bidShares,
                    sig
                )
            ).revertedWith("Media: Signature invalid");
        });

        it("should not mint a token for a different metadataHash", async () => {
            const badMetadata = '{"some": "bad", "data": ":)"}';
            const badMetadataHex =
                formatBytes32String(badMetadata);
            const badMetadataHashBytes = arrayify(badMetadataHex);

            const sig = await signMintWithSig(
                zapMedia1,
                signers,
                contentHashBytes,
                badMetadataHashBytes,
                version
            );

            await expect(
                zapMedia1.mintWithSig(
                    signers[1].address,
                    mediaData,
                    bidShares,
                    sig
                )
            ).revertedWith("Media: Signature invalid");
        });

        it("should not mint a token for a different creator bid share", async () => {

            const sig = await signMintWithSig(
                zapMedia1,
                signers,
                contentHashBytes,
                metadataHashBytes,
                version
            );

            let invalidBidShares = {

                collaborators: [
                    ethers.constants.AddressZero,
                    ethers.constants.AddressZero,
                    ethers.constants.AddressZero,
                ],
                collabShares: [
                    BigNumber.from('15000000000000000000'),
                    BigNumber.from('15000000000000000000'),
                    BigNumber.from('15000000000000000000')
                ],
                creator: {
                    value: BigNumber.from('14000000000000000000')
                },
                owner: {
                    value: BigNumber.from('35000000000000000000')
                },
            };

            await expect(
                zapMedia1.mintWithSig(
                    signers[1].address,
                    mediaData,
                    invalidBidShares,
                    sig
                )
            ).revertedWith("Media: Signature invalid");

        });

        it("should not mint a token with an invalid deadline", async () => {
            const sig = await signMintWithSig(
                zapMedia1,
                signers,
                contentHashBytes,
                metadataHashBytes,
                version
            );

            await expect(
                zapMedia1.mintWithSig(
                    signers[1].address,
                    mediaData,
                    bidShares,
                    { ...sig, deadline: "1" }
                )
            ).revertedWith("Media: mintWithSig expired");
        });
    });

    describe('#setAsk', () => {
        beforeEach(async () => {
            tokenURI = String('media contract 1 - token 1 uri');
            metadataURI = String('media contract 1 - metadata 1 uri');

            metadataHex = formatBytes32String("{}");
            metadataHash = keccak256(metadataHex);
            metadataHashBytes = arrayify(metadataHash);

            randomString = Date.now().toString();
            contentHex = formatBytes32String(randomString);
            contentHash = keccak256(contentHex);
            contentHashBytes = arrayify(contentHash);

            zeroContentHashBytes = arrayify(ethers.constants.HashZero);

            mediaData = {
                tokenURI,
                metadataURI,
                contentHash: contentHashBytes,
                metadataHash: metadataHashBytes,
            };
            await zapMedia3.mint(mediaData, bidShares);
        });

        it("should set the ask", async () => {
            expect(await zapMedia3.setAsk(0, ask));
        });

        it('should reject if the ask is 0', async () => {
            await expect(
                zapMedia3.setAsk(0, { ...ask, amount: 0 })
            ).revertedWith("Market: Ask invalid for share splitting");
        });

        it('should reject if the ask amount is invalid and cannot be split', async () => {
            await expect(
                zapMedia3.setAsk(0, { ...ask, amount: 101 })
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
                recipient: signers[8].address,
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
            metadataURI = String('media contract 1 - metadata 1 uri');

            metadataHex = formatBytes32String("{}");
            metadataHash = keccak256(metadataHex);
            metadataHashBytes = arrayify(metadataHash);

            randomString = Date.now().toString();
            contentHex = formatBytes32String(randomString);
            contentHash = keccak256(contentHex);
            contentHashBytes = arrayify(contentHash);

            zeroContentHashBytes = arrayify(ethers.constants.HashZero);

            mediaData = {
                tokenURI,
                metadataURI,
                contentHash: contentHashBytes,
                metadataHash: metadataHashBytes,
            };

            await zapMedia3.mint(mediaData, bidShares);
        });

        it("should revert if the token bidder does not have a high enough allowance for their bidding currency", async () => {
            await zapTokenBsc.mint(signers[1].address, bid1.amount);

            await zapTokenBsc
                .connect(signers[1])
                .approve(zapMarket.address, bid1.amount - 1);

            await expect(
                zapMedia3.connect(signers[1]).setBid(0, bid1)
            ).to.be.revertedWith("SafeERC20: low-level call failed");
        });

        it("should revert if the token bidder does not have a high enough balance for their bidding currency", async () => {
            await zapTokenBsc.mint(signers[1].address, bid1.amount / 2);

            await zapTokenBsc
                .connect(signers[1])
                .approve(zapMarket.address, bid1.amount / 2);

            await expect(
                zapMedia3.connect(signers[1]).setBid(0, bid1)
            ).to.be.revertedWith("SafeERC20: low-level call failed");
        });

        it("should set a bid", async () => {
            await zapTokenBsc.mint(signers[4].address, 100000);

            await zapTokenBsc
                .connect(signers[4])
                .approve(zapMarket.address, 100000);

            expect(await zapMedia3.connect(signers[4]).setBid(0, { ...bid1, bidder: signers[4].address, recipient: signers[4].address }));

            const balance = await zapTokenBsc.balanceOf(signers[4].address);
            expect(balance.toNumber()).eq(100000 - 100);
        });
    });

    describe("#setBid-with-setupAuction", () => {

        let bid1: any;

        beforeEach(async () => {

            bid1 = {
                amount: 100,
                currency: zapTokenBsc.address,
                bidder: signers[1].address,
                recipient: signers[8].address,
                spender: signers[1].address,
                sellOnShare: {
                    value: BigInt(0),
                },
            };

            const zapMediaFactory = await ethers.getContractFactory("ZapMedia");
            const zapMediaInterface = await zapMediaFactory.deploy();

            const mediaDeployerFactory = await ethers.getContractFactory("MediaFactory", signers[0]);

            mediaDeployer = (await upgrades.deployProxy(mediaDeployerFactory, [zapMarket.address, unInitMedia.address], {
                initializer: 'initialize'
            })) as MediaFactory;

            await mediaDeployer.deployed();

            await zapMarket.setMediaFactory(mediaDeployer.address);

            const medias = await deployJustMedias(signers, zapMarket, mediaDeployer);

            zapMedia1 = medias[0];
            zapMedia2 = medias[1];
            zapMedia3 = medias[2];

            await zapMedia1.claimTransferOwnership();
            await zapMedia2.claimTransferOwnership();
            await zapMedia3.claimTransferOwnership();

            tokenURI = String('media contract 1 - token 1 uri');
            metadataURI = String('media contract 1 - metadata 1 uri');

            metadataHex = formatBytes32String("{}");
            metadataHash = keccak256(metadataHex);
            metadataHashBytes = arrayify(metadataHash);

            randomString = Date.now().toString();
            contentHex = formatBytes32String(randomString);
            contentHash = keccak256(contentHex);
            contentHashBytes = arrayify(contentHash);

            zeroContentHashBytes = arrayify(ethers.constants.HashZero);

            mediaData = {
                tokenURI,
                metadataURI,
                contentHash: contentHashBytes,
                metadataHash: metadataHashBytes,
            };

            ask.currency = zapTokenBsc.address

        });

        it('should refund a bid if one already exists for the bidder', async () => {

            await setupAuction(zapMedia2, signers[2]);

            await zapMedia2.connect(signers[4]).setAsk(0, ask);

            expect(await zapMedia2.ownerOf(0)).to.equal(signers[4].address);

            const beforeBalance = await zapTokenBsc.balanceOf(signers[6].address);

            await zapMedia2.connect(signers[6]).setBid(0, { ...bid1, amount: 200, bidder: signers[6].address, recipient: signers[7].address });

            const afterBalance = await zapTokenBsc.balanceOf(signers[6].address);

            expect(afterBalance - 100).eq(beforeBalance - 200);
        });
    });

    async function setupAuction(ownerContract: ZapMedia, ownerWallet: SignerWithAddress) {

        const bid1 = {
            amount: 100,
            currency: zapTokenBsc.address,
            bidder: ownerWallet.address,
            recipient: signers[8].address,
            spender: ownerWallet.address,
            sellOnShare: {
                value: BigInt(0),
            },
        };

        await zapTokenBsc.mint(ownerWallet.address, 10000);
        await zapTokenBsc.mint(signers[3].address, 10000);
        await zapTokenBsc.mint(signers[4].address, 10000);
        await zapTokenBsc.mint(signers[5].address, 10000);
        await zapTokenBsc.mint(signers[6].address, 10000);
        await zapTokenBsc
            .connect(ownerWallet)
            .approve(zapMarket.address, 10000);
        await zapTokenBsc.connect(signers[3]).approve(zapMarket.address, 10000);
        await zapTokenBsc.connect(signers[4]).approve(zapMarket.address, 10000);
        await zapTokenBsc.connect(signers[5]).approve(zapMarket.address, 10000);
        await zapTokenBsc.connect(signers[6]).approve(zapMarket.address, 10000);

        randomString = Date.now().toString();
        contentHex = formatBytes32String(randomString);
        contentHash = keccak256(contentHex);
        contentHashBytes = arrayify(contentHash);

        await ownerContract.connect(ownerWallet).mint({ ...mediaData, contentHash: contentHashBytes }, bidShares);

        await ownerContract.connect(signers[3]).setBid(0, { ...bid1, bidder: signers[3].address, recipient: signers[3].address });

        await ownerContract.connect(ownerWallet).acceptBid(0, { ...bid1, bidder: signers[3].address, recipient: signers[3].address });

        await ownerContract.connect(signers[4]).setBid(0, { ...bid1, bidder: signers[4].address, recipient: signers[4].address });

        await ownerContract.connect(signers[3]).acceptBid(0, { ...bid1, bidder: signers[4].address, recipient: signers[4].address });

        await ownerContract.connect(signers[5]).setBid(0, { ...bid1, bidder: signers[5].address, recipient: signers[5].address });

        await ownerContract.connect(signers[6]).setBid(0, { ...bid1, bidder: signers[6].address, recipient: signers[6].address });
    }

    describe("#removeBid", () => {

        beforeEach(async () => {

            const zapMediaFactory = await ethers.getContractFactory("ZapMedia");
            const zapMediaInterface = await zapMediaFactory.deploy();

            const mediaDeployerFactory = await ethers.getContractFactory("MediaFactory", signers[0]);

            mediaDeployer = (await upgrades.deployProxy(mediaDeployerFactory, [zapMarket.address, unInitMedia.address], {
                initializer: 'initialize'
            })) as MediaFactory;

            await mediaDeployer.deployed();

            await zapMarket.setMediaFactory(mediaDeployer.address);

            const medias = await deployJustMedias(signers, zapMarket, mediaDeployer);

            zapMedia1 = medias[0];
            zapMedia2 = medias[1];
            zapMedia3 = medias[2];

            await zapMedia1.claimTransferOwnership();
            await zapMedia2.claimTransferOwnership();
            await zapMedia3.claimTransferOwnership();

            tokenURI = String('media contract 1 - token 1 uri');
            metadataURI = String('media contract 1 - metadata 1 uri');

            metadataHex = formatBytes32String("{}");
            metadataHash = keccak256(metadataHex);
            metadataHashBytes = arrayify(metadataHash);

            randomString = Date.now().toString();
            contentHex = formatBytes32String(randomString);
            contentHash = keccak256(contentHex);
            contentHashBytes = arrayify(contentHash);

            zeroContentHashBytes = arrayify(ethers.constants.HashZero);

            mediaData = {
                tokenURI,
                metadataURI,
                contentHash: contentHashBytes,
                metadataHash: metadataHashBytes,
            };

            ask.currency = zapTokenBsc.address

            await setupAuction(zapMedia1, signers[1]);

        });

        it("should revert if the bidder has not placed a bid", async () => {

            await expect(
                zapMedia1.connect(signers[4]).removeBid(0)
            ).revertedWith("Market: cannot remove bid amount of 0");

        });

        it('should revert if the tokenId has not yet been created', async () => {

            await expect(zapMedia1.connect(signers[4]).removeBid(100)).revertedWith(
                'Media: token with that id does not exist'
            );

        });

        it('should remove a bid and refund the bidder', async () => {

            const beforeBalance = await zapTokenBsc.balanceOf(signers[6].address);

            await zapMedia1.connect(signers[6]).removeBid(0);

            const afterBalance = await zapTokenBsc.balanceOf(signers[6].address);

            expect(afterBalance.toNumber()).eq(beforeBalance.toNumber() + 100);

        });

        it('should not be able to remove a bid twice', async () => {

            await zapMedia1.connect(signers[6]).removeBid(0);

            await expect(zapMedia1.connect(signers[6]).removeBid(0))
                .revertedWith('Market: cannot remove bid amount of 0');
        });

        it('should remove a bid, even if the token is burned', async () => {

            await zapMedia1
                .connect(signers[4])
                .transferFrom(signers[4].address, signers[1].address, 0);

            await zapMedia1.connect(signers[1]).burn(0);

            const beforeBalance = await zapTokenBsc.balanceOf(
                signers[6].address
            );

            await zapMedia1.connect(signers[6]).removeBid(0);

            const afterBalance = await zapTokenBsc.balanceOf(signers[6].address);

            expect(afterBalance.toNumber()).eq(beforeBalance.toNumber() + 100);

        });
    });

    describe("#acceptBid", () => {

        let bid1: any;

        beforeEach(async () => {

            bid1 = {
                amount: 100,
                currency: zapTokenBsc.address,
                bidder: signers[1].address,
                recipient: signers[8].address,
                spender: signers[1].address,
                sellOnShare: {
                    value: BigInt(10000000000000000000),
                },
            };

            const zapMediaFactory = await ethers.getContractFactory("ZapMedia");
            const zapMediaInterface = await zapMediaFactory.deploy();

            const mediaDeployerFactory = await ethers.getContractFactory("MediaFactory", signers[0]);

            mediaDeployer = (await upgrades.deployProxy(mediaDeployerFactory, [zapMarket.address, unInitMedia.address], {
                initializer: 'initialize'
            })) as MediaFactory;

            await mediaDeployer.deployed();

            await zapMarket.setMediaFactory(mediaDeployer.address);

            const medias = await deployJustMedias(signers, zapMarket, mediaDeployer);

            zapMedia1 = medias[0];
            zapMedia2 = medias[1];
            zapMedia3 = medias[2];

            await zapMedia1.claimTransferOwnership();
            await zapMedia2.claimTransferOwnership();
            await zapMedia3.claimTransferOwnership();

            tokenURI = String('media contract 1 - token 1 uri');
            metadataURI = String('media contract 1 - metadata 1 uri');

            metadataHex = formatBytes32String("{}");
            metadataHash = keccak256(metadataHex);
            metadataHashBytes = arrayify(metadataHash);

            randomString = Date.now().toString();
            contentHex = formatBytes32String(randomString);
            contentHash = keccak256(contentHex);
            contentHashBytes = arrayify(contentHash);

            zeroContentHashBytes = arrayify(ethers.constants.HashZero);

            mediaData = {
                tokenURI,
                metadataURI,
                contentHash: contentHashBytes,
                metadataHash: metadataHashBytes,
            };

            ask.currency = zapTokenBsc.address

            await setupAuction(zapMedia2, signers[2]);

        });

        it('should accept a bid', async () => {

            const bid = {
                ...bid1,
                bidder: signers[6].address,
                recipient: signers[6].address,
                sellOnShare: {
                    value: BigInt(15000000000000000000),
                },
            };

            await zapMedia2.connect(signers[6]).setBid(0, bid);

            const beforeOwnerBalance = (await zapTokenBsc.balanceOf(signers[4].address)).toNumber();

            const beforeCreatorBalance = (await zapTokenBsc.balanceOf(signers[2].address)).toNumber();

            expect(await zapMedia2.connect(signers[4]).acceptBid(0, bid));

            const newOwner = await zapMedia2.ownerOf(0);

            const afterOwnerBalance = (await zapTokenBsc.balanceOf(signers[6].address)).toNumber();

            const afterCreatorBalance = (await zapTokenBsc.balanceOf(signers[2].address)).toNumber();

            const bidShares = await zapMarket.bidSharesForToken(zapMedia2.address, 0);

            // expect(afterOwnerBalance, "Owner's balance should increase by 35").eq(beforeOwnerBalance + 35);

            expect(afterCreatorBalance, "Creator's balance should increase by 15").eq(beforeCreatorBalance + 15);

            expect(newOwner).eq(signers[6].address);

            expect(bidShares.owner.value).eq(BigInt(35000000000000000000));

            expect(bidShares.creator.value).eq(BigInt(15000000000000000000));

        });

        it('should emit a bid finalized event if the bid is accepted', async () => {

            const bid = { ...bid1, bidder: signers[3].address };

            await zapMedia2.connect(signers[3]).setBid(0, bid);

            await zapMedia2.connect(signers[4]).acceptBid(0, bid);

            const zapMarketFilter: EventFilter = zapMarket.filters.BidFinalized(
                null,
                null,
                null
            );

            const event: Event = (
                await zapMarket.queryFilter(zapMarketFilter)
            ).slice(-1)[0];

            const logDescription = zapMarket.interface.parseLog(event);

            expect(logDescription.args.tokenId.toNumber()).to.eq(0);

            expect(logDescription.args.bid.amount.toNumber()).to.eq(bid.amount);

            expect(logDescription.args.bid.currency).to.eq(bid.currency);

            expect(logDescription.args.bid.sellOnShare.value).to.eq(
                bid.sellOnShare.value
            );

            expect(logDescription.args.bid.bidder).to.eq(bid.bidder);

        });

        it('should emit a bid shares updated event if the bid is accepted', async () => {

            const bid = { ...bid1, bidder: signers[5].address };

            await zapMedia2.connect(signers[5]).setBid(0, bid);

            await zapMedia2.connect(signers[4]).acceptBid(0, bid);

            const zapMarketFilter: EventFilter =
                zapMarket.filters.BidShareUpdated(null, null, null);

            const event: Event = (
                await zapMarket.queryFilter(zapMarketFilter)
            ).slice(-1)[0];

            const logDescription = zapMarket.interface.parseLog(event);

            expect(logDescription.args.tokenId.toNumber()).to.eq(0);

            expect(logDescription.args.bidShares.owner.value).to.eq(
                BigInt(35000000000000000000)
            );
            expect(logDescription.args.bidShares.creator.value).to.eq(
                BigInt(15000000000000000000)
            );
        });

        it('should revert if not called by the owner', async () => {

            await setupAuction(zapMedia1, signers[2]);

            await expect(
                zapMedia1.connect(signers[3]).acceptBid(0, { ...bid1, bidder: signers[5].address })

            ).revertedWith('Media: Only approved or owner');

        });

        it('should revert if a non-existent bid is accepted', async () => {

            await expect(
                zapMedia2.connect(signers[4]).acceptBid(0, { ...bid1, bidder: '0x0000000000000000000000000000000000000000' })
            ).revertedWith('Market: cannot accept bid of 0');

        });

        it('should revert if an invalid bid is accepted', async () => {

            const bid = {
                ...bid1,
                bidder: signers[5].address,
                amount: 99,
            };

            await zapMedia2.connect(signers[5]).setBid(0, bid);

            await expect(zapMedia2.connect(signers[4]).acceptBid(0, bid)).revertedWith(
                'Market: Bid invalid for share splitting'
            );

        });
    });

    describe('#transfer', () => {

        it('should remove the ask after a transfer', async () => {

            const zapMediaFactory = await ethers.getContractFactory("ZapMedia");
            const zapMediaInterface = await zapMediaFactory.deploy();
            const mediaDeployerFactory = await ethers.getContractFactory("MediaFactory", signers[0]);

            mediaDeployer = (await upgrades.deployProxy(mediaDeployerFactory, [zapMarket.address, unInitMedia.address], {
                initializer: 'initialize'
            })) as MediaFactory;

            await mediaDeployer.deployed();

            await zapMarket.setMediaFactory(mediaDeployer.address);

            const medias = await deployJustMedias(signers, zapMarket, mediaDeployer);

            zapMedia1 = medias[0];
            zapMedia2 = medias[1];
            zapMedia3 = medias[2];

            await zapMedia1.claimTransferOwnership();
            await zapMedia2.claimTransferOwnership();
            await zapMedia3.claimTransferOwnership();

            tokenURI = String('media contract 1 - token 1 uri');
            metadataURI = String('media contract 1 - metadata 1 uri');

            metadataHex = formatBytes32String("{}");
            metadataHash = keccak256(metadataHex);
            metadataHashBytes = arrayify(metadataHash);

            randomString = Date.now().toString();
            contentHex = formatBytes32String(randomString);
            contentHash = keccak256(contentHex);
            contentHashBytes = arrayify(contentHash);

            zeroContentHashBytes = arrayify(ethers.constants.HashZero);

            mediaData = {
                tokenURI,
                metadataURI,
                contentHash: contentHashBytes,
                metadataHash: metadataHashBytes,
            };

            ask.currency = zapTokenBsc.address

            await setupAuction(zapMedia2, signers[2]);

            await zapMedia2.connect(signers[4]).setAsk(0, ask);

            expect(
                await zapMedia2
                    .connect(signers[4])
                    .transferFrom(signers[4].address, signers[5].address, 0)
            );

            const askB = await zapMarket.currentAskForToken(
                zapMedia2.address,
                0
            );

            expect(await askB.amount.toNumber()).eq(0);

            expect(await askB.currency).eq(
                "0x0000000000000000000000000000000000000000"
            );
        });
    });

    describe('#burn', () => {

        beforeEach(async () => {

            const zapMediaFactory = await ethers.getContractFactory("ZapMedia");
            const zapMediaInterface = await zapMediaFactory.deploy();

            const mediaDeployerFactory = await ethers.getContractFactory("MediaFactory", signers[0]);

            mediaDeployer = (await upgrades.deployProxy(mediaDeployerFactory, [zapMarket.address, unInitMedia.address], {
                initializer: 'initialize'
            })) as MediaFactory;

            await mediaDeployer.deployed();

            await zapMarket.setMediaFactory(mediaDeployer.address);

            const medias = await deployJustMedias(signers, zapMarket, mediaDeployer);

            zapMedia1 = medias[0];
            zapMedia2 = medias[1];
            zapMedia3 = medias[2];

            await zapMedia1.claimTransferOwnership();
            await zapMedia2.claimTransferOwnership();
            await zapMedia3.claimTransferOwnership();

            tokenURI = String('media contract 1 - token 1 uri');
            metadataURI = String('media contract 1 - metadata 1 uri');

            metadataHex = formatBytes32String("{}");
            metadataHash = keccak256(metadataHex);
            metadataHashBytes = arrayify(metadataHash);

            randomString = Date.now().toString();
            contentHex = formatBytes32String(randomString);
            contentHash = keccak256(contentHex);
            contentHashBytes = arrayify(contentHash);

            zeroContentHashBytes = arrayify(ethers.constants.HashZero);

            mediaData = {
                tokenURI,
                metadataURI,
                contentHash: contentHashBytes,
                metadataHash: metadataHashBytes,
            };

            await zapMedia3.mint(mediaData, bidShares);

        });

        it('should revert when the caller is the owner, but not creator', async () => {

            await zapMedia3.connect(signers[3]).transferFrom(
                signers[3].address,
                signers[4].address,
                0
            );

            await expect(zapMedia3.connect(signers[4]).burn(0))
                .revertedWith('Media: owner is not creator of media');

        });

        it("should revert when the caller is approved, but the owner is not the creator", async () => {

            await zapMedia3
                .connect(signers[3])
                .transferFrom(signers[3].address, signers[4].address, 0);

            await zapMedia3.connect(signers[4]).approve(signers[5].address, 0);

            await expect(zapMedia3.connect(signers[5]).burn(0)).revertedWith(
                "Media: owner is not creator of media"
            );

        });

        it('should revert when the caller is not the owner or a creator', async () => {

            await expect(zapMedia3.connect(signers[5]).burn(0)).revertedWith('Media: Only approved or owner');

        });

        it('should revert if the token id does not exist', async () => {

            await expect(zapMedia3.connect(signers[3]).burn(100)).revertedWith('Media: nonexistent token');

        });

        it('should clear approvals, set remove owner, but maintain tokenURI and contentHash when the owner is creator and caller', async () => {

            expect(await zapMedia3.connect(signers[3]).approve(signers[4].address, 0));

            expect(await zapMedia3.connect(signers[3]).burn(0));

            await expect(zapMedia3.connect(signers[3]).ownerOf(0)).revertedWith(
                "ERC721: owner query for nonexistent token"
            );

            const totalSupply = await zapMedia3.connect(signers[3]).totalSupply();

            expect(totalSupply.toNumber()).eq(0);

            await expect(zapMedia3.connect(signers[3]).getApproved(0)).revertedWith(
                'ERC721: approved query for nonexistent token'
            );

            await expect(zapMedia3.connect(signers[3]).tokenURI(0)).revertedWith(
                'ERC721URIStorage: URI query for nonexistent token'
            );

        });

        it('should clear approvals, set remove owner, but maintain tokenURI and contentHash when the owner is creator and caller is approved', async () => {

            expect(await zapMedia3.connect(signers[3]).approve(signers[4].address, 0));

            expect(await zapMedia3.connect(signers[3]).burn(0));

            await expect(zapMedia1.connect(signers[3]).ownerOf(0)).revertedWith(
                "ERC721: owner query for nonexistent token"
            );

            const totalSupply = await zapMedia1.connect(signers[1]).totalSupply();

            expect(totalSupply.toNumber()).eq(0);

            await expect(zapMedia3.connect(signers[3]).getApproved(0)).revertedWith(
                'ERC721: approved query for nonexistent token'
            );

            await expect(zapMedia3.connect(signers[3]).tokenURI(0)).revertedWith(
                'ERC721URIStorage: URI query for nonexistent token'
            );

        });

    });

    describe("#updateTokenURI", async () => {

        beforeEach(async () => {

            const zapMediaFactory = await ethers.getContractFactory("ZapMedia");
            const zapMediaInterface = await zapMediaFactory.deploy();

            const mediaDeployerFactory = await ethers.getContractFactory("MediaFactory", signers[0]);

            mediaDeployer = (await upgrades.deployProxy(mediaDeployerFactory, [zapMarket.address, unInitMedia.address], {
                initializer: 'initialize'
            })) as MediaFactory;

            await mediaDeployer.deployed();

            await zapMarket.setMediaFactory(mediaDeployer.address);

            const medias = await deployJustMedias(signers, zapMarket, mediaDeployer);

            zapMedia1 = medias[0];
            zapMedia2 = medias[1];
            zapMedia3 = medias[2];

            await zapMedia1.claimTransferOwnership();
            await zapMedia2.claimTransferOwnership();
            await zapMedia3.claimTransferOwnership();

            tokenURI = String('media contract 1 - token 1 uri');
            metadataURI = String('media contract 1 - metadata 1 uri');

            metadataHex = formatBytes32String("{}");
            metadataHash = keccak256(metadataHex);
            metadataHashBytes = arrayify(metadataHash);

            randomString = Date.now().toString();
            contentHex = formatBytes32String(randomString);
            contentHash = keccak256(contentHex);
            contentHashBytes = arrayify(contentHash);

            zeroContentHashBytes = arrayify(ethers.constants.HashZero);

            mediaData = {
                tokenURI,
                metadataURI,
                contentHash: contentHashBytes,
                metadataHash: metadataHashBytes,
            };

            await setupAuction(zapMedia1, signers[1]);

        });

        it("should revert if the token does not exist", async () => {

            await expect(
                zapMedia1.connect(signers[1]).updateTokenURI(1, "www.test.com")
            ).revertedWith("ERC721: operator query for nonexistent token");

        });

        it("should revert if the caller is not the owner of the token and does not have approval", async () => {

            await expect(
                zapMedia1.connect(signers[5]).updateTokenURI(0, "www.test.com")
            ).revertedWith("Media: Only approved or owner");

        });

        it("should revert if the uri is empty string", async () => {

            await expect(
                zapMedia1.connect(signers[4]).updateTokenURI(0, "")

            ).revertedWith("Media: specified uri must be non-empty");

        });

        it("should revert if the token has been burned", async () => {

            await zapMedia1.connect(signers[1]).mint(mediaData, bidShares);

            await zapMedia1.connect(signers[1]).burn(1);

            await expect(
                zapMedia1.connect(signers[1]).updateTokenURI(1, "www.test.com")
            ).revertedWith("ERC721: operator query for nonexistent token");

        });

        it("should set the tokenURI to the URI passed if the msg.sender is the owner", async () => {

            await zapMedia1
                .connect(signers[4])
                .updateTokenURI(0, "www.test.com")

            const tokenURI = await zapMedia1.connect(signers[4]).tokenURI(0);

            expect(tokenURI).eq("www.test.com");

        });

        it("should set the tokenURI to the URI passed if the msg.sender is approved", async () => {

            await zapMedia1.connect(signers[4]).approve(signers[5].address, 0);

            expect(
                await zapMedia1
                    .connect(signers[5])
                    .updateTokenURI(0, "www.test.com")
            );

            const tokenURI = await zapMedia1.connect(signers[3]).tokenURI(0);

            expect(tokenURI).eq('www.test.com');

        });

    });

    describe('#updateMetadataURI', async () => {

        beforeEach(async () => {

            const zapMediaFactory = await ethers.getContractFactory("ZapMedia");
            const zapMediaInterface = await zapMediaFactory.deploy();

            const mediaDeployerFactory = await ethers.getContractFactory("MediaFactory", signers[0]);

            mediaDeployer = (await upgrades.deployProxy(mediaDeployerFactory, [zapMarket.address, unInitMedia.address], {
                initializer: 'initialize'
            })) as MediaFactory;

            await mediaDeployer.deployed();

            await zapMarket.setMediaFactory(mediaDeployer.address);

            const medias = await deployJustMedias(signers, zapMarket, mediaDeployer);

            zapMedia1 = medias[0];
            zapMedia2 = medias[1];
            zapMedia3 = medias[2];

            await zapMedia1.claimTransferOwnership();
            await zapMedia2.claimTransferOwnership();
            await zapMedia3.claimTransferOwnership();

            tokenURI = String('media contract 1 - token 1 uri');
            metadataURI = String('media contract 1 - metadata 1 uri');

            metadataHex = formatBytes32String("{}");
            metadataHash = keccak256(metadataHex);
            metadataHashBytes = arrayify(metadataHash);

            randomString = Date.now().toString();
            contentHex = formatBytes32String(randomString);
            contentHash = keccak256(contentHex);
            contentHashBytes = arrayify(contentHash);

            zeroContentHashBytes = arrayify(ethers.constants.HashZero);

            mediaData = {
                tokenURI,
                metadataURI,
                contentHash: contentHashBytes,
                metadataHash: metadataHashBytes,
            };

            await setupAuction(zapMedia2, signers[2]);

        });

        it("should revert if the token does not exist", async () => {

            await expect(
                zapMedia2
                    .connect(signers[2])
                    .updateTokenMetadataURI(1, "www.test.com")

            ).revertedWith("ERC721: operator query for nonexistent token");

        });

        it("should revert if the caller is not the owner of the token and does not have approval", async () => {

            await expect(
                zapMedia2
                    .connect(signers[5])
                    .updateTokenMetadataURI(0, "www.test.com")
            ).revertedWith("Media: Only approved or owner");

        });

        it("should revert if the uri is empty string", async () => {

            await expect(
                zapMedia2.connect(signers[4]).updateTokenMetadataURI(0, "")
            ).revertedWith("Media: specified uri must be non-empty");

        });

        it("should revert if the token has been burned", async () => {

            await zapMedia2.connect(signers[2]).mint(mediaData, bidShares);

            await zapMedia2.connect(signers[2]).burn(1);

            await expect(
                zapMedia2.connect(signers[2]).updateTokenMetadataURI(1, "www.test.com")
            ).revertedWith("ERC721: operator query for nonexistent token");

        });

        it("should set the tokenURI to the URI passed if the msg.sender is the owner", async () => {

            expect(
                await zapMedia2
                    .connect(signers[4])
                    .updateTokenMetadataURI(0, "www.test.com")
            );

            const tokenURI = await zapMedia2
                .connect(signers[4])
                .tokenMetadataURI(0);
            expect(tokenURI).eq("www.test.com");

        });

        it("should set the tokenURI to the URI passed if the msg.sender is approved", async () => {

            await zapMedia2.connect(signers[4]).approve(signers[5].address, 0);

            expect(
                await zapMedia2
                    .connect(signers[5])
                    .updateTokenMetadataURI(0, "www.test.com")
            );

            const tokenURI = await zapMedia2
                .connect(signers[4])
                .tokenMetadataURI(0);

            expect(tokenURI).eq("www.test.com");

        });

    });

    describe("#permit", () => {

        beforeEach(async () => {

            const zapMediaFactory = await ethers.getContractFactory("ZapMedia");
            const zapMediaInterface = await zapMediaFactory.deploy();

            const mediaDeployerFactory = await ethers.getContractFactory("MediaFactory", signers[0]);

            mediaDeployer = (await upgrades.deployProxy(mediaDeployerFactory, [zapMarket.address, unInitMedia.address], {
                initializer: 'initialize'
            })) as MediaFactory;

            await mediaDeployer.deployed();

            await zapMarket.setMediaFactory(mediaDeployer.address);

            const medias = await deployJustMedias(signers, zapMarket, mediaDeployer);

            zapMedia1 = medias[0];
            zapMedia2 = medias[1];
            zapMedia3 = medias[2];

            await zapMedia1.claimTransferOwnership();
            await zapMedia2.claimTransferOwnership();
            await zapMedia3.claimTransferOwnership();

            tokenURI = String('media contract 1 - token 1 uri');
            metadataURI = String('media contract 1 - metadata 1 uri');

            metadataHex = formatBytes32String("{}");
            metadataHash = keccak256(metadataHex);
            metadataHashBytes = arrayify(metadataHash);

            randomString = Date.now().toString();
            contentHex = formatBytes32String(randomString);
            contentHash = keccak256(contentHex);
            contentHashBytes = arrayify(contentHash);

            zeroContentHashBytes = arrayify(ethers.constants.HashZero);

            mediaData = {
                tokenURI,
                metadataURI,
                contentHash: contentHashBytes,
                metadataHash: metadataHashBytes,
            };

            await setupAuction(zapMedia1, signers[1]);

        });

        it("should allow a wallet to set themselves to approved with a valid signature", async () => {

            const sig = await signPermit(
                zapMedia1,
                signers[5].address,
                signers,
                0,
                "1"
            );

            await zapMedia1.connect(signers[4]).permit(signers[5].address, 0, sig);

            expect(await zapMedia1.connect(signers[5]).getApproved(0)).eq(
                signers[5].address
            );

        });

        it("should not allow a wallet to set themselves to approved with an invalid signature", async () => {
            const sig = await signPermit(
                zapMedia1,
                signers[4].address,
                signers,
                0,
                "1"
            );
            await expect(
                zapMedia1.connect(signers[5]).permit(signers[5].address, 0, sig)
            ).revertedWith("Media: Signature invalid");
            expect(await zapMedia1.connect(signers[5]).getApproved(0)).eq(
                ethers.constants.AddressZero
            );
        })
    });

    describe('#supportsInterface', () => {

        beforeEach(async () => {

            const zapMediaFactory = await ethers.getContractFactory("ZapMedia");
            const zapMediaInterface = await zapMediaFactory.deploy();

            const mediaDeployerFactory = await ethers.getContractFactory("MediaFactory", signers[0]);

            mediaDeployer = (await upgrades.deployProxy(mediaDeployerFactory, [zapMarket.address, unInitMedia.address], {
                initializer: 'initialize'
            })) as MediaFactory;

            await mediaDeployer.deployed();

            await zapMarket.setMediaFactory(mediaDeployer.address);

            const medias = await deployJustMedias(signers, zapMarket, mediaDeployer);

            zapMedia1 = medias[0];
            zapMedia2 = medias[1];
            zapMedia3 = medias[2];

            await zapMedia1.claimTransferOwnership();
            await zapMedia2.claimTransferOwnership();
            await zapMedia3.claimTransferOwnership();
        })

        it('should return true to supporting metadata interface', async () => {

            const interfaceId = arrayify('0x5b5e139f');

            const supportsId = await zapMedia1.connect(signers[1]).supportsInterface(interfaceId);

            expect(supportsId).eq(true);

        });

        describe("#revokeApproval", async () => {

            beforeEach(async () => {

                const zapMediaFactory = await ethers.getContractFactory("ZapMedia");
                const zapMediaInterface = await zapMediaFactory.deploy();

                const mediaDeployerFactory = await ethers.getContractFactory("MediaFactory", signers[0]);

                mediaDeployer = (await upgrades.deployProxy(mediaDeployerFactory, [zapMarket.address, unInitMedia.address], {
                    initializer: 'initialize'
                })) as MediaFactory;

                await mediaDeployer.deployed();

                await zapMarket.setMediaFactory(mediaDeployer.address);

                const medias = await deployJustMedias(signers, zapMarket, mediaDeployer);

                zapMedia1 = medias[0];
                zapMedia2 = medias[1];
                zapMedia3 = medias[2];

                await zapMedia1.claimTransferOwnership();
                await zapMedia2.claimTransferOwnership();
                await zapMedia3.claimTransferOwnership();

                tokenURI = String('media contract 1 - token 1 uri');
                metadataURI = String('media contract 1 - metadata 1 uri');

                metadataHex = formatBytes32String("{}");
                metadataHash = keccak256(metadataHex);
                metadataHashBytes = arrayify(metadataHash);

                randomString = Date.now().toString();
                contentHex = formatBytes32String(randomString);
                contentHash = keccak256(contentHex);
                contentHashBytes = arrayify(contentHash);

                zeroContentHashBytes = arrayify(ethers.constants.HashZero);

                mediaData = {
                    tokenURI,
                    metadataURI,
                    contentHash: contentHashBytes,
                    metadataHash: metadataHashBytes,
                };

                await setupAuction(zapMedia2, signers[2]);

            });

            it('should revert if the caller is the creator', async () => {

                await expect(zapMedia2.connect(signers[2]).revokeApproval(0))
                    .to.be.revertedWith('Media: Only approved or owner');

            });

            it('should revert if the caller is neither owner, creator, or approver', async () => {

                await expect(zapMedia2.connect(signers[5]).revokeApproval(0))

                    .to.be.revertedWith('Media: Only approved or owner');

            });

            it('should revoke the approval for token id if caller is approved address', async () => {

                await zapMedia2.connect(signers[4]).approve(signers[5].address, 0);

                await zapMedia2.connect(signers[5]).revokeApproval(0);

                const approved = await zapMedia2.connect(signers[4]).getApproved(0);

                expect(approved).eq(ethers.constants.AddressZero);
            });

        });
    });

    describe("Ownership", () => {
        beforeEach(async () => {
            mediaData = {
                tokenURI,
                metadataURI,
                contentHash: contentHashBytes,
                metadataHash: metadataHashBytes,
            };

            const zapMediaFactory = await ethers.getContractFactory("ZapMedia");
            const zapMediaInterface = await zapMediaFactory.deploy();

            const mediaDeployerFactory = await ethers.getContractFactory("MediaFactory", signers[0]);

            mediaDeployer = (await upgrades.deployProxy(mediaDeployerFactory, [zapMarket.address, unInitMedia.address], {
                initializer: 'initialize'
            })) as MediaFactory;

            await mediaDeployer.deployed();

            await zapMarket.setMediaFactory(mediaDeployer.address);

            const medias = await deployOneMedia(signers[0], zapMarket, mediaDeployer, 101);

            zapMedia1 = medias;
            await zapMedia1.claimTransferOwnership();
        });

        it("Should successfully transfer ownership", async () => {
            let oldOwner = await zapMedia1.getOwner();
            let newOwner = signers[1].address;
            await zapMedia1.initTransferOwnership(newOwner);
            expect(newOwner).to.be.equal(await zapMedia1.appointedOwner());
            expect(oldOwner).to.be.equal(await zapMedia1.getOwner());
            // listen for transferOwnershipInitiated event
            const filter_transferInitiated: EventFilter = zapMedia1.filters.OwnershipTransferInitiated(
                null, null
            );

            const event_transferOwnershipInitated: Event = (
                await zapMedia1.queryFilter(filter_transferInitiated)
            )[1]

            expect(event_transferOwnershipInitated.event).to.be.equal("OwnershipTransferInitiated");
            expect(event_transferOwnershipInitated.args?.owner).to.be.equal(oldOwner);
            expect(event_transferOwnershipInitated.args?.appointedOwner).to.be.equal(newOwner);

            await zapMedia1.connect(signers[1]).claimTransferOwnership();
            expect(newOwner).to.be.equal(await zapMedia1.getOwner());
            expect(ethers.constants.AddressZero).to.be.equal(await zapMedia1.appointedOwner());
            // listen for transferOwnership event
            const filter_transfered: EventFilter = zapMedia1.filters.OwnershipTransferred(
                null, null
            );

            const event_transferredOwnership: Event = (
                await zapMedia1.queryFilter(filter_transfered)
            )[1]

            expect(event_transferredOwnership.event).to.be.equal("OwnershipTransferred");
            expect(event_transferredOwnership.args?.previousOwner).to.be.equal(oldOwner);
            expect(event_transferredOwnership.args?.newOwner).to.be.equal(newOwner);
        });

        it("Should revoke appointed owner", async () => {
            let oldOwner = await zapMedia1.getOwner();
            let newOwner = signers[1].address;

            await zapMedia1.initTransferOwnership(newOwner);
            expect(newOwner).to.be.equal(await zapMedia1.appointedOwner());
            expect(oldOwner).to.be.equal(await zapMedia1.getOwner());
            // listen for transferOwnershipInitiated event
            const filter_transferInitiated: EventFilter = zapMedia1.filters.OwnershipTransferInitiated(
                null, null
            );

            const event_transferOwnershipInitated: Event = (
                await zapMedia1.queryFilter(filter_transferInitiated)
            )[1]

            expect(event_transferOwnershipInitated.event).to.be.equal("OwnershipTransferInitiated");
            expect(event_transferOwnershipInitated.args?.owner).to.be.equal(oldOwner);
            expect(event_transferOwnershipInitated.args?.appointedOwner).to.be.equal(newOwner);

            await zapMedia1.revokeTransferOwnership();
            expect(ethers.constants.AddressZero).to.be.equal(await zapMedia1.appointedOwner());
            expect(oldOwner).to.be.equal(await zapMedia1.getOwner());

            await expect(zapMedia1.connect(signers[1]).claimTransferOwnership()).
                to.be.revertedWith("Ownable: No ownership transfer have been initiated");
        });

        it("Should revert when non owner calls init transfer", async () => {
            let newOwner = signers[1].address;
            await expect(zapMedia1.connect(signers[2]).initTransferOwnership(newOwner)).
                to.be.reverted;


            await expect(zapMedia1.connect(signers[0]).initTransferOwnership(ethers.constants.AddressZero)).
                to.be.revertedWith("Ownable: Cannot transfer to zero address");
        });

        it("Should revert when non owner calls claim transfer", async () => {
            let oldOwner = await zapMedia1.getOwner();
            let newOwner = signers[1].address;

            await zapMedia1.initTransferOwnership(newOwner);
            expect(newOwner).to.be.equal(await zapMedia1.appointedOwner());
            expect(oldOwner).to.be.equal(await zapMedia1.getOwner());
            // listen for transferOwnershipInitiated event
            const filter_transferInitiated: EventFilter = zapMedia1.filters.OwnershipTransferInitiated(
                null, null
            );

            const event_transferOwnershipInitated: Event = (
                await zapMedia1.queryFilter(filter_transferInitiated)
            )[1]

            expect(event_transferOwnershipInitated.event).to.be.equal("OwnershipTransferInitiated");
            expect(event_transferOwnershipInitated.args?.owner).to.be.equal(oldOwner);
            expect(event_transferOwnershipInitated.args?.appointedOwner).to.be.equal(newOwner);

            await expect(zapMedia1.connect(signers[2]).claimTransferOwnership()).
                to.be.revertedWith("Ownable: Caller is not the appointed owner of this contract");
        });

        it("Should revert f owner does not call revoke", async () => {

            const original_owner = await zapMedia1.getOwner();
            const newOwner = await signers[2].address;

            await zapMedia1.initTransferOwnership(newOwner);

            await expect(zapMedia1.connect(signers[1]).revokeTransferOwnership()).
                to.be.revertedWith("onlyOwner error: Only Owner of the Contract can make this Call");

            const owner = await zapMedia1.getOwner();

            expect(original_owner).to.be.equal(owner);

        });

    });

    describe("Upgradeability", () => {
        let mediaContractFactoryV2: ContractFactory;
        let mediaDeployerFactoryV2: ContractFactory;
        let marketFactoryV2: ContractFactory;
        let initData: any[];
        beforeEach(async () => {

            tokenURI = String('media contract 1 - token 1 uri');
            metadataURI = String('media contract 1 - metadata 1 uri');

            metadataHex = formatBytes32String("{}");
            metadataHash = keccak256(metadataHex);
            metadataHashBytes = arrayify(metadataHash);

            randomString = Date.now().toString();
            contentHex = formatBytes32String(randomString);
            contentHash = keccak256(contentHex);
            contentHashBytes = arrayify(contentHash);

            zeroContentHashBytes = arrayify(ethers.constants.HashZero);

            mediaData = {
                tokenURI,
                metadataURI,
                contentHash: contentHashBytes,
                metadataHash: metadataHashBytes,
            };
            const oldVaultArtifact = require('../artifacts/contracts/nft/develop/ZapVaultOld.sol/ZapVaultOld.json');
            const oldVaultABI = oldVaultArtifact.abi;
            const oldVaultBytecode = oldVaultArtifact.bytecode;
            const zapVaultFactory = new ethers.ContractFactory(oldVaultABI, oldVaultBytecode, signers[0]);

            zapVault = (await upgrades.deployProxy(zapVaultFactory, [zapTokenBsc.address], {
                initializer: 'initializeVault'
            })) as ZapVault;

            const oldZMArtifact = require('../artifacts/contracts/nft/develop/ZapMarketOld.sol/ZapMarketOld.json');
            const oldZMABI = oldZMArtifact.abi;
            const oldZMBytecode = oldZMArtifact.bytecode;
            const zapMarketFactory = new ethers.ContractFactory(oldZMABI, oldZMBytecode, signers[0]);

            zapMarket = (await upgrades.deployProxy(zapMarketFactory, [zapVault.address], {
                initializer: 'initializeMarket'
            })) as ZapMarket;
            await zapMarket.deployed();
            await zapMarket.setFee(platformFee);

            const zapMediaFactoryV1 = await ethers.getContractFactory("ZapMediaOld", signers[5]);
            const zapMediaInterface = await zapMediaFactoryV1.deploy();
            const mediaDeployerFactory = await ethers.getContractFactory("MediaFactoryOld", signers[0]);
            mediaDeployer = (await upgrades.deployProxy(mediaDeployerFactory, [zapMarket.address, zapMediaInterface.address], {
                initializer: 'initialize'
            })) as MediaFactory;

            await mediaDeployer.deployed();

            await zapMarket.setMediaFactory(mediaDeployer.address);

            const medias = await deployOneMedia(signers[5], zapMarket, mediaDeployer, 101);

            zapMedia1 = medias;
            await zapMedia1.connect(signers[5]).claimTransferOwnership();

            initData = [
                "TEST MEDIA 2",
                "TM2",
                zapMarket.address,
                false,
                "https://ipfs.io/ipfs/QmTDCTPF6CpUK7DTqcUvRpGysfA1EbgRob5uGsStcCZie6"
            ];

            const zapMediaFactory = await ethers.getContractFactory("ZapMediaOld", signers[0]);
            zapMedia2 = await upgrades.deployProxy(zapMediaFactory, [...initData]) as ZapMedia;
            await zapMedia2.deployed();

            mediaContractFactoryV2 = await ethers.getContractFactory("ZapMedia", signers[0]);
            mediaDeployerFactoryV2 = await ethers.getContractFactory("MediaFactory", signers[0]);

            await zapMedia1.connect(signers[5]).mint(mediaData, bidShares);
            expect(await zapMedia1.ownerOf(0)).to.be.eq(signers[5].address);

            marketFactoryV2 = await ethers.getContractFactory("ZapMarket", signers[0]);

        });
        it("Should be able to upgrade v1 ZapMedia to a version allowing external NFTs", async () => {
            await expect(
                upgrades.upgradeProxy(zapMedia2.address, mediaContractFactoryV2),
                "ensuring that the media contract's storage is fully upgradeable").to.not.be.reverted;

            // upgrading to the new MediaFactory which contains ZapMediaV2
            mediaDeployer = await upgrades.upgradeProxy(mediaDeployer, mediaDeployerFactoryV2) as MediaFactory;
            const owner = await zapMedia1.getOwner();

            // ensuring that ZapMedia can be upgraded
            const zapMediaInterfaceV2 = await mediaContractFactoryV2.deploy();
            await expect(mediaDeployer.connect(signers[0]).upgradeMedia(zapMediaInterfaceV2.address)).to.not.be.reverted;
            // ensuring the state of the contracts are transfered
            expect(await zapMedia1.getOwner()).to.be.eq(owner);
            expect(await zapMedia1.ownerOf(0)).to.be.eq(owner);
            expect(await zapMedia1.getTokenMetadataURIs(0)).to.be.eq(metadataURI);
        });

        it("Should be able to mint once MediaFactory is updated along with ZapMarket", async () => {
            // upgrading to the new MediaFactory which contains ZapMediaV2
            mediaDeployer = await upgrades.upgradeProxy(mediaDeployer, mediaDeployerFactoryV2) as MediaFactory;
            const owner = await zapMedia1.getOwner();
            const zapMediaInterfaceV2 = await mediaContractFactoryV2.deploy();
            await mediaDeployer.connect(signers[0]).upgradeMedia(zapMediaInterfaceV2.address);

            //// minting a second token
            metadataHex = formatBytes32String("{}");
            metadataHash = keccak256(metadataHex);
            metadataHashBytes = arrayify(metadataHash);

            randomString = Date.now().toString();
            contentHex = formatBytes32String(randomString);
            contentHash = keccak256(contentHex);
            contentHashBytes = arrayify(contentHash);

            await expect(zapMedia1.connect(signers[5]).mint(
                {
                    tokenURI: String('media contract 2 - token 2 uri'),
                    metadataURI: String('media contract 2 - metadata 2 uri'),
                    contentHash: contentHashBytes,
                    metadataHash: metadataHashBytes
                },
                bidShares
            ),
                "ZapMarket needs to be updated as well before minting"
            ).to.be.reverted;

            zapMarket = await upgrades.upgradeProxy(zapMarket.address, marketFactoryV2) as ZapMarket;

            await expect(zapMedia1.connect(signers[5]).mint(
                {
                    tokenURI: String('media contract 2 - token 2 uri'),
                    metadataURI: String('media contract 2 - metadata 2 uri'),
                    contentHash: contentHashBytes,
                    metadataHash: metadataHashBytes
                },
                bidShares
            ),
                "ZapMarket needs to be updated as well"
            ).to.not.be.reverted;
            expect(await zapMedia1.ownerOf(1)).to.be.eq(owner);
            expect(await zapMedia1.ownerOf(0), "ensuring that pre-upgrade storage persists").to.be.eq(owner);
        });

        it("Should not allow a non-owner to upgrade the ZapMedia interface", async () => {
            mediaDeployer = await upgrades.upgradeProxy(mediaDeployer, mediaDeployerFactoryV2) as MediaFactory;
            const owner = await zapMedia1.getOwner();

            // owner is signers[5]
            const zapMediaInterfaceV2 = await mediaContractFactoryV2.deploy();
            await expect(
                mediaDeployer.connect(signers[5]).upgradeMedia(zapMediaInterfaceV2.address)
            ).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });

        it("Should not be able to initialize after being upgraded", async () => {
            mediaDeployer = await upgrades.upgradeProxy(mediaDeployer, mediaDeployerFactoryV2) as MediaFactory;
            const zapMediaInterfaceV2 = await mediaContractFactoryV2.deploy();
            await mediaDeployer.connect(signers[0]).upgradeMedia(zapMediaInterfaceV2.address);

            const [tokenname, symbol, marketContractAddr, permissive, collectionMetadata] = initData;

            await expect(zapMedia1.connect(signers[5]).initialize(
                tokenname,
                symbol,
                marketContractAddr,
                permissive,
                collectionMetadata
            )).to.be.revertedWith(
                "Initializable: contract is already initialized"
            );
        });
    });

})
