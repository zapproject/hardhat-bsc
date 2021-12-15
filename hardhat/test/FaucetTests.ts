import { ethers } from 'hardhat';
import { solidity } from 'ethereum-waffle';
import chai from 'chai';

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
  allocatedAmt = 999999999;

  // Instance of the ZapToken.sol contract
  const zapTokenFactory = await ethers.getContractFactory(
    'ZapToken',
    signers[0]
  );

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
  it('owner() - Check if the owner is valid', async () => {
    // Verify the Faucet contract address is equivalent to the first test account address
    expect(await faucet.owner()).to.equal(signers[0].address);
  });
});

describe('Faucet_Transactions', async () => {
  it('rate() - Check if the rate is 1 ETH for 1000 ZAP', async () => {
    // Stores the value of the rate
    const rateObj = await faucet.rate();

    // Verfiy the rate is equal to 1000
    expect(parseInt(rateObj._hex)).to.equal(1000);
  });

  it('balanceOf() - Check if the balance is equivalent to the initial allocated amount', async () => {
    // Stores the balance after being funded
    const balance = await zapToken.balanceOf(faucet.address);

    // Verify the balance equals to allocatedAmt
    expect(parseInt(balance._hex)).to.equal(allocatedAmt);
  });

  it('withdrawTok() -Check if the withdrawTok function withdraws all test ZAP from the Faucet', async () => {
    // Invoke the withdawnTok function
    expect(await faucet.withdrawTok());

    // Store the new balance after being withdrawn
    const withdrawnFaucet = await zapToken.balanceOf(faucet.address);

    // Verify that the balance is 0
    expect(parseInt(withdrawnFaucet._hex)).to.equal(0);
  });

  it('buyZap() - Check if the buyZap function is able to disperse 100,000 test ZAP to signers', async () => {
    // Verify that 100,000 test ZAP is dispersed to the signer
    expect(await faucet.buyZap(signers[0].address, 100));
  });

  it('buyZap() - Check if 100,000 test ZAP is available in the signers balance', async () => {
    // Signer is dispersed 100,000 test ZAP
    expect(await faucet.buyZap(signers[0].address, 100));

    // Stores the balance of the signer
    const signerBalance = await zapToken.balanceOf(signers[0].address);

    // Verify the signers balance is equal to 100,000
    expect(parseInt(signerBalance._hex)).to.equal(100000);
  });

  it('buyZap() - Check if the Faucet balance subtracts the dispersed 100,000 test ZAP', async () => {
    // Signer is dispersed 100,000 test ZAP
    expect(await faucet.buyZap(signers[0].address, 100));

    // Stores the balance of the signer
    const faucetBalance = await zapToken.balanceOf(faucet.address);

    // Verify the signers balance is equal to 100,000
    expect(parseInt(faucetBalance._hex)).to.equal(allocatedAmt - 100000);
  });

  it('withdrawTok() - Check if the withdrawEther function invokes ', async () => {
    // Verify the function invokes
    expect(await faucet.withdrawEther());
  });
});
