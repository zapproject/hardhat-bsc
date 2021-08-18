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
import { keccak256 } from 'ethers/lib/utils';
import { Address } from 'hardhat-deploy/dist/types';

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
      await vault.connect(signers[i]).lockSmith(signers[i].address, zap.address);

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
      //   const res = await mining.wait();
      //   console.log(res)

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

    zap = zap.connect(signers[1]);
    await zap.beginDispute(1, timeStamp, 4);

    disputeId = await zapMaster.getUintVar(ddisputecount);
    // test dispute count after beginDispute
    expect(disputeId).to.equal(1, 'Dispute count should be 1.');

    disputeId = await zapMaster.getUintVar(ddisputecount);
    let disp = await zapMaster.getAllDisputeVars(disputeId);

    // expect to be the address that begain the dispute
    expect(disp[4]).to.equal(signers[5].address);
    // expect to be the address that is being disputed
    expect(disp[5]).to.equal(signers[1].address);
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

    let reporting_miner_wallet_bal = await zapMaster.balanceOf(disp[5]);

    expect(reporting_miner_wallet_bal).to.equal(BigNumber.from("112500000000000000000000"));

    // expect to be the address that begain the dispute
    expect(disp[4]).to.equal(signers[5].address);
    // expect to be the address that is being disputed
    expect(disp[5]).to.equal(signers[1].address);
    //expect requestID disputed to be 1
    expect(disp[7][0]).to.equal(1);
    // expect timestamp to be the same timestamp used when disputed
    expect(disp[7][1]).to.equal(timeStamp);

    // vote of a dispute
    // signers 1-4 vote for the dispute 1
    for (var i = 1; i < 5; i++) {
      zap = zap.connect(signers[i]);
      await zap.vote(disputeId, true);
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
    expect(disp[2]).to.be.true;

    // let disputeFee = disp[7][8];

    blockNumber = await ethers.provider.getBlockNumber();

    reporting_miner_wallet_bal = await zapTokenBsc.balanceOf(disp[5]);

    // let zMBal = await zap.getBalanceAt(zapMaster.address, blockNumber);
    blockNumber = await ethers.provider.getBlockNumber();

    // let zMBal = await zap.getBalanceAt(zapMaster.address, blockNumber);
    let zMBal2 = await zapMaster.balanceOf(zapMaster.address);

    // expect balance of winner's wallet to be 600K: 600k(leftover bal. after staking) - 427500 (pay dispute fee) + 427500 (win back dispute fee)  = 600K.
    expect(reporting_miner_wallet_bal).to.equal(BigNumber.from("600000000000000000000000"));

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

    let reporting_miner_wallet_bal = await zapTokenBsc.balanceOf(disp[5]);

    expect(reporting_miner_wallet_bal).to.equal(BigNumber.from("112500000000000000000000"));

    // expect to be the address that begain the dispute
    expect(disp[4]).to.equal(signers[5].address);
    // expect to be the address that is being disputed
    expect(disp[5]).to.equal(signers[1].address);
    //expect requestID disputed to be 1
    expect(disp[7][0]).to.equal(1);
    // expect timestamp to be the same timestamp used when disputed
    expect(disp[7][1]).to.equal(timeStamp);

    // vote of a dispute
    // signers 1-4 vote for the dispute 1
    for (var i = 1; i < 5; i++) {
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

    let reported_miner_wallet_bal = await zapMaster.balanceOf(disp[4]);

    reporting_miner_wallet_bal = await zapMaster.balanceOf(disp[5]);

    // let zMBal = await zap.getBalanceAt(zapMaster.address, blockNumber);
    blockNumber = await ethers.provider.getBlockNumber();

    // let zMBal = await zap.getBalanceAt(zapMaster.address, blockNumber);
    let zMBal2 = await zapMaster.balanceOf(zapMaster.address);

    // expect balance of loser's wallet to be 1087500: 600k(leftover bal. after staking) - 427500 (pay dispute fee) = 108750 since reporter lost their fee to disputed miner.
    expect(reported_miner_wallet_bal).to.equal(BigNumber.from("1087500000000000000000000")); //600K + 472500(dispute fee)

    expect(reporting_miner_wallet_bal).to.equal(BigNumber.from("112500000000000000000000")); // 600k - 472500(dispute fee)
    // expect balance of loser to be 500k(original stake amount) + 15(reward for mining ) = 500015 for not winning the disputed miners stake.

  });
});
