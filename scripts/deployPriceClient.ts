import { ethers } from "hardhat";

const hre = require("hardhat")
const fs = require('fs')





async function main() {

  let signers = await ethers.getSigners();
  // console.log(process.argv)
  
  let owner = signers[0]
  const endpoint = ["Zap Price"]
  const specifier = ethers.utils.formatBytes32String(endpoint[0])

  let query='zap';
  const params = [
      ethers.utils.formatBytes32String("int")     
  ];
  //let oracle=process.arvs[4]

  let OracleSigner = signers[2];
  let broker = signers[3];

  let escrower = signers[4];
  let escrower2 = signers[5];
  let arbiter_ = signers[6];
  const Coordinator = await ethers.getContractFactory('ZapCoordinator')
  const coordinator = await Coordinator.attach('0xe7f1725e7734ce288f8367e1bb143e90bb3f0512')
  const ZAPTOKEN = await ethers.getContractFactory('ZapToken');
  const zapToken= await ZAPTOKEN.attach(await coordinator.getContract('ZAP_TOKEN'));
  const BONDAGE = await ethers.getContractFactory('Bondage');
  const Bondage= await BONDAGE.attach(await coordinator.getContract('BONDAGE'));
  const DISPATCH = await ethers.getContractFactory('Dispatch');
  const Dispatch= await DISPATCH.attach(await coordinator.getContract('DISPATCH'));
  const Registry=await coordinator.getContract('REGISTRY')
  const priceClientFactory = await ethers.getContractFactory(
    'priceClient'
  );

  //0xb7278a61aa25c888815afc32ad3cc52ff24fe575
  const priceClient = (await priceClientFactory.deploy(
    zapToken.address,
    Dispatch.address,
    Bondage.address,
    Registry,
    owner.address, 
    query, 
    specifier, 
    params 
  ))
  // console.log(priceClient)
}

main()
  .then(() =>
    process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });