// Signers 15, 16, 17, 18, 19, 0 are already miners

import { ethers } from 'hardhat';

import { solidity } from 'ethereum-waffle';

import chai from 'chai';

import { ZapTokenBSC } from '../typechain/ZapTokenBSC';

import { ZapTransfer } from '../typechain/ZapTransfer';

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

let zapTransfer: ZapTransfer;

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

    const zapTransferFactory: ContractFactory = await ethers.getContractFactory(
      'ZapTransfer',
      signers[0]
    );

    zapTransfer = (await zapTransferFactory.deploy()) as ZapTransfer;
    await zapTransfer.deployed();

    const zapLibraryFactory: ContractFactory = await ethers.getContractFactory(
      'ZapLibrary',
      {
        libraries: {
          ZapTransfer: zapTransfer.address
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
          ZapTransfer: zapTransfer.address
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
          ZapTransfer: zapTransfer.address,
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
          ZapTransfer: zapTransfer.address,
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


    await zapTokenBsc.allocate(zapMaster.address, 10000000);

    zap = zap.attach(zapMaster.address);

    // stake signers 1 to 5.
    for (let i = 1; i <= 5; i++) {
      await zapTokenBsc.allocate(signers[i].address, 1100000);
      zap = zap.connect(signers[i]);
      await vault.connect(signers[i]).lockSmith(signers[i].address, zap.address);

      await zapTokenBsc.connect(signers[i]).approve(zapMaster.address, 500000);
      await zap.depositStake();
      expect(await zapMaster.balanceOf(signers[i].address)).to.equal(600000);
      expect(await zapMaster.balanceOf(vault.address)).to.equal(i * 500000);
    }

  });

  it('Should be able to add tip when requesting data.', async () => {
    let orignalBal = await zap.connect(signers[1]).balanceOf(signers[1].address)
    let symbol: string = "BTC/USD";
    // Request string
    const api: string =
        "json(https://api.binance.com/api/v1/klines?symbol=BTCUSDT&interval=1d&limit=1).0.4";
    await zapTokenBsc.connect(signers[1]).approve(zap.address, 5000000);
    await zap.connect(signers[1]).requestData(api, symbol, 100000, 52);


    let balAfterRequestData = await zap.connect(signers[1]).balanceOf(signers[1].address);
    let diff = parseInt(orignalBal._hex) - parseInt(balAfterRequestData._hex);
    expect(diff).to.equal(52);

    await zap.connect(signers[1]).addTip(1, 333);

    let balAfterAddTip = await zap
        .connect(signers[1])
        .balanceOf(signers[1].address);

    diff = parseInt(balAfterRequestData._hex) - parseInt(balAfterAddTip._hex);
    expect(diff).to.equal(333);


    // 1000 is the max. should fail
    await expect(zap.connect(signers[1]).addTip(1, 1234)).to.be.reverted

   
  });
  it("Should not be able to add tip when requesting data with tip > 1000.", async () => {

      let symbol: string = "BTC/USD";
      // Request string
      const api: string =
          "json(https://api.binance.com/api/v1/klines?symbol=BTCUSDT&interval=1d&limit=1).0.4";
      await zapTokenBsc.connect(signers[1]).approve(zap.address, 5000000);
    await expect(zap.connect(signers[1]).requestData(api, symbol, 100000, 1234)).to.be.reverted;

  });
});
