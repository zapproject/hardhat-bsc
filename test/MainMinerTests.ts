// Signers 15, 16, 17, 18, 19, 0 are already miners
import { ethers } from "hardhat";

import { solidity } from "ethereum-waffle"

import chai from "chai";

import { ZapToken } from "../typechain/ZapToken";

import { ZapTransfer } from '../typechain/ZapTransfer';

import { ZapLibrary } from "../typechain/ZapLibrary";

import { ZapDispute } from "../typechain/ZapDispute";

import { ZapStake } from "../typechain/ZapStake";

import { ZapMaster } from "../typechain/ZapMaster";

import { Zap } from "../typechain/Zap";

const { expect } = chai;

let zapToken: ZapToken;

let zapTransfer: ZapTransfer;

let zapLibrary: ZapLibrary;

let zapDispute: ZapDispute;

let zapStake: ZapStake;

let zapMaster: ZapMaster;

let zap: Zap;

let signers: any

let allocatedAmt = 999999999;

beforeEach(async () => {

    signers = await ethers.getSigners();

    const zapTokenFactory = await ethers.getContractFactory(
        "ZapToken",
        signers[0]
    )

    zapToken = (await zapTokenFactory.deploy()) as ZapToken;
    await zapToken.deployed()

    const zapTransferFactory = await ethers.getContractFactory(
        "ZapTransfer",
        signers[8]
    )

    zapTransfer = (await zapTransferFactory.deploy()) as ZapTransfer
    await zapTransfer.deployed();

    const zapLibraryFactory = await ethers.getContractFactory("ZapLibrary",
        {
            libraries: {
                ZapTransfer: zapTransfer.address,
            },
            signer: signers[8]
        }
    );

    zapLibrary = (await zapLibraryFactory.deploy()) as ZapLibrary
    await zapLibrary.deployed()

    const zapDisputeFactory = await ethers.getContractFactory("ZapDispute", {

        libraries: {
            ZapTransfer: zapTransfer.address,
        },
        signer: signers[8]

    });

    zapDispute = (await zapDisputeFactory.deploy()) as ZapDispute
    await zapDispute.deployed();

    const zapStakeFactory = await ethers.getContractFactory("ZapStake", {

        libraries: {
            ZapTransfer: zapTransfer.address,
            ZapDispute: zapDispute.address
        },
        signer: signers[8]
    })

    zapStake = (await zapStakeFactory.deploy()) as ZapStake
    await zapStake.deployed()

    const zapFactory = await ethers.getContractFactory("Zap", {

        libraries: {
            ZapStake: zapStake.address,
            ZapDispute: zapDispute.address,
            ZapLibrary: zapLibrary.address,
        },
        signer: signers[8]

    })

    zap = (await zapFactory.deploy(zapToken.address)) as Zap
    await zap.deployed()

    const zapMasterFactory = await ethers.getContractFactory("ZapMaster", {
        libraries: {
            ZapTransfer: zapTransfer.address,
            ZapStake: zapStake.address
        },
        signer: signers[8]
    });

    zapMaster = (await zapMasterFactory.deploy(zap.address, zapToken.address)) as ZapMaster
    await zapMaster.deployed()

    await zapToken.allocate(signers[8].address, allocatedAmt)

})

it("Should stake a miner", async () => {

    // Connect
    zap = zap.attach(zapMaster.address)

    await zap.depositStake()

    const test = await zapMaster.getStakerInfo(signers[8].address)



})

