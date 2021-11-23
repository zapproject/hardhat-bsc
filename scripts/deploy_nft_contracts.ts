import { ethers, upgrades } from "hardhat";
import { BigNumber, Event } from 'ethers';
import { getImplementationAddress } from '@openzeppelin/upgrades-core';
import { MediaFactory, ZapMedia, ZapVault } from "../typechain";
import hre from 'hardhat';

async function main() {

    // Deployed ZapToken on Ethereum Mainnet
    const ethMainAddress = '0x6781a0f84c7e9e846dcb84a9a5bd49333067b104';

    // Deployed ZapToken on Rinkeby
    const rinkebyAddress = '0x5877451904f0484cc49DAFdfb8f9b33C8C31Ee2F';

    // Deployed ZapToken on BSC Testnet
    const bscTestAddress = '0x09d8AF358636D9BCC9a3e177B66EB30381a4b1a8';

    // Deployed ZapToken on BSC Mainnet
    const bscMainAddress = '0xC5326b32E8BaEF125AcD68f8bC646fD646104F1c';

    // ABI for ZapMedia
    const zapMediaABI = require('../artifacts/contracts/nft/ZapMedia.sol/ZapMedia.json').abi;

    // Collection name
    const name = 'Zap Collection';

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

        // Ethereum mainnet deployment
        case 1:
            tokenAddress = ethMainAddress
            symbol = 'ZAP'
            contractURI = 'https://bafybeiev76hwk2gu7xmy5h3dn2f6iquxkhu4dhwpjgmt6ookrn6ykbtfi4.ipfs.dweb.link/mainnet'
            console.log("Ethereum Mainnet")
            break;

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

        // BSC Mainnet Deployment
        case 56:
            tokenAddress = bscMainAddress
            symbol = "ZAP"
            contractURI = 'https://bafybeiev76hwk2gu7xmy5h3dn2f6iquxkhu4dhwpjgmt6ookrn6ykbtfi4.ipfs.dweb.link/bsc'
            console.log("BSC MAINNET")
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

    // const zapVaultFactory = await ethers.getContractFactory("ZapVault", signers[0]);

    // const zapVault = await upgrades.deployProxy(
    //     zapVaultFactory,
    //     [tokenAddress],
    //     { initializer: 'initializeVault' }
    // ) as ZapVault;

    // await zapVault.deployed();
    // console.log("ZapVault deployed to:", zapVault.address);

    // ************************************************************** //
    // deploy ZapMarket
    // ************************************************************** //

    // const ZapMarket = await ethers.getContractFactory('ZapMarket', signers[0]);

    // const zapMarket = await upgrades.deployProxy(
    //     ZapMarket,
    //     [zapVault.address],
    //     { initializer: 'initializeMarket' }
    // );

    // await zapMarket.deployed();
    // console.log('ZapMarket deployed to:', zapMarket.address);

    const ZapMarket = await ethers.getContractFactory("ZapMarket");
    const zapMarket = await ZapMarket.attach('0x220a4Ef4F308f270927268DCA90800EA8F96D046');

    // const setFeeGas = await zapMarket.estimateGas.setFee(platformFee);

    // set Fee for the platform
    // await zapMarket.setFee(platformFee, { gasLimit: 500000 });
    // console.log("Platform fee set for ZapMarket")

    // ************************************************************** //
    // deploy AuctionHouse
    // ************************************************************** //

    // const AuctionHouse = await ethers.getContractFactory('AuctionHouse', signers[0]);
    // const auctionHouse = await upgrades.deployProxy(AuctionHouse,
    //     [tokenAddress, '0x220a4Ef4F308f270927268DCA90800EA8F96D046'],
    //     { initializer: 'initialize' }
    // );
    // await auctionHouse.deployed();
    // console.log('AuctionHouse deployed to:', auctionHouse.address);

    // ************************************************************** //
    // deploy ZapMedia Implementation Contract
    // ************************************************************** //

    // const mediaImplementation = await ethers.getContractFactory('ZapMedia');

    // const zapMediaImplementation: ZapMedia = (await mediaImplementation.deploy()) as ZapMedia;
    // await zapMediaImplementation.deployed();

    // console.log("zapMediaImplementation:", zapMediaImplementation.address);

    // ************************************************************** //
    // deploy MediaFactory
    // ************************************************************** //

    // const MediaFactory = await ethers.getContractFactory("MediaFactory", signers[0]);

    // const mediaFactory = await upgrades.deployProxy(
    //     MediaFactory,
    //     ['0x220a4ef4f308f270927268dca90800ea8f96d046', zapMediaImplementation.address],
    //     { initializer: 'initialize' }
    // ) as MediaFactory;


    // Gas estimation for setMediaFactory()
    const setMediaGas = await zapMarket.estimateGas.setMediaFactory('0xB9Ba7f46AaaC2b2c0D145779578B2d7E9302e869');

    // set mediaFactory address to ZapMarket
    await zapMarket.setMediaFactory('0xB9Ba7f46AaaC2b2c0D145779578B2d7E9302e869', { gasLimit: setMediaGas });
    console.log("MediaFactory set to ZapMarket");

    // await mediaFactory.deployed();
    // console.log('MediaFactory deployed to:', mediaFactory.address);

    // const tx = await mediaFactory.connect(signers[0]).deployMedia(
    //     name,
    //     symbol,
    //     zapMarket.address,
    //     true,
    //     contractURI
    // );

    // const receipt = await tx.wait();
    // const mediaDeployedEvents = receipt.events as Event[];
    // const mediaDeployedEvent = mediaDeployedEvents.slice(-1);
    // const zapMediaAddress = mediaDeployedEvent[0].args?.mediaContract;

    // const zapMedia = new ethers.Contract(zapMediaAddress, zapMediaABI, signers[0]) as ZapMedia;
    // await zapMedia.deployed();

    // console.log("ZapMedia deployed to:", zapMedia.address);

    // const transferGas = await zapMedia.estimateGas.claimTransferOwnership();
    // await zapMedia.claimTransferOwnership({ gasLimit: transferGas });

}

main()
    .then(() =>
        process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });