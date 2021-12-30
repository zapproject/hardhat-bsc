// Chai test method
import { expect } from 'chai';

// Ethers Types
import { Contract, ethers, BigNumber } from 'ethers';

import MediaFactory from '../mediaFactory';

import ZapMedia from '../zapMedia';

// Hardhat localhost connection
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

describe('MediaFactory', () => {

    // Hardhat signers[0]: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
    let signer0: any;
    let zapMedia: any;
    let customMedia: any;
    let mediaFactory: any;

    before(async () => {

        // Hardhat localhost account: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        signer0 = provider.getSigner(0);

        zapMedia = new ZapMedia(31337, signer0);

        customMedia = new ZapMedia(31337, signer0, 1)

    });

    it('Testing', async () => {

        const x = await zapMedia.test()

        const y = await customMedia.test()

        console.log(await x.symbol())
        console.log(await y.symbol())

    });
});
