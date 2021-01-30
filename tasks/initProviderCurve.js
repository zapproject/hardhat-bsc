const { task, taskArgs }  = require("hardhat/config");
require("hardhat-deploy-ethers");
require("hardhat-deploy");

task("initiate-Provider-Curve", "Initializes the first 20 provider accounts with a unique bonding curve")

    .setAction(async () => {
        const zeroAddress = '0x0000000000000000000000000000000000000000';
        // Stores the titles of all 20 providers
        const title = ["Slothrop", "Blicero", "Borgesius", "Enzian", "Pointsman", "Tchitcherine", "Achtfaden", "Andreas", "Bianca", "Bland", "Bloat", "Bodine", "Bounce", "Bummer", "Byron the Bulb", "Chiclitz", "Christian", "Darlene", "Dodson-Truck", "Erdmann"];
        
        // Stores the endpoints of all 20 providers
        const endpoint = ["Ramanujan", "Lagrange", "Wiles", "Jacobi", "Turing", "Riemann", "Poincare", "Hilbert", "Fibonacci", "Bernoulli", "Pythagoras", "Gauss", "Newton", "Euler", "Archimedes", "Euclid", "Merkle", "Shamir", "Buterin", "Nakamoto"];
       
        // Stores the curves of all 20 providers
        // TODO: make all the curves below more realistic and unique
        const curve = [3, 0, 0, 2, 1000000000];

        // Test accounts
        const signers = await ethers.getSigners();
       // console.log(signers);

        // Connection to Registry.sol
        const Registry = await ethers.getContractFactory('Registry');
        const registry = await Registry.attach('0x0165878a594ca255338adfa4d48449f69242eb8f');
        console.log("starting")
        for (var i = 0; i < signers.length; i++) {
            console.log(i)
            // Registry.sol initializes curve on a provider account using ETH
            let res=await registry.connect(signers[i]).initiateProviderCurve(ethers.utils.sha256(ethers.utils.toUtf8Bytes(endpoint[i])),curve,zeroAddress )
            console.log(await res.wait())
                
        }
      /**   for (var i = 0; i < signers.length; i++) {
                // Registry.sol initializes provider on an account using ETH
                await registry.initiateProvider(signers[i].address, ethers.utils.sha256(ethers.utils.toUtf8Bytes(title[i])))
                    .then((res) => {
                        return res;
                    })
                    .catch((err) => {
                        return err;
                    })
                
                }
            **/
        // Log account details
       /**  console.log(
            {
                signer: i,
                providerAddress: signers[i].address,
                title: title[i],
            },
        );
        //}
        }
        **/
      
        // Log account details
       /**  console.log(
            {
                signer: i,
                endpoint: endpoint[i],
                curve: curve[i],
            },
        );

        }
        **/
    })