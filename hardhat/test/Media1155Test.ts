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
    let metadataURI: any;
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

        const unInitMediaFactory = await ethers.getContractFactory('Media1155');

        unInitMedia = (await unInitMediaFactory.deploy()) as Media1155;

    })


    describe("Configure", () => {

        beforeEach(async () => {

            tokenURI = String("media contract 1 - token 1 uri");
            metadataURI = String("media contract 1 - metadata 1 uri");

            tokenURI = String('media contract 1 - token 1 uri');
            metadataURI = String('media contract 1 - metadata 1 uri');

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

            const zapMedia1Address = await zapMarket.mediaContracts(
                signers[1].address,
                BigNumber.from("0")
            );

            const zapMedia2Address = await zapMarket.mediaContracts(
                signers[2].address,
                BigNumber.from("0")
            );

            expect(await zapMedia1Address).to.equal(media1.address);

            expect(await zapMedia2Address).to.equal(media2.address);
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
})