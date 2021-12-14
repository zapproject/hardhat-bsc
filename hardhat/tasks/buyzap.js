
const { task } = require("hardhat/config");
require("hardhat-deploy-ethers");
require('hardhat-deploy');

task("buyZap", "Signer can buy 100K ZAP")

    .addParam("account", "The account's address")

    .setAction(async taskArgs => {

        const signerBalance = [];

        // Connection to ZapToken.sol
        const Token = await ethers.getContractFactory('ZapToken')
        const token = await Token.attach('0x5FbDB2315678afecb367f032d93F642f64180aa3');

        // Connection to Faucet.sol
        const Faucet = await ethers.getContractFactory('Faucet');
        const faucet = await Faucet.attach('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');

        // Stores the balance of the faucet
        const faucetBalance = await token.balanceOf(faucet.address);

        // Checks if the faucet is empty 
        if (parseInt(faucetBalance._hex) === 0) {

            console.log("Please run the <npx hardhat faucet> task.");
            console.log("<npx hardhat faucet> will replinish the Faucet for purchase.");
            console.log("<npx hardhat faucet> will make the test accounts purchase 100K ZAP.");

        } else {

            // Test account purchasing 100K ZAP
            // 1 ETH = 1000 ZAP
            await faucet.buyZap(taskArgs.account, 100)
                .then((res) => {
                    return res;
                })
                .catch((err) => {
                    return err;
                })

            // Gets the balance of each test account
            await token.balanceOf(taskArgs.account)
                .then((balance) => {

                    signerBalance.push(balance);
                })
                .catch((err) => {
                    return err;
                })

            // Log account details
            console.log(
                {
                    address: taskArgs.account,
                    ZAP_Balance: parseInt(signerBalance[0]._hex) + ' ZAP',
                },
            );
        }
    })
