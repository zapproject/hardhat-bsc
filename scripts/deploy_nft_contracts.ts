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

    // Will store the ZapToken address depending on the network
    let tokenAddress = '';
    let localhostAddress = '';
    let symbol: string;
    let contractURI: string;

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
            symbol = "ZAPLCL"
            console.log("Localhost")
            break;

        // Rinkeby deployment
        case 4:
            tokenAddress = rinkebyAddress;
            symbol = "ZAPRKBY"
            console.log("Rinkeby");
            break;

        // BSC Testnet deployment
        case 97:
            tokenAddress = bscTestAddress
            symbol = "ZAPBSC"
            console.log("BSC TESTNET");
            break;
    }

    const signers = await ethers.getSigners();

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
    const zapVaultImplAddress = await getImplementationAddress(ethers.provider, zapVault.address);
    console.log("ZapVault implementation:", zapVaultImplAddress);

    // Deploy ZapMarket
    const ZapMarket = await ethers.getContractFactory('ZapMarket', signers[0]);
    const zapMarket = await upgrades.deployProxy(
        ZapMarket,
        [zapVault.address],
        { initializer: 'initializeMarket' }
    );
    await zapMarket.deployed();
    console.log('ZapMarket deployed to:', zapMarket.address);
    const zapMarketImplAddress = await getImplementationAddress(ethers.provider, zapMarket.address);
    console.log("ZapMarket implementation:", zapMarketImplAddress);

    // Sets the platform fee
    await zapMarket.setFee(platformFee);

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
    await zapMarket.setMediaFactory(mediaFactory.address);
    console.log("MediaFactory set to ZapMarket");
    const factoryImplAddress = await getImplementationAddress(ethers.provider, mediaFactory.address);
    console.log("MediaFactory implementation:", factoryImplAddress);

    await mediaFactory.deployMedia(
        "ZapMedia",
        "ZAPBSC",
        zapMarket.address,
        true,
        'https://ipfs.moralis.io:2053/ipfs/Qmb6X5bYB3J6jq9JPmd5FLx4fa4JviXfV11yN42i96Q5Xt'
    );
    // const mediaDeployedFilter = mediaFactory.filters.MediaDeployed(null);
    // const mediaDeployedEvent: Event = (await mediaFactory.queryFilter(mediaDeployedFilter))[0];
    // const zapMediaAddress = mediaDeployedEvent.args?.mediaContract;
    // const zapMediaABI = require('../artifacts/contracts/nft/ZapMedia.sol/ZapMedia.json').abi;
    // const zapMedia = new ethers.Contract(zapMediaAddress, zapMediaABI, signers[0]) as ZapMedia;
    // await zapMedia.deployed();
    // await zapMedia.connect(signers[0]).claimTransferOwnership();

    // console.log('ZapMedia deployed to:', zapMedia.address);
    // const mediaImplAddress = await getImplementationAddress(ethers.provider, zapMedia.address);
    // console.log("ZapMedia implementation:", mediaImplAddress);

    // const AuctionHouse = await ethers.getContractFactory('AuctionHouse', signers[0]);
    // const auctionHouse = await upgrades.deployProxy(AuctionHouse,
    //     [tokenAddress, zapMarket.address],
    //     { initializer: 'initialize' }
    // );
    // await auctionHouse.deployed();
    // console.log('AuctionHouse deployed to:', auctionHouse.address);
    // const auctionImplAddress = await getImplementationAddress(ethers.provider, auctionHouse.address);
    // console.log("AuctionHouse implementation:", auctionImplAddress);

}

main()
    .then(() =>
        process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });