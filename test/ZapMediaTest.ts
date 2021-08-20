import { deployments, ethers } from "hardhat"

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';

import { ZapTokenBSC } from '../typechain/ZapTokenBSC';

chai.use(solidity);
  

describe("ZapMedia Test", async () => {

    let zapMarket: any
    let zapMedia1: any
    let zapMedia2: any
    let zapTokenBsc: any
    let signers: any

    let bidShares = {

        prevOwner: {
            value: BigInt(10000000000000000000)
        },
        owner: {
            value: BigInt(80000000000000000000)
        },
        creator: {
            value: BigInt(10000000000000000000)
        },
    };

    let invalidBidShares = {

        prevOwner: {
            value: BigInt(90000000000000000000)
        },
        owner: {
            value: BigInt(79000000000000000000)
        },
        creator: {
            value: BigInt(90000000000000000000)
        },
    };

    let ask = {
        amount: 100,
        currency: '',
        sellOnShare: 0
    };

    let tokenURI: any;
    let metadataURI: any;
    let metadataHex: any;
    let metadataHash: any;
    let metadataHashBytes: any;
    let contentHex: any;
    let contentHash: any;
    let contentHashBytes: any;
    let zeroContentHashBytes: any;
    let mediaData: any;

    describe("Configure", () => {

        beforeEach(async () => {

            signers = await ethers.getSigners()

            const marketFixture = await deployments.fixture(['ZapMarket'])

            zapMarket = await ethers.getContractAt("ZapMarket", marketFixture.ZapMarket.address)


            const mediaFactory = await ethers.getContractFactory("ZapMedia", signers[1]);

            zapMedia1 = (await mediaFactory.deploy("TEST MEDIA 1", "TM1", zapMarket.address))

            await zapMedia1.deployed();

            const mediaFactory2 = await ethers.getContractFactory("ZapMedia", signers[2]);

            zapMedia2 = (await mediaFactory2.deploy("TEST MEDIA 2", "TM2", zapMarket.address))

            await zapMedia2.deployed();

            const zapTokenFactory = await ethers.getContractFactory(
                'ZapTokenBSC',
                signers[0]
            );

            zapTokenBsc = (await zapTokenFactory.deploy()) as ZapTokenBSC;
            await zapTokenBsc.deployed();

            ask.currency = zapTokenBsc.address

        });

        it.only('Should get media owner', async () => {

            const zapMedia1Address = await zapMarket.mediaContract(zapMedia1.address);

            const zapMedia2Address = await zapMarket.mediaContract(zapMedia2.address);

            expect(await zapMedia1Address).to.equal(signers[1].address);

            expect(await zapMedia2Address).to.equal(signers[2].address);


        });

        it.only('Should reject if called twice', async () => {

            await expect(zapMarket.configure(signers[1].address))
                .to.be.revertedWith("Market: Already configured");

            await expect(zapMarket.configure(signers[2].address))
                .to.be.revertedWith("Market: Already configured");

            expect(await zapMarket.isConfigured(signers[1].address)).to.be.true

            expect(await zapMarket.isConfigured(signers[2].address)).to.be.true

        });
    });

    describe('#mint', () => {
        beforeEach(async () => {
            tokenURI =  String('media contract 1 - token 1 uri');
            metadataURI = String('media contract 1 - metadata 1 uri');

            metadataHex = ethers.utils.formatBytes32String('{}');
            metadataHash = await ethers.utils.sha256(metadataHex);
            metadataHashBytes = ethers.utils.arrayify(metadataHash);
        
            contentHex = ethers.utils.formatBytes32String('invert');
            contentHash = await ethers.utils.sha256(contentHex);
            contentHashBytes = ethers.utils.arrayify(contentHash);

            zeroContentHashBytes = ethers.utils.arrayify(ethers.constants.HashZero);
        
            mediaData = {
                tokenURI,
                metadataURI,
                contentHash: contentHashBytes,
                metadataHash: metadataHashBytes,
            };
        });

        it.only('should mint token', async () => {
            await zapMedia1.mint(mediaData, bidShares);

            const ownerOf = await zapMedia1.ownerOf(0);
            const creator = await zapMedia1.tokenCreators(0);
            const prevOwner = await zapMedia1.previousTokenOwners(0);
            const tokenContentHash = await zapMedia1.tokenContentHashes(0);
            const metadataContentHash = await zapMedia1.tokenMetadataHashes(0);
            const savedTokenURI = await zapMedia1.tokenURI(0);
            const savedMetadataURI = await zapMedia1.tokenMetadataURI(0);
      
            expect(ownerOf).eq(signers[1].address);
            expect(creator).eq(signers[1].address);
            expect(prevOwner).eq(signers[1].address);
            expect(tokenContentHash).eq(contentHash);
            expect(metadataContentHash).eq(metadataHash);
            expect(savedTokenURI).eq(tokenURI);
            expect(savedMetadataURI).eq(metadataURI);
        });

        it.only('should revert if an empty content hash is specified', async () => {      
            await expect(
                zapMedia1.mint(
                    {...mediaData, contentHash: zeroContentHashBytes}, bidShares
                )
            ).revertedWith('Media: content hash must be non-zero');
        });
    
        it.only('should revert if the content hash already exists for a created token', async () => {
            await zapMedia2.mint(mediaData, bidShares);
        
            await expect(
                zapMedia2.mint(mediaData, bidShares)
            ).revertedWith('Media: a token has already been created with this content hash');
        });
      
        it.only('should revert if the metadataHash is empty', async () => {
            const secondContentHex = ethers.utils.formatBytes32String('invert2');
            const secondContentHash = await ethers.utils.sha256(secondContentHex);

            await expect(
                zapMedia1.mint(
                    {...mediaData, contentHash: secondContentHash, metadataHash: zeroContentHashBytes},
                    bidShares
                )
            ).revertedWith('Media: metadata hash must be non-zero');
        });
    
        it.only('should revert if the tokenURI is empty', async () => {
            await expect(
                zapMedia1.mint({...mediaData, tokenURI: ''}, bidShares)
            ).revertedWith('Media: specified uri must be non-empty');
        });
    
        it.only('should revert if the metadataURI is empty', async () => {
            await expect(
                zapMedia1.mint({...mediaData, metadataURI: ''}, bidShares)
            ).revertedWith('Media: specified uri must be non-empty');
        });
    
        // it.only('should not be able to mint a token with bid shares summing to less than 100', async () => {
        //     await expect(
        //         zapMedia1.mint(mediaData, {...bidShares, creator: {
        //             value: BigInt(50000000000000000000)
        //         }})
        //     ).revertedWith('Market: Invalid bid shares, must sum to 100');
        // });
    });

    describe('#mintWithSig', () => {
        let sig: any;

        beforeEach(async () => {
            tokenURI =  String('media contract 1 - token 1 uri');
            metadataURI = String('media contract 1 - metadata 1 uri');

            metadataHex = ethers.utils.formatBytes32String('{}');
            metadataHash = await ethers.utils.sha256(metadataHex);
            metadataHashBytes = ethers.utils.arrayify(metadataHash);

            contentHex = ethers.utils.formatBytes32String('invert');
            contentHash = await ethers.utils.sha256(contentHex);
            contentHashBytes = ethers.utils.arrayify(contentHash);

            zeroContentHashBytes = ethers.utils.arrayify(ethers.constants.HashZero);

            mediaData = {
                tokenURI,
                metadataURI,
                contentHash: contentHashBytes,
                metadataHash: metadataHashBytes,
            };

            let nonce = (await zapMedia1.mintWithSigNonces(signers[1].address)).toNumber();
            const deadline = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24; // 24 hours
            const name = await zapMedia1.name();

            const chainId = 1;
            const creatorShare = BigInt(50000000000000000000).valueOf().toString();
            const domain = {
                name,
                version: '1',
                chainId,
                verifyingContract: zapMedia1.address,
            };
            const types = {
                // primaryType: 'MintWithSig',
                // EIP712Domain: [
                //     { name: 'name', type: 'string' },
                //     { name: 'version', type: 'string' },
                //     { name: 'chainId', type: 'uint256' },
                //     { name: 'verifyingContract', type: 'address' },
                // ],
                MintWithSig: [
                    { name: 'contentHash', type: 'bytes32' },
                    { name: 'metadataHash', type: 'bytes32' },
                    { name: 'creatorShare', type: 'uint256' },
                    { name: 'nonce', type: 'uint256' },
                    { name: 'deadline', type: 'uint256' },
                ],
            };
            const value = {
                contentHash,
                metadataHash,
                creatorShare,
                nonce,
                deadline,
            };
            sig = await signers[1]._signTypedData(
                domain,
                types,
                value
                // primaryType: 'MintWithSig',
            );
            console.log(creatorShare, sig);
        });

        it.only('test', async () => {
            await zapMedia1.mintWithSig(signers[1].address, mediaData, bidShares, sig);
        });
    });
});