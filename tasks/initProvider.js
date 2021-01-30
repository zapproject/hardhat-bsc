const { task, taskArgs } = require("hardhat/config");


require("hardhat-deploy-ethers");
require("hardhat-deploy");

task("initiate-Provider", "Initializes the first 20 accounts as a Provider")

    .setAction(async () => {
        
        // Stores the titles of all 20 providers
        const title = ["Slothrop", "Blicero", "Borgesius", "Enzian", "Pointsman", "Tchitcherine", "Achtfaden", "Andreas", "Bianca", "Bland", "Bloat", "Bodine", "Bounce", "Bummer", "Byron the Bulb", "Chiclitz", "Christian", "Darlene", "Dodson-Truck", "Erdmann"];
        const keys=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,16,17,18,19,20]
        // Test accounts
        const signers = await ethers.getSigners();
        console.log(signers);

        // Connection to Registry.sol
        const Registry = await ethers.getContractFactory('Registry');
        const registry = await Registry.attach('0x0165878a594ca255338adfa4d48449f69242eb8f');

        for (var i = 0; i < signers.length; i++) {
                // Registry.sol initializes provider on an account using ETH
                await registry.connect(signers[i]).initiateProvider(keys[i], ethers.utils.sha256(ethers.utils.toUtf8Bytes(title[i])) )
                    .then((res) => {
                        return res;
                    })
                    .catch((err) => {
                        return err;
                    })

        // Log account details
        console.log(
            {
                signer: i,
                providerAddress: signers[i].address,
                title: title[i],
            },
        );
        //}
        }
    })