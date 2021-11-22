import { ethers, upgrades } from "hardhat";
import { BigNumber, Event } from 'ethers';
import { getImplementationAddress } from '@openzeppelin/upgrades-core';
import { MediaFactory, ZapMedia } from "../typechain";
import hre from 'hardhat';

async function main() {

    // Deployed ZapToken on Rinkeby
    const rinkebyAddress = '0x5877451904f0484cc49DAFdfb8f9b33C8C31Ee2F';

    // Deployed ZapToken on BSC Testnet
    const bscTestAddress = '0x09d8AF358636D9BCC9a3e177B66EB30381a4b1a8';

    // Collection name
    const name = 'ZapMedia';

    // Will store the ZapToken address depending on the network
    let tokenAddress = '';

    // Will store the ZapToken address if localhost deployment is detected
    let localhostAddress = '';

    // Will store the symbol depending on the network
    let symbol = '';

    // Will store the contractURI depending on the network
    let contractURI = '';

    try {

        localhostAddress = (await hre.deployments.get('ZapTokenBSC')).address;

    } catch (err) {

        console.log("Localhost ZapTokenBSC deployment not detected")

    }

    // Gets the chainID of the network the contracts are deploying to
    const chainId = await (await ethers.provider.getNetwork()).chainId;

    switch (chainId) {

        // Localhost deployment
        case 31337:
            tokenAddress = localhostAddress
            symbol = "ZAPLCL";
            contractURI = 'https://bafybeiev76hwk2gu7xmy5h3dn2f6iquxkhu4dhwpjgmt6ookrn6ykbtfi4.ipfs.dweb.link/'
            console.log("Localhost")
            break;

        // Rinkeby deployment
        case 4:
            tokenAddress = rinkebyAddress;
            symbol = "ZAPRKBY"
            contractURI = 'https://bafybeiev76hwk2gu7xmy5h3dn2f6iquxkhu4dhwpjgmt6ookrn6ykbtfi4.ipfs.dweb.link/rinkeby';
            console.log("Rinkeby");
            break;

        // BSC Testnet deployment
        case 97:
            tokenAddress = bscTestAddress
            symbol = "ZAPBSC"
            contractURI = 'https://bafybeiev76hwk2gu7xmy5h3dn2f6iquxkhu4dhwpjgmt6ookrn6ykbtfi4.ipfs.dweb.link/bscTest'
            console.log("BSC TESTNET");
            break;
    }

    const signers = await ethers.getSigners();

    // Sets the fee at to 5%
    const platformFee = {
        fee: {
            value: BigNumber.from('5000000000000000000')
        },
    };

    // Deploy ZapVault
    const ZapVault = await ethers.getContractFactory("ZapVault", signers[0]);
    const zapVault = await upgrades.deployProxy(
        ZapVault,
        [tokenAddress],
        { initializer: 'initializeVault' }
    );
    await zapVault.deployed();
    console.log("ZapVault deployed to:", zapVault.address);

    // Deploy ZapMarket
    const ZapMarket = await ethers.getContractFactory('ZapMarket', signers[0]);
    const zapMarket = await upgrades.deployProxy(
        ZapMarket,
        [zapVault.address],
        { initializer: 'initializeMarket' }
    );
    await zapMarket.deployed();
    console.log('ZapMarket deployed to:', zapMarket.address);

    // Gas estimation for setFee()
    const setFeeGas = await zapMarket.estimateGas.setFee(platformFee);

    // Sets the platform fee
    await zapMarket.setFee(platformFee, { gasLimit: setFeeGas });

    // Deploys the Media Interface
    const unInitMediaFactory = await ethers.getContractFactory("ZapMedia");
    const unInitMedia = (await unInitMediaFactory.deploy()) as ZapMedia;
    await unInitMedia.deployed();
    console.log("Media Interface deployed to:", unInitMedia.address);

    // Deploys the MediaFactory
    const MediaFactory = await ethers.getContractFactory("MediaFactory", signers[0]);
    const mediaFactory = await upgrades.deployProxy(
        MediaFactory,
        [zapMarket.address, unInitMedia.address],
        { initializer: 'initialize' }
    ) as MediaFactory;

    await mediaFactory.deployed();
    console.log('MediaFactory deployed to:', mediaFactory.address);

    // Gas estimation for setMediaFactory()
    const setFactoryGas = await zapMarket.estimateGas.setMediaFactory(mediaFactory.address)

    await zapMarket.setMediaFactory(mediaFactory.address, { gasLimit: setFactoryGas });
    console.log("MediaFactory set to ZapMarket");

    // Gas estimation for deployMedia()
    const deployMediaGas = await mediaFactory.estimateGas.deployMedia(
        name,
        symbol,
        zapMarket.address,
        true,
        contractURI
    );

    // Deploys ZapMedia
    await mediaFactory.deployMedia(
        name,
        symbol,
        zapMarket.address,
        true,
        contractURI,
        { gasLimit: deployMediaGas }
    );

    // Filter for MediaDeployed event
    const mediaDeployedFilter = mediaFactory.filters.MediaDeployed(null);

    // Query for the MediaDepoyed event
    const mediaDeployedEvent: Event = (await mediaFactory.queryFilter(mediaDeployedFilter))[0];

    // Deployed media address from the MediaDeployed event
    const zapMediaAddress = mediaDeployedEvent.args?.mediaContract;

    // ABI for ZapMedia
    const zapMediaABI = require('../artifacts/contracts/nft/ZapMedia.sol/ZapMedia.json').abi;

    // Creates the instance of ZapMedia
    const zapMedia = new ethers.Contract(zapMediaAddress, zapMediaABI, signers[0]) as ZapMedia;
    await zapMedia.deployed();

    // Gas estimation for claimTransferOwnership()
    const claimGas = await zapMedia.estimateGas.claimTransferOwnership();
    await zapMedia.connect(signers[0]).claimTransferOwnership({ gasLimit: claimGas });

    console.log('ZapMedia ownership claimed by', signers[0].address)
    console.log('ZapMedia deployed to:', zapMedia.address);

    // Deployes AuctionHouse
    const AuctionHouse = await ethers.getContractFactory('AuctionHouse', signers[0]);
    const auctionHouse = await upgrades.deployProxy(AuctionHouse,
        [tokenAddress, zapMarket.address],
        { initializer: 'initialize' }
    );
    await auctionHouse.deployed();
    console.log('AuctionHouse deployed to:', auctionHouse.address);

}

main()
    .then(() =>
        process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });