
const { task, taskArgs } = require("hardhat/config");
require("hardhat-deploy-ethers");
require('hardhat-deploy');

task("faucet", "Sends 100K ZAP to the first 20 accounts")

    .setAction(async () => {

        // Stores the ZAP balance of each test account
        const balances = [];

        // Test accounts
        const signers = await ethers.getSigners();

        // Connection to Coordinator
        const Coordinator = await ethers.getContractFactory('ZapCoordinator')
        const coordinator = await Coordinator.attach('0xe7f1725e7734ce288f8367e1bb143e90bb3f0512')

        // Connection to ZapToken.sol
        const Token = await ethers.getContractFactory('ZapToken')
        const token = await Token.attach( '0x5fbdb2315678afecb367f032d93f642f64180aa3');

        // Connection to Faucet.sol
        const Faucet = await ethers.getContractFactory('Faucet');
        const faucet = await Faucet.attach('0x5fc8d32690cc91d4c39d9d3abcbd16989f875707');

        // ZapToken.sol funds test ZAP to Faucet.sol
        await token.allocate(faucet.address, 1000000000000)
            .then((allocate) => {
              //  console.log(allocate)
                return allocate;
            })
            .catch((err) => {
                return err;
            })

        for (var i = 0; i < signers.length; i++) {

            // Test accounts purchasing 100K ZAP
            // 1 ETH = 1000 ZAP
            await faucet.connect(signers[i]).buyZap(signers[i].address, 1000000)
                .then((res) => {
                    //console.log(res)
                    res.wait().then((r)=>{
                       // console.log(r)
                    })
                })
                .catch((err) => {
                    console.log(err)
                    return err;
                })

        }
    });
