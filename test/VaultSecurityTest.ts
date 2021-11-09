import { ethers } from 'hardhat';

import { solidity } from 'ethereum-waffle';

import chai, { assert } from 'chai';

import { ZapTokenBSC } from '../typechain/ZapTokenBSC';

import { ZapLibrary } from '../typechain/ZapLibrary';

import { ZapDispute } from '../typechain/ZapDispute';

import { ZapStake } from '../typechain/ZapStake';

import { ZapMaster } from '../typechain/ZapMaster';

import { Zap } from '../typechain/Zap';

import { Vault } from '../typechain/Vault';

import { ERC20 } from '../typechain/ERC20';

import { BigNumber, ContractFactory, Event } from 'ethers';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

const { expect } = chai;

chai.use(solidity);

let zapTokenBsc: ZapTokenBSC;

let zapLibrary: ZapLibrary;

let zapDispute: ZapDispute;

let zapStake: ZapStake;

let zapMaster: ZapMaster;

let zap: Zap;

let vault: Vault;

let newVault: Vault;

let signers: any;

let numVaultOwners: number;

let numAuthorizedUsers: number;

async function stakeFiveSigners() {
  assert(
    signers[1].address != ethers.constants.AddressZero,
    "You need to set up the signers before running this function");

  for (let i = 1; i <= 5; i++) {
    const staker = signers[i];

    // depositing stake for signer[i]
    // this also means that the stakeAmount is transfered to the Current Vault
    // and that the vault holds accounting for this tx
    // approving ZM to spend on stakers behalf to lock ZAP in the Vault (contract)
    await zapTokenBsc.connect(staker).approve(zapMaster.address, ethers.utils.parseEther("500000.0"));
    await zap.attach(zapMaster.address).connect(staker).depositStake();
  }
}

async function deployNewVault(signer: SignerWithAddress, zm: ZapMaster, zt: ZapTokenBSC | ERC20): Promise<Vault> {
  const newVaultFact = await ethers.getContractFactory("Vault", signer);
  const _newVault = newVaultFact.deploy(zt.address, zm.address) as Promise<Vault>;

  return _newVault;
}

describe('Vault Security Test', () => {
  beforeEach(async () => {
    signers = await ethers.getSigners();

    const zapTokenFactory: ContractFactory = await ethers.getContractFactory(
      'ZapToken',
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

    await zapMaster.functions.changeVaultContract(vault.address);

    for (var i = 1; i <= 5; i++) {
      // Allocates ZAP to signers 1 - 5
      await zapTokenBsc.allocate(signers[i].address, ethers.utils.parseEther("600000.0"));
    }

    numVaultOwners = signers.length / 2;
    numAuthorizedUsers = numVaultOwners;
  });

  it('Should revert when depositing as non Zap address', async () => {
    await expect(vault.deposit(signers[1].address, 1)).to.revertedWith("Vault: Only the ZapMaster contract or an authorized Vault Contract can make this call");
  });

  it('Should revert when withdrawing as non Zap address', async () => {
    await expect(vault.withdraw(signers[1].address, 1)).to.revertedWith("Vault: Only the ZapMaster contract or an authorized Vault Contract can make this call");
  });

  it('Should revert when `changeVaultContract` is called more than once', async () => {
    newVault = await deployNewVault(signers[6], zapMaster, zapTokenBsc);
    await newVault.deployed();
    await expect(zapMaster.changeVaultContract(newVault.address)).to.be.reverted;
  });

  it('Should not allow users to directly set new Vault contract addresses', async () => {
    const NewVault: ContractFactory = await ethers.getContractFactory('Vault', {
      signer: signers[0]
    });
    const newVault = (await NewVault.deploy(
      zapTokenBsc.address,
      zapMaster.address
    )) as Vault;

    await newVault.deployed();

    
    await expect(
      vault.connect(signers[2]).setNewVault(newVault.address)).
    to.be.revertedWith(
        "Vault: Only the ZapMaster contract can make this call");
  });

  it('Should not allow users to directly try to migrate Vault balances into new Vault', async () => {
    const NewVault: ContractFactory = await ethers.getContractFactory('Vault', {
      signer: signers[0]
    });
    const newVault = (await NewVault.deploy(
      zapTokenBsc.address,
      zapMaster.address
    )) as Vault;

    await newVault.deployed();

    await expect(
      vault.connect(signers[2]).migrateVault())
    .to.be.revertedWith(
      "Vault: Only the ZapMaster contract can make this call");
  });

  it('Should propose a new Vault Contract if the tally reaches a conensus', async () => {
    await stakeFiveSigners();

    // deploying new Vault Contract
    newVault = await deployNewVault(signers[6], zapMaster, zapTokenBsc);
    await newVault.deployed();

    const disputeFee = await zapMaster.getUintVar(ethers.utils.id("disputeFee"));
    await zapTokenBsc.allocate(signers[1].address, disputeFee);
    await zapTokenBsc.connect(signers[1]).approve(zapMaster.address, disputeFee);
    const txReceipt = await zap.attach(zapMaster.address).connect(signers[1]).proposeFork(newVault.address, 3);

    const eventFilter = zapDispute.filters.NewForkProposal(null, null, newVault.address);
    const event: Event = (await zapMaster.queryFilter(eventFilter))[0];

    // ensure that the proposeFork call went through for the right Vault address
    const retrievedVaultAddress = ethers.utils.getAddress(ethers.utils.hexStripZeros(event.topics[2]));
    expect(retrievedVaultAddress).to.be.eq(newVault.address);

    const disputeID = BigNumber.from(ethers.utils.hexStripZeros(event.topics[1]));
    const txBlockNum = txReceipt.blockNumber as number;
    const timestamp = (await ethers.provider.getBlock(txBlockNum)).timestamp;
    // 60 secs * 60 * 24 * 7 = 604800 secs = 1 week
    const sevenDaysLater = timestamp + 604800;

    // Fast forward 7 days later
    await ethers.provider.send("evm_setNextBlockTimestamp", [sevenDaysLater]);

    for (let i = 2; i <= 5; i++) {
      const voter = signers[i];

      // each staker (who did not initiate fork proposal) votes in favor of forking the Vault
      await zap.attach(zapMaster.address).connect(voter).vote(disputeID, true);
    }

    const oldVaultBalance = await zapTokenBsc.balanceOf(vault.address);
    const balanceOfFirstStaker = await vault.userBalance(signers[1].address);
    const balanceOfLastStaker = await vault.userBalance(signers[5].address);

    await zap.attach(zapMaster.address).connect(signers[1]).tallyVotes(disputeID);

    expect(await zapMaster.getAddressVars(ethers.utils.id("_vault"))).to.be.eq(newVault.address);
    expect(await zapTokenBsc.balanceOf(newVault.address)).to.be.eq(oldVaultBalance);
    expect(await newVault.userBalance(signers[1].address)).to.be.eq(balanceOfFirstStaker);
    expect(await newVault.userBalance(signers[5].address)).to.be.eq(balanceOfLastStaker);
  });

  it("Should not migrate the Vault contract if the quorum is < 35%", async () => {
    await stakeFiveSigners();

    newVault = await deployNewVault(signers[6], zapMaster, zapTokenBsc);
    await newVault.deployed();

    const disputeFee = await zapMaster.getUintVar(ethers.utils.id("disputeFee"));
    await zapTokenBsc.allocate(signers[1].address, disputeFee);
    await zapTokenBsc.connect(signers[1]).approve(zapMaster.address, disputeFee);
    const txReceipt = await zap.attach(zapMaster.address).connect(signers[1]).proposeFork(newVault.address, 3);

    const eventFilter = zapDispute.filters.NewForkProposal(null, null, newVault.address);
    const event: Event = (await zapMaster.queryFilter(eventFilter))[0];

    const disputeID = BigNumber.from(ethers.utils.hexStripZeros(event.topics[1]));
    const txBlockNum = txReceipt.blockNumber as number;
    const timestamp = (await ethers.provider.getBlock(txBlockNum)).timestamp;
    // 60 secs * 60 * 24 * 7 = 604800 secs = 1 week
    const sevenDaysLater = timestamp + 604800;

    // Fast forward 7 days later
    await ethers.provider.send("evm_setNextBlockTimestamp", [sevenDaysLater]);

    // note, it only takes 2 persons who staked 500k ZAP to satisfy the quorum argument
    await zap.attach(zapMaster.address).connect(signers[2]).vote(disputeID, true);

    await expect(zap.attach(zapMaster.address).connect(signers[1]).tallyVotes(disputeID)).to.be.reverted;
  });

  it("Should not migrate the vault if the new Vault contract has a different ZapMaster than the current one", async () => {
    await stakeFiveSigners();

    const zapMasterFactory: ContractFactory = await ethers.getContractFactory(
      'ZapMaster',
      {
        libraries: {
          ZapStake: zapStake.address
        },
        signer: signers[0]
      }
    );

    const zapMaster2 = (await zapMasterFactory.deploy(
      zap.address,
      zapTokenBsc.address
    )) as ZapMaster;
    await zapMaster2.deployed();

    newVault = await deployNewVault(signers[6], zapMaster2, zapTokenBsc);
    
    const disputeFee = await zapMaster.getUintVar(ethers.utils.id("disputeFee"));
    await zapTokenBsc.allocate(signers[1].address, disputeFee);
    await zapTokenBsc.connect(signers[1]).approve(zapMaster.address, disputeFee);
    const txReceipt = await zap.attach(zapMaster.address).connect(signers[1]).proposeFork(newVault.address, 3)

    const eventFilter = zapDispute.filters.NewForkProposal(null, null, newVault.address);
    const event: Event = (await zapMaster.queryFilter(eventFilter))[0];

    const disputeID = BigNumber.from(ethers.utils.hexStripZeros(event.topics[1]));
    const txBlockNum = txReceipt.blockNumber as number;
    const timestamp = (await ethers.provider.getBlock(txBlockNum)).timestamp;
    // 60 secs * 60 * 24 * 7 = 604800 secs = 1 week
    const sevenDaysLater = timestamp + 604800;

    // Fast forward 7 days later
    await ethers.provider.send("evm_setNextBlockTimestamp", [sevenDaysLater]);

    for (let i = 2; i <= 5; i++) {
      const voter = signers[i];

      // each staker (who did not initiate fork proposal) votes in favor of forking the Vault
      await zap.attach(zapMaster.address).connect(voter).vote(disputeID, true);
    }
    
    assert(await newVault.getZM() != zapMaster.address);
    await expect(zap.attach(zapMaster.address).connect(signers[1]).tallyVotes(disputeID))
    .to.be.revertedWith(
      "Vault: Only the ZapMaster contract can make this call");
  });

  it("Should not migrate the Vault if the new Vault has a different ERC20 contract to the old one", async () => {
    await stakeFiveSigners();

    const erc20Factory = await ethers.getContractFactory("ZapToken", signers[6]);
    const erc20 = await erc20Factory.deploy() as ERC20;

    newVault = await deployNewVault(signers[6], zapMaster, erc20);
    await newVault.deployed();

    const disputeFee = await zapMaster.getUintVar(ethers.utils.id("disputeFee"));
    await zapTokenBsc.allocate(signers[1].address, disputeFee);
    await zapTokenBsc.connect(signers[1]).approve(zapMaster.address, disputeFee);
    const txReceipt = await zap.attach(zapMaster.address).connect(signers[1]).proposeFork(newVault.address, 3)

    const eventFilter = zapDispute.filters.NewForkProposal(null, null, newVault.address);
    const event: Event = (await zapMaster.queryFilter(eventFilter))[0];

    const disputeID = BigNumber.from(ethers.utils.hexStripZeros(event.topics[1]));
    const txBlockNum = txReceipt.blockNumber as number;
    const timestamp = (await ethers.provider.getBlock(txBlockNum)).timestamp;
    // 60 secs * 60 * 24 * 7 = 604800 secs = 1 week
    const sevenDaysLater = timestamp + 604800;

    // Fast forward 7 days later
    await ethers.provider.send("evm_setNextBlockTimestamp", [sevenDaysLater]);

    for (let i = 2; i <= 5; i++) {
      const voter = signers[i];

      // each staker (who did not initiate fork proposal) votes in favor of forking the Vault
      await zap.attach(zapMaster.address).connect(voter).vote(disputeID, true);
    }

    assert(zapTokenBsc.address != erc20.address);

    await expect(
      zap.attach(zapMaster.address).connect(signers[1]).tallyVotes(disputeID))
    .to.be.revertedWith(
      "The new vault must share the same ZapToken contract");
  });

  /**
   * Tests below are deprecated as now only the Zap/ZapMaster contracts can call the state changing functions
   */
  // it('Tests if the authority of a user is correct', async () => {
  //   let j: number = numAuthorizedUsers;
  //   for (let i = 0; i < numVaultOwners; i++) {
  //     await vault
  //       .connect(signers[i])
  //       .lockSmith(signers[i].address, signers[j].address);
  //     await expect(vault.connect(signers[j]).deposit(signers[i].address, 1)).to.be.reverted;
  //     expect(
  //       await vault
  //         .connect(signers[j])
  //         .hasAccess(signers[j].address, signers[i].address)s
  //     ).to.be.true;
  //     j++;
  //   }

  //   j = 0;
  //   for (let i = numAuthorizedUsers; i < signers.length; i++) {
  //     expect(
  //       await vault
  //         .connect(signers[j])
  //         .hasAccess(signers[j].address, signers[i].address)
  //     ).to.be.false;
  //     await expect(vault.connect(signers[j]).withdraw(signers[i].address, 1)).to
  //       .be.reverted;
  //     j++;
  //     if (j == signers.length) {
  //       break;
  //     }
  //   }
  // });

  // it('Tests if an authorised user can deposit/withdraw', async () => {
  //   let j: number = numAuthorizedUsers;
  //   for (let i = 0; i < numVaultOwners; i++) {
  //     await vault
  //       .connect(signers[i])
  //       .lockSmith(signers[i].address, signers[j].address);
  //     expect(await vault.connect(signers[j]).deposit(signers[i].address, 1)).to
  //       .be.ok;
  //     expect(await vault.userBalance(signers[i].address)).to.equal(1);
  //     j++;
  //   }

  //   j = 0;
  //   for (let i = numAuthorizedUsers; i < signers.length; i++) {
  //     expect(await vault.connect(signers[i]).withdraw(signers[j].address, 1)).to
  //       .be.ok;
  //     expect(await vault.userBalance(signers[j].address)).to.equal(0);
  //     await expect(vault.connect(signers[i]).withdraw(signers[j], 1)).to.be
  //       .reverted;
  //     j++;
  //     if (j == signers.length) {
  //       break;
  //     }
  //   }
  // });
});
