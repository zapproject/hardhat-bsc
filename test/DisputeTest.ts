// Signers 15, 16, 17, 18, 19, 0 are already miners

import { ethers } from "hardhat";

import { solidity } from "ethereum-waffle";

import chai from "chai";

import { ZapTokenBSC } from "../typechain/ZapTokenBSC";

import { ZapTransfer } from '../typechain/ZapTransfer';

import { ZapLibrary } from "../typechain/ZapLibrary";

import { ZapDispute } from "../typechain/ZapDispute";

import { ZapStake } from "../typechain/ZapStake";

import { ZapMaster } from "../typechain/ZapMaster";

import { Zap } from "../typechain/Zap";

import { BigNumber, ContractFactory } from "ethers";

const { expect } = chai;

chai.use(solidity);

let zapTokenBsc: ZapTokenBSC;

let zapTransfer: ZapTransfer;

let zapLibrary: ZapLibrary;

let zapDispute: ZapDispute;

let zapStake: ZapStake;

let zapMaster: ZapMaster;

let zap: Zap;

let signers: any;

describe("Test ZapDispute and it's dispute functions", () => {

    beforeEach(async () => {

        signers = await ethers.getSigners();

        const zapTokenFactory: ContractFactory = await ethers.getContractFactory(
            "ZapTokenBSC",
            signers[0]
        )

        zapTokenBsc = (await zapTokenFactory.deploy()) as ZapTokenBSC;
        await zapTokenBsc.deployed()

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

        zap = (await zapFactory.deploy(zapTokenBsc.address)) as Zap
        await zap.deployed()

        const zapMasterFactory: ContractFactory = await ethers.getContractFactory("ZapMaster", {
            libraries: {
                ZapTransfer: zapTransfer.address,
                ZapStake: zapStake.address
            },
            signer: signers[0]
        });

        zapMaster = (await zapMasterFactory.deploy(zap.address, zapTokenBsc.address)) as ZapMaster
        await zapMaster.deployed()

        // stake signers 1 to 5.
        for (let i=1; i<=5; i++) {
            await zapTokenBsc.allocate(signers[i].address, 1300);
            zap = zap.attach(zapMaster.address);
            zap = zap.connect(signers[i]);
            await zap.depositStake();
        }

        
        let symbol: string = "BTC/USD"
        // Request string
        const api: string = "json(https://api.binance.com/api/v1/klines?symbol=BTCUSDT&interval=1d&limit=1).0.4";
        
        await zapTokenBsc.approve(zap.address, 5000);
        zap = zap.connect(signers[0]);
        await zap.requestData(api, symbol, 1000, 52);

    })

    it("Should stake a miner with a balance greater than or equal to 1000 ZAP and return a 1 stake status and an above 0 timestamp",
        async () => {
          // expect(stakerInfo[1]).to.greaterThan(0)
          let bal = await zapTokenBsc.balanceOf(signers[1].address);
          console.log(bal);
          expect(bal).to.equal(1300);


          const getInfo: BigNumber[] = await zapMaster.getStakerInfo(
            signers[5].address
          );
          const stakerInfo: number[] = getInfo.map(info => parseInt(info._hex));
          expect(stakerInfo[0]).to.equal(1), 'Staked';
          

          // // stakerInfo[0] = Staker Status
          // // Expect the staker status to be 1
          // expect(stakerInfo[0]).to.equal(1), "Staked";

          // // stakerInfo[1] = Staker Timestamp
          // // Expect the staker timestamp to be greater than 0
          // expect(stakerInfo[1]).to.greaterThan(0)

          // // Allocate enough to stake
          // await zapTokenBsc.allocate(signers[1].address, 1000)

          // // Attach the ZapMaster instance to Zap
          // zap = zap.attach(zapMaster.address);

          // // Connects address 1 as the signer
          // zap = zap.connect(signers[1]);

          // // Stakes 1000 Zap to initiate a miner
          // await zap.depositStake();

          // // Gets the balance as hexString
          // const getBalance: BigNumber = await zapMaster.balanceOf(signers[1].address);

          // // Parses the hexString
          // const balance: number = parseInt(getBalance._hex);

          // // Returns an array containing the staker status and timestamp
          // // The array values are returned as hexStrings
          // const getInfo: BigNumber[] = await zapMaster.getStakerInfo(signers[1].address);

          // // Parses the hexStrings in the array
          // const stakerInfo: number[] = getInfo.map(info => parseInt(info._hex));

          // // Expect the balance to be greater than or equal to 1000
          // expect(balance).to.be.greaterThanOrEqual(1000);

          //   stakerInfo[0] = Staker Status
          // // Expect the staker status to be 1
          // expect(stakerInfo[0]).to.equal(1), "Staked";

          // // stakerInfo[1] = Staker Timestamp
          // // Expect the staker timestamp to be greater than 0
          // expect(stakerInfo[1]).to.greaterThan(0)
        }
    )

})
