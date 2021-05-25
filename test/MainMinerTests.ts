// Signers 15, 16, 17, 18, 19, 0 are already miners
import { ethers } from "hardhat";

import { solidity } from "ethereum-waffle";

import chai from "chai";

import { ZapToken } from "../typechain/ZapToken";

import { ZapTransfer } from '../typechain/ZapTransfer';

import { ZapLibrary } from "../typechain/ZapLibrary";

import { ZapDispute } from "../typechain/ZapDispute";

import { ZapStake } from "../typechain/ZapStake";

import { ZapMaster } from "../typechain/ZapMaster";

import { Zap } from "../typechain/Zap";

const { expect } = chai;

chai.use(solidity);

let zapToken: ZapToken;

let zapTransfer: ZapTransfer;

let zapLibrary: ZapLibrary;

let zapDispute: ZapDispute;

let zapStake: ZapStake;

let zapMaster: ZapMaster;

let zap: Zap;

let signers: any

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
        signers[0]
    )

    zapTransfer = (await zapTransferFactory.deploy()) as ZapTransfer
    await zapTransfer.deployed();

    const zapLibraryFactory = await ethers.getContractFactory("ZapLibrary",
        {
            libraries: {
                ZapTransfer: zapTransfer.address,
            },
            signer: signers[0]
        }
    );

    zapLibrary = (await zapLibraryFactory.deploy()) as ZapLibrary
    await zapLibrary.deployed()

    const zapDisputeFactory = await ethers.getContractFactory("ZapDispute", {

        libraries: {
            ZapTransfer: zapTransfer.address,
        },
        signer: signers[0]

    });

    zapDispute = (await zapDisputeFactory.deploy()) as ZapDispute
    await zapDispute.deployed();

    const zapStakeFactory = await ethers.getContractFactory("ZapStake", {

        libraries: {
            ZapTransfer: zapTransfer.address,
            ZapDispute: zapDispute.address
        },
        signer: signers[0]
    })

    zapStake = (await zapStakeFactory.deploy()) as ZapStake
    await zapStake.deployed()

    const zapFactory = await ethers.getContractFactory("Zap", {

        libraries: {
            ZapStake: zapStake.address,
            ZapDispute: zapDispute.address,
            ZapLibrary: zapLibrary.address,
        },
        signer: signers[0]

    })

    zap = (await zapFactory.deploy(zapToken.address)) as Zap
    await zap.deployed()

    const zapMasterFactory = await ethers.getContractFactory("ZapMaster", {
        libraries: {
            ZapTransfer: zapTransfer.address,
            ZapStake: zapStake.address
        },
        signer: signers[0]
    });

    zapMaster = (await zapMasterFactory.deploy(zap.address, zapToken.address)) as ZapMaster
    await zapMaster.deployed()

})

it("Should stake a miner with a balance greater than or equal to 1000 ZAP and return a 1 stake status and an above 0 timestamp",
    async () => {

        // Allocate enough to stake
        await zapToken.allocate(signers[1].address, 1000)

        // Attach the ZapMaster instance to Zap
        zap = zap.attach(zapMaster.address);

        // Connects address 1 as the signer
        zap = zap.connect(signers[1]);

        // Stakes 1000 Zap to initiate a miner
        await zap.depositStake();

        // Gets the balance as hexString
        const getBalance = await zapMaster.balanceOf(signers[1].address);

        // Parses the hexString
        const balance = parseInt(getBalance._hex);

        // Returns an array containing the staker status and timestamp
        // The array values are returned as hexStrings
        const getInfo = await zapMaster.getStakerInfo(signers[1].address);

        // Parses the hexStrings in the array
        const stakerInfo = getInfo.map(info => parseInt(info._hex));

        // Expect the balance to be greater than or equal to 1000
        expect(balance).to.be.greaterThanOrEqual(1000);

        // stakerInfo[0] = Staker Status
        // Expect the staker status to be 1
        expect(stakerInfo[0]).to.equal(1);

        // stakerInfo[1] = Staker Timestamp
        // Expect the staker timestamp to be greater than 0
        expect(stakerInfo[1]).to.greaterThan(0)
    })

it("Should not stake a miner with a balance less than 1000 and return a 0 stake status and timestamp",
    async () => {

        // Allocate enough to not stake
        await zapToken.allocate(signers[2].address, 999);

        // Attach the ZapMaster instance to Zap
        zap = zap.attach(zapMaster.address);

        // Connects address 2 as the signer
        zap = zap.connect(signers[2]);

        // Returns an array containing the staker status and timestamp
        // The array values are returned as hexStrings
        const getInfo = await zapMaster.getStakerInfo(signers[2].address);

        // Parses the hexStrings in the array
        const stakerInfo = getInfo.map(info => parseInt(info._hex));

        // Expects depositStake to fail and revert the transaction
        await expect(zap.depositStake()).to.be.reverted;

        // Expect staker status to be 0
        expect(stakerInfo[0]).to.equal(0);

        // Expect staker timestamp to be 0
        expect(stakerInfo[1]).to.equal(0);

    })

it("Should get a non staked miner and return a 0 stake status and a 0 timestamp ", async () => {

    // Returns an array containing the staker status and timestamp
    // The array values are returned as hexStrings
    const getInfo = await zapMaster.getStakerInfo(signers[2].address);

    // Parses the hexStrings in the array
    const stakerInfo = getInfo.map(info => parseInt(info._hex));

    // Expect staker status to be 0
    expect(stakerInfo[0]).to.equal(0);

    // Expect staker timestamp to be 0
    expect(stakerInfo[1]).to.equal(0);

})



