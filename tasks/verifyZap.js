const { task, taskArgs } = require("hardhat/config");
const fs = require('fs');

task("verifyZap", "Verifies miner contracts")
    .addParam("dir")
    .addParam("contract")
    .setAction(async taskArgs => {
      await run("compile");
      var addresses = fs.readFileSync(taskArgs.dir, 'utf8');
      addresses = JSON.parse(addresses);
      const contract = taskArgs.contract;

      for (let i = 4; i < addresses.length; i++) {
        if (addresses[i].name == contract){
          await run("verify:verify", {
            address: addresses[i].address,
            constructorArguments: [...addresses[i].arguments],
            libraries:{...addresses[i].libraries}
          })
        }
      }
    });