import { ethers } from "hardhat";
import { ZapToken } from "../typechain/ZapToken";

async function main() {

  const tokenFactory = await ethers.getContractFactory('ZapToken');
  const zapToken = await tokenFactory.deploy();
  await zapToken.deployed();

  const faucetContract = await ethers.getContractFactory('Faucet');
  const faucet = await faucetContract.deploy(zapToken.address);
  await faucet.deployed();

  // Core Contracts 

  const coordinator = await ethers.getContractFactory('ZapCoordinator');
  const Coordinator = await coordinator.deploy();

  const database = await ethers.getContractFactory('Database')
  const Database = await database.deploy();

  //const publicKey = await ethers.BigNumber.isBigNumber(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);

  const onchainOracle = await ethers.getContractFactory('SampleOnChainOracle');
  const OnchainOracle = await onchainOracle.deploy(Coordinator.address, 1, "Slothrop");


  // The majority of the core contracts take the Coordinator as params
  const arbiter = await ethers.getContractFactory('Arbiter');
  const Arbiter = await arbiter.deploy(Coordinator.address);

  const bondage = await ethers.getContractFactory('Bondage');
  const Bondage = await bondage.deploy(Coordinator.address);

  const dispatch = await ethers.getContractFactory('Dispatch')
  const Dispatch = await dispatch.deploy(Coordinator.address);

  const registry = await ethers.getContractFactory('Registry')
  const Registry = await registry.deploy(Coordinator.address);


  console.log("zapToken address:", zapToken.address);
  console.log("Faucet address:", faucet.address);
  console.log("Onchain Oracle address:", OnchainOracle.address);
  console.log("ZapCoordinator address:", Coordinator.address);
  console.log("Database address:", Database.address);
  console.log("Arbiter address:", Arbiter.address);
  console.log("Bondage address:", Bondage.address);
  console.log("Registry address:", Registry.address);

  // const factory = await ethers.getContractFactory("Counter");

  // // If we had constructor arguments, they would be passed into deploy()
  // let contract = await factory.deploy();

  // // The address the Contract WILL have once mined
  // console.log(contract.address);

  // // The transaction that was sent to the network to deploy the Contract
  // console.log(contract.deployTransaction.hash);

  // // The contract is NOT deployed yet; we must wait until it is mined
  // await contract.deployed();

}



main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
