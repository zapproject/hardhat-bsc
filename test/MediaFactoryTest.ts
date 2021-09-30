import { ethers, upgrades } from 'hardhat';

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';

import { MediaFactory, ZapMarket, ZapVault, ZapTokenBSC, } from '../typechain';

chai.use(solidity);

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

    describe('Initializer', () => {

        let zapTokenBsc: ZapTokenBSC;
        let zapVault: ZapVault;
        let zapMarket: ZapMarket;
        let mediaFactory: MediaFactory;

        beforeEach(async () => {

            zapTokenBsc = await deployToken();
            zapVault = await deployVault(zapTokenBsc.address);
            zapMarket = await deployMarket(zapVault.address);
            mediaFactory = await deployMediaFactory(zapMarket.address);

        });

        it('Should be able to deploy a new Media contract', async () => {

            const media1 = await mediaFactory.deployMedia(
                'TEST MEDIA 1',
                'TM1',
                zapMarket.address,
                true,
                'https://ipfs.moralis.io:2053/ipfs/QmeWPdpXmNP4UF9Urxyrp7NQZ9unaHfE2d43fbuur6hWWV'
            );

        });
    })
})