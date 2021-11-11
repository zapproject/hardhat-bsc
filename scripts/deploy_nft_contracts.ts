import { ethers, upgrades, run } from "hardhat";
import {
    AuctionHouse,
    MediaFactory,
    ZapMarket,
    ZapMedia,
    ZapVault
} from '../typechain/'
import { BigNumber, EventFilter, Event } from 'ethers';

const ZMABI = require('../artifacts/contracts/nft/ZapMedia.sol/ZapMedia.json').abi;

async function main() {

    const signers = await ethers.getSigners();

    // ZapTokenBSC testnet address used for the Faucet
    const tokenAddress = '0x09d8AF358636D9BCC9a3e177B66EB30381a4b1a8';

    const platformFee = {
        fee: {
            value: BigNumber.from('5000000000000000000')
        },
    };

    const ZapVault = await ethers.getContractFactory("ZapVault", signers[0]);
    const zapVault = await upgrades.deployProxy(
        ZapVault,
        [tokenAddress],
        { initializer: 'initializeVault' }
    ) as ZapVault;
    await zapVault.deployed();
    console.log("ZapVault deployed to: ", zapVault.address);

    const ZapMarket = await ethers.getContractFactory('ZapMarket', signers[0]);
    const zapMarket = await upgrades.deployProxy(
        ZapMarket,
        [zapVault.address],
        { initializer: 'initializeMarket' }
    ) as ZapMarket;
    await zapMarket.deployed();
    console.log('ZapMarket deployed to: ', zapMarket.address);

    await zapMarket.setFee(platformFee);

    const MediaFactory = await ethers.getContractFactory("MediaFactory", signers[0]);
    const mediaFactory = await upgrades.deployProxy(
        MediaFactory,
        [zapMarket.address],
        { initializer: 'initialize' }
    ) as MediaFactory;
    await mediaFactory.deployed();
    console.log('MediaFactory deployed to: ', zapMarket.address);

    await zapMarket.setMediaFactory(mediaFactory.address);
    console.log("MediaFactory set to ZapMarket");

    const data = {
        name: "ZapMedia",
        symbol: "ZAPBSC",
        marketContractAddr: zapMarket.address,
        permissive: true,
        _collectionMetadata:'https://ipfs.moralis.io:2053/ipfs/Qmb6X5bYB3J6jq9JPmd5FLx4fa4JviXfV11yN42i96Q5Xt'
    }

    const txReceipt = await mediaFactory.deployMedia(
        data.name, data.symbol, data.marketContractAddr, data.permissive, data._collectionMetadata
        );

    const mediaDeployedEventFilter: EventFilter = mediaFactory.filters.MediaDeployed(null);
    const mediaDeployedEvent: Event = (await mediaFactory.queryFilter(mediaDeployedEventFilter))[0];
    const zapMediaAddr = mediaDeployedEvent.args?.mediaContract;
    
    const zapMedia = new ethers.Contract(zapMediaAddr, ZMABI, signers[0]) as ZapMedia;
    await zapMedia.deployed();
    console.log('ZapMedia deployed to: ', zapMedia.address);
    
    // console.log('Verifing ZapMedia...')
    // await run("verify:verify", {
    //     address: zapMedia.address,
    //     constructorArguments: [
    //         data.name, data.symbol, data.marketContractAddr, data.permissive, data._collectionMetadata
    //     ]
    // });

    const AuctionHouse = await ethers.getContractFactory('AuctionHouse', signers[0]);
    const auctionHouse = await upgrades.deployProxy(AuctionHouse,
        [tokenAddress, zapMarket.address],
        { initializer: 'initialize' }
    ) as AuctionHouse;
    await auctionHouse.deployed();
    console.log('AuctionHouse deployed to: ', auctionHouse.address);

    await zapMarket.setAuctionHouse(auctionHouse.address);
    console.log('AuctionHouse is set on ZapMarket');

}

main()
    .then(() =>
        process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });