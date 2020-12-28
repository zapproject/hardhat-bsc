
const { task, taskArgs } = require("hardhat/config");
require("hardhat-deploy-ethers");
require('hardhat-deploy')

task("faucet", "Sends 100K ZAP to the first 20 accounts")

    .setAction(async () => {

        // Stores the ZAP balance of each test account
        const balances = [];

        // Test accounts
        const signers = await ethers.getSigners();

        // Connection to ZapToken.sol
        const Token = await ethers.getContractFactory('ZapToken')
        const token = await Token.attach('0x5FbDB2315678afecb367f032d93F642f64180aa3');

        // Connection to Faucet.sol
        const Faucet = await ethers.getContractFactory('Faucet');
        const faucet = await Faucet.attach('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');

        // ZapToken.sol funds test ZAP to Faucet.sol
        await token.allocate(faucet.address, 1000000000)
            .then((allocate) => {
                return allocate;
            })
            .catch((err) => {
                return err;
            })

        for (var i = 0; i < signers.length; i++) {

            // Test accounts purchasing 100K ZAP
            // 1 ETH = 1000 ZAP
            await faucet.buyZap(signers[i].address, 100)
                .then((res) => {
                    return res;
                })
                .catch((err) => {
                    return err;
                })

            // Gets the balance of each test account
            await token.balanceOf(signers[i].address)
                .then((balance) => {

                    balances.push(balance);
                })
                .catch((err) => {
                    return err;
                })

            // Log account details
            console.log(
                {
                    signer: i,
                    address: signers[i].address,
                    ZAP_Balance: parseInt(balances[i]._hex) + ' ZAP',
                },
            );
        }
    });

