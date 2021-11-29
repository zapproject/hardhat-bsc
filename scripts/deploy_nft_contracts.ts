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

    // Will store the network name
    let network = '';

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
            network = "Ethereum Mainnet"
            break;

        // Localhost deployment
        case 31337:
            tokenAddress = localhostAddress
            symbol = "ZAPLCL";
            contractURI = 'https://bafybeiev76hwk2gu7xmy5h3dn2f6iquxkhu4dhwpjgmt6ookrn6ykbtfi4.ipfs.dweb.link/'
            network = "Localhost"
            break;

        // Rinkeby deployment
        case 4:
            tokenAddress = rinkebyAddress;
            symbol = "ZAPRKBY"
            contractURI = 'https://bafybeiev76hwk2gu7xmy5h3dn2f6iquxkhu4dhwpjgmt6ookrn6ykbtfi4.ipfs.dweb.link/rinkeby';
            network = "Rinkeby"
            break;

        // BSC Testnet deployment
        case 97:
            tokenAddress = bscTestAddress
            symbol = "ZAPBSC"
            contractURI = 'https://bafybeiev76hwk2gu7xmy5h3dn2f6iquxkhu4dhwpjgmt6ookrn6ykbtfi4.ipfs.dweb.link/bscTest'
            network = "BSC TESTNET"
            break;

        // BSC Mainnet Deployment
        case 56:
            tokenAddress = bscMainAddress
            symbol = "ZAP"
            contractURI = 'https://bafybeiev76hwk2gu7xmy5h3dn2f6iquxkhu4dhwpjgmt6ookrn6ykbtfi4.ipfs.dweb.link/bsc'
            network = "BSC MAINNET"
    }

    const signers = await ethers.getSigners();

    // Sets the fee at to 5%
    const platformFee = {
        fee: {
            value: BigNumber.from('5000000000000000000')
        },
    };

    console.log("\nContracts deploying to: ", network)
    console.log("Deployer address is: ", signers[0].address)
    console.log("With starting balance: ", ethers.utils.formatEther(await signers[0].getBalance()), "\n")

    const zapMarketFactory = await ethers.getContractFactory('ZapMarket');

    const zapMarket = await zapMarketFactory.attach('0x8E85743faA25b305967609E2a5E4FA32Ea092cc4');

    const gas = await zapMarket.estimateGas.setFee(platformFee);

    const setFee = await zapMarket.setFee(platformFee, { gasLimit: gas });

    console.log(setFee)

    // // ************************************************************** //
    // // deploy Zap Vault
    // // ************************************************************** //

    // const zapVaultFactory = await ethers.getContractFactory("ZapVault", signers[0]);

    // const zapVault = await upgrades.deployProxy(
    //     zapVaultFactory,
    //     [tokenAddress],
    //     { initializer: 'initializeVault' }
    // ) as ZapVault;

    // await zapVault.deployed();
    // console.log("ZapVault deployed to:", zapVault.address);
    // console.log("ZapVault Balance: ", await zapVault.vaultBalance(), "\n")


    // // // ************************************************************** //
    // // // deploy ZapMarket
    // // // ************************************************************** //

    // const zapMarketFactory = await ethers.getContractFactory('ZapMarket', signers[0]);

    // const zapMarket = await upgrades.deployProxy(
    //     zapMarketFactory,
    //     [zapVault.address],
    //     { initializer: 'initializeMarket' },

    // );

    // await zapMarket.deployed();
    // console.log('ZapMarket deployed to:', zapMarket.address);
    // console.log("ZapMarket isRegistered (should be false): ", await zapMarket.isRegistered(zapVault.address), "\n");

    // // const ZapMarket = await ethers.getContractFactory("ZapMarket");

    // // set Fee for the platform
    // await zapMarket.setFee(platformFee);
    // console.log("Platform fee set for ZapMarket")

    // // // ************************************************************** //
    // // // deploy AuctionHouse
    // // // ************************************************************** //

    // const AuctionHouse = await ethers.getContractFactory('AuctionHouse', signers[0]);
    // const auctionHouse = await upgrades.deployProxy(AuctionHouse,
    //     [tokenAddress, zapMarket.address],
    //     { initializer: 'initialize' }
    // );
    // await auctionHouse.deployed();
    // console.log('AuctionHouse deployed to:', auctionHouse.address);

    // // ************************************************************** //
    // // deploy ZapMedia Implementation Contract
    // // ************************************************************** //

    // const mediaImplementation = await ethers.getContractFactory('ZapMedia');

    // const zapMediaImplementation: ZapMedia = (await mediaImplementation.deploy()) as ZapMedia;
    // await zapMediaImplementation.deployed();

    // console.log("zapMediaImplementation deployed to:", zapMediaImplementation.address);
    // console.log("zapMediaImplementation Owner: ", await zapMediaImplementation.getOwner(), "\n")
    // console.log("zapMediaImplementation Contract URI (should be null): ", await zapMediaImplementation.contractURI(), "\n")

    // // // ************************************************************** //
    // // // deploy MediaFactory
    // // // ************************************************************** //

    // const MediaFactory = await ethers.getContractFactory("MediaFactory", signers[0]);

    // const mediaFactory = await upgrades.deployProxy(
    //     MediaFactory,
    //     [zapMarket.address, zapMediaImplementation.address],
    //     { initializer: 'initialize' }
    // ) as MediaFactory;


    // await mediaFactory.deployed();

    // // set mediaFactory address to ZapMarket
    // await zapMarket.setMediaFactory(mediaFactory.address);
    // console.log("MediaFactory set to ZapMarket");

    // console.log('MediaFactory deployed to:', mediaFactory.address);
    // console.log("MediaFactory Owner: ", await mediaFactory.owner(), "\n")


    // // const mediaDeployGas = await mediaFactory.estimateGas.deployMedia(
    // //     name,
    // //     symbol,
    // //     zapMarket.address,
    // //     true,
    // //     contractURI
    // // );

    // const tx = await mediaFactory.deployMedia(
    //     name,
    //     symbol,
    //     zapMarket.address,
    //     true,
    //     contractURI,
    // //     { gasLimit: mediaDeployGas }
    // );

    // const receipt = await tx.wait();
    // const mediaDeployedEvents = receipt.events as Event[];
    // const mediaDeployedEvent = mediaDeployedEvents.slice(-1);
    // const zapMediaAddress = mediaDeployedEvent[0].args?.mediaContract;

    // const zapMedia = new ethers.Contract(zapMediaAddress, zapMediaABI, signers[0]) as ZapMedia;
    // await zapMedia.deployed();

    // console.log("ZapMedia deployed to:", zapMedia.address);
    // console.log("ZapMedia contract URI (this time it should show something): ", await zapMedia.contractURI());

    // await zapMedia.claimTransferOwnership();

    // console.log("Ownership claimed by", await zapMedia.getOwner(), "\n")
}

main()
    .then(() =>
        process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
