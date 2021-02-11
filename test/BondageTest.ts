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
chai.use(solidity);
const { expect } = chai;

const publicKey = 77;
const title =
  '0x048a2991c2676296b330734992245f5ba6b98174d3f1907d795b7639e92ce532';
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
  let dataBase: Database;
  let bondage: Bondage;
  let cost: CurrentCost;
  let registry: Registry;
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
  beforeEach(async () => {
    signers = await ethers.getSigners();
    owner = signers[0];
    subscriber = signers[1];
    oracle = signers[2];
    broker = signers[3];
    escrower = signers[4];
    escrower2 = signers[5];
    arbiter = signers[6];
    const zapTokenFactory = await ethers.getContractFactory(
      'ZapToken',
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
    const bondFactory = await ethers.getContractFactory('Bondage', signers[0]);

    zapToken = (await zapTokenFactory.deploy()) as ZapToken;

    await zapToken.deployed();

    coordinator = (await coordinatorFactory.deploy()) as ZapCoordinator;
    await coordinator.deployed();

    dataBase = (await dbFactory.deploy()) as Database;

    cost = (await costFactory.deploy(coordinator.address)) as CurrentCost;

    registry = (await registryFactory.deploy(coordinator.address)) as Registry;

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
    account = oracle,
    curveParams = piecewiseFunction
  ) {
    await registry.connect(account).initiateProvider(publicKey, title);
    await registry
      .connect(account)
      .initiateProviderCurve(specifier, curveParams, zeroAddress);
  }

  async function prepareTokens(allocAddress = subscriber) {
    await zapToken.allocate(owner.address, tokensForOwner);
    await zapToken.allocate(allocAddress.address, tokensForSubscriber);
    await zapToken
      .connect(allocAddress)
      .approve(bondage.address, approveTokens);
  }

  it('BONDAGE_1 - bond() - Check bond function', async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(broker);
    await bondage.connect(subscriber).bond(oracle.address, specifier, dotBound);

    let result = await bondage.getBoundDots(
      subscriber.address,
      oracle.address,
      specifier
    );
    await expect(result).to.equal(999);
  });
  it('BONDAGE_4 - unbond() - Check unbond function', async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(broker);

    await bondage.connect(subscriber).bond(oracle.address, specifier, dotBound);
    await bondage
      .connect(subscriber)
      .unbond(oracle.address, specifier, dotBound);

    let result = await bondage.getBoundDots(
      subscriber.address,
      oracle.address,
      specifier
    );
    await expect(result).to.equal(0);
  });
  it('BONDAGE_5 - calcZapForDots() - Check zap for dots calculating', async function () {
    const totalBound = 5;
    await registry.connect(subscriber).initiateProvider(publicKey, title);
    await registry
      .connect(subscriber)
      .initiateProviderCurve(specifier, piecewiseFunction, broker.address);

    const structure = structurizeCurve(piecewiseFunction);
    const fun0Calc = calcDotsCost(structure, totalBound);
    console.log(subscriber.address);
    const res0 = await bondage.calcZapForDots(
      subscriber.address,
      specifier,
      totalBound
    );
    console.log(res0);
    //res0.should.be.bignumber.equal(fun0Calc);
    await expect(res0).to.equal(fun0Calc);
  });

  it('BONDAGE_6 - calcZapForDots() - Check that function revert if curve not intialized', async function () {
    //prepareProvider.call(this.test, true, false);
    await registry.connect(oracle).initiateProvider(publicKey, title);
    await expect(bondage.calcZapForDots(oracle.address, specifier, 5)).to
      .reverted;
  });
  it('BONDAGE_7 - unbond() - Check unbond zap for dots calculation', async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(broker);
    let balance = await zapToken.balanceOf(subscriber.address);
    // we will get 5 dots with current curve (n: [1-5], p = 2n^2)
    await bondage.connect(subscriber).bond(oracle.address, specifier, 5);

    const bond_balance = await zapToken.balanceOf(subscriber.address);

    // unbond three dots
    await bondage.connect(subscriber).unbond(oracle.address, specifier, 3);
    const final_balance = await zapToken.balanceOf(subscriber.address);

    // expect total bonding to cost 110 and unbonding to return 100 zap (50+32+18)
    expect(balance.sub(bond_balance)).to.equal(ethers.BigNumber.from(110));
    expect(final_balance.sub(bond_balance)).to.equal(
      ethers.BigNumber.from(100)
    );
  });
  it('BONDAGE_8 - getBoundDots() - Check received dots getting', async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(broker);
    await bondage.connect(subscriber).bond(oracle.address, specifier, 3);

    const res = await bondage
      .connect(subscriber)
      .getBoundDots(subscriber.address, oracle.address, specifier);
    expect(res).to.equal(ethers.BigNumber.from(3));
  });

  it('BONDAGE_9 - getBoundDots() - Check that number of dots of unbonded provider is 0', async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(broker);

    const res = await bondage
      .connect(subscriber)
      .getBoundDots(subscriber.address, oracle.address, specifier);
    expect(res).to.equal(ethers.BigNumber.from(0));
  });

  it('BONDAGE_10 - getZapBound() - Check received ZAP getting', async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(broker);
    // with current linear curve (startValue = 1, multiplier = 2) number of dots received should be equal to 5
    await bondage.connect(subscriber).bond(oracle.address, specifier, 3);

    const res = await bondage
      .connect(subscriber)
      .getZapBound(oracle.address, specifier);
    expect(res).to.equal(ethers.BigNumber.from(28));
  });
  it('BONDAGE_11 - getZapBound() - Check that received ZAP of unbonded provider is 0', async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(broker);

    const res = await bondage
      .connect(subscriber)
      .getZapBound(oracle.address, specifier);
    expect(res).to.equal(ethers.BigNumber.from(0));
  });

  it('BONDAGE_12 - escrowDots() - Check that operator can escrow dots', async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(broker);

    // we will get 3 dots with current curve
    await bondage.connect(subscriber).bond(oracle.address, specifier, 3);

    const dots = 3;
    const dotsForEscrow = 2;

    await bondage
      .connect(arbiter)
      .escrowDots(subscriber.address, oracle.address, specifier, dotsForEscrow);

    const subscriberDots = await bondage.getBoundDots(
      subscriber.address,
      oracle.address,
      specifier
    );
    expect(subscriberDots).to.equal(
      ethers.BigNumber.from(dots - dotsForEscrow)
    );

    const escrowDots = await bondage.getNumEscrow(
      subscriber.address,
      oracle.address,
      specifier
    );
    expect(escrowDots).to.equal(ethers.BigNumber.from(dotsForEscrow));
  });
  it("BONDAGE_13 - escrowDots() - Check that not operator can't escrow dots", async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(broker);

    // we will get 3 dots with current curve
    await bondage.connect(subscriber).bond(oracle.address, specifier, 3);

    const dots = 3;
    const dotsForEscrow = 2;

    await expect(
      bondage.escrowDots(
        subscriber.address,
        oracle.address,
        specifier,
        dotsForEscrow
      )
    ).to.reverted;
  });

  it("BONDAGE_14 - escrowDots() - Check that operator can't escrow dots from oracle that haven't got enough dots", async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(broker);

    /// we will get 0 dots with current curve
    await bondage.connect(subscriber).bond(oracle.address, specifier, 0);

    const dots = 0;
    const dotsForEscrow = 2;

    await expect(
      bondage.escrowDots(
        subscriber.address,
        oracle.address,
        specifier,
        dotsForEscrow
      )
    ).to.reverted;
  });

  it('BONDAGE_15 - releaseDots() - Check that operator can release dots', async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(broker);

    // we will get 3 dots with current curve
    await bondage.connect(subscriber).bond(oracle.address, specifier, 3);

    const dots = 3;
    const dotsForEscrow = 2;

    await bondage
      .connect(arbiter)
      .escrowDots(subscriber.address, oracle.address, specifier, dotsForEscrow);
    await bondage
      .connect(arbiter)
      .releaseDots(
        subscriber.address,
        oracle.address,
        specifier,
        dotsForEscrow
      );

    const subscriberDots = await bondage.getBoundDots(
      subscriber.address,
      oracle.address,
      specifier
    );

    expect(subscriberDots).to.equal(
      ethers.BigNumber.from(dots - dotsForEscrow)
    );
    const pendingDots = await bondage.getNumEscrow(
      subscriber.address,
      oracle.address,
      specifier
    );

    expect(pendingDots).to.equal(ethers.BigNumber.from(0));
    const releaseDots = await bondage.getBoundDots(
      oracle.address,
      oracle.address,
      specifier
    );

    expect(releaseDots).to.equal(ethers.BigNumber.from(dotsForEscrow));
  });
  it("BONDAGE_16 - releaseDots() - Check that operator can't release dots if trying to release more dots than escrowed", async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(broker);

    // we will get 3 dots with current curve
    await bondage.connect(subscriber).bond(oracle.address, specifier, 3);

    const dots = 3;
    const dotsForEscrow = 2;

    await bondage
      .connect(arbiter)
      .escrowDots(subscriber.address, oracle.address, specifier, dotsForEscrow);
    await expect(
      bondage
        .connect(arbiter)
        .releaseDots(
          subscriber.address,
          oracle.address,
          specifier,
          dotsForEscrow + 2
        )
    ).to.reverted;
  });

  it('BONDAGE_17 - getDotsIssued() - Check that issued dots will increase with every bond', async function () {
    await prepareProvider();
    await prepareTokens();

    // we will get 3 dots with current curve
    await bondage.connect(subscriber).bond(oracle.address, specifier, 3);
    // get another dot
    await bondage.connect(subscriber).bond(oracle.address, specifier, 1);

    const issuedDots = await bondage.getDotsIssued(oracle.address, specifier);
    expect(issuedDots).to.equal(ethers.BigNumber.from(4));
  });
  it('BONDAGE_18 - getDotsIssued() - Check that issued dots will decrease with every unbond', async function () {
    await prepareProvider();
    await prepareTokens();

    // we will get 3 dots with current curve
    await bondage.connect(subscriber).bond(oracle.address, specifier, 3);
    // and another to get 4 dots total
    await bondage.connect(subscriber).bond(oracle.address, specifier, 1);

    await bondage.connect(subscriber).unbond(oracle.address, specifier, 1);

    const issuedDots = await bondage.getDotsIssued(oracle.address, specifier);
    expect(issuedDots).to.equal(ethers.BigNumber.from(3));
  });

  it('BONDAGE_19 - bond() - Check bond function', async function () {
    await prepareProvider();
    await prepareTokens();
    expect(
      bondage.connect(subscriber).bond(oracle.address, specifier, approveTokens)
    ).to.reverted;
    //await expect(this.test.bondage.bond(oracle, specifier, approveTokens, {from: subscriber})).to.be.eventually.be.rejectedWith(EVMRevert);
  });

  it('BONDAGE_20 - delegateBond() - Check that delegate bond can be executed', async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(escrower);
    await zapToken.connect(escrower).approve(bondage.address, approveTokens);
    await bondage
      .connect(escrower)
      .delegateBond(subscriber.address, oracle.address, specifier, dotBound);
  });

  it('BONDAGE_21 - returnDots() - Check that dots can be returned', async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(subscriber);
    // we will get 3 dots with current curve
    await bondage.connect(subscriber).bond(oracle.address, specifier, 3);
    const dots = 3;
    const dotsForEscrow = 2;
    const dotsForReturn = 1;

    await bondage
      .connect(arbiter)
      .escrowDots(subscriber.address, oracle.address, specifier, dotsForEscrow);
    let subscriberDots = await bondage.getBoundDots(
      subscriber.address,
      oracle.address,
      specifier
    );
    console.log('SubScriber Dots', subscriberDots.toString());
    await bondage
      .connect(arbiter)
      .returnDots(subscriber.address, oracle.address, specifier, 1);

    subscriberDots = await bondage.getBoundDots(
      subscriber.address,
      oracle.address,
      specifier
    );
    console.log('SubScriber Dots', subscriberDots.toString());
    expect(subscriberDots).to.equal(
      ethers.BigNumber.from(dots - dotsForEscrow + dotsForReturn)
    );

    const escrowDots = await bondage.getNumEscrow(
      subscriber.address,
      oracle.address,
      specifier
    );
    console.log('Escrow Dots', subscriberDots.toString());
    expect(escrowDots).to.equal(
      ethers.BigNumber.from(dotsForEscrow - dotsForReturn)
    );
  });

  it("BONDAGE_22 - returnDots() - Check that more dots can't be returned than already escrowed", async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(subscriber);
    // we will get 3 dots with current curve
    await bondage.connect(subscriber).bond(oracle.address, specifier, 3);

    const dots = 3;
    const dotsForEscrow = 2;
    const dotsForReturn = 1;

    await bondage
      .connect(arbiter)
      .escrowDots(subscriber.address, oracle.address, specifier, dotsForEscrow);
    await expect(
      bondage.returnDots(
        subscriber.address,
        oracle.address,
        specifier,
        dotsForEscrow + 1
      )
    ).to.reverted;
  });

  it("BONDAGE_23 - returnDots() - Check that more dots can't be called by someone who isn't the owner", async function () {
    await prepareProvider();
    await prepareTokens();

    // we will get 3 dots with current curve
    await bondage.connect(subscriber).bond(oracle.address, specifier, 3);

    const dots = 3;
    const dotsForEscrow = 2;
    const dotsForReturn = 1;

    await bondage
      .connect(arbiter)
      .escrowDots(subscriber.address, oracle.address, specifier, dotsForEscrow);
    await expect(
      bondage
        .connect(arbiter)
        .returnDots(
          subscriber.address,
          oracle.address,
          specifier,
          dotsForEscrow + 1
        )
    ).to.reverted;
  });

  it('BONDAGE_24 - bond() - Check that broker can bond to its endpoint', async function () {
    await zapToken.connect(owner).allocate(oracle.address, tokensForOwner);
    await zapToken.connect(oracle).approve(bondage.address, approveTokens);

    let testBroker = oracle;
    await registry.connect(oracle).initiateProvider(publicKey, title);
    await registry
      .connect(oracle)
      .initiateProviderCurve(specifier, piecewiseFunction, testBroker.address);

    let savedBroker = await registry.getEndpointBroker(
      oracle.address,
      specifier
    );

    // with current linear curve (startValue = 1, multiplier = 2) number of dots received should be equal to 5
    await bondage.connect(oracle).bond(oracle.address, specifier, 3);

    const res = await bondage.getZapBound(oracle.address, specifier);
    expect(res).to.equal(ethers.BigNumber.from(28));
  });

  it('BONDAGE_25 - bond() - Check that nonbroker cannot bond to broker endpoint', async function () {
    await zapToken.connect(owner).allocate(subscriber.address, tokensForOwner);

    await registry.connect(oracle).initiateProvider(publicKey, title);
    await registry
      .connect(oracle)
      .initiateProviderCurve(specifier, piecewiseFunction, oracle.address);

    let savedBroker = await registry.getEndpointBroker(
      oracle.address,
      specifier
    );

    await expect(bondage.connect(subscriber).bond(oracle.address, specifier, 3))
      .to.reverted;
  });

  it('BONDAGE_26 - bond() - Check registry.clearEndpoint cannot be applied to a bonded curve', async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(subscriber);
    // we will get 3 dots with current curve
    await bondage.connect(subscriber).bond(oracle.address, specifier, 3);

    await expect(registry.connect(oracle).clearEndpoint(specifier)).to.reverted;
  });
});

describe('CurrentCost Test', () => {
  let zapToken: ZapToken;
  let dataBase: Database;
  let bondage: Bondage;
  let cost: CurrentCost;
  let registry: Registry;
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
  const curveParams1 = [3, 0, 0, 2, 1000];

  // 1 + 2 x + 3 x ^ 2 on [1, 1000]
  const curveParams2 = [3, 1, 2, 3, 1000];

  // 10 on [1, 1000]
  const curveParams3 = [1, 10, 1000];

  // 1 + 2 x + 3 x ^ 2 on [1, 10]
  // 2 on [10, 20]
  const curveParams4 = [3, 1, 2, 3, 10, 1, 2, 20];
  beforeEach(async () => {
    signers = await ethers.getSigners();
    owner = signers[0];
    subscriber = signers[1];
    oracle = signers[2];
    broker = signers[3];
    escrower = signers[4];
    escrower2 = signers[5];
    arbiter = signers[6];
    const zapTokenFactory = await ethers.getContractFactory(
      'ZapToken',
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
    const bondFactory = await ethers.getContractFactory('Bondage', signers[0]);

    zapToken = (await zapTokenFactory.deploy()) as ZapToken;

    await zapToken.deployed();

    coordinator = (await coordinatorFactory.deploy()) as ZapCoordinator;
    await coordinator.deployed();

    dataBase = (await dbFactory.deploy()) as Database;

    cost = (await costFactory.deploy(coordinator.address)) as CurrentCost;
    await cost.deployed();
    registry = (await registryFactory.deploy(coordinator.address)) as Registry;

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
    account = oracle,
    curveParams = piecewiseFunction
  ) {
    //   console.log("init provider")

    await registry.connect(account).initiateProvider(publicKey, title);
    //console.log("init curve")

    await registry
      .connect(account)
      .initiateProviderCurve(specifier, curveParams, zeroAddress);
  }

  async function prepareTokens(allocAddress = subscriber) {
    // console.log("allocate")
    await zapToken.allocate(owner.address, tokensForOwner);
    // console.log("allocate")
    await zapToken.allocate(allocAddress.address, tokensForSubscriber);
    // console.log("approve")
    await zapToken
      .connect(allocAddress)
      .approve(bondage.address, approveTokens);
  }

  it('CURRENT_COST_1 - _currentCostOfDot() - Check current cost for function 1', async function () {
    await prepareProvider(oracle, curveParams1);

    const dotNumber = 3;
    const structure = structurizeCurve(curveParams1);
    const dotcost = calcNextDotCost(structure, dotNumber);

    const res = await cost._currentCostOfDot(
      oracle.address,
      specifier,
      dotNumber
    );
    expect(res).to.equal(ethers.BigNumber.from(dotcost));
  });

  it('CURRENT_COST_2 - _currentCostOfDot() - Check current cost for function 2', async function () {
    await prepareProvider(oracle, curveParams2);

    const dotNumber = 3;
    const structure = structurizeCurve(curveParams2);
    const dotcost = calcNextDotCost(structure, dotNumber);

    const res = await cost._currentCostOfDot(
      oracle.address,
      specifier,
      dotNumber
    );
    expect(res).to.equal(ethers.BigNumber.from(dotcost));
  });

  it('CURRENT_COST_3 - _currentCostOfDot() - Check current cost for function 3', async function () {
    await prepareProvider(oracle, curveParams3);

    const dotNumber = 3;
    const structure = structurizeCurve(curveParams3);
    const dotcost = calcNextDotCost(structure, dotNumber);

    const res = await cost._currentCostOfDot(
      oracle.address,
      specifier,
      dotNumber
    );
    expect(res).to.equal(ethers.BigNumber.from(dotcost));
  });

  it('CURRENT_COST_4 - _currentCostOfDot() - Check current cost for function 4', async function () {
    await prepareProvider(oracle, curveParams4);

    const dotNumber = 3;
    const structure = structurizeCurve(curveParams4);
    const dotcost = calcNextDotCost(structure, dotNumber);

    const res = await cost._currentCostOfDot(
      oracle.address,
      specifier,
      dotNumber
    );
    expect(res).to.equal(ethers.BigNumber.from(dotcost));
  });

  it('CURRENT_COST_5 - _costOfNDots() - Check cost of n-dots for function 4', async function () {
    await prepareProvider(oracle, curveParams4);

    const dotNumber = 20;
    const structure = structurizeCurve(curveParams4);
    const dotcost = calcDotsCost(structure, dotNumber);

    const res = await cost._costOfNDots(
      oracle.address,
      specifier,
      1,
      dotNumber - 1
    );
    expect(res).to.equal(ethers.BigNumber.from(dotcost));
    // checking that Utils.calcDotsCost is working properly
    // ghci> let f x = 1 + 2 * x + 3 * x^2
    // ghci> sum (f <$> [1..10]) + 2 * 10
    // >>> 1295
    //res.should.be.bignumber.equal(web3.toBigNumber(1295));
  });
});
