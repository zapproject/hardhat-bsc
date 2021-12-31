import { ethers } from "hardhat";

import { solidity } from "ethereum-waffle";

import chai from "chai";

import { ZapTokenBSC } from "../typechain/ZapTokenBSC";

import { ZapLibrary } from "../typechain/ZapLibrary";

import { ZapDispute } from "../typechain/ZapDispute";

import { ZapStake } from "../typechain/ZapStake";

import { ZapMaster } from "../typechain/ZapMaster";

import { Zap } from "../typechain/Zap";

import { Vault } from "../typechain/Vault";

import { BigNumber, ContractFactory } from "ethers";

const { expect } = chai;

chai.use(solidity);

let zapTokenBsc: ZapTokenBSC;

let zapLibrary: ZapLibrary;

let zapLibrary2: ZapLibrary;

let zapDispute: ZapDispute;

let zapDispute2: ZapDispute;

let zapStake: ZapStake;

let zapStake2: ZapStake;

let zapMaster: ZapMaster;

let zap: Zap;

let zap2: Zap;

let vault: Vault;

let vault2: Vault;

let signers: any;

let zapAddress: string;

let zapMasterFactory: ContractFactory

describe("Fork Tests", () => {

    beforeEach(async () => {

        signers = await ethers.getSigners();

        const zapTokenFactory: ContractFactory = await ethers.getContractFactory(
            "ZapTokenBSC",
            signers[0]
        )

        zapTokenBsc = (await zapTokenFactory.deploy()) as ZapTokenBSC;
        await zapTokenBsc.deployed();

        const zapLibraryFactory: ContractFactory = await ethers.getContractFactory("ZapLibrary",
            {
                signer: signers[0]
            }
        );

        zapLibrary = (await zapLibraryFactory.deploy()) as ZapLibrary
        await zapLibrary.deployed();

        const zapLibraryFactory2: ContractFactory = await ethers.getContractFactory("ZapLibrary",
            {
                signer: signers[0]
            }
        );

        zapLibrary2 = (await zapLibraryFactory2.deploy()) as ZapLibrary
        await zapLibrary2.deployed();

        const zapDisputeFactory: ContractFactory = await ethers.getContractFactory("ZapDispute", {

            signer: signers[0]

        });

        zapDispute = (await zapDisputeFactory.deploy()) as ZapDispute
        await zapDispute.deployed();

        const zapDisputeFactory2: ContractFactory = await ethers.getContractFactory("ZapDispute", {

            signer: signers[0]

        });

        zapDispute2 = (await zapDisputeFactory2.deploy()) as ZapDispute
        await zapDispute2.deployed();

        const zapStakeFactory: ContractFactory = await ethers.getContractFactory("ZapStake", {

            libraries: {
                ZapDispute: zapDispute.address
            },
            signer: signers[0]
        });

        zapStake = (await zapStakeFactory.deploy()) as ZapStake
        await zapStake.deployed();

        const zapStakeFactory2: ContractFactory = await ethers.getContractFactory("ZapStake", {

            libraries: {
                ZapDispute: zapDispute2.address
            },
            signer: signers[0]
        });

        zapStake2 = (await zapStakeFactory2.deploy()) as ZapStake
        await zapStake2.deployed();

        const zapFactory: ContractFactory = await ethers.getContractFactory("Zap", {

            libraries: {
                ZapStake: zapStake.address,
                ZapDispute: zapDispute.address,
                ZapLibrary: zapLibrary.address,
            },
            signer: signers[0]

        });

        zap = (await zapFactory.deploy(zapTokenBsc.address)) as Zap
        await zap.deployed();
        zapAddress = zap.address;

        const zapFactory2: ContractFactory = await ethers.getContractFactory("Zap", {

            libraries: {
                ZapStake: zapStake2.address,
                ZapDispute: zapDispute2.address,
                ZapLibrary: zapLibrary2.address,
            },
            signer: signers[0]

        });

        zap2 = (await zapFactory2.deploy(zapTokenBsc.address)) as Zap
        await zap2.deployed();

        zapMasterFactory = await ethers.getContractFactory("ZapMaster", {
            libraries: {
                ZapStake: zapStake.address
            },
            signer: signers[0]
        });

        zapMaster = (await zapMasterFactory.deploy(zap.address, zapTokenBsc.address)) as ZapMaster
        await zapMaster.deployed();

        const Vault: ContractFactory = await ethers.getContractFactory('Vault', { signer: signers[0] });
        vault = (await Vault.deploy(zapTokenBsc.address, zapMaster.address)) as Vault
        await vault.deployed();

        await zapMaster.functions.changeVaultContract(vault.address);

        await zapTokenBsc.allocate(zapMaster.address, BigNumber.from("10000000000000000000000000"));

        zap = zap.attach(zapMaster.address);

        // stake signers 1 to 5.
        for (let i = 0; i <= 5; i++) {
            await zapTokenBsc.allocate(signers[i].address, BigNumber.from("1100000000000000000000000"));
            zap = zap.connect(signers[i]);
    
            await zapTokenBsc.connect(signers[i]).approve(zapMaster.address, BigNumber.from("500000000000000000000000"));
            await zap.depositStake();
        }
    });
 
    it("Should fork successfully with new contracts", async () => {
        // begin proposing fork
        zap = zap.connect(signers[0]);
        // Converts the uintVar "disputeFee" to a bytes array
        const disputeFeeBytes: Uint8Array = ethers.utils.toUtf8Bytes("disputeFee");

        // Converts the uintVar "disputeFee" from a bytes array to a keccak256 hash
        const disputeFeeHash: string = ethers.utils.keccak256(disputeFeeBytes)

        // Gets the dispute fee
        const disputeFee: BigNumber = await zapMaster.getUintVar(disputeFeeHash);

        // expect(balance).to.greaterThanOrEqual(getDisputeFee);
        await zapTokenBsc.approve(zap.address, disputeFee);
    
        await zap.proposeFork(zap2.address, 1);

        // Convert to a bytes array
        const disputeCount: Uint8Array = ethers.utils.toUtf8Bytes('disputeCount');

        // Convert to a keccak256 hash
        const ddisputecount: string = ethers.utils.keccak256(disputeCount);

        let disputeId = await zapMaster.getUintVar(ddisputecount);
        // test dispute count after beginDispute
        expect(disputeId).to.equal(1, 'Dispute count should be 1.');

        let disp = await zapMaster.getAllDisputeVars(disputeId);
        expect(disp[5]).to.equal(zap2.address, "The proposed fork new zap address is incorrect");

        // start vote for fork
        for (var i = 1; i <= 5; i++) {
            zap = zap.connect(signers[i]);
            await zap.vote(disputeId, true);
        }

        // Increase the evm time by 8 days
        // A stake can not be withdrawn until 7 days passed
        await ethers.provider.send('evm_increaseTime', [691200]);
        // tally votes
        await zap.connect(signers[1]).tallyVotes(disputeId);
        // Convert to a bytes array
        const bytesZAddress: Uint8Array = ethers.utils.toUtf8Bytes('zapContract');

        // Convert to a keccak256 hash
        const hashZAddress: string = ethers.utils.keccak256(bytesZAddress);
        let newZapAddress = await zapMaster.getAddressVars(hashZAddress);
        expect(zap2.address).to.equal(newZapAddress);
    });

    it("Should fail fork with new contracts", async () => {
        // begin proposing fork
        zap = zap.connect(signers[0]);
        // Converts the uintVar "disputeFee" to a bytes array
        const disputeFeeBytes: Uint8Array = ethers.utils.toUtf8Bytes("disputeFee");

        // Converts the uintVar "disputeFee" from a bytes array to a keccak256 hash
        const disputeFeeHash: string = ethers.utils.keccak256(disputeFeeBytes)

        // Gets the dispute fee
        const disputeFee: BigNumber = await zapMaster.getUintVar(disputeFeeHash);

        // Convert to a bytes array
        const bytesZAddress: Uint8Array = ethers.utils.toUtf8Bytes('zapContract');

        // Convert to a keccak256 hash
        const hashZAddress: string = ethers.utils.keccak256(bytesZAddress);

        // expect(balance).to.greaterThanOrEqual(getDisputeFee);
        await zapTokenBsc.approve(zap.address, disputeFee);
    
        await zap.proposeFork(zap2.address, 1);

        // Convert to a bytes array
        const disputeCount: Uint8Array = ethers.utils.toUtf8Bytes('disputeCount');

        // Convert to a keccak256 hash
        const ddisputecount: string = ethers.utils.keccak256(disputeCount);

        let disputeId = await zapMaster.getUintVar(ddisputecount);
        // test dispute count after beginDispute
        expect(disputeId).to.equal(1, 'Dispute count should be 1.');

        let disp = await zapMaster.getAllDisputeVars(disputeId);
        expect(disp[5]).to.equal(zap2.address, "The proposed fork new zap address is incorrect");

        // start vote for fork
        for (var i = 1; i <= 5; i++) {
            zap = zap.connect(signers[i]);
            await zap.vote(disputeId, false);
        }

        // Increase the evm time by 8 days
        // A stake can not be withdrawn until 7 days passed
        await ethers.provider.send('evm_increaseTime', [691200]);
        // tally votes
        await zap.connect(signers[1]).tallyVotes(disputeId);
        
        let newZapAddress = await zapMaster.getAddressVars(hashZAddress);
        expect(zapAddress).to.equal(newZapAddress);
    });

    it("Should fork successfully with only new ZapMaster", async () => {
        // deploy a new zap master and use existing zap stake and zap contracts

        let zapMaster2 = (await zapMasterFactory.deploy(zapAddress, zapTokenBsc.address)) as ZapMaster
        await zapMaster2.deployed();

        // begin proposing fork
        zap = zap.connect(signers[0]);

        // Converts the uintVar "disputeFee" to a bytes array
        const disputeFeeBytes: Uint8Array = ethers.utils.toUtf8Bytes("disputeFee");

        // Converts the uintVar "disputeFee" from a bytes array to a keccak256 hash
        const disputeFeeHash: string = ethers.utils.keccak256(disputeFeeBytes)

        // Gets the dispute fee
        const disputeFee: BigNumber = await zapMaster.getUintVar(disputeFeeHash);

        // expect(balance).to.greaterThanOrEqual(getDisputeFee);
        await zapTokenBsc.approve(zap.address, disputeFee);
    
        await zap.proposeFork(zapMaster2.address, 2);

        // Convert to a bytes array
        const disputeCount: Uint8Array = ethers.utils.toUtf8Bytes('disputeCount');

        // Convert to a keccak256 hash
        const ddisputecount: string = ethers.utils.keccak256(disputeCount);

        let disputeId = await zapMaster.getUintVar(ddisputecount);
        // test dispute count after beginDispute
        expect(disputeId).to.equal(1, 'Dispute count should be 1.');

        let disp = await zapMaster.getAllDisputeVars(disputeId);
        expect(disp[5]).to.equal(zapMaster2.address, "The proposed fork new zap master address is incorrect");

        // start vote for fork
        for (var i = 1; i <= 5; i++) {
            zap = zap.connect(signers[i]);
            await zap.vote(disputeId, true);
        }

        // Increase the evm time by 8 days
        // A stake can not be withdrawn until 7 days passed
        await ethers.provider.send('evm_increaseTime', [691200]);
        // tally votes
        await zap.connect(signers[1]).tallyVotes(disputeId);

        // Convert to a bytes array
        const bytesZAddress: Uint8Array = ethers.utils.toUtf8Bytes('zapContract');

        // Convert to a keccak256 hash
        const hashZAddress: string = ethers.utils.keccak256(bytesZAddress);

        // check address of zap contract
        let zapAddCheck = await zapMaster2.getAddressVars(hashZAddress)
        expect(zapAddress).to.equal(zapAddCheck);

        zap = zap.attach(zapMaster2.address);

        // test dispute count after beginDispute
        disputeId = await zapMaster.getUintVar(ddisputecount);
        expect(disputeId).to.equal(1, 'Dispute count should be 1.');

        // check if existing data for propose fork exists
        disp = await zapMaster.getAllDisputeVars(disputeId);
        expect(disp[5]).to.equal(zapMaster2.address, "The proposed fork new zap mastter address is incorrect");

        /**
         * CURRENTLY STAKER DATA IS NOT SHARED/TRANSFERRED WITH ZAP & ZAP MASTER
         */
        // check if existing staker details exists
        let staker1: BigNumber[] = await zapMaster2.getStakerInfo(signers[1].address);
        // expect(staker1[0]).to.equal(1);
        console.log(staker1)
    });
});