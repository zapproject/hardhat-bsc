const { task, taskArgs } = require("hardhat/config");


require("hardhat-deploy-ethers");
require("hardhat-deploy");

task("dispatch", "creates an offchain Incoming event")

    .setAction(async () => {
        
        const approveTokens = ethers.BigNumber.from('1000000000000000000000000000000');
        // Stores the titles of all 20 providers
        const title = ["Slothrop", "Blicero", "Borgesius", "Enzian", "Pointsman", "Tchitcherine", "Achtfaden", "Andreas", "Bianca", "Bland", "Bloat", "Bodine", "Bounce", "Bummer", "Byron the Bulb", "Chiclitz", "Christian", "Darlene", "Dodson-Truck", "Erdmann"];
        const endpoint = ["Ramanujan", "Lagrange", "Wiles", "Jacobi", "Turing", "Riemann", "Poincare", "Hilbert", "Fibonacci", "Bernoulli", "Pythagoras", "Gauss", "Newton", "Euler", "Archimedes", "Euclid", "Merkle", "Shamir", "Buterin", "Nakamoto"];
        let query='https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=0x514910771af9ca656af840dff83e8264ecf986ca&vs_currencies=usd';
        const params = [
            ethers.utils.formatBytes32String("address"),
            ethers.utils.formatBytes32String('usd')
        ];
        // Test accounts
        const signers = await ethers.getSigners();
        const owner=signers[1];
        const specifier = ethers.utils.formatBytes32String(endpoint[1])
        console.log(specifier)
        const subscriberAccount=signers[2];
        const offchainSubscriberFactory = await ethers.getContractFactory(
            'OffChainClient'
          );
        // Connection to Registry.sol
        const Coordinator = await ethers.getContractFactory('ZapCoordinator')
        const coordinator = await Coordinator.attach('0xe7f1725e7734ce288f8367e1bb143e90bb3f0512')
        const ZAPTOKEN = await ethers.getContractFactory('ZapToken');
        const zapToken= await ZAPTOKEN.attach(await coordinator.getContract('ZAP_TOKEN'));
        const BONDAGE = await ethers.getContractFactory('Bondage');
        const bondage= await BONDAGE.attach(await coordinator.getContract('BONDAGE'));
        
        
        const DISPATCH = await ethers.getContractFactory('Dispatch');
        const dispatch= await DISPATCH.attach(await coordinator.getContract('DISPATCH'));
        const offchainsubscriber = (await offchainSubscriberFactory.deploy(
            zapToken.address,
            dispatch.address,
            bondage.address,
            coordinator.address,
          
          ))
        await offchainsubscriber.deployed();    
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
            .delegateBond(offchainsubscriber.address, owner.address, specifier, 100);
  
        let res=await offchainsubscriber
            .connect(subscriberAccount)
            .testQuery(owner.address, query, specifier, params);
         console.log(await res.wait())
        
    })
