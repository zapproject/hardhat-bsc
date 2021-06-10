const { task } = require("hardhat/config");
const assert = require('assert').strict;
require("hardhat-deploy-ethers");
require('hardhat-deploy');

task("checkBalances", "Prints the test account balances")

    .setAction(async () => {

        // Stores the ZAP balance of each test account
        const balances = [];

        // Test accounts
        const signers = await ethers.getSigners();

        // Connection to ZapToken.sol
        const Token = await ethers.getContractFactory('ZapToken')
        const token = await Token.attach('0x5FbDB2315678afecb367f032d93F642f64180aa3');

        for (var i = 0; i < signers.length; i++) {

            // Gets the balance of each test account
            let b=await token.balanceOf(signers[i].address)
                
            }

    }
