const { task, taskArgs } = require("hardhat/config");
require("hardhat-deploy-ethers");
require("hardhat-deploy");


task("setEndpointParams", "Initialize a unique set of endpoint params for each endpoint on the first 20 accounts")

    .setAction(async () => {

        // Stores the endpointParams of each endpoint of all 20 providers
        let endpointParams = ["A, B", "C, D", "E, F", "G, H", "I, J", "K, L", "M, N", "O, P", "Q, R", "S, T", "U, V", "W, X", "Y, Z", "aa, bb", "cc, dd", "ee, ff", "gg, hh", "ii, jj", "kk, ll", "mm, nn"];

        // Stores the titles of all 20 providers
        let title = ["Slothrop", "Blicero", "Borgesius", "Enzian", "Pointsman", "Tchitcherine", "Achtfaden", "Andreas", "Bianca", "Bland", "Bloat", "Bodine", "Bounce", "Bummer", "Byron the Bulb", "Chiclitz", "Christian", "Darlene", "Dodson-Truck", "Erdmann"];

        // Stores the endpoints of all 20 providers
        let endpoint = ["Ramanujan", "Lagrange", "Wiles", "Jacobi", "Turing", "Riemann", "Poincare", "Hilbert", "Fibonacci", "Bernoulli", "Pythagoras", "Gauss", "Newton", "Euler", "Archimedes", "Euclid", "Merkle", "Shamir", "Buterin", "Nakamoto"];

        // 20 test curves
        const curve = [
            [3, 0, 0, 1, 122],
            [3, 0, 0, 1, 10000],
            [3, 0, 0, 1, 1222],
            [1, 100, 1000],
            [3, 0, 2, 1, 100],
            [2, 0, 0, 10000],
            [1, 1000, 10000],
            [1, 10000, 100000],
            [2, 5000, 2000, 1000, 2, 0, 3000, 10000],
            [2, 5000, 2000, 1000],
            [2, 7000, 1000, 10000],
            [2, 5000, 2000, 1000, 2, 0, 2000, 10000],
            [3, 0, 2000, 1000, 10000],
            [3, 0, 20000, 10000, 100000],
            [3, 0, 2000, 10000, 100000],
            [1, 100000, 1000000],
            [2, 7000, 70000, 1000000],
            [2, 70000, 7000000, 1000000],
            [2, 0, 1, 1000000],
            [2, 0, 1000, 100000],
        ];

        // Converts the endpoint array to an array of bytes32 strings
        endpoint = endpoint.map(name => ethers.utils.formatBytes32String(name));

        // Converts the endpointParams array to an array of bytes32 strings
        endpointParams = endpointParams.map(name => ethers.utils.formatBytes32String(name));

        // Test accounts
        const signers = await ethers.getSigners();
        console.log(signers);

        // Connection to Registry.sol
        const Registry = await ethers.getContractFactory('Registry');
        const registry = await Registry.attach('0xa513E6E4b8f2a923D98304ec87F64353C4D5C853');

    for (var i = 0; i < signers.length; i++) {
        // Registry.sol initializes endpoint params on a specific endpoint
        await registry.setEndpointParams(endpoint[i], endpointParams[i])
            .then((res) => {
                return res;
            })
            .catch((err) => {
                return err;
            })
    // Log details
    console.log(
        {
            signer: i,
            title: title[i],
            endpoint: ethers.utils.parseBytes32String(endpoint[i]),
            curve: curve[i],
            endpointParams: ethers.utils.parseBytes32String(endpointParams[i])
        },
    );

    }
})
