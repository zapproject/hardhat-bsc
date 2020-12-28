
const { task, taskArgs } = require("hardhat/config");
const { getTokenSourceMapRange } = require("typescript");
require("hardhat-deploy-ethers");
require('hardhat-deploy')


task("faucet", "Sends 100K ZAP to the first 20 accounts")
    .setAction(async () => {

        // Hardhat test accounts
        const signers = await ethers.getSigners();

        // Connection to ZapToken.sol
        const Token = await ethers.getContractFactory('ZapToken')
        const token = await Token.attach('0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6');

        // Connection to Faucet.sol
        const Faucet = await ethers.getContractFactory('Faucet');
        const faucet = await Faucet.attach('0x8A791620dd6260079BF849Dc5567aDC3F2FdC318')


        await token.allocate(faucet.address, 999999999)
            .then((res) => {
                return res
            })
            .catch((err) => {
                return err
            })

        const balances = []

        for (var i = 0; i < signers.length; i++) {


            await faucet.buyZap(signers[i].address, 100)

            balances.push(await token.balanceOf(signers[i].address))

            console.log(
                signers[i].address + ': ' +
                parseInt(balances[i]._hex) + ' ZAP'

            )
        }






    });



