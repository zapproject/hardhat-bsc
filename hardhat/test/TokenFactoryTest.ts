import { ethers } from 'hardhat';
import { solidity } from 'ethereum-waffle';
import chai from 'chai';
import mocha from 'mocha';

import { ZapCoordinator } from '../typechain/ZapCoordinator';
import { Database } from '../typechain/Database';
import { Registry } from '../typechain/Registry';
import { Bondage } from '../typechain/Bondage';
import { ZapToken } from '../typechain/ZapToken';
import { CurrentCost } from '../typechain/CurrentCost';
import { TokenDotFactory } from '../typechain/TokenDotFactory';
import {DotFactoryFactory} from '../typechain/DotFactoryFactory';
import { TokenFactory } from '../typechain/TokenFactory';
import { FactoryToken } from '../typechain/FactoryToken';
chai.use(solidity);
const { expect } = chai;

const publicKey = 77;
const title =
  '0x048a2991c2676296b330734992245f5ba6b98174d3f1907d795b7639e92ce532';
const title2 =
  '0x077a2991c2676296b330734992245f5ba6b98174d3f1907d795b7639e92ce532';
const routeKeys = [1];
const params = ['param1', 'param2'];

const specifier =
  '0x048a2991c2676296b330734992245f5ba6b98174d3f1907d795b7639e92ce577';
const zeroAddress = '0x0000000000000000000000000000000000000000';

const piecewiseFunction = [3, 0, 0, 2, 10000];

const tokensForOwner = ethers.BigNumber.from('1500000000000000000000000000000');

const tokensForSubscriber = ethers.BigNumber.from(
  '50000000000000000000000000000'
);

const approveTokens = ethers.BigNumber.from('1000000000000000000000000000000');

const dotBound = ethers.BigNumber.from('999');
const structurizeCurve = function (parts: any) {
  const pieces = Array();

  let index = 0;
  let start = 1;

  while (index < parts.length) {
    const length = parts[index];
    const base = index + 1;
    const terms = parts.slice(base, base + length);
    const end = parts[base + length];

    pieces.push({
      terms,
      start,
      end
    });

    index = base + length + 1;
    start = end;
  }

  return pieces;
};
const calcNextDotCost = function (structurizedCurve: any, total: any) {
  if (total < 0) {
    return 0;
  }

  for (let i = 0; i < structurizedCurve.length; i++) {
    if (
      structurizedCurve[i].start <= total &&
      total <= structurizedCurve[i].end
    ) {
      return _calculatePolynomial(structurizedCurve[i].terms, total);
    }
  }

  return 0;
};

const calcDotsCost = function (structurizedCurve: any, numDots: any) {
  let cost = 0;

  for (let i = 1; i <= numDots; i++) {
    cost += calcNextDotCost(structurizedCurve, i);
  }

  return cost;
};

function _calculatePolynomial(terms: any, x: any) {
  let sum = 0;

  for (let i = 0; i < terms.length; i++) {
    sum += terms[i] * x ** i;
  }

  return sum;
}

describe('ZapBondage', () => {
  let zapToken: ZapToken;
  let tokenFactory: any;
  let dataBase: Database;
  let bondage: Bondage;
  let cost: CurrentCost;
  let dotFactory: TokenDotFactory;
  let factoryToken: any;
  let registry: Registry;
  let factoryTokne: any;
  let allocatedAmt: number;
  let signers: any;
  let coordinator: ZapCoordinator;
  let owner: any;
  let subscriber: any;
  let oracle: any;
  let broker: any;
  let escrower: any;
  let escrower2: any;
  let arbiter: any;
  let dotTokenFactory: any;
  //let dotFactoryFactory:DotFactoryFactory;
  let dotFactoryFactoryInstance:any;
  beforeEach(async () => {
    signers = await ethers.getSigners();
    owner = signers[0];
    subscriber = signers[1];
    oracle = signers[2];
    broker = signers[3];
    escrower = signers[4];
    escrower2 = signers[5];
    arbiter = signers[6];
    dotTokenFactory = await ethers.getContractFactory(
      'TokenDotFactory',
      signers[0]
    );
  
    factoryToken = await ethers.getContractFactory('FactoryToken', signers[0]);
    const zapTokenFactory = await ethers.getContractFactory(
      'ZapToken',
      signers[0]
    );
    const genericTokenFactory = await ethers.getContractFactory(
      'TokenFactory',
      signers[0]
    );
    const coordinatorFactory = await ethers.getContractFactory(
      'ZapCoordinator',
      signers[0]
    );

    const dbFactory = await ethers.getContractFactory('Database', signers[0]);

    const registryFactory = await ethers.getContractFactory(
      'Registry',
      signers[0]
    );
    const costFactory = await ethers.getContractFactory(
      'CurrentCost',
      signers[0]
    );
    const dotFactoryFactory = await ethers.getContractFactory(
      'DotFactoryFactory',
      signers[0]
    );
    const bondFactory = await ethers.getContractFactory('Bondage', signers[0]);
    tokenFactory = (await genericTokenFactory.deploy()) as TokenFactory;
    await tokenFactory.deployed();
    zapToken = (await zapTokenFactory.deploy()) as ZapToken;

    await zapToken.deployed();

    coordinator = (await coordinatorFactory.deploy()) as ZapCoordinator;
    await coordinator.deployed();

    dataBase = (await dbFactory.deploy()) as Database;

    cost = (await costFactory.deploy(coordinator.address)) as CurrentCost;

    registry = (await registryFactory.deploy(coordinator.address)) as Registry;

    dotFactoryFactoryInstance=await dotFactoryFactory.deploy(coordinator.address, tokenFactory.address) as DotFactoryFactory;
    await dotFactoryFactoryInstance.deployed()
    
    await dataBase.transferOwnership(coordinator.address);
    await coordinator.addImmutableContract('DATABASE', dataBase.address);
    await coordinator.addImmutableContract('ARBITER', arbiter.address);
    await coordinator.addImmutableContract('ZAP_TOKEN', zapToken.address);
    await coordinator.updateContract('REGISTRY', registry.address);
    await coordinator.updateContract('CURRENT_COST', cost.address);

    bondage = (await bondFactory.deploy(coordinator.address)) as Bondage;
    await coordinator.updateContract('BONDAGE', bondage.address);
    await coordinator.updateAllDependencies();
  });
  async function prepareProvider(
    account = owner,
    curveParams = piecewiseFunction,
    bondBroker = zeroAddress
  ) {
    await registry.connect(account).initiateProvider(publicKey, title);
    await registry
      .connect(account)
      .initiateProviderCurve(specifier, curveParams, bondBroker);
  }
  function findEvent(logs: any, eventName: string) {
    for (let i = 0; i < logs.length; i++) {
      if (logs[i].event === eventName) {
        return logs[i];
      }
    }

    return null;
  }
  it('TOKEN_DOT_FACTORY_1 - constructor() - Check token dot factory initialization', async function () {
    console.log(tokenFactory.address);
    await dotTokenFactory.deploy(
      coordinator.address,
      tokenFactory.address,
      publicKey,
      title
    );
  });

  it('TOKEN_DOT_FACTORY_2 - newToken() - Check new token creation', async function () {
    let factory = await dotTokenFactory.deploy(
      coordinator.address,
      tokenFactory.address,
      publicKey,
      title
    );
    await factory.deployed();
    let tx = await factory.newToken('t1', 'tkn');
    tx = await tx.wait();

    await expect(
      ethers.utils.getAddress(ethers.utils.hexStripZeros(tx.logs[0].topics[2]))
    ).to.equal(factory.address);
  });

  it('TOKEN_DOT_FACTORY_3 - initializeCurve() - Check curve initialization', async function () {
    let factory = await dotTokenFactory.deploy(
      coordinator.address,
      tokenFactory.address,
      publicKey,
      title
    );
    let tx = await factory.initializeCurve(specifier, title, piecewiseFunction);
    tx = await tx.wait();
    console.log(tx);

    let dotTokenCreatedEvent = findEvent(tx.events, 'DotTokenCreated');
    console.log(dotTokenCreatedEvent);
    await expect(dotTokenCreatedEvent).to.be.not.equal(null);
  });

  it('TOKEN_DOT_FACTORY_4 - initializeCurve() - Exception thrown if curve specifier already exists', async function () {
    let factory = await dotTokenFactory.deploy(
      coordinator.address,
      tokenFactory.address,
      publicKey,
      title
    );
    let tx = await factory.initializeCurve(specifier, title, piecewiseFunction);
    tx = await tx.wait();
    console.log(tx);
    let dotTokenCreatedEvent = findEvent(tx.events, 'DotTokenCreated');
    await expect(dotTokenCreatedEvent).to.be.not.equal(null);

    await expect(factory.initializeCurve(specifier, title, piecewiseFunction))
      .to.reverted;
  });

  it('TOKEN_DOT_FACTORY_5 - bond() - Check bonding', async function () {
    let factory = await dotTokenFactory.deploy(
      coordinator.address,
      tokenFactory.address,
      publicKey,
      title
    );

    await factory.initializeCurve(specifier, title2, piecewiseFunction);
    let reserveTokenAddr = await factory.reserveToken();
    let reserveToken = await zapToken.attach(reserveTokenAddr);
    await reserveToken.allocate(subscriber.address, 10000);
    await reserveToken.connect(subscriber).approve(factory.address, 10000);
    await factory.connect(subscriber).bond(specifier, 1);

    let subBalance = parseInt(
      (await reserveToken.balanceOf(subscriber.address)).toString()
    );
    console.log(subBalance);
    await expect(subBalance).to.be.not.equal(10000);
  });

  it('TOKEN_DOT_FACTORY_6 - bond() - Check that user can not bond without tokens', async function () {
    let factory = await dotTokenFactory.deploy(
      coordinator.address,
      tokenFactory.address,
      publicKey,
      title
    );
    await factory.initializeCurve(specifier, title2, piecewiseFunction);
    let reserveTokenAddr = await factory.reserveToken();
    let reserveToken = await zapToken.attach(reserveTokenAddr);
    // await reserveToken.allocate(subscriber, 10000);
    await reserveToken.connect(subscriber).approve(factory.address, 10000);
    await expect(factory.connect(subscriber).bond(specifier, 1)).to.reverted;
  });

  it('TOKEN_DOT_FACTORY_7 - unbond() - Check unbonding', async function () {
    let factory = await dotTokenFactory.deploy(
      coordinator.address,
      tokenFactory.address,
      publicKey,
      title
    );
    await factory.initializeCurve(specifier, title2, piecewiseFunction);
    let reserveTokenAddr = await factory.reserveToken();
    let reserveToken = await zapToken.attach(reserveTokenAddr);
    await reserveToken.allocate(subscriber.address, 10000);
    await reserveToken.connect(subscriber).approve(factory.address, 10000);
    await factory.connect(subscriber).bond(specifier, 1);
    console.log('finish bond');
    let curveTokenAddr = await factory.getTokenAddress(specifier);

    let curveToken = await factoryToken.attach(curveTokenAddr);

    await curveToken.connect(subscriber).approve(factory.address, 1);
    await factory.connect(subscriber).unbond(specifier, 1);
  });

  it('TOKEN_DOT_FACTORY_8 - unbond() - Check that user can not unbond more than have', async function () {
    let factory = await dotTokenFactory.deploy(
      coordinator.address,
      tokenFactory.address,
      publicKey,
      title
    );
    await factory.initializeCurve(specifier, title2, piecewiseFunction);
    let reserveTokenAddr = await factory.reserveToken();
    let reserveToken = await zapToken.attach(reserveTokenAddr);
    await reserveToken.allocate(subscriber.address, 10000);
    await reserveToken.connect(subscriber).approve(factory.address, 10000);
    await factory.connect(subscriber).bond(specifier, 1);
    console.log('finish bond');
    let curveTokenAddr = await factory.getTokenAddress(specifier);

    let curveToken = await factoryToken.attach(curveTokenAddr);

    await curveToken.connect(subscriber).approve(factory.address, 1);
    await expect(factory.connect(subscriber).unbond(specifier, 100)).to
      .reverted;
  });

  it('TOKEN_DOT_FACTORY_9 - getTokenAddress() - Check curve token address', async function () {
    let factory = await dotTokenFactory.deploy(
      coordinator.address,
      tokenFactory.address,
      publicKey,
      title
    );
    await factory.initializeCurve(specifier, title2, piecewiseFunction);
    let curveTokenAddr = await factory.getTokenAddress(specifier);
    await expect(curveTokenAddr).to.not.equal(zeroAddress);
  });
  it('TOKEN_DOT_FACTORY_10 -deploy through dot factory Factory ', async function () {
    let factory = await dotFactoryFactoryInstance.deployFactory(      
      publicKey,
      title
    );
    let factories=await dotFactoryFactoryInstance.getFactories();
   // console.log(factories) 
    let Instantiated=await dotTokenFactory.attach(factories[0])
    await Instantiated.initializeCurve(specifier, title2, piecewiseFunction)
    //await factory.initializeCurve(specifier, title2, piecewiseFunction);
    let curveTokenAddr = await Instantiated.getTokenAddress(specifier);
    await expect(curveTokenAddr).to.not.equal(zeroAddress);
  });
});
