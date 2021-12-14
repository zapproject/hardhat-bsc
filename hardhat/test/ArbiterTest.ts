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
import { Arbiter } from '../typechain/Arbiter';
chai.use(solidity);
const { expect } = chai;

const publicKey = 77;
const title =
  '0x048a2991c2676296b330734992245f5ba6b98174d3f1907d795b7639e92ce532';
const routeKeys = [1];
const params = [
  ethers.utils.sha256(ethers.utils.toUtf8Bytes('param1')),
  ethers.utils.sha256(ethers.utils.toUtf8Bytes('param2'))
];

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
describe('ZapBondage', () => {
  let zapToken: ZapToken;
  let dataBase: Database;
  let bondage: Bondage;
  let cost: CurrentCost;
  let registry: Registry;
  let arbiter: Arbiter;
  let allocatedAmt: number;
  let signers: any;
  let coordinator: ZapCoordinator;
  let owner: any;
  let subscriber: any;
  let oracle: any;
  let broker: any;
  let escrower: any;
  let escrower2: any;
  let arbiterAccount: any;
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
    const arbiterFactory = await ethers.getContractFactory(
      'Arbiter',
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

    arbiter = (await arbiterFactory.deploy(coordinator.address)) as Arbiter;
    await arbiter.deployed();
    await coordinator.updateContract('ARBITER', arbiter.address);
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
  it('ARBITER_1 - initiateSubscription() - Check subscription', async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(broker);

    await bondage.connect(subscriber).bond(oracle.address, specifier, dotBound);
    console.log('initializing');
    await arbiter
      .connect(subscriber)
      .initiateSubscription(oracle.address, specifier, params, publicKey, 10);
    console.log('finished');
    const res = await arbiter.getSubscription(
      oracle.address,
      subscriber.address,
      specifier
    );
    expect(res[0]).to.equal(10);
  });
  it('ARBITER_2 - initiateSubscription() - Check subscription block must be more than 0', async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(broker);

    await bondage.connect(subscriber).bond(oracle.address, specifier, 1000);

    await expect(
      arbiter
        .connect(subscriber)
        .initiateSubscription(oracle, specifier, params, publicKey, 0)
    ).to.reverted;
  });
  it('ARBITER_3 - initiateSubscription() - Check user cannot inititate subscription for same subscriber once', async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(broker);

    await bondage.connect(subscriber).bond(oracle.address, specifier, 1000);

    await arbiter
      .connect(subscriber)
      .initiateSubscription(oracle.address, specifier, params, publicKey, 10);

    const res = await arbiter.getSubscription(
      oracle.address,
      subscriber.address,
      specifier
    );
    expect(res[0]).to.equal(10);

    await expect(
      arbiter
        .connect(subscriber)
        .initiateSubscription(oracle, specifier, params, publicKey, 10)
    ).to.reverted;
  });

  it('ARBITER_4 - endSubscriptionProvider() - Check ending subscription', async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(broker);

    await bondage.connect(subscriber).bond(oracle.address, specifier, 1000);

    await arbiter
      .connect(subscriber)
      .initiateSubscription(oracle.address, specifier, params, publicKey, 10);

    await arbiter
      .connect(oracle)
      .endSubscriptionProvider(subscriber.address, specifier);

    const res = await arbiter.getSubscription(
      oracle.address,
      subscriber.address,
      specifier
    );
    expect(res[0]).to.equal(0);
  });
  it("ARBITER_5 - endSubscriptionProvider() - Check that user can't end uninitialized subscription", async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(broker);

    await bondage.connect(subscriber).bond(oracle.address, specifier, 1000);

    await expect(
      arbiter
        .connect(oracle)
        .endSubscriptionProvider(subscriber.address, specifier)
    ).to.reverted;
  });

  it("ARBITER_6 - endSubscriptionSubscriber() - Check that user can't end uninitialized subscription", async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(broker);

    await bondage.connect(subscriber).bond(oracle.address, specifier, 1000);

    await expect(
      arbiter
        .connect(subscriber)
        .endSubscriptionProvider(subscriber.address, specifier)
    ).to.reverted;
  });

  it('ARBITER_7 - endSubscriptionSubscriber() - Check that only subscriber can end subscription by subscriber', async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(broker);

    await bondage.connect(subscriber).bond(oracle.address, specifier, 1000);

    await arbiter
      .connect(subscriber)
      .initiateSubscription(oracle.address, specifier, params, publicKey, 10);

    await expect(
      arbiter.connect(subscriber).endSubscriptionSubscriber(oracle, specifier)
    ).to.reverted;
  });

  it('ARBITER_10 - endSubscriptionProvider() - Check that subscriber receives any unused dots', async function () {
    await prepareProvider();
    await prepareTokens();
    await prepareTokens(broker);

    await bondage.connect(subscriber).bond(oracle.address, specifier, 100);

    await arbiter
      .connect(subscriber)
      .initiateSubscription(oracle.address, specifier, params, publicKey, 10);

    let postEscrowBal = await bondage.getBoundDots(
      subscriber.address,
      oracle.address,
      specifier
    );
    expect(postEscrowBal.toString()).to.equal('90');

    const res = await arbiter.getSubscription(
      oracle.address,
      subscriber.address,
      specifier
    );
    expect(res[0]).to.equal(10);
    ethers.provider.send('evm_mine', []);
    ethers.provider.send('evm_mine', []);
    ethers.provider.send('evm_mine', []);
    ethers.provider.send('evm_mine', []);
    ethers.provider.send('evm_mine', []);
    ethers.provider.send('evm_mine', []);

    // After blocks have been mined
    await arbiter
      .connect(subscriber)
      .endSubscriptionSubscriber(oracle.address, specifier);

    // 6 blocks have passed, and we include the first block in our calcuation, so we should receive 10-7=(3) dots back
    let postCancelBal = await bondage.getBoundDots(
      subscriber.address,
      oracle.address,
      specifier
    );
    expect(postCancelBal.toString()).to.be.equal('93');

    // check that the provider received their 7 dots
    let postCancelProviderBal = await bondage.getBoundDots(
      oracle.address,
      oracle.address,
      specifier
    );
    expect(postCancelProviderBal.toString()).to.be.equal('7');
  });
});
