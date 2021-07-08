import { ethers } from "hardhat";
import { Vault } from "../typechain/Vault";
import { ZapToken } from "../typechain/ZapToken";
import { ZapTokenBSC } from "../typechain/ZapTokenBSC";

const hre = require("hardhat")

const params = ["param1", "param2"];

const specifier = "0x048a2991c2676296b330734992245f5ba6b98174d3f1907d795b7639e92ce577";

// const tokensForOwner = ethers.BigNumber.from("1500000000000000000000000000000");
// const tokensForSubscriber = ethers.BigNumber.from("50000000000000000000000000000");
const approveTokens = ethers.BigNumber.from("1000000000000000000000000000000");

//TODO move these functions to another file


async function main() {

  let signers = await ethers.getSigners();

  const endpoint = ["Zap Price"]
  const specifier = ethers.utils.formatBytes32String(endpoint[0])
  let query = 'zap';
  const params = [
    ethers.utils.formatBytes32String("int")

  ];
  
 let broker = signers[3];

  const tokenFactory = await ethers.getContractFactory('ZapTokenBSC', signers[0]);
  const zapToken = await tokenFactory.deploy();
  await zapToken.deployed();
  console.log(`TOKEN address is ${zapToken.address}`)

  const coordinator = await ethers.getContractFactory('ZapCoordinator', signers[0]);
  const Coordinator = await coordinator.deploy();
  await Coordinator.deployed()
  console.log(`Coordinator address is ${Coordinator.address}`)

  const arbiter = await ethers.getContractFactory('Arbiter', signers[0]);
  const Arbiter = await arbiter.deploy(Coordinator.address);
  await Arbiter.deployed()
  console.log(`Arbiter address is ${Arbiter.address}`)

  const currentcost = await ethers.getContractFactory('CurrentCost', signers[0])
  const CurrentCost = await currentcost.deploy(Coordinator.address);
  await CurrentCost.deployed()
  console.log(`CurrentCost address is ${CurrentCost.address}`)

  const database = await ethers.getContractFactory('Database', signers[0])
  const Database = await database.deploy();
  await Database.deployed()
  console.log(`Database address is ${Database.address}`)

  const dispatch = await ethers.getContractFactory('Dispatch', signers[0])
  const Dispatch = await dispatch.deploy(Coordinator.address);
  await Dispatch.deployed()
  console.log(`Dispatch address is ${Dispatch.address}`)

  const faucetContract = await ethers.getContractFactory('Faucet', signers[0]);
  const faucet = await faucetContract.deploy(zapToken.address);
  await faucet.deployed();
  console.log(`FAUCET address is ${faucet.address}`)

  const registry = await ethers.getContractFactory('Registry', signers[0])
  const Registry = await registry.deploy(Coordinator.address);
  await Registry.deployed()
  console.log(`REGISTRY address is ${Registry.address}`)

  // Transfer ownership before creating bondage contract
  await Database.transferOwnership(Coordinator.address, { gasLimit: '50000', gasPrice: "20000000000" });
  console.log("transferring ownership")

  const bondage = await ethers.getContractFactory('Bondage', signers[0]);
  const Bondage = await bondage.deploy(Coordinator.address);
  await Bondage.deployed()
  console.log(`Bondage address is ${Bondage.address}`)

  await Coordinator.addImmutableContract('DATABASE', Database.address, { gasLimit: '75000', gasPrice: "20000000000" });
  console.log("adding DATABASE")
  await Coordinator.addImmutableContract('ARBITER', Arbiter.address, { gasLimit: '75000', gasPrice: "20000000000" });
  console.log("ADDING ARBITER")
  await Coordinator.addImmutableContract('FAUCET', faucet.address, { gasLimit: '75000', gasPrice: "20000000000" });
  console.log("FAUCET")
  await Coordinator.addImmutableContract('ZAP_TOKEN', zapToken.address, { gasLimit: '75000', gasPrice: "20000000000" });

  console.log("finished adding immuttable contracts")
  //await Coordinator.addImmutableContract('DISPATCH', Dispatch.address)
  //await Coordinator.addImmutableContract('BONDAGE', Bondage.address);
  await Coordinator.updateContract('REGISTRY', Registry.address, { gasLimit: '150000', gasPrice: "20000000000" });
  await Coordinator.updateContract('CURRENT_COST', CurrentCost.address, { gasLimit: '150000', gasPrice: "20000000000" });
  await Coordinator.updateContract('DISPATCH', Dispatch.address, { gasLimit: '150000', gasPrice: "20000000000" });

  await Coordinator.updateContract('BONDAGE', Bondage.address, { gasLimit: '150000', gasPrice: "20000000000" });
  console.log('finished updates')
  await Coordinator.updateAllDependencies({ gasLimit: '600000', gasPrice: "20000000000" });
  console.log("RUnning FAUCET")
  await hre.run('faucet')
  //await hre.run('initiateProvider')
  //await hre.run('initiateProviderCurve')

  // await Registry.connect(OracleSigner).initiateProvider(publicKey, title);
  // await Registry.connect(OracleSigner).initiateProviderCurve(specifier, piecewiseFunction, zeroAddress);

  // Approve the amount of Zap
  // await zapToken.allocate(owner.address, tokensForOwner)
  // await zapToken.allocate(broker.address, tokensForSubscriber)
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
  ))

  await subscriber.deployed();
  await offchainsubscriber.deployed();
  const oracle = (await oracleFactory.deploy(
    Registry.address,
    false
  ))
  await oracle.deployed()

  const dotFactoryFactory = await ethers.getContractFactory(
    'DotFactoryFactory',
    signers[0]
  );
  const genericTokenFactory = await ethers.getContractFactory(
    'TokenFactory',
    signers[0]
  );
  let generictoken = (await genericTokenFactory.deploy());
  await generictoken.deployed();
  await dotFactoryFactory.deploy(Coordinator.address, generictoken.address);

  await zapToken.allocate(faucet.address, 100);

  const tokenBal = await zapToken.totalSupply()

  console.log("TOTAL SUPPLY", parseInt(tokenBal._hex));

  const faucetBal = await zapToken.balanceOf(faucet.address)

  console.log("FAUCET BALANCE", parseInt(faucetBal._hex));


    /**
     * MINERS
     */
  //Vault contract deploy

  const zapGettersLibrary = await ethers.getContractFactory("ZapGettersLibrary", signers[0]);
  const ZapGettersLibrary = await zapGettersLibrary.deploy();
  await ZapGettersLibrary.deployed();
  console.log("ZapGettersLibary Address:", ZapGettersLibrary.address)
  console.log("deployed ZapGettersLibrary")

  const zapTransfer = await ethers.getContractFactory("ZapTransfer", signers[0]);
  const ZapTransfer = await zapTransfer.deploy();
  console.log('ZapTransfer Address:', ZapTransfer.address);
  console.log("deployed ZapTransfer")

  const zapDispute = await ethers.getContractFactory("ZapDispute", {
    libraries: {
      ZapTransfer: ZapTransfer.address,
    },
    signer: signers[0]
  });
  const ZapDispute = await zapDispute.deploy();
  await ZapDispute.deployed();
  console.log("ZapDispute Address:", ZapDispute.address)
  console.log("Deployed ZapDispute");

  const zapStake = await ethers.getContractFactory("ZapStake", {
    libraries: {
      ZapTransfer: ZapTransfer.address,
      ZapDispute: ZapDispute.address
    },
    signer: signers[0]
  });
  const ZapStake = await zapStake.deploy();
  await ZapStake.deployed();
  console.log("ZapStake Address:", ZapStake.address);
  console.log("Deployed ZapStake");

  const zapLibrary = await ethers.getContractFactory("ZapLibrary",
    {
      libraries: {
        ZapTransfer: ZapTransfer.address,
      },
      signer: signers[0]
    });
  const ZapLibrary = await zapLibrary.deploy();
  await ZapLibrary.deployed()
  console.log("ZapLibrary Address:", ZapLibrary.address);
  console.log("Deployed ZapLibrary");

  const zap = await ethers.getContractFactory("Zap",
    {
      libraries: {
        ZapStake: ZapStake.address,
        ZapDispute: ZapDispute.address,
        ZapLibrary: ZapLibrary.address,
      },
      signer: signers[0]
    });

  let Zap = await zap.deploy(zapToken.address);
  await Zap.deployed();
  console.log("Zap Address:", Zap.address);
  console.log("Deployed Zap")

  const zapMaster = await ethers.getContractFactory("ZapMaster", {
    libraries: {
      ZapTransfer: ZapTransfer.address,
      ZapStake: ZapStake.address
    },
    signer: signers[0]
  });

  const ZapMaster = await zapMaster.deploy(Zap.address, zapToken.address);
  await ZapMaster.deployed();
  console.log("ZapMaster Address: " + ZapMaster.address)
  console.log("Deployed ZapMaster")

  const vault = await ethers.getContractFactory("Vault", signers[0]);
  const Vault = await vault.deploy(zapToken.address, ZapMaster.address);
  await Vault.deployed();
  console.log("Vault Address:", Vault.address)
  console.log("deployed Vault")

  await ZapMaster.changeVaultContract(Vault.address)

  for (let i = 0; i<signers.length; i++){
    await Vault.connect(signers[i]).lockSmith(signers[i].address, ZapMaster.address);
  }


}


main()
  .then(() =>
    process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });