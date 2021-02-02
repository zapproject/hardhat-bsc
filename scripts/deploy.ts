import { ethers } from "hardhat";

const hre = require("hardhat")
const fs = require('fs')

const curveParams1 = [3, 0, 0, 2, 1000];
const curveParams2 = [3, 1, 2, 3, 1000];
const curveParams3 = [1, 10, 1000];
const curveParams4 = [3, 1, 2, 3, 10, 1, 2, 20];

const publicKey = 77
const title = '0x048a2991c2676296b330734992245f5ba6b98174d3f1907d795b7639e92ce532';
const routeKeys = [1];
const params = ["param1", "param2"];

const specifier = "0x048a2991c2676296b330734992245f5ba6b98174d3f1907d795b7639e92ce577";
const zeroAddress = '0x0000000000000000000000000000000000000000'

const piecewiseFunction = [3, 0, 0, 2, 10000];
const tokensForOwner = ethers.BigNumber.from("1500000000000000000000000000000");
const tokensForSubscriber = ethers.BigNumber.from("50000000000000000000000000000");
const approveTokens = ethers.BigNumber.from("1000000000000000000000000000000");

const dotBound = ethers.BigNumber.from("999");

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
    if (structurizedCurve[i].start <= total && total <= structurizedCurve[i].end) {
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

//TODO move these functions to another file

function _calculatePolynomial(terms: any, x: any) {
  let sum = 0;

  for (let i = 0; i < terms.length; i++) {
    sum += terms[i] * (x ** i);
  }

  return sum;
}

async function main() {

  let signers = await ethers.getSigners();

  let owner = signers[0]

  let subscriberAddress = signers[1];

  let OracleSigner = signers[2];
  let broker = signers[3];

  let escrower = signers[4];
  let escrower2 = signers[5];
  let arbiter_ = signers[6];

  const tokenFactory = await ethers.getContractFactory('ZapToken', signers[0]);
  const zapToken = await tokenFactory.deploy();
  await zapToken.deployed();

  const coordinator = await ethers.getContractFactory('ZapCoordinator', signers[0]);
  const Coordinator = await coordinator.deploy();

  const arbiter = await ethers.getContractFactory('Arbiter', signers[0]);
  const Arbiter = await arbiter.deploy(Coordinator.address);

  const currentcost = await ethers.getContractFactory('CurrentCost', signers[0])
  const CurrentCost = await currentcost.deploy(Coordinator.address);

  const database = await ethers.getContractFactory('Database', signers[0])
  const Database = await database.deploy();

  const dispatch = await ethers.getContractFactory('Dispatch', signers[0])
  const Dispatch = await dispatch.deploy(Coordinator.address);
  console.log(`Dispatch address is ${Dispatch.address}`)
  const faucetContract = await ethers.getContractFactory('Faucet', signers[0]);
  const faucet = await faucetContract.deploy(zapToken.address);
  await faucet.deployed();

  const registry = await ethers.getContractFactory('Registry', signers[0])
  const Registry = await registry.deploy(Coordinator.address);
  // Transfer ownership before creating bondage contract

  await Database.transferOwnership(Coordinator.address);

  const bondage = await ethers.getContractFactory('Bondage', signers[0]);
  const Bondage = await bondage.deploy(Coordinator.address);


  await Coordinator.addImmutableContract('DATABASE', Database.address);
  await Coordinator.addImmutableContract('ARBITER', Arbiter.address);
  await Coordinator.addImmutableContract('FAUCET', faucet.address);
  await Coordinator.addImmutableContract('ZAP_TOKEN', zapToken.address);
  //await Coordinator.addImmutableContract('BONDAGE', Bondage.address);
  await Coordinator.updateContract('REGISTRY', Registry.address);
  await Coordinator.updateContract('CURRENT_COST', CurrentCost.address);



  await Coordinator.updateContract('BONDAGE', Bondage.address);
  await Coordinator.updateAllDependencies();
  await hre.run('faucet')
  await hre.run('initiateProvider')
  await hre.run('initiateProviderCurve')

  // await Registry.connect(OracleSigner).initiateProvider(publicKey, title);
  // await Registry.connect(OracleSigner).initiateProviderCurve(specifier, piecewiseFunction, zeroAddress);

  // Approve the amount of Zap
  await zapToken.allocate(owner.address, tokensForOwner)
  await zapToken.allocate(broker.address, tokensForSubscriber)
  await zapToken.connect(broker).approve(Bondage.address, approveTokens)
  const subscriberFactory = await ethers.getContractFactory(
    'TestClient'
  );
  const offchainSubscriberFactory = await ethers.getContractFactory(
    'OffChainClient'
  );
  const oracleFactory = await ethers.getContractFactory(
    'TestProvider'
  );
  const subscriber = (await subscriberFactory.deploy(
    zapToken.address,
    Dispatch.address,
    Bondage.address,
    Registry.address
  ))

  const offchainsubscriber = (await offchainSubscriberFactory.deploy(
    zapToken.address,
    Dispatch.address,
    Bondage.address,
    Registry.address,
    OracleSigner.address
  ))

  await subscriber.deployed();
  await offchainsubscriber.deployed();
  const oracle = (await oracleFactory.deploy(
    Registry.address,
    false
  ))
  await oracle.deployed()

  console.log(Database.address);

}

main()
  .then(() =>
    process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });