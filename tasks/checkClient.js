const { task } = require("hardhat/config");
require("hardhat-deploy-ethers");
require('hardhat-deploy');

task("checkClient", "Prints the test account balances")

    .setAction(async () => {

        // Stores the ZAP balance of each test account
        const balances = [];

        // Test accounts
        const signers = await ethers.getSigners();

        // Connection to ZapToken.sol
        const Client = await ethers.getContractFactory('OffChainClient')
        const client = await Client.attach('0x0E801D84Fa97b50751Dbf25036d067dCf18858bF');
       
        let tq= await client.totalQueries();
        let tiq=await client.totalIntQueries();
        let tbq=await client.totalBytes32Queries();

        let result=await client.getQueryIntResultByOrder(0)
        let result1=await client.getQueryResultByOrder(tq-1)
        console.log(tq)
        console.log(tiq)
        console.log(tbq)
        console.log(result)
        console.log(result1)

    });



