const { task } = require("hardhat/config");
require("hardhat-deploy-ethers");
require('hardhat-deploy');

task("checkPriceClient", "Prints the test account balances")

    .setAction(async () => {

        // Stores the ZAP balance of each test account
        const balances = [];

        // Test accounts
        const signers = await ethers.getSigners();

        // Connection to ZapToken.sol
        const Client = await ethers.getContractFactory('priceClient')
        const client = await Client.attach('0x0E801D84Fa97b50751Dbf25036d067dCf18858bF');
       
        let queries=await client.returnPriceQueries()
        console.log(queries)
      
       
       
     

    });


