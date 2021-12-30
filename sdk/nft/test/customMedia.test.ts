// Chai test method
import { expect } from 'chai';

// Ethers Types
import { Contract, ethers, BigNumber } from 'ethers';

import MediaFactory from '../mediaFactory';

import CustomMedia from '../customMedia';

// Hardhat localhost connection
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

describe('MediaFactory', () => {

    // Hardhat signers[0]: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
    let signer0: any;
    let customMedia: any;
    let mediaFactory: any;

    before(async () => {

    });

    it('Testing', async () => {

    });
});
