const { task, taskArgs } = require("hardhat/config");
require("hardhat-deploy-ethers");
require("hardhat-deploy");

task("initiate-Provider", "Initializes the first 20 accounts as a Provider")

    .setAction(async () => {
        
        // Stores the titles of all 20 providers
        const title = ["Slothrop", "Blicero", "Borgesius", "Enzian", "Pointsman", "Tchitcherine", "Achtfaden", "Andreas", "Bianca", "Bland", "Bloat", "Bodine", "Bounce", "Bummer", "Byron the Bulb", "Chiclitz", "Christian", "Darlene", "Dodson-Truck", "Erdmann"];

        // Test accounts
        const signers = await ethers.getSigners();
        console.log(signers);

        // Connection to Registry.sol
        const Registry = await ethers.getContractFactory('Registry');
        const registry = await Registry.attach('0xa513E6E4b8f2a923D98304ec87F64353C4D5C853');

        for (var i = 0; i < signers.length; i++) {
                // Registry.sol initializes provider on an account using ETH
                await registry.initiateProvider(signers[i].address, title[i])
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