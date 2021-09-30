import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { BigNumber, ContractFactory } from "ethers";
import { ethers } from "hardhat";

import {
    ZapMasterTest,
    ZapTokenBSC,
    ZapStake,
    ZapDispute,
    ZapLibrary,
    Zap,
    Vault
} from "../typechain";

chai.use(solidity);

let testOracle: ZapMasterTest;
let zapToken: ZapTokenBSC;
let stake: ZapStake;
let dispute: ZapDispute;
let lib: ZapLibrary;
let oracleBackend: Zap;
let vault: Vault;

let deployer: SignerWithAddress;
let staker1: SignerWithAddress;
let staker2: SignerWithAddress;

let oneHunnidZap = ethers.utils.parseEther("100.0");

describe("Test Oracle Network", function () {
    beforeEach(async () => {
        [ deployer, staker1, staker2 ] = await ethers.getSigners();

        const zapTokenFactory: ContractFactory = await ethers.getContractFactory(
            "ZapTokenBSC",
            deployer
        )

        zapToken = (await zapTokenFactory.deploy()) as ZapTokenBSC;
        await zapToken.deployed()

        const libFactory: ContractFactory = await ethers.getContractFactory("ZapLibrary",
            {
                signer: deployer
            }
        );

        lib = (await libFactory.deploy()) as ZapLibrary
        await lib.deployed()

        const disputeFactory: ContractFactory = await ethers.getContractFactory("ZapDispute", {

            signer: deployer

        });

        dispute = (await disputeFactory.deploy()) as ZapDispute
        await dispute.deployed();

        const stakeFactory: ContractFactory = await ethers.getContractFactory("ZapStake", {

            libraries: {
                ZapDispute: dispute.address
            },
            signer: deployer
        })

        stake = (await stakeFactory.deploy()) as ZapStake
        await stake.deployed()

        const zapFactory: ContractFactory = await ethers.getContractFactory("Zap", {

            libraries: {
                ZapStake: stake.address,
                ZapDispute: dispute.address,
                ZapLibrary: lib.address,
            },
            signer: deployer

        })

        oracleBackend = (await zapFactory.deploy(zapToken.address)) as Zap
        await oracleBackend.deployed()

        const testOracleFactory: ContractFactory = await ethers.getContractFactory("ZapMasterTest", {
            libraries: {
                ZapStake: stake.address
            },
            signer: deployer
        });

        testOracle = (await testOracleFactory.deploy(oneHunnidZap, oracleBackend.address, zapToken.address)) as ZapMasterTest
        await testOracle.deployed()


        const Vault: ContractFactory = await ethers.getContractFactory('Vault', { signer: deployer });
        vault = (await Vault.deploy(zapToken.address, testOracle.address)) as Vault
        await vault.deployed();

        await testOracle.functions.changeVaultContract(vault.address);
    });

    describe("Variable Stake Amount", function () {
        beforeEach(async () => {
            await zapToken.mint(staker1.address, oneHunnidZap);
            await zapToken.mint(staker2.address, oneHunnidZap);

            await zapToken.connect(staker1).approve(testOracle.address, oneHunnidZap);
            await zapToken.connect(staker2).approve(testOracle.address, oneHunnidZap);

            // await vault.connect(staker1).lockSmith(staker1.address, testOracle.address);
            // await vault.connect(staker2).lockSmith(staker2.address, testOracle.address);
        });

        it("should be equal to 100 ZAP", async () => {
            const stakeAmtBytes = ethers.utils.toUtf8Bytes("stakeAmount");
            expect((await testOracle.getUintVar(ethers.utils.keccak256(stakeAmtBytes))))
                .to.eq(oneHunnidZap);
        })

        it("should be able to only require 100 Zap to Stake", async () => {
            expect(await oracleBackend.connect(staker1).attach(testOracle.address).depositStake()).to.be.ok;
            expect(await oracleBackend.connect(staker2).attach(testOracle.address).depositStake()).to.be.ok;

            expect((await vault.userBalance(staker1.address)).toBigInt()).to.eq(oneHunnidZap);
            expect((await vault.userBalance(staker2.address)).toBigInt()).to.eq(oneHunnidZap);
        });
    });
})
