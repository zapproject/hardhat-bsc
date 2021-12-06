const { task, taskArgs } = require("hardhat/config");
const fs = require('fs');

task("verifyZap", "Verifies miner contracts")
    .addParam("dir", "relative/absolute path of the contract address json")
    .addParam("contract", "name of the contract e.g. contracts/token/ZapToken.sol:ZapToken")
    .setAction(async taskArgs => {
      var addresses = fs.readFileSync(taskArgs.dir, 'utf8');
      addresses = JSON.parse(addresses);
      const contractName = taskArgs.contract;

      for (let i = 0; i < addresses.length; i++) {
        if (addresses[i].name == contractName.split(":")[1]){
          await run("verify:verify", {
            contract: contractName,
            address: addresses[i].address,
            constructorArguments: [...addresses[i].arguments],
            libraries:{...addresses[i].libraries}
          })
        }
      }
    });