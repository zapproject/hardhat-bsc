import { ethers, upgrades, deployments, getNamedAccounts, } from 'hardhat';

import { BigNumber, ContractFactory } from 'ethers';

import { ZapMarket, ZapMedia, ZapVault, ZapMarketV2, NewProxyAdmin, MediaFactory, ZapTokenBSC, ExternalMedia } from '../typechain';

import { getProxyAdminFactory } from '@openzeppelin/hardhat-upgrades/dist/utils';

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';
import { sign } from 'crypto';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { Creature } from '../typechain/Creature';
import { MockProxyRegistry } from '../typechain/MockProxyRegistry';




describe("Testing", () => {

    let signers: SignerWithAddress[]
    let zapTokenBsc: ZapTokenBSC
    let zapVault: ZapVault
    let zapMarket: ZapMarket
    let zapMarketFactory: any
    let mediaFactory: MediaFactory
    let zapMedia: ZapMedia
    let zapMarketV2: ZapMarketV2
    let externalMedia: ExternalMedia

    const name = 'Zap Collection';
    const symbol = 'ZAP';
    const contractURI = 'https://bafybeiev76hwk2gu7xmy5h3dn2f6iquxkhu4dhwpjgmt6ookrn6ykbtfi4.ipfs.dweb.link/';

    let tokenURI = 'https://bafybeiev76hwk2gu7xmy5h3dn2f6iquxkhu4dhwpjgmt6ookrn6ykbtfi4.ipfs.dweb.link/rinkeby'
    let metadataURI = 'https://bafybeiev76hwk2gu7xmy5h3dn2f6iquxkhu4dhwpjgmt6ookrn6ykbtfi4.ipfs.dweb.link/rinkeby'

    let metadataHex = ethers.utils.formatBytes32String('Testing');
    let metadataHashRaw = ethers.utils.keccak256(metadataHex);
    let metadataHashBytes = ethers.utils.arrayify(metadataHashRaw);

    let contentHex = ethers.utils.formatBytes32String('Testing');
    let contentHashRaw = ethers.utils.keccak256(contentHex);
    let contentHashBytes = ethers.utils.arrayify(contentHashRaw);

    let contentHash = contentHashBytes;
    let metadataHash = metadataHashBytes;

    const data = {
        tokenURI,
        metadataURI,
        contentHash,
        metadataHash
    };

    let bidShares = {
        collaborators: ["", "", ""],
        collabShares: [
            BigNumber.from('15000000000000000000'),
            BigNumber.from('15000000000000000000'),
            BigNumber.from('15000000000000000000')
        ],
        creator: {
            value: BigNumber.from('15000000000000000000')
        },
        owner: {
            value: BigNumber.from('35000000000000000000')
        },
    };

    before(async () => {

        // 20 test accounts
        signers = await ethers.getSigners();

        // Gets the deployed NFT contract fixtures from the 
        await deployments.fixture();

        // Gets the ZapTokenBSC contract deployment
        const zapTokenBscFactory = await deployments.get('ZapTokenBSC');

        // Gets the ZapVault contract deployment
        const zapVaultFactory = await deployments.get('ZapVault');

        // Gets the ZapMarket contract deployment
        zapMarketFactory = await deployments.get('ZapMarket');

        // Gets the MediaFactory contract deployment
        const mediaFactoryFactory = await deployments.get('MediaFactory');

        // Gets the ZapMedia implementation deployment
        const zapMediaFactory = await deployments.get('ZapMedia');

        // Deploy NewProxyAdmin contract
        const newProxyAdminFactory = await ethers.getContractFactory("NewProxyAdmin", signers[0]);
        const newProxyAdmin = await newProxyAdminFactory.deploy() as NewProxyAdmin;
        await newProxyAdmin.deployed();

        const defaultProxyAdminDeployment = await deployments.get('DefaultProxyAdmin');

        const defaultProxyAdmin = new ethers.Contract(
            defaultProxyAdminDeployment.address,
            defaultProxyAdminDeployment.abi,
            signers[0]
        );

        zapTokenBsc = await ethers.getContractAt(
            'ZapTokenBSC',
            zapTokenBscFactory.address,
            signers[0]
        ) as ZapTokenBSC;

        zapVault = await ethers.getContractAt(
            'ZapVault',
            zapVaultFactory.address,
            signers[0]
        ) as ZapVault;

        // ZapMarket contract instance
        zapMarket = await ethers.getContractAt(
            'ZapMarket',
            zapMarketFactory.address,
            signers[0]
        ) as ZapMarket;

        // MediaFactory contract instance
        mediaFactory = await ethers.getContractAt(
            'MediaFactory',
            mediaFactoryFactory.address,
            signers[0]
        ) as MediaFactory;

        // Deploy ZapMedia
        await mediaFactory.deployMedia(
            name,
            symbol,
            zapMarket.address,
            true,
            contractURI,
        );

        // Filter for the MediaDeployed event
        const filter = mediaFactory.filters.MediaDeployed(null);

        // Query for the MediaDeployed event
        const event = (await mediaFactory.queryFilter(filter))[0];

        // Store the zapMedia address
        const mediaAddress = event.args.mediaContract;

        // ZapMedia contract instance
        zapMedia = new ethers.Contract(mediaAddress, zapMediaFactory.abi, signers[0]) as ZapMedia;

        // Sets the token collaborators
        bidShares.collaborators = [signers[1].address, signers[2].address, signers[3].address];

        // Signer[0] mints a token
        // tokenId is currently 0
        await zapMedia.mint(data, bidShares);

    })

    describe.skip("Upgradeable Initialize", () => {

        beforeEach(async () => {

            const ZapMarketV2 = await ethers.getContractFactory('ZapMarketV2', signers[0])
            const proxyAdmin = await upgrades.erc1967.getAdminAddress(zapMarketFactory.address);

            await deployments.deploy('ZapMarket', {
                from: signers[0].address,
                contract: "ZapMarketV2",
                proxy: {
                    proxyContract: 'OpenZeppelinTransparentProxy',
                },
                log: true,
            })

            zapMarketV2 = new ethers.Contract(
                zapMarketFactory.address, ZapMarketV2.interface, signers[0]
            ) as ZapMarketV2;
        })

        it("Should not be able to initialize ZapMarketV2 twice", async () => {

            await expect(zapMarketV2.initializeMarket(zapVault.address)).to.be.revertedWith(
                'Initializable: contract is already initialized'
            );
        });

        it("Should return the same owner address between ZapMarketV1 and ZapMarketV2 ", async () => {

            const ownerV1 = await zapMarket.getOwner();
            const ownerV2 = await zapMarketV2.getOwner();

            expect(ownerV1).to.be.equal(ownerV2);

        });

    })

    describe("wrap and register external NFT contract", () => {
        let owner: SignerWithAddress;
        let proxyForOwner: SignerWithAddress;

        let proxy: MockProxyRegistry;

        let osCreature: Creature;
        beforeEach(async () => {
            owner = signers[0];
            proxyForOwner = signers[8];

            const proxyFactory = await ethers.getContractFactory(
                'MockProxyRegistry',
                signers[0]
            )

            proxy = (await proxyFactory.deploy()) as MockProxyRegistry;
            await proxy.deployed();
            await proxy.setProxy(owner.address, proxyForOwner.address);


            const oscreatureFactory = await ethers.getContractFactory(
                'Creature',
                signers[0]
            )

            osCreature = (await oscreatureFactory.deploy(proxy.address)) as Creature;
            await osCreature.deployed();

            // signers[10] mints 
            await osCreature.mintTo(signers[10].address)

        });

        it("external should...", async () => {
            console.log(osCreature.address);
            console.log(osCreature.balanceOf(signers[10].address))

            const ExternalMediaFactory = await ethers.getContractFactory("ExternalMedia", signers[0])
            externalMedia = await ExternalMediaFactory.deploy() as ExternalMedia;

            await externalMedia.connect(signers[10]).enterMarketplace(osCreature.address);

            console.log(await externalMedia.connect(signers[10]).getListOfContracts());

        });
    });


});

