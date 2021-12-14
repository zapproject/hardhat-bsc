// Signers 15, 16, 17, 18, 19, 0 are already miners

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

import { ContractFactory } from "ethers";

const { expect } = chai;

chai.use(solidity);

let zapTokenBsc: ZapTokenBSC;

let zapLibrary: ZapLibrary;

let zapDispute: ZapDispute;

let zapStake: ZapStake;

let zapMaster1: ZapMaster;

let zapMaster2: ZapMaster;

let zap: Zap;

let vault: Vault;

let signers: any;

describe("Main Miner Functions", () => {

    beforeEach(async () => {

        signers = await ethers.getSigners();

        const zapTokenFactory: ContractFactory = await ethers.getContractFactory(
            "ZapTokenBSC",
            signers[0]
        )

        zapTokenBsc = (await zapTokenFactory.deploy()) as ZapTokenBSC;
        await zapTokenBsc.deployed()


        const zapLibraryFactory: ContractFactory = await ethers.getContractFactory("ZapLibrary",
            {
                signer: signers[0]
            }
        );

        zapLibrary = (await zapLibraryFactory.deploy()) as ZapLibrary
        await zapLibrary.deployed()

        const zapDisputeFactory: ContractFactory = await ethers.getContractFactory("ZapDispute", {

            signer: signers[0]

        });

        zapDispute = (await zapDisputeFactory.deploy()) as ZapDispute
        await zapDispute.deployed();

        const zapStakeFactory: ContractFactory = await ethers.getContractFactory("ZapStake", {

            libraries: {
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

        zap = (await zapFactory.deploy(zapTokenBsc.address)) as Zap
        await zap.deployed()

        const zapMasterFactory: ContractFactory = await ethers.getContractFactory("ZapMaster", {
            libraries: {
                ZapStake: zapStake.address
            },
            signer: signers[0]
        });

        zapMaster1 = (await zapMasterFactory.deploy(zap.address, zapTokenBsc.address)) as ZapMaster
        await zapMaster1.deployed()
        zapMaster2 = (await zapMasterFactory.deploy(zap.address, zapTokenBsc.address)) as ZapMaster
        await zapMaster2.deployed();


        const Vault: ContractFactory = await ethers.getContractFactory('Vault', { signer: signers[0] });
        vault = (await Vault.deploy(
            zapTokenBsc.address,
            zapMaster1.address
        )) as Vault;
        await vault.deployed();

        await zapMaster1.functions.changeVaultContract(vault.address);

    })

    // it("Should transfer Zap balance from old ZM to new ZM.",
    //     async () => {
    //         // Allocate enough for transfer
    //         await zapTokenBsc.allocate(zapMaster1.address, 10000000);

    //         // expect zm1 to have 10 mil zap 
    //         expect(await zapTokenBsc.balanceOf(zapMaster1.address)).to.equal(
    //             10000000
    //         );

    //         await zapMaster1.connect(signers[0]).sendBalToNewZM(zapMaster2.address);

    //         // expect zm1 to have 0 zap after transfer
    //         expect(await zapTokenBsc.balanceOf(zapMaster1.address)).to.equal(
    //             0
    //         );
    //         // expect zm2 to have 10 mil zap from zm1
    //         expect(await zapTokenBsc.balanceOf(zapMaster2.address)).to.equal(
    //             10000000
    //         );
    //     }
    // )
    // it("Should only be able to transfer ZM balance by owner.",
    //     async () => {
    //         // Allocate enough for transfer
    //         await zapTokenBsc.allocate(zapMaster1.address, 10000000);

    //         // expect zm1 to have 10 mil zap 
    //         expect(await zapTokenBsc.balanceOf(zapMaster1.address)).to.equal(
    //             10000000
    //         );

    //         await expect(
    //             zapMaster1
    //                 .connect(signers[8])
    //                 .sendBalToNewZM(zapMaster2.address)
    //         ).to.be.revertedWith('Only owner can transfer balance.');
    //     }
    // )

})
