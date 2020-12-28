
const { task, taskArgs } = require("hardhat/config");

task("faucet", "Sends 100K ZAP to the first 20 accounts")
    .setAction(async () => {
      
        const signers = await ethers.getSigners();

        const Token = await ethers.getContractFactory('ZapToken')
        const token = await Token.attach('0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6')

        console.log(await token.symbol())

        // const Faucet = await ethers.getContractFactory('Faucet')
        // const faucet = await Faucet.attach('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512')



    });



