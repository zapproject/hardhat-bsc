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

import { BigNumber, ContractFactory } from "ethers";
import { FormatTypes } from "ethers/lib/utils";

const { expect } = chai;

chai.use(solidity);

let zapToken: ZapToken;

let zapTransfer: ZapTransfer;

let zapLibrary: ZapLibrary;

let zapDispute: ZapDispute;

let zapStake: ZapStake;

let zapMaster: ZapMaster;

let zap: Zap;

let signers: any;

describe("Main Miner Functions", () => {

    beforeEach(async () => {

        signers = await ethers.getSigners();

        const zapTokenFactory: ContractFactory = await ethers.getContractFactory(
            "ZapToken",
            signers[0]
        )

        zapToken = (await zapTokenFactory.deploy()) as ZapToken;
        await zapToken.deployed()

        const zapTransferFactory: ContractFactory = await ethers.getContractFactory(
            "ZapTransfer",
            signers[0]
        )

        zapTransfer = (await zapTransferFactory.deploy()) as ZapTransfer
        await zapTransfer.deployed();

        const zapLibraryFactory: ContractFactory = await ethers.getContractFactory("ZapLibrary",
            {
                libraries: {
                    ZapTransfer: zapTransfer.address,
                },
                signer: signers[0]
            }
        );

        zapLibrary = (await zapLibraryFactory.deploy()) as ZapLibrary
        await zapLibrary.deployed()

        const zapDisputeFactory: ContractFactory = await ethers.getContractFactory("ZapDispute", {

            libraries: {
                ZapTransfer: zapTransfer.address,
            },
            signer: signers[0]

        });

        zapDispute = (await zapDisputeFactory.deploy()) as ZapDispute
        await zapDispute.deployed();

        const zapStakeFactory: ContractFactory = await ethers.getContractFactory("ZapStake", {

            libraries: {
                ZapTransfer: zapTransfer.address,
                ZapDispute: zapDispute.address
            },
            signer: signers[0]
        })

        zapStake = (await zapStakeFactory.deploy()) as ZapStake
        await zapStake.deployed()

        const zapFactory: ContractFactory = await ethers.getContractFactory("Zap", {

            libraries: {
                ZapStake: zapStake.address,
                ZapDispute: zapDispute.address,
                ZapLibrary: zapLibrary.address,
            },
            signer: signers[0]

        })

        zap = (await zapFactory.deploy(zapToken.address)) as Zap
        await zap.deployed()

        const zapMasterFactory: ContractFactory = await ethers.getContractFactory("ZapMaster", {
            libraries: {
                ZapTransfer: zapTransfer.address,
                ZapStake: zapStake.address
            },
            signer: signers[0]
        });

        zapMaster = (await zapMasterFactory.deploy(zap.address, zapToken.address)) as ZapMaster
        await zapMaster.deployed()

        for (var i = 0; i < signers.length; i++) {

            await zapToken.allocate(signers[i].address, 5000);

        }

    })

    it("Should have an initial stake status of 0", async () => {

        for (var i = 0; i < signers.length; i++) {

            const getStakeStatus = await zapMaster.getStakerInfo(signers[i].address);

            const stakeStatus = parseInt(getStakeStatus[0]._hex);

            expect(stakeStatus).to.equal(0)

        }

    })

    it("Should have an initial staker count of 0", async () => {

        // Converts the uintVar "stakerCount" to a bytes array
        const stakerCountBytes: Uint8Array = ethers.utils.toUtf8Bytes("stakerCount");

        // Converts the uintVar "stakerCount" from a bytes array to a keccak256 hash
        const stakerCountHash: string = ethers.utils.keccak256(stakerCountBytes);

        // Gets the number of parties currently staked
        const getStakerCount: BigNumber = await zapMaster.getUintVar(stakerCountHash);

        // Parsed the getStakerCount from a hexString to a number
        const stakerCount: number = parseInt(getStakerCount._hex);

        expect(stakerCount).to.equal(0)

    })

    it("Should be able to stake all test accounts", async () => {

        // Iterates through signers 0 through 20
        for (var i = 0; i < signers.length; i++) {

            // Attach the ZapMaster instance to Zap
            zap = zap.attach(zapMaster.address);

            // Connects addresses 0-20 as the signer
            zap = zap.connect(signers[i]);

            // Stakes 1000 Zap to initiate a miner
            await zap.depositStake();

            const getStakeStatus = await zapMaster.getStakerInfo(signers[i].address);

            const stakeStatus = parseInt(getStakeStatus[0]._hex);

            expect(stakeStatus).to.equal(1);
        }

        // Converts the uintVar "stakerCount" to a bytes array
        const stakerCountBytes: Uint8Array = ethers.utils.toUtf8Bytes("stakerCount");

        // Converts the uintVar "stakerCount" from a bytes array to a keccak256 hash
        const stakerCountHash: string = ethers.utils.keccak256(stakerCountBytes);

        // Gets the number of parties currently staked
        const getStakerCount: BigNumber = await zapMaster.getUintVar(stakerCountHash);

        // Parsed the getStakerCount from a hexString to a number
        const stakerCount: number = parseInt(getStakerCount._hex);

        expect(stakerCount).to.equal(signers.length)

    })

    it("Test mine", async () => {

        let x: string;

        let apix: string;

        // Request string
        const api: string = "json(https://api.pro.coinbase.com/products/ETH-USD/ticker).price";

        // Iterates through signers 0 through 20
        for (var i = 0; i < signers.length; i++) {

            // Attach the ZapMaster instance to Zap
            zap = zap.attach(zapMaster.address);

            // Connects addresses 0-20 as the signer
            zap = zap.connect(signers[i]);

            // Stakes 1000 Zap to initiate a miner
            await zap.depositStake();
        }

        zap = zap.connect(signers[0]);

        // Approves Zap.sol the amount to tip for requestData
        await zapToken.approve(zap.address, 5000)

        // Iterates the length of the requestQ array
        for (var i = 0; i < 52; i++) {

            x = "USD" + i;
            apix = api + i;

            // Submits the query string as the request
            // Each request will add a tip starting at 51 and count down until 0
            // Each tip will be stored inside the requestQ array
            await zap.requestData(apix, x, 1000, 52 - i);
        }

        for (var i = 0; i < 10; i++) {

            // Connects address 1 as the signer
            zap = zap.connect(signers[i]);

            // // Each Miner will submit a mining solution
            await zap.submitMiningSolution("nonce", 1, 1200);

        }

        console.log(await zap.getNewCurrentVariables())

    })

})
