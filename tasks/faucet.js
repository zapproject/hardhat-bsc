
const { task, taskArgs } = require("hardhat/config");
require("hardhat-deploy-ethers");
require('hardhat-deploy')


task("faucet", "Sends 100K ZAP to the first 20 accounts")
    .setAction(async () => {

        const signers = await ethers.getSigners();

        const Token = await ethers.getContractFactory('ZapToken')
        const token = await Token.attach('0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6');

        const Faucet = await ethers.getContractFactory('Faucet');
        const faucet = await Faucet.attach('0x8A791620dd6260079BF849Dc5567aDC3F2FdC318')

        console.log(faucet)

    });



