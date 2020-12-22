
import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import chai from "chai";
import web3 from 'web3'

import { Faucet } from '../typechain/Faucet';

import { ZapToken } from '../typechain/ZapToken';
chai.use(solidity);

const { expect } = chai;


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

describe('Faucet_Deployment', () => {

    it('Check if the owner is valid', async () => {

        // Checks if the Faucet contract address is equivalent to the first test account address
        expect(await faucet.owner()).to.equal(signers[0].address);

    });

    it('Check if the rate is 1 ETH for 1000 ZAP'
        , async () => {

            // Stores the value of the rate
            const rateObj = await faucet.rate();

            expect(parseInt(rateObj._hex)).to.equal(1000);

        })
})

describe('Faucet_Transactions', async () => {

    it('Check if the balance is equivalent to the initial allocated amount', async () => {

        // Stores the balance after being funded
        const balance = await zapToken.balanceOf(faucet.address);

        // Checks that the balance equals to allocatedAmt
        expect(parseInt(balance._hex)).to.equal(allocatedAmt);

    });

    it('Check if all tokens are withdrawn from the Faucet', async () => {

        // Invoke the withdawnTok function
        expect(await faucet.withdrawTok());

        // Store the new balance after being withdrawn
        const withdrawnBalance = await zapToken.balanceOf(faucet.address);

        // Verify that the balance is 0
        expect(parseInt(withdrawnBalance._hex)).to.equal(0);

    })

    it('Test', async () => {

        console.log(await faucet.buyZap('0x5C631BB57A3b30746846979f84A3412aAa200852', 240))

        console.log(await zapToken.balanceOf(signers[0].address))
            
    })





})

