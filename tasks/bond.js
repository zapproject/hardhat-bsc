const { task, taskArgs } = require("hardhat/config");
require("hardhat-deploy-ethers");
require("hardhat-deploy");

task("bond", "Bonds 100 Zap using the first 20 accounts to the first 20 oracle endpoints")

    .setAction(async () => {

        // Stores the ZAP balance of each test account
        const balances = [];

        // Storage for the zap bound returned from getZapBound()
        let zapBound = [];

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

        // Convert endpoint array to an array of bytes32 strings
        endpoint = endpoint.map(name => ethers.utils.formatBytes32String(name));

        // Test accounts
        const signers = await ethers.getSigners();

        // Connection to Coordinator
        const Coordinator = await ethers.getContractFactory("ZapCoordinator");
        const coordinator = await Coordinator.attach('0xe7f1725e7734ce288f8367e1bb143e90bb3f0512')


        // Connection to ZapToken.sol
        const Token = await ethers.getContractFactory('ZapToken')
        const token = await Token.attach(await coordinator.getContract('ZAP_TOKEN'));

        // Connection to Bondage.sol
        const Bondage = await ethers.getContractFactory('Bondage');
        const bondage = await Bondage.attach(await coordinator.getContract('BONDAGE'));


        for (var i = 0; i < signers.length; i++) {

            // Gets the balance of each test account
            await token.balanceOf(signers[i].address)
                .then((balance) => {

                    balances.push(balance);
                })
                .catch((err) => {
                    return err;
                })

            try {

                await token.connect(signers[i]).approve(bondage.address, await token.balanceOf(signers[i].address));
                await bondage.connect(signers[i]).bond(signers[i].address, endpoint[i],1);
                await bondage.connect(signers[i]).getZapBound(signers[i].address, endpoint[i]);

            } catch (err) {

                console.log(err);

            }
        

            // Log account details
            console.log(
                {
                    signer: i,
                    address: signers[i].address,
                    ZAP_Balance: parseInt(balances[i]._hex) + ' ZAP',
                    Zap_Bound: zapBound[i]
                },
            );
        }

    })