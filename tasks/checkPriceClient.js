const { task,taskArgs} = require("hardhat/config");
require("hardhat-deploy-ethers");
require('hardhat-deploy');

task("checkPriceClient", "Prints the test account balances")
    .addParam("clientAddress", "The account's address")
    .setAction(async taskArgs =>  {

        // Stores the ZAP balance of each test account
        const balances = [];

        // Test accounts
        const signers = await ethers.getSigners();

        // Connection to ZapToken.sol
        const Client = await ethers.getContractFactory('priceClient')
        const client = await Client.attach(taskArgs.clientAddress);
       
        let queries=await client.returnPriceQueries()
        console.log(queries)
      
       
       
     

    });


