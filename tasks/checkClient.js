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
        let result;
        let result1;
        //console.log("SKFJDLKJFJL")
        console.log("the total string responses are "+tq.toString())
        console.log("the total int responses are "+tiq.toString())
        console.log("the total bytes responses are"+tbq.toString())
        if(tiq>0){
            result=await client.getQueryIntResultByOrder(tiq-1)
            console.log(result)
            console.log(await client.queryIntIDs(5))
            console.log("the latest int value is "+result)
        }
        if(tq>0){
            result1=await client.getQueryResultByOrder(tq-1)
            console.log("the latest string query is "+result1)
        }
      
       
       
     

    });



