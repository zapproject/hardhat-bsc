const { task, taskArgs } = require("hardhat/config");
require("hardhat-deploy-ethers");
require('hardhat-deploy');

task("faucet", "Sends 100K ZAP to the first 20 accounts")

    .setAction(async () => {

        // Test accounts
        const signers = await ethers.getSigners();

        // Connection to Coordinator
        const Coordinator = await ethers.getContractFactory('ZapCoordinator')
        const coordinator = await Coordinator.attach('0xe7f1725e7734ce288f8367e1bb143e90bb3f0512')

        // Connection to ZapToken.sol
        const Token = await ethers.getContractFactory('ZapToken')
        const token = await Token.attach(await coordinator.getContract('ZAP_TOKEN'));

        // Connection to Faucet.sol
        const Faucet = await ethers.getContractFactory('Faucet');
        const faucet = await Faucet.attach(await coordinator.getContract('FAUCET'));

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
            await faucet.buyZap(signers[i].address, 700)
                .then((res) => {
                    return res;
                })
                .catch((err) => {
                    return err;
                })

        }
    });