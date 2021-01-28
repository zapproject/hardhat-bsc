const { task, taskArgs } = require("hardhat/config");

require("hardhat-deploy-ethers");
require("hardhat-deploy");

task("initiateProviderCurve", "Initializes the first 20 provider accounts with a unique bonding curve")

    .setAction(async () => {

        // Test accounts
        const signers = await ethers.getSigners();

        // Storage for the provider curves returned from getProviderCurve()
        let getCurves = [];

        // Storage for the parsed provider ccurve
        let coefficientArr = [];

        // Empty broker address
        const broker = '0x0000000000000000000000000000000000000000';

        // Connection to Registry.sol
        const Registry = await ethers.getContractFactory('Registry');
        const registry = await Registry.attach('0xa513E6E4b8f2a923D98304ec87F64353C4D5C853');

        // Stores the endpoints of all 20 providers
        let endpoint = [
            "Ramanujan",
            "Lagrange",
            "Wiles",
            "Jacobi",
            "Turing",
            "Riemann",
            "Poincare",
            "Hilbert",
            "Fibonacci",
            "Bernoulli",
            "Pythagoras",
            "Gauss",
            "Newton",
            "Euler",
            "Archimedes",
            "Euclid",
            "Merkle",
            "Shamir",
            "Buterin",
            "Nakamoto"
        ];

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
        ]

        // Converts the endpoint array to an array of bytes32 strings
        endpoint = endpoint.map(name => ethers.utils.formatBytes32String(name));

        for (var i = 0; i < signers.length; i++) {

            try {

                // Connects the 20 test accounts to Registry.sol as signers
                // Initiates the 20 test accounts with provider curves
                await registry.connect(signers[i]).initiateProviderCurve(endpoint[i], curve[i], broker);

            } catch (err) {

                console.log(signers[i].address + ': Provider curve is already initiated')
            }

            getCurves.push(await registry.connect(signers[i]).getProviderCurve(signers[i].address, endpoint[i]))

            // Converts each curve coordinate from a hexstring to a number
            coefficientArr.push(getCurves[i].map(item => parseInt(item._hex)));

            console.log({
                endpoint: ethers.utils.parseBytes32String(endpoint[i]),
                curve: coefficientArr[i],
                address: signers[i].address

            })

        }

    })