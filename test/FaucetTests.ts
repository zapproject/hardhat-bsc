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
    let allocatedAmt: number;
    let signers: any;

    beforeEach(async () => {

        // Test accounts
        signers = await ethers.getSigners();

        // Funds for the Faucet
        allocatedAmt = 900000000;

        // Instance of the ZapToken.sol contract
        const zapTokenFactory = await ethers.getContractFactory('ZapToken', signers[0]);

        // Instance of the Faucet.sol contract
        const faucetFactory = await ethers.getContractFactory('Faucet', signers[0]);

        // Deploys the ZapToken contract and creating the test Zap token
        zapToken = (await zapTokenFactory.deploy()) as ZapToken;
        await zapToken.deployed();

        // Pass the address of the ZapToken contract for successful deployment
        faucet = (await faucetFactory.deploy(zapToken.address)) as Faucet;
        await faucet.deployed();

        // Funds the Faucet the allocated amount
        // Validates that the Faucet can be funded from ZapToken.sol
        expect(zapToken.allocate(faucet.address, allocatedAmt));

    });

    it('Faucet_1 - owner() - Check if the ownerOnly modifier is valid', async () => {

        // Checks if the Faucet contract address is equivalent to the first test account address
        expect(await faucet.owner()).to.equal(signers[0].address);

    });

    it('Faucet_2 - rate() - Check if 1 ETH is equivalent to 1000 ZAP'
        , async () => {

            // Stores the value of the rate
            const rateObj = await faucet.rate();

            expect(parseInt(rateObj._hex)).to.equal(1000);

        });

    it('Faucet_3 - Check if the balance is equivalent to the initial allocated amount', async () => {

        // Stores the balance after being funded
        const balance = await zapToken.balanceOf(faucet.address);

        // Checks that the balance equals to allocatedAmt
        expect(parseInt(balance._hex)).to.equal(allocatedAmt);

    });

    it('Faucet_4 - withdrawTok() - Check if all tokens are withdrawn from the Faucet', async () => {

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

