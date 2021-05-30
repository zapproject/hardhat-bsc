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

describe("Did Mine Test", () => {

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

        for (var i = 1; i <= 5; i++) {

            // Allocates ZAP to signers 1 - 5
            await zapToken.allocate(signers[i].address, 2000);

        }

    });

    it("Test didMine", async () => {

        let x: string;

        let apix: string;

        // Request string
        const api: string = "json(https://api.pro.coinbase.com/products/ETH-USD/ticker).price";

        // Allocates 5000 ZAP to signer 0 
        await zapToken.allocate(signers[0].address, 5000);

        // Iterates through signers 1 through 5
        for (var i = 1; i <= 5; i++) {

            // Attach the ZapMaster instance to Zap
            zap = zap.attach(zapMaster.address);

            // Connects addresses 1-5 as the signer
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

        // Gets the tip amounts stored in the requestQ array
        // Values are returned as hexStrings
        const getReqQ: BigNumber[] = await zapMaster.getRequestQ();

        // Parses the getReqQ array from hexStrings to numbers
        const reqQ: number[] = getReqQ.map(item => parseInt(item._hex));

        for (var i = 1; i <= 5; i++) {

            // Connects address 1 as the signer
            zap = zap.connect(signers[i]);

            /*
            Gets the data properties for the current request
            bytes32 _challenge,
            uint256[5] memory _requestIds,
            uint256 _difficutly,
            uint256 _tip
            */
            const newCurrentVars: any = await zap.getNewCurrentVariables();

            // Each Miner will submit a mining solution
            await zap.submitMiningSolution("nonce", 1, 1200);

            // Checks if the miners mined the challenge
            // true = Miner did mine the challenge
            // false = Miner did not mine the challenge
            const didMineStatus: boolean = await zapMaster.didMine(
                newCurrentVars[0],
                signers[i].address
            );

            // Expects the challenge hash 66 characters in length
            expect(newCurrentVars[0]).to.have.length(66);

            // Expects the didMine status of each miner to be true
            expect(didMineStatus).to.be.true;

        }

        expect(reqQ).to.have.length(51);

    })
});