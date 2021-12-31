// Chai test method
import { expect } from 'chai';

// Ethers Types
import { Contract, ethers, BigNumber } from 'ethers';

import MediaFactory from '../mediaFactory';

import ZapMedia from '../zapMedia';

// Hardhat localhost connection
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

const mediaData = () => {

    let tokenURI = 'www.example.com';
    let metadataURI = 'www.example.com';
    let metadataHex = ethers.utils.formatBytes32String(metadataURI);
    let metadataHashRaw = ethers.utils.keccak256(metadataHex);
    let metadataHashBytes = ethers.utils.arrayify(metadataHashRaw);

    let contentHex = ethers.utils.formatBytes32String(tokenURI);
    let contentHashRaw = ethers.utils.keccak256(contentHex);
    let contentHashBytes = ethers.utils.arrayify(contentHashRaw);

    let contentHash = contentHashBytes;
    let metadataHash = metadataHashBytes;

    return {
        tokenURI,
        metadataURI,
        contentHash,
        metadataHash
    }
}

const bidShares = () => {

    const bidShares = {
        collaborators: [],
        collabShares: [],
        creator: {
            value: BigNumber.from('10000000000000000000')
        },
        owner: {
            value: BigNumber.from('85000000000000000000')
        },
    };

    return bidShares

}

describe('ZapMedia', () => {

    // Hardhat signers[0]: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
    let signer1: any;
    let signer0: any
    let zapMedia: any;
    let customMedia: any;


    describe('#constructor', () => {

        before(async () => {

            signer0 = provider.getSigner(0)

            // Hardhat localhost account: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
            signer1 = provider.getSigner(1);

            // Instantiates the company ZapMedia class deployed through hardhat-deploy
            zapMedia = new ZapMedia(31337, signer0);

        });


        it("Should throw an error if the networkId is not valid", async () => {

            expect(new ZapMedia(400, signer0)).to.throw()
        })

    })



});
