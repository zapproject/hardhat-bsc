const { task } = require("hardhat/config");
require("hardhat-deploy-ethers");
require('hardhat-deploy');

task("verifyMiner", "Verifies miner contracts")
    .addParam("dir")
    .addParam("contract")
    .setAction(async (taskArgs, hre) => {
        const fs = require("fs");
        var addresses = fs.readFileSync(taskArgs.dir, 'utf8');
        addresses = JSON.parse(addresses);
        const contract = taskArgs.contract;
        console.log("Verifying ", contract, " on network...");
        for (let i = 4; i < addresses.length; i++) {
            if (addresses[i].name == contract) {
                await hre.run("verify:verify", {
                    address: addresses[i].address,
                    constructorArguments: [...addresses[i].arguments],
                    libraries: { ...addresses[i].libraries }
                })
            }
        }
    });