const { task, taskArgs }  = require("hardhat/config");
require("hardhat-deploy-ethers");
require("hardhat-deploy");

task("initiate-Provider-Curve", "Initializes the first 20 provider accounts with a unique bonding curve")

    .setAction(async () => {
        
        // Stores the titles of all 20 providers
        const title = ["Slothrop", "Blicero", "Borgesius", "Enzian", "Pointsman", "Tchitcherine", "Achtfaden", "Andreas", "Bianca", "Bland", "Bloat", "Bodine", "Bounce", "Bummer", "Byron the Bulb", "Chiclitz", "Christian", "Darlene", "Dodson-Truck", "Erdmann"];

        // Stores the endpoints of all 20 providers
        const endpoint = ["Ramanujan", "Lagrange", "Wiles", "Jacobi", "Turing", "Riemann", "Poincare", "Hilbert", "Fibonacci", "Bernoulli", "Pythagoras", "Gauss", "Newton", "Euler", "Archimedes", "Euclid", "Merkle", "Shamir", "Buterin", "Nakamoto"];

        // Stores the curves of all 20 providers
        // TODO: make all the curves below more realistic and unique
        const curve = ["1x","2x", "3x", "4x", "5x", "6x", "7x", "8x", "9x", "10x", "11x", "12x", "13x", "14x", "15x", "16x", "17x", "18x", "19x", "20x"];

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

        for (var i = 0; i < signers.length; i++) {
            // Registry.sol initializes curve on a provider account using ETH
            await registry.initiateProviderCurve(endpoint[i], title[i])
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
                endpoint: endpoint[i],
                curve: curve[i],
            },
        );

        }
    })