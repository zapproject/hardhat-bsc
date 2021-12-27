// Signers 15, 16, 17, 18, 19, 0 are already miners

import { ethers } from 'hardhat';

import { solidity } from 'ethereum-waffle';

import chai from 'chai';

import { ZapTokenBSC } from '../typechain/ZapTokenBSC';

import { ZapLibrary } from '../typechain/ZapLibrary';

import { ZapDispute } from '../typechain/ZapDispute';

import { ZapStake } from '../typechain/ZapStake';

import { ZapMaster } from '../typechain/ZapMaster';

import { Zap } from '../typechain/Zap';

import { Vault } from '../typechain/Vault';

import { BigNumber, ContractFactory } from 'ethers';
// import { keccak256 } from 'ethers/lib/utils';
// import { Address } from 'hardhat-deploy/dist/types';
// import { Token } from '../typechain';

const { expect } = chai;

chai.use(solidity);

let zapTokenBsc: ZapTokenBSC;

let zapLibrary: ZapLibrary;

let zapDispute: ZapDispute;

let zapStake: ZapStake;

let zapMaster: ZapMaster;

let zap: Zap;

let vault: Vault;

let signers: any;

describe("Test ZapDispute and it's dispute functions", () => {
  beforeEach(async () => {
    signers = await ethers.getSigners();

    const zapTokenFactory: ContractFactory = await ethers.getContractFactory(
      'ZapTokenBSC',
      signers[0]
    );

    zapTokenBsc = (await zapTokenFactory.deploy()) as ZapTokenBSC;
    await zapTokenBsc.deployed();

    const zapLibraryFactory: ContractFactory = await ethers.getContractFactory(
      'ZapLibrary',
      {
        signer: signers[0]
      }
    );

    zapLibrary = (await zapLibraryFactory.deploy()) as ZapLibrary;
    await zapLibrary.deployed();

    const zapDisputeFactory: ContractFactory = await ethers.getContractFactory(
      'ZapDispute',
      {
        signer: signers[0]
      }
    );

    zapDispute = (await zapDisputeFactory.deploy()) as ZapDispute;
    await zapDispute.deployed();

    const zapStakeFactory: ContractFactory = await ethers.getContractFactory(
      'ZapStake',
      {
        libraries: {
          ZapDispute: zapDispute.address
        },
        signer: signers[0]
      }
    );

    zapStake = (await zapStakeFactory.deploy()) as ZapStake;
    await zapStake.deployed();

    const zapFactory: ContractFactory = await ethers.getContractFactory('Zap', {
      libraries: {
        ZapStake: zapStake.address,
        ZapDispute: zapDispute.address,
        ZapLibrary: zapLibrary.address
      },
      signer: signers[0]
    });

    zap = (await zapFactory.deploy(zapTokenBsc.address)) as Zap;
    await zap.deployed();

    const zapMasterFactory: ContractFactory = await ethers.getContractFactory(
      'ZapMaster',
      {
        libraries: {
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

    // await zap.setVault(vault.address);
    await zapMaster.functions.changeVaultContract(vault.address);

    await zapTokenBsc.allocate(zapMaster.address, BigNumber.from("10000000000000000000000000"));

    zap = zap.attach(zapMaster.address);

    // stake signers 1 to 5.
    for (let i = 1; i <= 5; i++) {
      await zapTokenBsc.allocate(signers[i].address, BigNumber.from("1100000000000000000000000"));
      zap = zap.connect(signers[i]);

      await zapTokenBsc.connect(signers[i]).approve(zapMaster.address, BigNumber.from("500000000000000000000000"));
      await zap.depositStake();
      expect(await zapMaster.balanceOf(signers[i].address)).to.equal(BigNumber.from("600000000000000000000000"));
      expect(await zapMaster.balanceOf(vault.address)).to.equal(BigNumber.from(i).mul(BigNumber.from("500000000000000000000000")));
    }

    await zapTokenBsc.allocate(signers[6].address, BigNumber.from("500000000000000000000"));

    let symbol: string = 'BTC/USD';
    // Request string
    const api: string =
      'json(https://api.binance.com/api/v1/klines?symbol=BTCUSDT&interval=1d&limit=1).0.4';

    await zapTokenBsc.approve(zap.address, BigNumber.from("500000000000000000000000"));
    zap = zap.connect(signers[0]);
    await zap.requestData(api, symbol, 10000, 52);

    // have each miner submit a solution
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
      const mining = await zap.submitMiningSolution('nonce', 1, 1200);
      // Checks if the miners mined the challenge
      // true = Miner did mine the challenge
      // false = Miner did not mine the challenge
      const didMineStatus: boolean = await zapMaster.didMine(
        newCurrentVars[0],
        signers[i].address
      );
      expect(didMineStatus).to.be.true;
    }
  });
//186-194
  it('Should be able to dispute a submission.', async () => {
    // Converts the uintVar "stakeAmount" to a bytes array
    const timeOfLastNewValueBytes: Uint8Array = ethers.utils.toUtf8Bytes(
      'timeOfLastNewValue'
    );

    // Converts the uintVar "stakeAmount" from a bytes array to a keccak256 hash
    const timeOfLastNewValueHash: string = ethers.utils.keccak256(
      timeOfLastNewValueBytes
    );

    // Gets the the current stake amount
    let timeStamp: BigNumber = await zapMaster.getUintVar(
      timeOfLastNewValueHash
    );

    await zapTokenBsc.connect(signers[1]).approve(zapMaster.address, BigNumber.from("500000000000000000000000"));

    // Convert to a bytes array
    const disputeCount: Uint8Array = ethers.utils.toUtf8Bytes('disputeCount');

    // Convert to a keccak256 hash
    const ddisputecount: string = ethers.utils.keccak256(disputeCount);

    // Gets the disputeID also the dispute count
    let disputeId: BigNumber = await zapMaster.getUintVar(ddisputecount);

    // test dispute count before beginDispute
    expect(disputeId).to.equal(
      0,
      'There should be no disputes before beginDispute.'
    );

    zap = zap.connect(signers[6]);
    await expect(zap.beginDispute(1, timeStamp, 4)).to.be.revertedWith("Only stakers can begin a dispute")

    zap = zap.connect(signers[1]);
    await zap.beginDispute(1, timeStamp, 4);

    disputeId = await zapMaster.getUintVar(ddisputecount);
    // test dispute count after beginDispute
    expect(disputeId).to.equal(1, 'Dispute count should be 1.');

    disputeId = await zapMaster.getUintVar(ddisputecount);
    let disp = await zapMaster.getAllDisputeVars(disputeId);

    // expect to be the address that begain the dispute
    expect(disp[4]).to.equal(signers[1].address);
    // expect to be the address that is being disputed
    expect(disp[3]).to.equal(signers[5].address);
    //expect requestID disputed to be 1
    expect(disp[7][0]).to.equal(1);
    // expect timestamp to be the same timestamp used when disputed
    expect(disp[7][1]).to.equal(timeStamp);
  });

  it('Should be able to vote for (true) a dispute.', async () => {
    // Converts the uintVar "stakeAmount" to a bytes array
    const timeOfLastNewValueBytes: Uint8Array = ethers.utils.toUtf8Bytes(
      'timeOfLastNewValue'
    );

    // Converts the uintVar "stakeAmount" from a bytes array to a keccak256 hash
    const timeOfLastNewValueHash: string = ethers.utils.keccak256(
      timeOfLastNewValueBytes
    );

    // Gets the the current stake amount
    let timeStamp: BigNumber = await zapMaster.getUintVar(
      timeOfLastNewValueHash
    );

    await zapTokenBsc.connect(signers[1]).approve(zapMaster.address, BigNumber.from("500000000000000000000000"));

    zap = zap.connect(signers[1]);
    await zap.beginDispute(1, timeStamp, 4);
    // Convert to a bytes array
    const disputeCount: Uint8Array = ethers.utils.toUtf8Bytes('disputeCount');

    // Convert to a keccak256 hash
    const ddisputecount: string = ethers.utils.keccak256(disputeCount);

    // Gets the disputeID also the dispute count
    let disputeId: BigNumber = await zapMaster.getUintVar(ddisputecount);

    disputeId = await zapMaster.getUintVar(ddisputecount);
    let disp = await zapMaster.getAllDisputeVars(disputeId);

    let postReportingVBal = await vault.userBalance(disp[4]);

    let postReportedVBal = await vault.userBalance(disp[3]);

    let postZMVBal = await vault.userBalance(zapMaster.address);

    let reporting_miner_wallet_bal = await zapMaster.balanceOf(disp[4]);

    expect(reporting_miner_wallet_bal).to.equal(BigNumber.from("112500000000000000000000"));

    // expect to be the address that begain the dispute
    expect(disp[4]).to.equal(signers[1].address);
    // expect to be the address that is being disputed
    expect(disp[3]).to.equal(signers[5].address);
    //expect requestID disputed to be 1
    expect(disp[7][0]).to.equal(1);
    // expect timestamp to be the same timestamp used when disputed
    expect(disp[7][1]).to.equal(timeStamp);

    // vote of a dispute
    // signers 2-4 vote for the dispute 1
    for (var i = 2; i < 5; i++) {
      zap = zap.connect(signers[i]);
      await zap.vote(disputeId, true);
    }

    zap = zap.connect(signers[6]);
    await expect(zap.vote(disputeId, true)).to.be.revertedWith("Only Stakers that are not under dispute can vote");

    disputeId = await zapMaster.getUintVar(ddisputecount);
    disp = await zapMaster.getAllDisputeVars(disputeId);
    expect(disp[7][6]).to.equal(4);

    zapMaster.didVote(disputeId, signers[1].address);

    let blockNumber = await ethers.provider.getBlockNumber();

    // Increase the evm time by 8 days
    // A stake can not be withdrawn until 7 days passed
    await ethers.provider.send('evm_increaseTime', [691200]);
    await zap.connect(signers[1]).tallyVotes(disputeId);

    disp = await zapMaster.getAllDisputeVars(disputeId);

    // expect voting to have ended
    expect(disp[1]).to.be.true;

    // expect dispute to be successful
    expect(disp[2]).to.be.true;

    // let disputeFee = disp[7][8];

    blockNumber = await ethers.provider.getBlockNumber();

    reporting_miner_wallet_bal = await zapTokenBsc.balanceOf(disp[4]);

    // let zMBal = await zap.getBalanceAt(zapMaster.address, blockNumber);
    blockNumber = await ethers.provider.getBlockNumber();

    // let zMBal = await zap.getBalanceAt(zapMaster.address, blockNumber);
    let zMBal2 = await zapMaster.balanceOf(zapMaster.address);

    // expect balance of winner's wallet to be 600K: 600k(leftover bal. after staking) - 487500 (pay dispute fee)
    expect(reporting_miner_wallet_bal).to.equal(BigNumber.from("112500000000000000000000"));
    
    let zmVaultBal = await vault.userBalance(zapMaster.address)

    expect(zmVaultBal).to.equal(BigNumber.from("5000000000000000010"));

    expect(zmVaultBal.sub(postZMVBal)).to.equal(postReportedVBal.sub(BigNumber.from("500000000000000000000000")));

    let initiatorVBal = await vault.userBalance(disp[4]);

    expect(initiatorVBal).to.equal(BigNumber.from("1000005000000000000000010"));

    let disputedVBal = await vault.userBalance(disp[3]);

    expect(disputedVBal).to.equal(0);

    /*
    // Check if the disputed can change their stake status
    */
    let initialStakeInfo = await zapMaster.getStakerInfo(disp[3]);

    expect(initialStakeInfo[0]).to.equal(3);

    // Attempt to requestWithdraw
    await expect(zap.connect(signers[5]).requestStakingWithdraw()).to.be.revertedWith("Miner is not staked");

    expect(initialStakeInfo[0]).to.equal(3);
  });

  it('Should be able to vote against (false) a dispute.', async () => {
    // Converts the uintVar "stakeAmount" to a bytes array
    const timeOfLastNewValueBytes: Uint8Array = ethers.utils.toUtf8Bytes(
      'timeOfLastNewValue'
    );

    // Converts the uintVar "stakeAmount" from a bytes array to a keccak256 hash
    const timeOfLastNewValueHash: string = ethers.utils.keccak256(
      timeOfLastNewValueBytes
    );

    // Gets the the current stake amount
    let timeStamp: BigNumber = await zapMaster.getUintVar(
      timeOfLastNewValueHash
    );

    await zapTokenBsc.connect(signers[1]).approve(zapMaster.address, BigNumber.from("500000000000000000000000"));

    let initReportingWBal = await zapTokenBsc.balanceOf(signers[1].address); 

    let initReportingVBal = await vault.userBalance(signers[1].address);

    zap = zap.connect(signers[1]);
    await zap.beginDispute(1, timeStamp, 4);
    // Convert to a bytes array
    const disputeCount: Uint8Array = ethers.utils.toUtf8Bytes('disputeCount');

    // Convert to a keccak256 hash
    const ddisputecount: string = ethers.utils.keccak256(disputeCount);

    // Gets the disputeID also the dispute count
    let disputeId: BigNumber = await zapMaster.getUintVar(ddisputecount);

    disputeId = await zapMaster.getUintVar(ddisputecount);
    let disp = await zapMaster.getAllDisputeVars(disputeId);

    let reporting_miner_wallet_bal = await zapTokenBsc.balanceOf(disp[4]);

    let postReportingVBal = await vault.userBalance(disp[4]);

    let initReportedVBal = await vault.userBalance(disp[3]);

    expect(reporting_miner_wallet_bal).to.equal(BigNumber.from("112500000000000000000000"));

    let disputeFee = initReportingWBal.sub(reporting_miner_wallet_bal);

    expect(initReportingVBal.sub(disputeFee)).to.equal(postReportingVBal);

    // expect to be the address that begain the dispute
    expect(disp[4]).to.equal(signers[1].address);
    // expect to be the address that is being disputed
    expect(disp[3]).to.equal(signers[5].address);
    //expect requestID disputed to be 1
    expect(disp[7][0]).to.equal(1);
    // expect timestamp to be the same timestamp used when disputed
    expect(disp[7][1]).to.equal(timeStamp);

    // vote of a dispute
    // signers 2-4 vote for the dispute 1
    for (var i = 2; i < 5; i++) {
      zap = zap.connect(signers[i]);
      await zap.vote(disputeId, false);
    }
    disputeId = await zapMaster.getUintVar(ddisputecount);
    disp = await zapMaster.getAllDisputeVars(disputeId);
    expect(disp[7][6]).to.equal(4);

    zapMaster.didVote(disputeId, signers[1].address);

    let blockNumber = await ethers.provider.getBlockNumber();

    // Increase the evm time by 8 days
    // A stake can not be withdrawn until 7 days passed
    await ethers.provider.send('evm_increaseTime', [691200]);
    await zap.tallyVotes(disputeId);

    disp = await zapMaster.getAllDisputeVars(disputeId);

    // expect voting to have ended
    expect(disp[1]).to.be.true;

    // expect dispute to be successful
    expect(disp[2]).to.be.false;

    // let disputeFee = disp[7][8];

    blockNumber = await ethers.provider.getBlockNumber();

    let reported_miner_wallet_bal = await zapMaster.balanceOf(disp[3]);

    reporting_miner_wallet_bal = await zapMaster.balanceOf(disp[4]);

    let finalReportingVBal = await vault.userBalance(disp[4]);

    let finalReportedVBal = await vault.userBalance(disp[3])

    // let zMBal = await zap.getBalanceAt(zapMaster.address, blockNumber);
    blockNumber = await ethers.provider.getBlockNumber();

    // let zMBal = await zap.getBalanceAt(zapMaster.address, blockNumber);
    let zMBal2 = await zapMaster.balanceOf(zapMaster.address);

    // expect balance of loser's wallet to be 1087500: 600k(leftover bal. after staking) - 427500 (pay dispute fee) = 108750 since reporter lost their fee to disputed miner.
    expect(reporting_miner_wallet_bal).to.equal(BigNumber.from("112500000000000000000000")); //600K + 472500(dispute fee)

    expect(postReportingVBal).to.equal(finalReportingVBal);

    expect(initReportedVBal.add(disputeFee)).to.equal(finalReportedVBal);
  });

  it('Should be able to dispute with token balance exactly equal to disputeFee.', async () => {
    // main actor in this test case
    let disputer = signers[1].address;


    // Converts the uintVar "stakeAmount" to a bytes array
    const timeOfLastNewValueBytes: Uint8Array = ethers.utils.toUtf8Bytes(
      'timeOfLastNewValue'
    );

    // Converts the uintVar "stakeAmount" from a bytes array to a keccak256 hash
    const timeOfLastNewValueHash: string = ethers.utils.keccak256(
      timeOfLastNewValueBytes
    );

    // Gets the the current stake amount
    let timeStamp: BigNumber = await zapMaster.getUintVar(
      timeOfLastNewValueHash
    );

    // balance of disputer (main actor in this test case)
    let disputerBalance = (await zapTokenBsc.balanceOf(disputer)).toString();
   
    // give away tokens to make 0 Zap Token balance
    await zapTokenBsc.connect(signers[1]).transfer(signers[2].address, disputerBalance);
    
    // get the disputeFee
    let disputeFee = await getUintVarHelper("disputeFee")

    // allocate disputeFee amount of tokens to disputer
    await zapTokenBsc.connect(signers[0]).allocate(disputer, disputeFee);
    
    disputerBalance = (await zapTokenBsc.balanceOf(disputer)).toString(); //487500000000000000000000
    
    // approve then begin dispute
    await zapTokenBsc.connect(signers[1]).approve(zapMaster.address, disputeFee);
    await zap.connect(signers[1]).beginDispute(1, timeStamp, 4);

    // Convert to a bytes array
    const disputeCount: Uint8Array = ethers.utils.toUtf8Bytes('disputeCount');

    // Convert to a keccak256 hash
    const ddisputecount: string = ethers.utils.keccak256(disputeCount);

    // Gets the disputeID also the dispute count
    let disputeId: BigNumber = await zapMaster.getUintVar(ddisputecount);

    disputeId = await zapMaster.getUintVar(ddisputecount);
    let disp = await zapMaster.getAllDisputeVars(disputeId);

    let reporting_miner_wallet_bal = await zapTokenBsc.balanceOf(disp[5]);

    let reportingVBal = await vault.userBalance(disp[4]);

    let initReportedVBal = await vault.userBalance(disp[3]);

    expect(reporting_miner_wallet_bal).to.equal(BigNumber.from("0"));

    // expect to be the address that begain the dispute
    expect(disp[4]).to.equal(disputer);
    // expect to be the address that is being disputed
    expect(disp[3]).to.equal(signers[5].address);
    //expect requestID disputed to be 1
    expect(disp[7][0]).to.equal(1);
    // expect timestamp to be the same timestamp used when disputed
    expect(disp[7][1]).to.equal(timeStamp);

    // vote of a dispute
    // signers 2-4 vote for the dispute 1
    for (var i = 2; i < 5; i++) {
      zap = zap.connect(signers[i]);
      await zap.vote(disputeId, false);
    }
    disputeId = await zapMaster.getUintVar(ddisputecount);
    disp = await zapMaster.getAllDisputeVars(disputeId);
    expect(disp[7][6]).to.equal(4);

    zapMaster.didVote(disputeId, disputer);

    let blockNumber = await ethers.provider.getBlockNumber();

    // Increase the evm time by 8 days
    // A stake can not be withdrawn until 7 days passed
    await ethers.provider.send('evm_increaseTime', [691200]);
    await zap.tallyVotes(disputeId);

    disp = await zapMaster.getAllDisputeVars(disputeId);

    // expect voting to have ended
    expect(disp[1]).to.be.true;

    // expect dispute to be successful
    expect(disp[2]).to.be.false;

    blockNumber = await ethers.provider.getBlockNumber();

    let reported_miner_wallet_bal = await zapMaster.balanceOf(disp[3]);
    
    reporting_miner_wallet_bal = await zapMaster.balanceOf(disp[4]);

    let finalReportingVBal = await vault.userBalance(disp[4]);

    let finalReportedVBal = await vault.userBalance(disp[3])

    // let zMBal = await zap.getBalanceAt(zapMaster.address, blockNumber);
    blockNumber = await ethers.provider.getBlockNumber();

    // let zMBal = await zap.getBalanceAt(zapMaster.address, blockNumber);
    let zMBal2 = await zapMaster.balanceOf(zapMaster.address);

    // expect balance of winner's wallet to be 1087500: 600k(leftover bal. after staking) + 487500 disputeFee
    expect(reported_miner_wallet_bal).to.equal(BigNumber.from("600000000000000000000000"));

     // 0, since disputer's balance was exactly disputeFee
    expect(reporting_miner_wallet_bal).to.equal(BigNumber.from("0"));

    expect(reportingVBal).to.equal(finalReportingVBal);

    expect(initReportedVBal.add(disputeFee)).to.equal(finalReportedVBal);
  });

  it('Should fail dispute if the number of voters are less than 10%', async () => {
    // stake signers 6 to 15.
    for (let i = 6; i <= 15; i++) {
      await zapTokenBsc.allocate(signers[i].address, BigNumber.from("1100000000000000000000000"));
      zap = zap.connect(signers[i]);

      await zapTokenBsc.connect(signers[i]).approve(zapMaster.address, BigNumber.from("500000000000000000000000"));
      await zap.depositStake();
    }

    // Converts the uintVar "stakeAmount" to a bytes array
    const timeOfLastNewValueBytes: Uint8Array = ethers.utils.toUtf8Bytes(
      'timeOfLastNewValue'
    );

    // Converts the uintVar "stakeAmount" from a bytes array to a keccak256 hash
    const timeOfLastNewValueHash: string = ethers.utils.keccak256(
      timeOfLastNewValueBytes
    );

    // Gets the the current stake amount
    let timeStamp: BigNumber = await zapMaster.getUintVar(
      timeOfLastNewValueHash
    );

    await zapTokenBsc.connect(signers[1]).approve(zapMaster.address, BigNumber.from("500000000000000000000000"));

    zap = zap.connect(signers[1]);
    await zap.beginDispute(1, timeStamp, 4);
    // Convert to a bytes array
    const disputeCount: Uint8Array = ethers.utils.toUtf8Bytes('disputeCount');

    // Convert to a keccak256 hash
    const ddisputecount: string = ethers.utils.keccak256(disputeCount);

    // Gets the disputeID also the dispute count
    let disputeId: BigNumber = await zapMaster.getUintVar(ddisputecount);

    disputeId = await zapMaster.getUintVar(ddisputecount);
    let disp = await zapMaster.getAllDisputeVars(disputeId);

    // expect to be the address that begain the dispute
    expect(disp[4]).to.equal(signers[1].address);
    // expect to be the address that is being disputed
    expect(disp[3]).to.equal(signers[5].address);
    //expect requestID disputed to be 1
    expect(disp[7][0]).to.equal(1);
    // expect timestamp to be the same timestamp used when disputed
    expect(disp[7][1]).to.equal(timeStamp);

    // vote as reporting party (expect to fail)
    zap = zap.connect(signers[1]);
    await expect(zap.vote(disputeId, true)).to.be.revertedWith("The reporting party of the dispute cannot vote");

    // vote of a valid dispute
    zap = zap.connect(signers[2]);
    await zap.vote(disputeId, true);

    disputeId = await zapMaster.getUintVar(ddisputecount);
    disp = await zapMaster.getAllDisputeVars(disputeId);

    zapMaster.didVote(disputeId, signers[1].address);

    // Increase the evm time by 8 days
    // A stake can not be withdrawn until 7 days passed
    await ethers.provider.send('evm_increaseTime', [691200]);
    await zap.tallyVotes(disputeId);

    disp = await zapMaster.getAllDisputeVars(disputeId);

    // expect voting to have ended
    expect(disp[1]).to.be.true;

    // expect dispute to have failed
    expect(disp[2]).to.be.false;
  });

  it('Should revert when calling tallyVote() as non staked.', async () => {
    // Converts the uintVar "stakeAmount" to a bytes array
    const timeOfLastNewValueBytes: Uint8Array = ethers.utils.toUtf8Bytes(
      'timeOfLastNewValue'
    );

    // Converts the uintVar "stakeAmount" from a bytes array to a keccak256 hash
    const timeOfLastNewValueHash: string = ethers.utils.keccak256(
      timeOfLastNewValueBytes
    );

    // Gets the the current stake amount
    let timeStamp: BigNumber = await zapMaster.getUintVar(
      timeOfLastNewValueHash
    );

    await zapTokenBsc.connect(signers[1]).approve(zapMaster.address, BigNumber.from("500000000000000000000000"));

    zap = zap.connect(signers[1]);
    await zap.beginDispute(1, timeStamp, 4);
    // Convert to a bytes array
    const disputeCount: Uint8Array = ethers.utils.toUtf8Bytes('disputeCount');

    // Convert to a keccak256 hash
    const ddisputecount: string = ethers.utils.keccak256(disputeCount);

    // Gets the disputeID also the dispute count
    let disputeId: BigNumber = await zapMaster.getUintVar(ddisputecount);

    disputeId = await zapMaster.getUintVar(ddisputecount);
    let disp = await zapMaster.getAllDisputeVars(disputeId);

    let reporting_miner_wallet_bal = await zapMaster.balanceOf(disp[4]);

    expect(reporting_miner_wallet_bal).to.equal(BigNumber.from("112500000000000000000000"));

    // expect to be the address that begain the dispute
    expect(disp[4]).to.equal(signers[1].address);
    // expect to be the address that is being disputed
    expect(disp[3]).to.equal(signers[5].address);
    //expect requestID disputed to be 1
    expect(disp[7][0]).to.equal(1);
    // expect timestamp to be the same timestamp used when disputed
    expect(disp[7][1]).to.equal(timeStamp);

    // vote of a dispute
    // signers 2-4 vote for the dispute 1
    for (var i = 2; i < 5; i++) {
      zap = zap.connect(signers[i]);
      await zap.vote(disputeId, true);
    }

    zap = zap.connect(signers[6]);
    await expect(zap.vote(disputeId, true)).to.be.revertedWith("Only Stakers that are not under dispute can vote");

    disputeId = await zapMaster.getUintVar(ddisputecount);
    disp = await zapMaster.getAllDisputeVars(disputeId);
    expect(disp[7][6]).to.equal(4);

    zapMaster.didVote(disputeId, signers[1].address);

    let blockNumber = await ethers.provider.getBlockNumber();

    // Increase the evm time by 8 days
    // A stake can not be withdrawn until 7 days passed
    await ethers.provider.send('evm_increaseTime', [691200]);
    await expect(zap.connect(signers[11]).tallyVotes(disputeId)).to.be.revertedWith("Caller must be staked");
  });
});


// helps grab uintVar variables from ZapStorage
async function getUintVarHelper(key: string) {
  // Converts the uintVar "stakeAmount" to a bytes array
  const _bytes: Uint8Array = ethers.utils.toUtf8Bytes(key);

  // Converts the uintVar "stakeAmount" from a bytes array to a keccak256 hash
  const _hash: string = ethers.utils.keccak256(_bytes);

  // Gets the the current stake amount
  return zapMaster.getUintVar(_hash);
}