import chai, { expect, should, assert } from 'chai';

import { ethers, BigNumber, Signer, Wallet } from 'ethers';

import { constructBidShares } from '../utils';

import ZapMedia from '../zapMedia';

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

const mediaData = () => {
    let tokenURI = 'https://bafkreievpmtbofalpowrcbr5oaok33e6xivii62r6fxh6fontaglngme2m.ipfs.dweb.link/';
    let metadataURI = 'https://bafkreihhu7xo7knc3vn42jj26gz3jkvh3uu3rwurkb4djsoo5ayqs2s25a.ipfs.dweb.link/';
    let metadataHex = ethers.utils.formatBytes32String('Test');
    let metadataHashRaw = ethers.utils.keccak256(metadataHex);
    let metadataHashBytes = ethers.utils.arrayify(metadataHashRaw);

    let contentHex = ethers.utils.formatBytes32String("Test Car");
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

            let bidShares: any
            beforeEach(async () => {

                bidShares = constructBidShares(
                    [
                        await provider.getSigner(19).getAddress(),
                        await provider.getSigner(18).getAddress(),
                        await provider.getSigner(17).getAddress()
                    ],
                    [15, 15, 15],
                    15,
                    35
                )

            })

            describe('#updateContentURI', () => {
                it.skip('Should throw an error if the tokenId does not exist', async () => {
                    const signer = provider.getSigner(1)

                    const zapMedia = new ZapMedia(31337, signer);

                    await zapMedia
                        .updateContentURI(0, 'www.exmaple.com')
                        .then((res) => {
                            // Will never resolve
                            return res
                        })
                        .catch((err) => {
                            expect(err.message).to.equal(
                                'Invariant failed: ZapMedia - updateContentURI: TokenId does not exist.',
                            );
                        });
                });

                it("Should update the content uri", async () => {

                    const signer = provider.getSigner(1)

                    const zapMedia = new ZapMedia(31337, signer);


                    await zapMedia.mint(mediaData(), bidShares);

                })

            });
        });
    });
});
