
const { task } = require("hardhat/config");
require("hardhat-deploy-ethers");
require('hardhat-deploy');

task("checkBalance", "Checks the ZAP balance of a given signer address")

    .addParam("account", "The account's address")
/*
Balanced
.setAction(async taskArgs => {

        // Connection to ZapToken.sol
        const Token = await ethers.getContractFactory('ZapToken');
        const token = await Token.attach('0x5FbDB2315678afecb367f032d93F642f64180aa3');
**/
    .setAction(async taskArgs => {

        // Connection to ZapToken.sol
        const Token = await ethers.getContractFactory('ZapToken');
        const token = await Token.attach('0x5FbDB2315678afecb367f032d93F642f64180aa3');

        // Stores the ZAP balance
        const signerBalance = await token.balanceOf(taskArgs.account);

        // Log account details
        console.log({
            address: taskArgs.account,
            balance: parseInt(signerBalance._hex) + ' ZAP'
        });

    })



