import { ethers } from "hardhat";
import { ContractFactory } from "ethers";
import { ZapToken } from "../typechain";

const hre = require("hardhat")

async function main() {

  let signers = await ethers.getSigners();
  let deployer = signers[0];

  let zapToken: ZapToken;
  let ZapTokenBSCFactory: ContractFactory;
  let withZapBSC = true;


    /**
     * MINERS
     */
  //Vault contract deploy

  // const zapToken = '0x09d8af358636d9bcc9a3e177b66eb30381a4b1a8';
  // const zapToken = (await hre.deployments.get('ZapTokenBSC')).address;
  ZapTokenBSCFactory = await ethers.getContractFactory("ZapTokenBSC", deployer);

  if (withZapBSC){
    zapToken = await ZapTokenBSCFactory.deploy() as ZapToken;
    await zapToken.deployed();
    console.log("ZapTokenBSC Address: ", zapToken.address)
    console.log("deployed ZapTokenBSC")
  } else {
    zapToken = ZapTokenBSCFactory.attach(process.env.ZT_BSC!) as ZapToken;
  }

  const zapGettersLibrary = await ethers.getContractFactory("ZapGettersLibrary", deployer);
  const ZapGettersLibrary = await zapGettersLibrary.deploy();
  await ZapGettersLibrary.deployed();
  console.log("ZapGettersLibary Address:", ZapGettersLibrary.address)
  console.log("deployed ZapGettersLibrary")

  const zapDispute = await ethers.getContractFactory("ZapDispute", {
    signer: deployer
  });
  const ZapDispute = await zapDispute.deploy();
  await ZapDispute.deployed();
  console.log("ZapDispute Address:", ZapDispute.address)
  console.log("Deployed ZapDispute");

  const zapStake = await ethers.getContractFactory("ZapStake", {
    libraries: {
      ZapDispute: ZapDispute.address
    },
    signer: deployer
  });
  const ZapStake = await zapStake.deploy();
  await ZapStake.deployed();
  console.log("ZapStake Address:", ZapStake.address);
  console.log("Deployed ZapStake");

  const zapLibrary = await ethers.getContractFactory("ZapLibrary",
    {
      signer: deployer
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
      signer: deployer
    });

  let Zap = await zap.deploy(zapToken.address);
  await Zap.deployed();
  console.log("Zap Address:", Zap.address);
  console.log("Deployed Zap")

  const zapMaster = await ethers.getContractFactory("ZapMaster", {
    libraries: {
      ZapStake: ZapStake.address
    },
    signer: deployer
  });

  const ZapMaster = await zapMaster.deploy(Zap.address, zapToken.address);
  await ZapMaster.deployed();
  console.log("ZapMaster Address: " + ZapMaster.address)
  console.log("Deployed ZapMaster")

  const vault = await ethers.getContractFactory("Vault", deployer);
  const Vault = await vault.deploy(zapToken.address, ZapMaster.address);
  await Vault.deployed();
  console.log("Vault Address:", Vault.address)
  console.log("deployed Vault")

  await ZapMaster.changeVaultContract(Vault.address)
  // await zapToken.allocate(deployer.address, "10000000000000000000000000");

  // for (let i = 0; i<signers.length; i++){
  //   await zapToken.allocate(signers[i].address, "1000000000000000000000000");
  // }
}


main()
  .then(() =>
    process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });