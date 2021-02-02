const { task, taskArgs } = require("hardhat/config");


require("hardhat-deploy-ethers");
require("hardhat-deploy");

task("dispatch", "creates an offchain Incoming event")

    .setAction(async () => {
        
        const approveTokens = ethers.BigNumber.from('1000000000000000000000000000000');
        // Stores the titles of all 20 providers
        const title = ["Slothrop", "Blicero", "Borgesius", "Enzian", "Pointsman", "Tchitcherine", "Achtfaden", "Andreas", "Bianca", "Bland", "Bloat", "Bodine", "Bounce", "Bummer", "Byron the Bulb", "Chiclitz", "Christian", "Darlene", "Dodson-Truck", "Erdmann"];
        const endpoint = ["Ramanujan", "Lagrange", "Wiles", "Jacobi", "Turing", "Riemann", "Poincare", "Hilbert", "Fibonacci", "Bernoulli", "Pythagoras", "Gauss", "Newton", "Euler", "Archimedes", "Euclid", "Merkle", "Shamir", "Buterin", "Nakamoto"];
        let query='test this';
        const params = [
            ethers.utils.sha256(ethers.utils.toUtf8Bytes('param1')),
            ethers.utils.sha256(ethers.utils.toUtf8Bytes('param2'))
        ];
        // Test accounts
        const signers = await ethers.getSigners();
        const owner=signers[1];
        const specifier = ethers.utils.formatBytes32String(endpoint[1])
        const subscriberAccount=signers[2];

        // Connection to Registry.sol
        const Coordinator = await ethers.getContractFactory('ZapCoordinator')
        const coordinator = await Coordinator.attach('0xe7f1725e7734ce288f8367e1bb143e90bb3f0512')
        const ZAPTOKEN = await ethers.getContractFactory('ZapToken');
        const zapToken= await ZAPTOKEN.attach(await coordinator.getContract('ZAP_TOKEN'));
        const BONDAGE = await ethers.getContractFactory('Bondage');
        const bondage= await BONDAGE.attach(await coordinator.getContract('BONDAGE'));
        
        const SUBSCRIBER= await ethers.getContractFactory('OffChainClient');
        const subscriber= await SUBSCRIBER.attach('0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1');
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
