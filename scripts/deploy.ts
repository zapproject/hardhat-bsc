import { ethers } from "hardhat";

async function main() {
  const signers = await ethers.getSigners();

  console.log("Deploying contracts with the account:", signers[0].address);

  console.log("Account balance:", (await signers[0].getBalance()).toString());

  const tokenFactory = await ethers.getContractFactory('ZapToken')
  const zapToken = await tokenFactory.deploy();

  const faucetContract = await ethers.getContractFactory('Faucet');
  const faucet = await faucetContract.deploy(zapToken.address);

  console.log("zapToken address:", zapToken.address);
  console.log("Faucet address:", faucet.address);




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
