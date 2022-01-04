import chai, { expect, should, assert } from 'chai';

import { ethers, BigNumber, Signer, Wallet } from 'ethers';

import { constructBidShares } from '../utils';

import ZapMedia from '../zapMedia';

import { mediaFactoryAddresses, zapMarketAddresses, zapMediaAddresses } from '../addresses';

import { zapMediaAbi } from '../abi'

const contracts = require('../deploy.js');

const ganache = require('ganache-cli');
const provider = new ethers.providers.Web3Provider(ganache.provider());

const mediaData = () => {
    let tokenURI =
        'https://bafkreievpmtbofalpowrcbr5oaok33e6xivii62r6fxh6fontaglngme2m.ipfs.dweb.link/';
    let metadataURI =
        'https://bafkreihhu7xo7knc3vn42jj26gz3jkvh3uu3rwurkb4djsoo5ayqs2s25a.ipfs.dweb.link/';
    let metadataHex = ethers.utils.formatBytes32String('Test');
    let metadataHashRaw = ethers.utils.keccak256(metadataHex);
    let metadataHashBytes = ethers.utils.arrayify(metadataHashRaw);

    let contentHex = ethers.utils.formatBytes32String('Test Car');
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
    describe('#constructor', () => {
        let bidShares: any;
        let token: any;
        let zapVault: any;
        let zapMarket: any;
        let zapMediaImpl: any;
        let mediaFactory: any;
        let signer: any;

        beforeEach(async () => {
            signer = provider.getSigner(0);

            token = await contracts.deployZapToken();
            zapVault = await contracts.deployZapVault();
            zapMarket = await contracts.deployZapMarket();
            zapMediaImpl = await contracts.deployZapMediaImpl();
            mediaFactory = await contracts.deployMediaFactory();

            await zapMarket.setMediaFactory(mediaFactory.address);

            const deployMedia = await mediaFactory.deployMedia(
                'TEST COLLECTION',
                'TC',
                zapMarket.address,
                true,
                'https://testing.com',
            );

            const receipt = await deployMedia.wait();

            const eventLogs = receipt.events[receipt.events.length - 1];

            const zapMediaAddress = eventLogs.args.mediaContract;

            const zapMedia = new ethers.Contract(zapMediaAddress, zapMediaAbi, signer);
            await zapMedia.claimTransferOwnership();

            zapMarketAddresses['1337'] = zapMarket.address;
            mediaFactoryAddresses['1337'] = mediaFactory.address;
            zapMediaAddresses['1337'] = zapMediaAddress;

        });

        it('Should throw an error if the networkId is invalid', async () => {
            expect(() => {
                new ZapMedia(300, signer);
            }).to.throw('ZapMedia Constructor: Network Id is not supported.');
        });
    });

    describe('contract Functions', () => {
        describe('Write Functions', () => {
            beforeEach(async () => {
                // bidShares = constructBidShares(
                //     [
                //         await provider.getSigner(19).getAddress(),
                //         await provider.getSigner(18).getAddress(),
                //         await provider.getSigner(17).getAddress()
                //     ],
                //     [15, 15, 15],
                //     15,
                //     35
                // );
            });

            describe('#updateContentURI', () => {
                it.skip('Should throw an error if the tokenId does not exist', async () => {
                    // const signer = provider.getSigner(1)
                    // const zapMedia = new ZapMedia(31337, signer);
                    // await zapMedia
                    //     .updateContentURI(0, 'www.exmaple.com')
                    //     .then((res) => {
                    //         // Will never resolve
                    //         return res
                    //     })
                    //     .catch((err) => {
                    //         expect(err.message).to.equal(
                    //             'Invariant failed: ZapMedia - updateContentURI: TokenId does not exist.',
                    //         );
                    //     });
                });

                it('Should update the content uri', async () => {
                    // const tokenFactory = new ethers.ContractFactory(x.abi, x.bytecode, signer)
                    // const signer = provider.getSigner(1)
                    // const zapMedia = new ZapMedia(31337, signer);
                    // // await zapMedia.mint(mediaData(), bidShares);
                    // console.log(provider.prepareRequest("hardhat_reset", []))
                });
            });
        });
    });
});
