import chai, { expect, should, assert } from 'chai';

import { ethers, BigNumber, Signer, Wallet } from 'ethers';

import ZapMedia from '../zapMedia';

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
        metadataHash,
    };
};

const bidShares = () => {
    const bidShares = {
        collaborators: [],
        collabShares: [],
        creator: {
            value: BigNumber.from('10000000000000000000'),
        },
        owner: {
            value: BigNumber.from('85000000000000000000'),
        },
    };

    return bidShares;
};

describe('ZapMedia', () => {
    // Hardhat signers[0]: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
    let signer1: any;
    // let signer0: any;
    let zapMedia: any;

    describe('#constructor', () => {
        it('Should throw an error if the networkId is invalid', async () => {
            const signer = Wallet.createRandom();

            expect(() => {
                new ZapMedia(300, signer);
            }).to.throw('ZapMedia Constructor: Network Id is not supported.');
        });
    });

    describe('contract Functions', () => {
        describe('Write Functions', () => {
            describe('#updateContentURI', () => {
                it('Should throw an error if the tokenId does not exist', async () => {
                    const signer = Wallet.createRandom().connect(provider);

                    const zapMedia = new ZapMedia(31337, signer);

                    await zapMedia
                        .updateContentURI(0, 'test')
                        .then((res) => {
                            // Will never resolve
                            console.log(res);
                        })
                        .catch((err) => {
                            expect(err.message).to.equal(
                                'Invariant failed: ZapMedia - updateContentURI: TokenId does not exist.',
                            );
                        });
                });
            });
        });
    });
});
