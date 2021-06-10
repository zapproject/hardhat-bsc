const { task, taskArgs } = require("hardhat/config");


require("hardhat-deploy-ethers");
require("hardhat-deploy");

task("dispatchCoinGecko", "creates an offchain Incoming event")

    .setAction(async () => {
        
        const approveTokens = ethers.BigNumber.from('1000000000000000000000000000000');
        // Stores the titles of all 20 providers
        const title = ["Coingecko Oracle"]
        const endpoint = ["Zap Price"]
        const specifier = ethers.utils.formatBytes32String(endpoint[0])
        let query='zap';
        const params = [
            ethers.utils.formatBytes32String("int")
           
        ];
        // Test accounts
        const signers = await ethers.getSigners();
        const owner=signers[0];
       
    
        const subscriberAccount=signers[2];

        // Connection to Registry.sol
        const Coordinator = await ethers.getContractFactory('ZapCoordinator')
        const coordinator = await Coordinator.attach('0xe7f1725e7734ce288f8367e1bb143e90bb3f0512')
        const ZAPTOKEN = await ethers.getContractFactory('ZapToken');
        const zapToken= await ZAPTOKEN.attach(await coordinator.getContract('ZAP_TOKEN'));
        const BONDAGE = await ethers.getContractFactory('Bondage');
        const bondage= await BONDAGE.attach(await coordinator.getContract('BONDAGE'));
        
        const SUBSCRIBER= await ethers.getContractFactory('OffChainClient');
        const subscriber= await SUBSCRIBER.attach('0x0e801d84fa97b50751dbf25036d067dcf18858bf');
        const DISPATCH = await ethers.getContractFactory('Dispatch');
        const dispatch= await DISPATCH.attach(await coordinator.getContract('DISPATCH'));
        console.log(dispatch.address)
        let b=await dispatch.bondage()
        let d=await bondage.dispatchAddress()
        console.log(b)
        console.log(d)
        await zapToken
            .connect(subscriberAccount)
            .approve(bondage.address, approveTokens);
       
        await bondage
            .connect(subscriberAccount)
            .delegateBond(subscriber.address, owner.address, specifier, 100);
  
        let res=await subscriber
            .connect(subscriberAccount)
            .testQuery(owner.address, query, specifier, params);
        console.log(await res.wait())
        
    })
