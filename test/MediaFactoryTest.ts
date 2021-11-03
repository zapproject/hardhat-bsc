import { ethers, upgrades } from 'hardhat';

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';

import { MediaFactory, ZapMarket, ZapVault, ZapTokenBSC, ZapMedia, AuctionHouse } from '../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Event } from '@ethersproject/contracts';
import { BigNumber, BigNumberish } from "ethers";
import { sha256 } from "ethers/lib/utils"

chai.use(solidity);

const zmABI = require("../artifacts/contracts/nft/ZapMedia.sol/ZapMedia.json").abi;

describe("MediaFactory", () => {

    async function deployToken(): Promise<ZapTokenBSC> {

        const ZapTokenBSC = await ethers.getContractFactory("ZapTokenBSC");

        const zapTokenBsc = await ZapTokenBSC.deploy();

        return zapTokenBsc as ZapTokenBSC;

    }

    async function deployVault(tokenAddress: string): Promise<ZapVault> {

        const ZapVault = await ethers.getContractFactory("ZapVault");

        const zapVault = (await upgrades.deployProxy(
            ZapVault,
            [tokenAddress],
            { initializer: 'initializeVault' }
        ));

        return zapVault as ZapVault;
    }

    async function deployMarket(vaultAddress: string): Promise<ZapMarket> {

        const MarketFactory = await ethers.getContractFactory("ZapMarket");

        const zapMarket = (await upgrades.deployProxy(
            MarketFactory,
            [vaultAddress],
            { initializer: 'initializeMarket' }
        ));

        return zapMarket as ZapMarket;
    }

    async function deployMediaFactory(marketAddress: string): Promise<MediaFactory> {

        const MediaFactory = await ethers.getContractFactory("MediaFactory");

        const mediaFactory = (await upgrades.deployProxy(
            MediaFactory,
            [marketAddress],
            { initializer: 'initialize' }
        ));

        return mediaFactory as MediaFactory;
    }

    async function deployAuction(signer: SignerWithAddress, currency: string, market: string) {
        const ahFact = await ethers.getContractFactory("AuctionHouse", signer);

        const auctionHouse = await upgrades.deployProxy(ahFact, [currency, market], { initializer: 'initialize' }) as AuctionHouse;

        return auctionHouse as AuctionHouse;
    }

    async function mintFrom(media: ZapMedia) {
        const metadataHex = ethers.utils.formatBytes32String("{}");
        const metadataHash = await sha256(metadataHex);
        const hash = ethers.utils.arrayify(metadataHash);

        const signers = await ethers.getSigners();

        let collaborators = {
          collaboratorTwo: signers[10].address,
          collaboratorThree: signers[11].address,
          collaboratorFour: signers[12].address
        }

        await media.mint(
          {
            tokenURI: "zap.co",
            metadataURI: "zap.co",
            contentHash: hash,
            metadataHash: hash,
          },
          {
            collaborators: [
              signers[10].address,
              signers[11].address,
              signers[12].address
            ],
            collabShares: [
              BigNumber.from('15000000000000000000'),
              BigNumber.from('15000000000000000000'),
              BigNumber.from('15000000000000000000')
            ]
            ,
            creator: {
              value: BigNumber.from('15000000000000000000')
            },
            owner: {
              value: BigNumber.from('35000000000000000000')
            },
          }
        );
      };

    async function createAuction(
        media: string,
        auctionHouse: AuctionHouse,
        curator: string,
        currency: string,
        duration?: number,
        token?: BigNumberish
      ) {
        if(!token) token = 0;
        if(!duration) duration = 60 * 60 * 24;

        const reservePrice = BigNumber.from(10).pow(18).div(2);

        await auctionHouse.createAuction(
          token,
          media,
          duration,
          reservePrice,
          curator,
          5,
          currency
        );
      }

    let zapTokenBsc: ZapTokenBSC;
    let zapVault: ZapVault;
    let zapMarket: ZapMarket;
    let mediaFactory: MediaFactory;

    let deployer: SignerWithAddress;
    let mediaOwner: SignerWithAddress;
    let badActor: SignerWithAddress;

    let mediaAddress: string;

    beforeEach(async () => {

        zapTokenBsc = await deployToken();
        zapVault = await deployVault(zapTokenBsc.address);
        zapMarket = await deployMarket(zapVault.address);
        mediaFactory = await deployMediaFactory(zapMarket.address);

        await zapMarket.setMediaFactory(mediaFactory.address);

        [ deployer, mediaOwner, badActor ] = await ethers.getSigners();

        await mediaFactory.connect(mediaOwner).deployMedia(
            'TEST MEDIA 1',
            'TM1',
            zapMarket.address,
            true,
            'https://ipfs.moralis.io:2053/ipfs/QmeWPdpXmNP4UF9Urxyrp7NQZ9unaHfE2d43fbuur6hWWV'
        );

        const deployedFilter = mediaFactory.filters.MediaDeployed(null);
        const eventLog: Event = (await mediaFactory.queryFilter(deployedFilter))[0];

        mediaAddress = eventLog.args?.mediaContract;
    });

    describe('Initializer', () => {

        it('Should be able to deploy a new Media contract', async () => {
            const zapMedia = new ethers.Contract(mediaAddress, zmABI, mediaOwner) as ZapMedia;

            expect(await zapMedia.getTokenCreators(0)).to.be.eq(ethers.constants.AddressZero);
        });
    });

    describe("Registration", function () {
        it("should register media contract on deployment", async () => {
            expect(await zapMarket.isRegistered(mediaAddress)).to.be.true;
        });

        it("should reject an registered media contracts", async () => {
            const badMediaFactory = await ethers.getContractFactory("ZapMedia", badActor);
            const badMedia = await upgrades.deployProxy(
                badMediaFactory,
                [
                    'Bad MEDIA 1',
                    'BM1',
                    zapMarket.address,
                    false,
                    'https://ipfs.moralis.io:2053/ipfs/QmeWP0pXmNPoUF9Urxyrp7NQZ9unaHEE2d43fbuur6hWWV'
                ],
                { initializer: 'initialize' }
            ) as ZapMedia;

            expect(await zapMarket.isRegistered(badMedia.address)).to.be.false;
        });
    });

    describe("AuctionHouse", function () {
        let auctionHouse: AuctionHouse;
        let zapMedia: ZapMedia;
        let badMedia: ZapMedia;

        beforeEach(async () => {
            auctionHouse = await deployAuction(deployer, zapTokenBsc.address, zapMarket.address);
            zapMedia = new ethers.Contract(mediaAddress, zmABI, mediaOwner) as ZapMedia;
            
            const platformFee = {
                fee: {
                    value: BigNumber.from('5000000000000000000')
                },
            };
            await zapMarket.setFee(platformFee);
        });

        it("Should not allow a unregistered media contract to create an auction", async () => {
            const badMediaFactory = await ethers.getContractFactory("ZapMedia", badActor);
            badMedia = await upgrades.deployProxy(
                badMediaFactory,
                [
                    'Bad MEDIA 1',
                    'BM1',
                    zapMarket.address,
                    false,
                    'https://ipfs.moralis.io:2053/ipfs/QmeWP0pXmNPoUF9Urxyrp7NQZ9unaHEE2d43fbuur6hWWV'
                ],
                { initializer: 'initialize' }
            ) as ZapMedia;
            await mintFrom(badMedia);

            const token = 0;
            const duration = 60 * 60 * 24;
            const reservePrice = BigNumber.from(10).pow(18).div(2);

            await expect (auctionHouse.createAuction(
                token,
                badMedia.address,
                duration,
                reservePrice,
                badActor.address,
                5,
                zapTokenBsc.address
            )).to.be.revertedWith("Media contract is not registered with the marketplace");
        });

        it("Should create an auction for a registered media contract", async () => {
            await mintFrom(zapMedia);

            await zapMedia.approve(auctionHouse.address, 0);

            await createAuction(zapMedia.address, auctionHouse.connect(mediaOwner), mediaOwner.address, zapTokenBsc.address);

            const createdfilter = auctionHouse.filters.AuctionCreated(
                null, null, null,
                null, null, null,
                null, null, null
            );

            const eventLog =  (await auctionHouse.queryFilter(createdfilter))[0];

            expect(eventLog.args?.tokenId).to.be.      eq(0);
            expect(eventLog.args?.auctionId).to.be.    eq(0);
            expect(eventLog.args?.mediaContract).to.be.eq(zapMedia.address);
            expect(eventLog.args?.curator).to.be.      eq(mediaOwner.address);
            expect(eventLog.args?.tokenOwner).to.be.   eq(mediaOwner.address);
        });
    })
});
