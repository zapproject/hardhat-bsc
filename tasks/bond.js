const { ethers } = require("ethers");
const { task, taskArgs } = require("hardhat/config");
require("hardhat-deploy-ethers");
require("hardhat-deploy");

task("bond", "Bonds 100 Zap using the first 20 accounts to the first 20 oracle endpoints")

    .setAction(async () => {

        // Test accounts
        const signers = await ethers.getSigners();
        console.log(signers);

    })