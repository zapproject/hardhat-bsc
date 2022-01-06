// import { ethers } from 'hardhat';
// import { solidity } from 'ethereum-waffle';
// import chai from 'chai';
// import { MultiPartyOracle } from '../typechain/MultiPartyOracle';
// import { MpoStorage } from '../typechain/MpoStorage';

// import { ZapToken } from '../typechain/ZapToken';
// import { SSL_OP_NETSCAPE_CA_DN_BUG } from 'constants';
// import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
// import { assert } from 'console';
// import { BigNumber, BigNumberish, ContractTransaction } from 'ethers';
// import {
//   Bytes,
//   BytesLike,
//   checkProperties,
//   formatBytes32String,
//   hexConcat,
//   hexlify,
//   randomBytes
// } from 'ethers/lib/utils';
// import { beforeEach } from 'mocha';
// import { ZapCoordinator } from '../typechain/ZapCoordinator';
// import { Registry } from '../typechain/Registry';
// import { Database } from '../typechain/Database';

// chai.use(solidity);

// const { expect } = chai;

// let registry: Registry;
// let db: Database;
// let coordinator: ZapCoordinator;
// let zapToken: ZapToken;
// let MPO: MultiPartyOracle;
// let mpoStorage: MpoStorage;
// let key: number;
// let owner: SignerWithAddress;
// let add1: SignerWithAddress;

// //TODO: Write tests incorporating the "storageOnly" guard condition for the setter functions

// beforeEach(async () => {
//   // Test accounts
//   [owner, add1] = await ethers.getSigners();

//   const tokenFactory = await ethers.getContractFactory('ZapToken', owner);
//   const zapToken = await tokenFactory.deploy();
//   await zapToken.deployed();

//   const database = await ethers.getContractFactory('Database');
//   db = (await database.deploy()) as Database;
//   await db.setStorageContract(owner.address, true);

//   const coordinatorFactory = await ethers.getContractFactory(
//     'ZapCoordinator',
//     owner
//   );

//   coordinator = (await coordinatorFactory.deploy()) as ZapCoordinator;
//   await coordinator.deployed();

//   const dispatch = await ethers.getContractFactory('Dispatch', owner);
//   const Dispatch = await dispatch.deploy(coordinator.address);

//   const bondage = await ethers.getContractFactory('Bondage', owner);
//   const Bondage = await bondage.deploy(coordinator.address);
//   const Mpostorage = await ethers.getContractFactory('MPOStorage');

//   mpoStorage = (await Mpostorage.deploy()) as MpoStorage;

//   const multipartyoracle = await ethers.getContractFactory('MultiPartyOracle');
//   MPO = (await multipartyoracle.deploy(
//     coordinator.address,
//     mpoStorage.address
//   )) as MultiPartyOracle;

//   await coordinator.addImmutableContract('DATABASE', Database.address);
//   await coordinator.addImmutableContract('ARBITER', Arbiter.address);
//   await coordinator.addImmutableContract('ZAP_TOKEN', zapToken.address);
//   await coordinator.updateContract('REGISTRY', Registry.address);
// });

// describe('Database_Deployment', () => {
//   it('owner() - Check if the owner is valid', async () => {
//     expect(await MPO.owner()).to.equal(owner.address);
//   });
// });