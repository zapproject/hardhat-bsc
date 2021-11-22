import { ethers, upgrades } from "hardhat";
import { BigNumber, Event } from 'ethers';
import { getImplementationAddress } from '@openzeppelin/upgrades-core';
import { MediaFactory, ZapMedia, ZapVault } from "../typechain";
import hre from 'hardhat';

async function main() {

    // Deployed ZapToken on Rinkeby
    const rinkebyAddress = '0x5877451904f0484cc49DAFdfb8f9b33C8C31Ee2F';

    // Deployed ZapToken on BSC Testnet
    const bscTestAddress = '0x09d8AF358636D9BCC9a3e177B66EB30381a4b1a8';

    // ABI for ZapMedia
    const zapMediaABI = require('../artifacts/contracts/nft/ZapMedia.sol/ZapMedia.json').abi;

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

    // ************************************************************** //
    // deploy Zap Vault
    // ************************************************************** //

    const zapVaultFactory = await ethers.getContractFactory("ZapVault", signers[0]);

    const zapVault = await upgrades.deployProxy(
        zapVaultFactory,
        [tokenAddress],
        { initializer: 'initializeVault' }
    ) as ZapVault;

    await zapVault.deployed();
    console.log("ZapVault deployed to:", zapVault.address);

    // ************************************************************** //
    // deploy ZapMarket
    // ************************************************************** //

    const ZapMarket = await ethers.getContractFactory('ZapMarket', signers[0]);

    const zapMarket = await upgrades.deployProxy(
        ZapMarket,
        [zapVault.address],
        { initializer: 'initializeMarket' }
    );

    await zapMarket.deployed();
    console.log('ZapMarket deployed to:', zapMarket.address);

    // set Fee for the platform
    await zapMarket.setFee(platformFee);
    console.log("Platform fee set for ZapMarket")

    // ************************************************************** //
    // deploy ZapMedia Implementation Contract
    // ************************************************************** //

    const mediaImplementation = await ethers.getContractFactory('ZapMedia');

    const zapMediaImplementation: ZapMedia = (await mediaImplementation.deploy()) as ZapMedia;
    await zapMediaImplementation.deployed();

    console.log("zapMediaImplementation:", zapMediaImplementation.address);

    // ************************************************************** //
    // deploy MediaFactory
    // ************************************************************** //

    const MediaFactory = await ethers.getContractFactory("MediaFactory", signers[0]);

    const mediaFactory = await upgrades.deployProxy(
        MediaFactory,
        [zapMarket.address, zapMediaImplementation.address],
        { initializer: 'initialize' }
    ) as MediaFactory;

    // set mediaFactory address to ZapMarket
    await zapMarket.setMediaFactory(mediaFactory.address);
    console.log("MediaFactory set to ZapMarket");

    await mediaFactory.deployed();
    console.log('MediaFactory deployed to:', mediaFactory.address);

    const tx = await mediaFactory.connect(signers[0]).deployMedia(
        name,
        symbol,
        zapMarket.address,
        true,
        contractURI
    );

    const receipt = await tx.wait();

    console.log(receipt)

    // Creates the instance of ZapMedia
    // const zapMedia = new ethers.Contract(
    //     '0x314D0A56B2bd8229a18A3B9f0875E4fE7A963375',
    //     zapMediaABI,
    //     signers[0]) as ZapMedia;

    // await zapMedia.claimTransferOwnership()

    // await zapMedia.deployed();
    // console.log("ZapMedia deployed to:", zapMedia.address)

    // ************************************************************** //
    // deploy AuctionHouse
    // ************************************************************** //

    // const AuctionHouse = await ethers.getContractFactory('AuctionHouse', signers[0]);
    // const auctionHouse = await upgrades.deployProxy(AuctionHouse,
    //     [tokenAddress, zapMarket.address],
    //     { initializer: 'initialize' }
    // );
    // await auctionHouse.deployed();
    // console.log('AuctionHouse deployed to:', auctionHouse.address);

}

main()
    .then(() =>
        process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });