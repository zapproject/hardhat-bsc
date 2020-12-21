import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import chai from "chai";

import { Faucet } from '../typechain/Faucet';

import { ZapToken } from '../typechain/ZapToken';

chai.use(solidity);

const { expect } = chai;

describe('Faucet', () => {

    let zapToken: ZapToken;
    let faucet: Faucet;
    let allocatedAmt: number

    beforeEach(async () => {

        // Instance of the ZapToken.sol contract
        const zapTokenFactory = await ethers.getContractFactory('ZapToken');

        // Instance of the Faucet.sol contract
        const faucetFactory = await ethers.getContractFactory('Faucet');

        // Deploys the ZapToken contract and creating the test Zap token
        zapToken = (await zapTokenFactory.deploy()) as ZapToken;
        await zapToken.deployed();

        // Pass the address of the ZapToken contract for successful deployment
        faucet = (await faucetFactory.deploy(zapToken.address)) as Faucet;
        await faucet.deployed();

    });

    it('Faucet_1 - owner() - Check if the ownerOnly modifier is valid', async () => {

        // Test accounts
        const signers = await ethers.getSigners();

        // Checks if the Faucet contract address is equivalent to the first test account address
        expect(await faucet.owner()).to.equal(signers[0].address);

    });


    it('Faucet_2 - rate() - Check if 1 ETH is equivalent to 1000 ZAP'
        , async () => {

            // Stores the value of the rate
            const rateObj = await faucet.rate();

            expect(parseInt(rateObj._hex)).to.equal(1000);

        });


    it('Faucet_3 - Check if the Faucet can be allocated test tokens', async () => {

        // Amount to fund the Faucet
        allocatedAmt = 900000000;

        expect(await zapToken.allocate(faucet.address, allocatedAmt));

    });

    it('Faucet_4 - Check if the balance is equivalent to the initial allocated amount', async () => {

        // Amount to fund the Faucet
        allocatedAmt = 900000000;

        // Funds the Faucet from allocatedAmt
        expect(await zapToken.allocate(faucet.address, allocatedAmt));

        // Stores the balance after being funded
        const balance = await zapToken.balanceOf(faucet.address);

        // Checks that the balance equals to allocatedAmt
        expect(parseInt(balance._hex)).to.equal(allocatedAmt);

    });

    it('Faucet_5 - withdrawTok() - Check if all tokens are withdrawn from the Faucet', async () => {

        // Amount to fund the Faucet
        allocatedAmt = 900000000;

        // Funds the Faucet from allocatedAmt
        expect(await zapToken.allocate(faucet.address, allocatedAmt));

        // Invoke the withdawnTok function
        expect(await faucet.withdrawTok());

        // Store the new balance after being withdrawn
        const withdrawnBalance = await zapToken.balanceOf(faucet.address);

        // Verify that the balance is 0
        expect(parseInt(withdrawnBalance._hex)).to.equal(0);

    });

})

