import { ethers } from "hardhat";

const hre = require("hardhat")

const tokensForOwner = ethers.BigNumber.from("1500000000000000000000000000000");
const tokensForSubscriber = ethers.BigNumber.from("50000000000000000000000000000");
const approveTokens = ethers.BigNumber.from("1000000000000000000000000000000");


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
  const endpoint = ["Zap Price"]
  
  let broker = signers[3];

  const tokenFactory = await ethers.getContractFactory('ZapToken', signers[0]);
  const zapToken = await tokenFactory.deploy();
  await zapToken.deployed();
  console.log(`TOKEN address is ${zapToken.address}`)
  const coordinator = await ethers.getContractFactory('ZapCoordinator', signers[0]);
  const Coordinator = await coordinator.deploy();
  console.log(`Coordinator address is ${Coordinator.address}`)
  const arbiter = await ethers.getContractFactory('Arbiter', signers[0]);
  const Arbiter = await arbiter.deploy(Coordinator.address);
  console.log(`Arbiter address is ${Arbiter.address}`)
  const currentcost = await ethers.getContractFactory('CurrentCost', signers[0])
  const CurrentCost = await currentcost.deploy(Coordinator.address);
  console.log(`CurrentCost address is ${CurrentCost.address}`)
  const database = await ethers.getContractFactory('Database', signers[0])
  const Database = await database.deploy();
  console.log(`Database address is ${Database.address}`)
  const dispatch = await ethers.getContractFactory('Dispatch', signers[0])
  const Dispatch = await dispatch.deploy(Coordinator.address);
  console.log(`Dispatch address is ${Dispatch.address}`)
  const faucetContract = await ethers.getContractFactory('Faucet', signers[0]);
  const faucet = await faucetContract.deploy(zapToken.address);
  await faucet.deployed();
  console.log(`FAUCET address is ${faucet.address}`)
  const registry = await ethers.getContractFactory('Registry', signers[0])
  const Registry = await registry.deploy(Coordinator.address);
  // Transfer ownership before creating bondage contract
  console.log(`REGISTRY address is ${Registry.address}`)
  await Database.transferOwnership(Coordinator.address, { gasLimit: '50000', gasPrice: "20000000000" });
  console.log("transferring ownership")
  const bondage = await ethers.getContractFactory('Bondage', signers[0]);
  const Bondage = await bondage.deploy(Coordinator.address);
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


  // const zapToken = '0x09d8af358636d9bcc9a3e177b66eb30381a4b1a8';
  const zapToken = (await hre.deployments.get('ZapTokenBSC')).address;


  const zapGettersLibrary = await ethers.getContractFactory("ZapGettersLibrary", signers[0]);
  const ZapGettersLibrary = await zapGettersLibrary.deploy();
  await ZapGettersLibrary.deployed();
  console.log("ZapGettersLibary Address:", ZapGettersLibrary.address)
  console.log("deployed ZapGettersLibrary")

  const zapDispute = await ethers.getContractFactory("ZapDispute", {
    signer: signers[0]
  });
  const ZapDispute = await zapDispute.deploy();
  await ZapDispute.deployed();
  console.log("ZapDispute Address:", ZapDispute.address)
  console.log("Deployed ZapDispute");

  const zapStake = await ethers.getContractFactory("ZapStake", {
    libraries: {
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

  let Zap = await zap.deploy(zapToken);
  await Zap.deployed();
  console.log("Zap Address:", Zap.address);
  console.log("Deployed Zap")

  const zapMaster = await ethers.getContractFactory("ZapMaster", {
    libraries: {
      ZapStake: ZapStake.address
    },
    signer: signers[0]
  });

  const ZapMaster = await zapMaster.deploy(Zap.address, zapToken);
  await ZapMaster.deployed();
  console.log("ZapMaster Address: " + ZapMaster.address)
  console.log("Deployed ZapMaster")

  const vault = await ethers.getContractFactory("Vault", signers[0]);
  const Vault = await vault.deploy(zapToken, ZapMaster.address);
  await Vault.deployed();
  console.log("Vault Address:", Vault.address)
  console.log("deployed Vault")

  await ZapMaster.changeVaultContract(Vault.address)

  // for (let i = 0; i<signers.length; i++){
  //   await Vault.connect(signers[i]).lockSmith(signers[i].address, ZapMaster.address);
  // }


  
  // await zapToken.approve(
  //   ZapMaster.address,
  //   BigNumber.from("10000000000000000000000000")
  // );
  // await zapToken.transfer(
  //   ZapMaster.address,
  //   BigNumber.from("10000000000000000000000000")
  // );


}


main()
  .then(() =>
    process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });