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
import { Dispatch } from '../typechain/Dispatch';
import { TestProvider } from '../typechain/TestProvider';
import { TestClient } from '../typechain/TestClient';
import { OffChainClient } from '../typechain/OffChainClient';
import OffChainClientAbi from '../artifacts/contracts/lib/platform/OffChainClient.sol/OffChainClient.json'
chai.use(solidity);
const { expect } = chai;

let eventSigs = [
  'RecievedQuery(string,bytes32,bytes32[])',
  'TEST(uint,bytes32,string)',
  'Incoming(uint256,address,address,string,bytes32,bytes32[],bool)',
  'FulfillQuery(address,address,bytes32)',
  'OffchainResponse(uint256,address,address,bytes32[])',
  'OffchainResponseInt(uint256,address,address,int[])',
  'OffchainResult1(uint256,address,address,string)',
  'OffchainResult2(uint256,address,address,string,string)',
  'OffchainResult3(uint256,address,address,string,string,string)',
  'OffchainResult4(uint256,address,address,string,string,string,string)',
  'CanceledRequest(uint256,address,address)',
  'RevertCancelation(uint256,address,address)',
  'MadeQuery(address,string,uint256)',
  'Result1(uint256,string)',
  'Result1(uint256,bytes32)',
  'Result2(uint256,string,string)',
  'Escrowed(address,address,bytes32,uint256)'
];

function getEventHashSigs() {
  let hashes = eventSigs.map((item) =>
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes(item))
  );
  // console.log(hashes)
  return hashes;
}

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

const piecewiseFunction = [3, 0, 0, 2, 1000000000];

const tokensForOwner = ethers.BigNumber.from('1500000000000000000000000000000');

const tokensForSubscriber = ethers.BigNumber.from(
  '50000000000000000000000000000'
);

const approveTokens = ethers.BigNumber.from('1000000000000000000000000000000');

const dotBound = ethers.BigNumber.from('999');
//const Oracle = artifacts.require("TestProvider");
//const Subscriber = artifacts.require("TestClient");

const spec1 = ethers.utils.sha256(ethers.utils.toUtf8Bytes('Hello?'));
const spec2 = ethers.utils.sha256(ethers.utils.toUtf8Bytes('Reverse'));
const spec3 = ethers.utils.sha256(ethers.utils.toUtf8Bytes('Add'));
const spec4 = ethers.utils.sha256(ethers.utils.toUtf8Bytes('Double'));
const badSpec = ethers.utils.sha256(ethers.utils.toUtf8Bytes('Bad Endpoint'));

const publicKey = 10001;

const extInfo = [111, 222, 333];

const query = 'query';
describe('ZapBondage', () => {
  let zapToken: ZapToken;
  let dataBase: Database;
  let bondage: Bondage;
  let cost: CurrentCost;
  let registry: Registry;
  let coordinator: ZapCoordinator;
  let oracle: TestProvider;
  let subscriber: TestClient;
  let dispatch: Dispatch;
  let offchainsubscriber: OffChainClient;
  let allocatedAmt: number;

  let signers: any;
  let subscriberAccount: any;
  let owner: any;

  let OracleSigner: any;
  let broker: any;
  let escrower: any;
  let escrower2: any;
  let arbiter: any;
  beforeEach(async () => {
    signers = await ethers.getSigners();
    owner = signers[0];
    subscriberAccount = signers[1];
    OracleSigner = signers[2];

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
    const offchainFactory = await ethers.getContractFactory(
      'OffChainClient',
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
    const dispatchFactory = await ethers.getContractFactory(
      'Dispatch',
      signers[0]
    );
    const subscriberFactory = await ethers.getContractFactory(
      'TestClient',
      signers[0]
    );
    const oracleFactory = await ethers.getContractFactory(
      'TestProvider',
      OracleSigner
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
    // console.log("adding ImmutableContracts")
    await coordinator.addImmutableContract('DATABASE', dataBase.address);
    dispatch = (await await dispatchFactory.deploy(
      coordinator.address
    )) as Dispatch;
    
    
    await coordinator.addImmutableContract('ARBITER', arbiter.address);
    await coordinator.addImmutableContract('ZAP_TOKEN', zapToken.address);
    // console.log("updating Contracts")
    await coordinator.updateContract('REGISTRY', registry.address);
    await coordinator.updateContract('CURRENT_COST', cost.address);
 

    bondage = (await bondFactory.deploy(coordinator.address)) as Bondage;
 
    await coordinator.updateContract('BONDAGE', bondage.address);
    
    
    await coordinator.updateContract('DISPATCH', dispatch.address);

    await coordinator.updateAllDependencies();

    subscriber = (await subscriberFactory.deploy(
      zapToken.address,
      dispatch.address,
      bondage.address,
      registry.address
    )) as TestClient;

    offchainsubscriber = (await offchainFactory.deploy(
      zapToken.address,
      dispatch.address,
      bondage.address,
      registry.address
      
    )) as OffChainClient;

    await subscriber.deployed();
    await offchainsubscriber.deployed();
    oracle = (await await oracleFactory.deploy(
      registry.address,
      false
    )) as TestProvider;

    oracle = await oracle.deployed();
  });

  async function prepareTokens(allocAddress = subscriberAccount) {
    // console.log("allocate")
    await zapToken.allocate(owner.address, tokensForOwner);
    // console.log("allocate")
    await zapToken.allocate(allocAddress.address, tokensForSubscriber);
    // console.log("approve")
    await zapToken
      .connect(allocAddress)
      .approve(bondage.address, approveTokens);
  }
  async function prepareProvider(
    account = owner,
    curveParams = piecewiseFunction
  ) {
    //   console.log("init provider")

    await registry.connect(account).initiateProvider(publicKey, title);
    //console.log("init curve")

    await registry
      .connect(account)
      .initiateProviderCurve(spec1, curveParams, zeroAddress);
    await registry
      .connect(account)
      .initiateProviderCurve(spec2, curveParams, zeroAddress);
    await registry
      .connect(account)
      .initiateProviderCurve(spec3, curveParams, zeroAddress);
    await registry
      .connect(account)
      .initiateProviderCurve(spec4, curveParams, zeroAddress);
  }

  function validateEvents(events: any, expected: string[]) {
    events.forEach((event: any, key: number) => {
      //console.log(event.topics[0])
      let hashes = getEventHashSigs();
      //console.log(key)
      let index = hashes.findIndex((hash) => hash === event.topics[0]);
      console.log(index);
      if (index >= 0) {
        expect(eventSigs[index]).to.equal(expected[key]);
      }
    });
  }
  let abi = [
    'event Incoming(uint256 indexed id,address indexed provider,address indexed subscriber,string query,bytes32 endpoint,bytes32[] endpointParams,bool onchainSubscriber)'
  ];

  let IncomingInterface = new ethers.utils.Interface(abi);
  it('DISPATCH_1 - offChainOracle - Check that we can make a simple offchain query and the correct events are emitted', async function () {
    await prepareProvider();
    await prepareTokens();

    await zapToken
      .connect(subscriberAccount)
      .approve(bondage.address, approveTokens);

    await bondage
      .connect(subscriberAccount)
      .delegateBond(subscriber.address, owner.address, spec1, 10);

    let result = await subscriber
      .connect(subscriberAccount)
      .testQuery(owner.address, query, spec1, params);
    let r = await result.wait();
    console.log(r.events);
    let expected = [
      'Escrowed(address,address,bytes32,uint256)',
      'Incoming(uint256,address,address,string,bytes32,bytes32[],bool)',

      'MadeQuery(address,string,uint256)',
      'FulfillQuery(address,address,bytes32)'
    ];
    validateEvents(r.events, expected);
  });
  it('DISPATCH_1.1 - onChainOracle - Check that we can make a simple offchain query and the correct events are emitted', async function () {
    await prepareProvider();
    await prepareTokens();

    await zapToken
      .connect(subscriberAccount)
      .approve(bondage.address, approveTokens);

    let spec = await oracle.spec1();

    console.log(`the oracle spec is ${spec}`);
    await bondage
      .connect(subscriberAccount)
      .delegateBond(subscriber.address, oracle.address, spec, 10);
   let d=await bondage.dispatchAddress()
   console.log(d)
   console.log("DISPATCH ADDRESSSSSSSSSSSSSSSSSSSSSSSSS!!!!")
    //  spec= spec.wait();
    let result = await subscriber
      .connect(subscriberAccount)
      .testQuery(oracle.address, query, spec, params);
    let r = await result.wait();
    //validateEvents(r.events, expected);

    let expected = [
      'Escrowed(address,address,bytes32,uint256)',
      'RecievedQuery(string,bytes32,bytes32[])',
      '',

      'FulfillQuery(address,address,bytes32)',
      'Result1(uint256,string)',
      'MadeQuery(address,string,uint256)'
    ];
    validateEvents(r.events, expected);
  });
  it('DISPATCH_2 - query() - Check query function will not be performed if subscriber will not have enough dots', async function () {
    await prepareProvider();
    await prepareTokens();

    await expect(
      subscriber
        .connect(subscriberAccount)
        .testQuery(owner.address, query, spec1, params)
    ).to.reverted;
  });

  /**  it("DISPATCH_3 - query() - Check query function will not be performed if msg.sender is not subscriber", async function () {
            await prepareProvider();
            await prepareTokens();
            await zapToken.connect(subscriberAccount).approve(bondage.address, approveTokens);
            
            await bondage.connect(subscriberAccount).delegateBond(subscriber.address, owner.address, spec1, 10);
            
            //await expect(subscriber.connect(escrower).testQuery(owner.address, query, spec1, params)).to.reverted;
            //await expect(this.test.dispatch.query(oracleAddr, query, spec1, params, {from: accounts[4]})).to.be.eventually.rejectedWith(EVMRevert);
        });
        **/

  it('DISPATCH_4 - query() - Check that our contract will revert with an invalid endpoint', async function () {
    await prepareProvider();
    await prepareTokens();

    await zapToken
      .connect(subscriberAccount)
      .approve(bondage.address, approveTokens);

    await bondage
      .connect(subscriberAccount)
      .delegateBond(subscriber.address, owner.address, spec1, 10);

    await expect(
      subscriber
        .connect(subscriberAccount)
        .testQuery(owner.address, query, badSpec, params)
    ).to.reverted;
  });
  it('DISPATCH_5 - query() - test a query to an offchain subscriber', async function () {
    await prepareProvider();
    await prepareTokens();

    await zapToken
      .connect(subscriberAccount)
      .approve(bondage.address, approveTokens);

    await bondage
      .connect(subscriberAccount)
      .delegateBond(offchainsubscriber.address, owner.address, spec2, 100);

    let result = await offchainsubscriber
      .connect(subscriberAccount)
      .testQuery(owner.address, query, spec2, params);

    let r = await result.wait();
    let incoming: any = r.events ?? ([] as Event[]);

    let decoded = IncomingInterface.parseLog(incoming[1]);
    console.log("DECODED")
    //console.log(decoded[0])
    let id:any=decoded.args[0]
    let res:any=await dispatch.connect(owner).respond1(id,"A TEST RESPONSE")
    let CallbackResp =await res.wait()
    let storedResponse=await  offchainsubscriber.getQueryResultById(id)
    let storedResponsebyOrder=await  offchainsubscriber.getQueryResultByOrder(0)
    
    expect(storedResponse).to.equal("A TEST RESPONSE");
    expect(storedResponsebyOrder).to.equal("A TEST RESPONSE");
    let logs: any = CallbackResp.events ?? ([] as Event[]);
    let offchainSubInterface=new ethers.utils.Interface(OffChainClientAbi.abi)
    
    let Result1:any=offchainSubInterface.parseLog(logs[2])
   
    expect(Result1.args["response1"]).to.equal("A TEST RESPONSE");
   
  });
  it('DISPATCH_6 - query() - test a query to an offchain subscriber through dispatch fails from unathorized ', async function () {
    await prepareProvider();
    await prepareTokens();

    await zapToken
      .connect(subscriberAccount)
      .approve(bondage.address, approveTokens);
    console.log('delegating');
    await bondage
      .connect(subscriberAccount)
      .delegateBond(offchainsubscriber.address, owner.address, spec2, 100);

    let result = await offchainsubscriber
      .connect(subscriberAccount)
      .testQuery(owner.address, query, spec2, params);
    let r = await result.wait();
    let incoming: any = r.events ?? ([] as Event[]);
    let decoded = IncomingInterface.parseLog(incoming[1]);
    
    //console.log(decoded[0])
    let id:any=decoded.args[0]
  
    await expect(
      dispatch.connect(subscriberAccount).respond1(2,"A TEST RESPONSE")
    ).to.reverted;
  });
});