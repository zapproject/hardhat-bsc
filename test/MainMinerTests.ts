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
import { exception } from "console";

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
            const getBalance: BigNumber = await zapMaster.balanceOf(signers[1].address);

            // Parses the hexString
            const balance: number = parseInt(getBalance._hex);

            // Returns an array containing the staker status and timestamp
            // The array values are returned as hexStrings
            const getInfo: BigNumber[] = await zapMaster.getStakerInfo(signers[1].address);

            // Parses the hexStrings in the array
            const stakerInfo: number[] = getInfo.map(info => parseInt(info._hex));

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
            const getInfo: BigNumber[] = await zapMaster.getStakerInfo(signers[2].address);

            // Parses the hexStrings in the array
            const stakerInfo: number[] = getInfo.map(info => parseInt(info._hex));

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
        const getInfo: BigNumber[] = await zapMaster.getStakerInfo(signers[2].address);

        // Parses the hexStrings in the array
        const stakerInfo: number[] = getInfo.map(info => parseInt(info._hex));

        // Expect staker status to be 0
        expect(stakerInfo[0]).to.equal(0);

        // Expect staker timestamp to be 0
        expect(stakerInfo[1]).to.equal(0);

    })

    it("Should get the stakeAmount uintVar", async () => {

        // Converts the uintVar "stakeAmount" to a bytes array
        const stakeAmtBytes: Uint8Array = ethers.utils.toUtf8Bytes("stakeAmount");

        // Converts the uintVar "stakeAmount" from a bytes array to a keccak256 hash
        const stakeAmtHash: string = ethers.utils.keccak256(stakeAmtBytes);

        // Gets the the current stake amount
        const getStakeAmt: BigNumber = await zapMaster.getUintVar(stakeAmtHash);

        // Parses getStakeAmt from a hexString to a number
        const stakeAmt: number = parseInt(getStakeAmt._hex);

        // Expect stakeAmt to equal 1000
        expect(stakeAmt).to.equal(1000);

    })

    it("Should get the stakerCount uintVar", async () => {

        // Converts the uintVar "stakerCount" to a bytes array
        const stakerCountBytes: Uint8Array = ethers.utils.toUtf8Bytes("stakerCount");

        // Converts the uintVar "stakerCount" from a bytes array to a keccak256 hash
        const stakerCountHash: string = ethers.utils.keccak256(stakerCountBytes);

        // Gets the number of parties currently staked
        const getStakerCount: BigNumber = await zapMaster.getUintVar(stakerCountHash);

        // Parsed the getStakerCount from a hexString to a number
        const stakerCount: number = parseInt(getStakerCount._hex);

        // Expect stakerCount to equal 6
        expect(stakerCount).to.equal(6);

    })

    it("Should request staking withdraw", async () => {

        // Allocate enough to stake
        await zapToken.allocate(signers[1].address, 1000);

        // Attach the ZapMaster instance to Zap
        zap = zap.attach(zapMaster.address);

        // Connects address 1 as the signer
        zap = zap.connect(signers[1]);

        // Attach the ZapMaster instance to Zap
        zap = zap.attach(zapMaster.address);

        // Connects address 1 as the signer
        zap = zap.connect(signers[1]);

        // Stakes 1000 Zap to initiate a miner
        await zap.depositStake();

        // Returns an array containing the staker status and timestamp
        // The array values are returned as hexStrings
        const getPostStakerInfo: BigNumber[] = await zapMaster.getStakerInfo(signers[1].address);

        // Parses the hexStrings in the array
        const postStakerInfo: number[] = getPostStakerInfo.map(info => parseInt(info._hex));

        // Request to withdraw stake
        await zap.requestStakingWithdraw();

        // Returns an array containing the staker status and timestamp
        // The array values are returned as hexStrings
        const getPostReqInfo: BigNumber[] = await zapMaster.getStakerInfo(signers[1].address);

        // Parses the hexStrings in the array
        const postReqInfo: number[] = getPostReqInfo.map(info => parseInt(info._hex));

        // Withdraws the stake 
        await zap.withdrawStake();

        // Returns an array containing the staker status and timestamp
        // The array values are returned as hexStrings
        const getPostWthDrwInfo: BigNumber[] = await zapMaster.getStakerInfo(signers[1].address);

        // Parses the hexStrings in the array
        const postWthDrwInfo: number[] = getPostWthDrwInfo.map(info => parseInt(info._hex));

        // Expects the staker status to equal 1 after staking
        // 1 = Staked
        expect(postStakerInfo[0]).to.equal(1);

        // Expects the timestamp to be greater than 0
        expect(postStakerInfo[1]).to.be.greaterThan(0);

        // Expects the staker status to equal 2 after requesting a withdrawal
        // 2 = Staker request withdrawal
        expect(postReqInfo[0]).to.equal(2);

        // Expects the timestamp to be greater than 0
        expect(postStakerInfo[1]).to.be.greaterThan(0);

        // Expects the staker status to equal 0 after stake withdrawal
        // 0 = Not staked
        expect(postWthDrwInfo[0]).to.equal(0);

        // Expects the timestamp to be greater than 0
        expect(postWthDrwInfo[1]).to.be.greaterThan(0);

    })

    it("Should withdraw and re-stake", async () => {

        // Allocate enough to stake
        await zapToken.allocate(signers[1].address, 1000);

        // Attach the ZapMaster instance to Zap
        zap = zap.attach(zapMaster.address);

        // Connects address 1 as the signer
        zap = zap.connect(signers[1]);

        // Attach the ZapMaster instance to Zap
        zap = zap.attach(zapMaster.address);

        // Stakes 1000 Zap to initiate a miner
        await zap.depositStake();

        // Request to withdraw stake
        await zap.requestStakingWithdraw();

        // Returns an array containing the staker status and timestamp
        // The array values are returned as hexStrings
        const getPostReqInfo: BigNumber[] = await zapMaster.getStakerInfo(signers[1].address);

        // Parses the hexStrings in the array
        const postReqInfo: number[] = getPostReqInfo.map(info => parseInt(info._hex));

        // Withdraws the stake
        await zap.withdrawStake();

        // Gets the staker info after stake withdrawal
        // Returns an array of hexStrings
        const getPostWthDrwInfo: BigNumber[] = await zapMaster.getStakerInfo(signers[1].address);

        // Parses the hexStrings in the array
        const postWthDrwInfo: number[] = getPostWthDrwInfo.map(info => parseInt(info._hex));

        // Stake deposit
        await zap.depositStake();

        // Returns an array containing the staker status and timestamp
        // The array values are returned as hexStrings
        const getPostStakerInfo: BigNumber[] = await zapMaster.getStakerInfo(signers[1].address);

        // Parses the hexStrings inside the array
        const postStakerInfo: number[] = getPostStakerInfo.map(info => parseInt(info._hex));

        // Expects the staker status after the withdrawal request to equal 2
        expect(postReqInfo[0]).to.equal(2);

        // Expects the staker status after withdrawal to equal 0
        expect(postWthDrwInfo[0]).to.equal(0);

        // Expects the staker status after depositing a stake to equal 1
        expect(postStakerInfo[0]).to.equal(1)

    })

    it("Should not be able to withdraw unapproved", async () => {

        // Allocate enough to stake
        await zapToken.allocate(signers[1].address, 1000);

        // Attach the ZapMaster instance to Zap
        zap = zap.attach(zapMaster.address);

        // Connects address 1 as the signer
        zap = zap.connect(signers[1]);

        // Attach the ZapMaster instance to Zap
        zap = zap.attach(zapMaster.address);

        // Stakes 1000 Zap to initiate a miner
        await zap.depositStake();

        // Expect withdrawStake to fail and revert the transaction
        // Can not withdrawStake wihthout submitting a request
        await expect(zap.withdrawStake()).to.be.reverted;

    })

    it("Should transfer tokens", async () => {

        // Transfer amount
        const transferAmt: number = 2500;

        // Connects signer 1 to Zap.sol
        zap = zap.connect(signers[1]);

        // Attaches the ZapToken.sol address to Zap.sol
        zap = zap.attach(zapToken.address);

        // Allocated 5000 tokens to signer 1
        await zapToken.allocate(signers[1].address, 5000);

        // Ge
        const getSigner1Bal: BigNumber = await zapMaster.balanceOf(signers[1].address);

        const signer1Bal: number = parseInt(getSigner1Bal._hex);

        await zap.transfer(signers[2].address, transferAmt);

        const getPostSigner1Bal: BigNumber = await zapMaster.balanceOf(signers[1].address);

        // Gets the b
        const postSigner1Bal: number = parseInt(getPostSigner1Bal._hex);

        // Gets the balance of signer 2 and returns the value as a hexString
        const getSigner2Bal: BigNumber = await zapMaster.balanceOf(signers[2].address);

        // Parses the balance of signer 2 from a hexString to a number
        const signer2Bal: number = parseInt(getSigner2Bal._hex);

        // Expects the balance of signer 1 after transferring to equal the original balance minus
        // the transferAmt(2500)
        expect(postSigner1Bal).to.equal(signer1Bal - transferAmt);

        // Expects the balance of signer 2 to equal transferAmt(2500)
        expect(signer2Bal).to.equal(transferAmt);

    });

    it('Should get the dispute fee', async () => {

        // Converts the uintVar "disputeFee" to a bytes array
        const disputeFeeBytes: Uint8Array = ethers.utils.toUtf8Bytes("disputeFee");

        // Converts the uintVar "disputeFee" from a bytes array to a keccak256 hash
        const disputeFeeHash: string = ethers.utils.keccak256(disputeFeeBytes)

        // Gets the dispute fee
        const getDisputeFee: BigNumber = await zapMaster.getUintVar(disputeFeeHash);

        // Parses the dispute fee from a hexString to a number
        const disputeFee: number = parseInt(getDisputeFee._hex);

        // Expects the dispute fee to equal 970
        expect(disputeFee).to.equal(970);
    })

    it("Should test deity functions", async () => {

        // Converts the uintVar "_deity" to a bytes array
        const deityBytes: Uint8Array = ethers.utils.toUtf8Bytes("_deity");

        // Converts the uintVar "_deity" from a bytes array to a keccak256 hash
        const deityHash: string = ethers.utils.keccak256(deityBytes)

        // Gets the deity(owner)
        const initialDeity: string = await zapMaster.getAddressVars(deityHash);

        // Changes the deity from address 0 to address 1
        await zapMaster.changeDeity(signers[1].address)

        // Gets the new deity 
        const newDeity: string = await zapMaster.getAddressVars(deityHash);

        // Expects the deity to be address 0 
        expect(initialDeity).to.equal(signers[0].address);

        // Expects the new deity to equal address 1
        expect(newDeity).to.equal(signers[1].address);

    })

    it("Should get token supply", async () => {

        const getSupply = await zapMaster.totalTokenSupply();

        const supply = parseInt(getSupply._hex);

        expect(supply).to.equal(6000);

    })

    it("Should get token name", async () => {

        // Gets the token name
        const name: string = await zapMaster.getName();

        // Expects the token name to equal Zap Token
        expect(name).to.equal("Zap Token");
    })

})
