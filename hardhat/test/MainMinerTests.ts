// Signers 15, 16, 17, 18, 19, 0 are already miners

import { ethers } from "hardhat";

import { solidity } from "ethereum-waffle";

import chai from "chai";

import { ZapConstants } from "../typechain/ZapConstants";

import { ZapTokenBSC } from "../typechain/ZapTokenBSC";

import { ZapLibrary } from "../typechain/ZapLibrary";

import { ZapDispute } from "../typechain/ZapDispute";

import { ZapStake } from "../typechain/ZapStake";

import { ZapMaster } from "../typechain/ZapMaster";

import { Zap } from "../typechain/Zap";

import { Vault } from "../typechain/Vault";

import { BigNumber, ContractFactory } from "ethers";
import { start } from "pm2";

const { expect } = chai;

chai.use(solidity);

let zapTokenBsc: ZapTokenBSC;

let zapConstants: ZapConstants;

let zapLibrary: ZapLibrary;

let zapDispute: ZapDispute;

let zapStake: ZapStake;

let zapMaster: ZapMaster;

let zap: Zap;

let vault: Vault;

let signers: any;

describe("Main Miner Functions", () => {

    beforeEach(async () => {

        signers = await ethers.getSigners();

        const zapTokenFactory: ContractFactory = await ethers.getContractFactory(
          'ZapTokenBSC',
          signers[0]
        );
    
        zapTokenBsc = (await zapTokenFactory.deploy()) as ZapTokenBSC;
        await zapTokenBsc.deployed();
    
        const zapConstantsFactory: ContractFactory = await ethers.getContractFactory(
          'ZapConstants',
          signers[0]
        );
    
        zapConstants = (await zapConstantsFactory.deploy()) as ZapConstants;
        await zapConstants.deployed();
    
        const zapLibraryFactory: ContractFactory = await ethers.getContractFactory(
          'ZapLibrary',
          {
            libraries: {
              ZapConstants: zapConstants.address
            },
            signer: signers[0]
          }
        );
    
        zapLibrary = (await zapLibraryFactory.deploy()) as ZapLibrary;
        await zapLibrary.deployed();
    
        const zapDisputeFactory: ContractFactory = await ethers.getContractFactory(
          'ZapDispute',
          {
            libraries: {
              ZapConstants: zapConstants.address
            },
            signer: signers[0]
          }
        );
    
        zapDispute = (await zapDisputeFactory.deploy()) as ZapDispute;
        await zapDispute.deployed();
    
        const zapStakeFactory: ContractFactory = await ethers.getContractFactory(
          'ZapStake',
          {
            libraries: {
              ZapConstants: zapConstants.address,
              ZapDispute: zapDispute.address
            },
            signer: signers[0]
          }
        );
    
        zapStake = (await zapStakeFactory.deploy()) as ZapStake;
        await zapStake.deployed();
    
        const zapFactory: ContractFactory = await ethers.getContractFactory('Zap', {
          libraries: {
            ZapConstants: zapConstants.address,
            ZapDispute: zapDispute.address,
            ZapLibrary: zapLibrary.address,
            ZapStake: zapStake.address,
          },
          signer: signers[0]
        });
    
        zap = (await zapFactory.deploy(zapTokenBsc.address)) as Zap;
        await zap.deployed();
    
        const zapMasterFactory: ContractFactory = await ethers.getContractFactory(
          'ZapMaster',
          {
            libraries: {
              ZapConstants: zapConstants.address,
              ZapStake: zapStake.address
            },
            signer: signers[0]
          }
        );
    
        zapMaster = (await zapMasterFactory.deploy(
          zap.address,
          zapTokenBsc.address
        )) as ZapMaster;
        await zapMaster.deployed();
    
        const Vault: ContractFactory = await ethers.getContractFactory('Vault', {
          signer: signers[0]
        });
        vault = (await Vault.deploy(
          zapTokenBsc.address,
          zapMaster.address
        )) as Vault;
    
        await vault.deployed();
    
        await zapMaster.functions.changeVaultContract(vault.address);

    })

    it("Should transfer Zap from signers[19] to vault and then to signers[18]",
        async () => {
            // Allocate enough for transfer
            await zapTokenBsc.allocate(signers[19].address, 100)

            // Attach the ZapMaster instance to Zap
            let master = zap.attach(zapMaster.address) as Zap;

            // Connects address 19 as the signer and approve the Zap Master
            await zapTokenBsc.connect(signers[19]).approve(zapMaster.address, 10000);

            // transfer Zap from signers[19] to Vault
            await master.transferFrom(signers[19].address, vault.address, 100);

            // expect vault to have a balance of 100 Zap transferred amount
            expect(await zapMaster.balanceOf(vault.address)).to.equal(100);

            // transfer Zap from Vault to signers[18]
            let balance = await zapMaster.balanceOf(signers[18].address);
            await master.transferFrom(vault.address, signers[18].address, 100);

            // expect signers[1] to have 100 more Zap
            expect(await zapTokenBsc.balanceOf(signers[18].address)).to.equal(balance.add(100));
        }
    )

    it("Should increaseApproval through Vault's function call",
        async () => {
            // Allocate enough for transfer
            await zapTokenBsc.allocate(vault.address, 200)

            // Attach the ZapMaster instance to Zap
            let master = zap.attach(zapMaster.address) as Zap;

            // transfer 100 Zap to decrease approval
            await master.transferFrom(vault.address, signers[18].address, 100);
            let approval = await zapTokenBsc.allowance(vault.address, zapMaster.address);

            // approval should be max uint256 - 100
            expect(approval).to.equal(BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff9b"));

            // increase approval of vault
            master.increaseVaultApproval(vault.address);

            // approval sohuld be max uint256
            approval = await zapTokenBsc.allowance(vault.address, zapMaster.address);
            expect(approval).to.equal(BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"));

            await master.transferFrom(vault.address, signers[18].address, 100);
            approval = await zapTokenBsc.allowance(vault.address, zapMaster.address);

            expect(approval).to.equal(BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff9b"));
        }
    )

    it("Should stake a miner with a balance greater than or equal to 500K ZAP and return a 1 stake status and an above 0 timestamp",
        async () => {

            // Allocate enough to stake
            await zapTokenBsc.allocate(signers[1].address, (BigNumber.from("600000000000000000000000")));

            // Attach the ZapMaster instance to Zap
            zap = zap.attach(zapMaster.address);

            // Connects address 1 as the signer
            zap = zap.connect(signers[1]);

            await zapTokenBsc.connect(signers[1]).approve(zapMaster.address, (BigNumber.from("500000000000000000000000")));

            // await vault.connect(signers[1]).lockSmith(signers[1].address, zap.address);

            // Stakes 500k Zap to initiate a miner
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

            expect(await zapMaster.balanceOf(vault.address)).to.equal((BigNumber.from("500000000000000000000000")));

            // Expect the balance to be greater than or equal to 500k
            expect(balance).to.be.greaterThanOrEqual(100000);

            // stakerInfo[0] = Staker Status
            // Expect the staker status to be 1
            expect(stakerInfo[0]).to.equal(1), "Staked";

            // stakerInfo[1] = Staker Timestamp
            // Expect the staker timestamp to be greater than 0
            expect(stakerInfo[1]).to.greaterThan(0)
        })

    it('Should not be able to depositStake if the stake status is 1(Staked)', async () => {

        // Allocate enough to stake
        await zapTokenBsc.allocate(signers[1].address, (BigNumber.from("1000000000000000000000000")));

        // Attach the ZapMaster instance to Zap
        zap = zap.attach(zapMaster.address);

        // Connects address 1 as the signer
        zap = zap.connect(signers[1]);

        await zapTokenBsc.connect(signers[1]).approve(zapMaster.address, (BigNumber.from("1000000000000000000000000")));

        // Stakes 500k Zap to initiate a miner
        await zap.depositStake();

        const postStakeStatus = await zapMaster.getStakerInfo(signers[1].address);

        expect(parseInt(postStakeStatus[0]._hex)).to.equal(1);

        // Should catch the error trying to deposit a stake after request a withdrawal
        // Only addresses with a stake status of 0 can be staked
        await expect(zap.depositStake()).to.be.revertedWith(
            'ZapStake: Staker is already staked'
        );

    });

    

    it("Should not be able to request a stake withdrawal if the stake status is 0(Not Staked)", async () => {

        await expect(zap.requestStakingWithdraw()).to.be.revertedWith(
            'Miner is not staked'
        );

    });

    it("Should not be able to depositStake if the stake status is 2(Request to withdraw)", async () => {

        // Allocate enough to stake
        await zapTokenBsc.allocate(signers[1].address, (BigNumber.from("1000000000000000000000000")));

        // Attach the ZapMaster instance to Zap
        zap = zap.attach(zapMaster.address);

        // Connects address 1 as the signer
        zap = zap.connect(signers[1]);

        await zapTokenBsc.connect(signers[1]).approve(zapMaster.address, (BigNumber.from("1000000000000000000000000")));

        // Stakes 500k Zap to initiate a miner
        await zap.depositStake();

        const postStakeStatus = await zapMaster.getStakerInfo(signers[1].address);

        expect(parseInt(postStakeStatus[0]._hex)).to.equal(1);

        // Put in a request to refund stake amount
        await zap.requestStakingWithdraw();

        // Gets signer 1's stake status after request a refund
        const postRequestStatus = await zapMaster.getStakerInfo(signers[1].address);

        // Expect signer 1's status to equal 2(Request a withdraw)
        expect(parseInt(postRequestStatus[0]._hex)).to.equal(2);

        // Increase the evm time by 8 days
        // A stake can not be withdrawn until 7 days passed
        await ethers.provider.send("evm_increaseTime", [691200]);

        // Should catch the error trying to deposit a stake after request a withdrawal
        // Only addresses with a stake status of 0 can be staked
        await expect(zap.depositStake()).to.be.revertedWith(
            'ZapStake: Staker is already staked'
        );

        zap.withdrawStake();

        const vaultUserBal = await vault.userBalance(signers[1].address);

        expect(parseInt(vaultUserBal._hex)).to.equal(0);

    });

    it("Should not stake a miner with a balance less than 500k and return a 0 stake status and timestamp",
        async () => {

            // Allocate enough to not stake
            await zapTokenBsc.allocate(signers[2].address, 499999);

            // Attach the ZapMaster instance to Zap
            zap = zap.attach(zapMaster.address);

            // Connects address 2 as the signer
            zap = zap.connect(signers[2]);

            // Returns an array containing the staker status and timestamp
            // The array values are returned as hexStrings
            const getInfo: BigNumber[] = await zapMaster.getStakerInfo(signers[2].address);

            // Parses the hexStrings in the array
            const stakerInfo: number[] = getInfo.map(info => parseInt(info._hex));

            await zapTokenBsc.connect(signers[2]).approve(zapMaster.address, 1000);

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

        // Expect stakeAmt to equal 500k
        expect(stakeAmt).to.equal(500000e18);

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

        // Expect stakerCount to equal zero
        // this used to be 6 when there were initial stakers, that has been removed
        expect(stakerCount).to.equal(0);

    })

    it("Should request staking withdraw", async () => {

        // Allocate enough to stake
        // await zapTokenBsc.allocate(signers[1].address, 600000e18);
        await zapTokenBsc.allocate(signers[1].address, (BigNumber.from("600000000000000000000000")));

        // Connects address 1 as the signer
        zap = zap.connect(signers[1]);

        // Attach the ZapMaster instance to Zap
        zap = zap.attach(zapMaster.address);

        // await zapTokenBsc.connect(signers[1]).approve(zapMaster.address, 500000e18);
        await zapTokenBsc.connect(signers[1]).approve(zapMaster.address, (BigNumber.from("500000000000000000000000")));

        // Signer 1 balance before staking
        const getStartBal: BigNumber = await zapMaster.balanceOf(signers[1].address);
        const startBal: number = parseInt(getStartBal._hex);

        // Vault balance before staking
        const getVaultPreBal: BigNumber = await zapMaster.balanceOf(vault.address);
        const vaultPreBal: Number = parseInt(getVaultPreBal._hex);

        // Stakes 500k Zap to initiate a miner
        await zap.depositStake();

        // Balance after stake deposit
        const getPostBal: BigNumber = await zapMaster.balanceOf(signers[1].address);
        const postBal: number = parseInt(getPostBal._hex);

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

        // Increase the evm time by 8 days
        // A stake can not be withdrawn until 7 days passed
        await ethers.provider.send("evm_increaseTime", [691200]);

        // Withdraw the stake amount to signer 1's wallet
        await zap.withdrawStake();

        // Signer 1 balance after withdrawal
        const getPostWithdrawBal = await zapMaster.balanceOf(signers[1].address);
        const postWithdrawBal = parseInt(getPostWithdrawBal._hex);

        // Vault balance after withdrawal
        const getVaultPostBal = await zapMaster.balanceOf(vault.address);
        const vaultPostBal = parseInt(getVaultPostBal._hex);

        // Returns an array containing the staker status and timestamp
        // The array values are returned as hexStrings
        const getPostWthDrwInfo: BigNumber[] = await zapMaster.getStakerInfo(signers[1].address);

        // Parses the hexStrings in the array
        const postWthDrwInfo: number[] = getPostWthDrwInfo.map(info => parseInt(info._hex));

        // Signer 1 balance before staking should be 600k
        expect(startBal).to.equal(parseInt(BigNumber.from('600000000000000000000000')._hex));

        // Vault balance should be 0 before staking
        expect(vaultPreBal).to.equal(0)

        // Signer 1 balance should be 100k after staking
        // expect(postBal).to.equal(startBal - BigNumber.from("500000000000000000000000"));
        expect(getPostBal).to.equal(BigNumber.from('100000000000000000000000'));

        expect(vaultPostBal).to.equal(0);

        // Signer 1 balance should be 600k after withdrawal
        expect(postWithdrawBal).to.equal(parseInt(BigNumber.from("600000000000000000000000")._hex));

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
        await zapTokenBsc.allocate(signers[1].address, (BigNumber.from("600000000000000000000000")));

        // Connects address 1 as the signer
        zap = zap.connect(signers[1]);

        // Attach the ZapMaster instance to Zap
        zap = zap.attach(zapMaster.address);

        await zapTokenBsc.connect(signers[1]).approve(zapMaster.address, (BigNumber.from("500000000000000000000000")));

        // Stakes 500000 Zap to initiate a miner
        await zap.depositStake();

        // Request to withdraw stake
        await zap.requestStakingWithdraw();

        // Returns an array containing the staker status and timestamp
        // The array values are returned as hexStrings
        const getPostReqInfo: BigNumber[] = await zapMaster.getStakerInfo(signers[1].address);

        // Parses the hexStrings in the array
        const postReqInfo: number[] = getPostReqInfo.map(info => parseInt(info._hex));

        // Increase the evm time by 8 days
        // A stake can not be withdrawn until 7 days passed
        await ethers.provider.send("evm_increaseTime", [691200]);

        // Withdraws the stake
        await zap.withdrawStake();

        // Gets the staker info after stake withdrawal
        // Returns an array of hexStrings
        const getPostWthDrwInfo: BigNumber[] = await zapMaster.getStakerInfo(signers[1].address);

        // Parses the hexStrings in the array
        const postWthDrwInfo: number[] = getPostWthDrwInfo.map(info => parseInt(info._hex));

        // Allocate enough to stake again (** this will be replaced once withdraw works properlly **)
        await zapTokenBsc.allocate(signers[1].address, (BigNumber.from("500000000000000000000000")));

        await zapTokenBsc.connect(signers[1]).approve(zapMaster.address, (BigNumber.from("500000000000000000000000")));

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
        await zapTokenBsc.allocate(signers[1].address, (BigNumber.from("500000000000000000000000")));

        // Attach the ZapMaster instance to Zap
        zap = zap.attach(zapMaster.address);

        // Connects address 1 as the signer
        zap = zap.connect(signers[1]);

        // Attach the ZapMaster instance to Zap
        zap = zap.attach(zapMaster.address);

        await zapTokenBsc.connect(signers[1]).approve(zapMaster.address, (BigNumber.from("500000000000000000000000")));

        // Stakes 500k Zap to initiate a miner
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

        // Attaches the zapTokenBsc.sol address to Zap.sol
        zap = zap.attach(zapTokenBsc.address);

        // Allocated 5000 tokens to signer 1
        await zapTokenBsc.allocate(signers[1].address, 5000);

        // Ges the balance of signer 1 as a hexString
        const getSigner1Bal: BigNumber = await zapMaster.balanceOf(signers[1].address);

        // Converts the balance of signer 1 to a number
        const signer1Bal: number = parseInt(getSigner1Bal._hex);

        // Transfers 2500 to signers 2
        await zap.transfer(signers[2].address, transferAmt);

        // Gets the balance of signer 1 after transferring as a hexString
        const getPostSigner1Bal: BigNumber = await zapMaster.balanceOf(signers[1].address);

        // Parses the hexString to a number
        // Balance should have been subtracted by 2500
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

    it('Should not be able to transfer more than balance', async () => {

        // Allocates signers 1 1000 tokens
        await zapTokenBsc.allocate(signers[1].address, 1000);

        // Connects signers 1 to zap.sol
        zap = zap.connect(signers[1]);

        // Gets the balance of signer 1 as a hexString
        const getSigner1Bal: BigNumber = await zapMaster.balanceOf(signers[1].address);

        // Parses the balance of signer 1 from a hexString to a number
        const signer1Bal: number = parseInt(getSigner1Bal._hex);

        // Expect transferring from signer 1 to signer 2 to fail
        await expect(zap.transfer(signers[2].address, 1001)).to.be.reverted;

        const getSigner2Bal: BigNumber = await zapMaster.balanceOf(signers[2].address);

        const signer2Bal: Number = parseInt(getSigner2Bal._hex);

        // Expect the balance of signer 1 to stay the same
        expect(signer1Bal).to.equal(1000);

        // Expect the balance of signer 2 to be 0
        expect(signer2Bal).to.equal(0);

    })

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
        expect(disputeFee).to.equal(970e18);
    })

    it("Should get token supply", async () => {

        // Gets the total oracle tokens as a hexString
        const getSupply: BigNumber = await zapMaster.totalTokenSupply();

        // Convert the hexString to a number
        const supply: number = parseInt(getSupply._hex);

        // There is no initial stake, so it should be zero
        expect(supply).to.equal(0);

    })

})
