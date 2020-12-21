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

    beforeEach(async () => {

        const zapTokenFactory = await ethers.getContractFactory('ZapToken');
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

            // Stores the value of 
            const rateObj = await faucet.rate();

            expect(parseInt(rateObj._hex)).to.equal(1000);

        });


    it('Faucet_3 - Check if the Faucet can be funded test ZAP and initial balance is the same', async () => {

        const allocateAmt = 900000000;

        expect(await zapToken.allocate(faucet.address, allocateAmt));

        const balance = await zapToken.balanceOf(faucet.address);

        expect(allocateAmt).to.equal(parseInt(balance._hex));

    });


    // it('Faucet_3 - withdrawTok() - Check if the Faucet ZAP balance is 0 after withdrawing ', async () => {

    //     // Withdraw all the test ZAP from the Faucet
    //     expect(await faucet.withdrawTok());

    //     // Stores key/value pair bigNumber and _hex
    //     // The _hex value 0x00 is 0 as a hex string
    //     const balanceObj = await zapToken.balanceOf(faucet.address);

    //     expect(parseInt(balanceObj._hex)).to.equal(0);

    // });


})

