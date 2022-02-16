import { ethers, upgrades } from "hardhat";

import { EventFilter, Event, ContractFactory } from "ethers";

import { solidity } from "ethereum-waffle";

import chai, { expect } from "chai";

import { ZapTokenBSC } from "../typechain/ZapTokenBSC";

import { signPermit, signMintWithSig, deployOneMedia } from "./utils";

import { Media1155 } from '../typechain/Media1155';
import { ZapMarket } from "../typechain/ZapMarket";
import { ZapVault } from "../typechain/ZapVault"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deployJustMedias } from "./utils";


import {
    keccak256,
    formatBytes32String,
    arrayify
} from 'ethers/lib/utils';
import { MediaFactory } from "../typechain";

const { BigNumber } = ethers;

chai.use(solidity);

describe("ZapMedia Test", async () => {
    let zapMarket: ZapMarket;
    let media1: Media1155;
    let media2: Media1155;
    let media3: Media1155;
    let unInitMedia: Media1155;
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
})