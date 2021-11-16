import { ethers, upgrades } from "hardhat";
import { BigNumber } from 'ethers';
import { getImplementationAddress } from '@openzeppelin/upgrades-core';

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
    );
    await zapVault.deployed();
    console.log("ZapVault deployed to:", zapVault.address);
    const zapVaultImplAddress = await getImplementationAddress(ethers.provider, zapVault.address);
    console.log("ZapVault implementation:", zapVaultImplAddress);

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

    await zapMarket.setFee(platformFee);

    const MediaFactory = await ethers.getContractFactory("MediaFactory", signers[0]);
    const mediaFactory = await upgrades.deployProxy(
        MediaFactory,
        [zapMarket.address],
        { initializer: 'initialize' }
    );
    await mediaFactory.deployed();
    console.log('MediaFactory deployed to:', mediaFactory.address);
    await zapMarket.setMediaFactory(mediaFactory.address);
    console.log("MediaFactory set to ZapMarket");
    const factoryImplAddress = await getImplementationAddress(ethers.provider, mediaFactory.address);
    console.log("MediaFactory implementation:", factoryImplAddress);

    const ZapMedia = await ethers.getContractFactory('ZapMedia', signers[0]);
    const zapMedia = await upgrades.deployProxy(
        ZapMedia,
        [
            "ZapMedia",
            "ZAPBSC",
            zapMarket.address,
            true,
            'https://ipfs.moralis.io:2053/ipfs/Qmb6X5bYB3J6jq9JPmd5FLx4fa4JviXfV11yN42i96Q5Xt'
        ],
        { initializer: 'initialize' }
    );
    await zapMedia.deployed();
    console.log('ZapMedia deployed to:', zapMedia.address);
    const mediaImplAddress = await getImplementationAddress(ethers.provider, zapMedia.address);
    console.log("ZapMedia implementation:", mediaImplAddress);

    const AuctionHouse = await ethers.getContractFactory('AuctionHouse', signers[0]);
    const auctionHouse = await upgrades.deployProxy(AuctionHouse,
        [tokenAddress, zapMarket.address],
        { initializer: 'initialize' }
    );
    await auctionHouse.deployed();
    console.log('AuctionHouse deployed to:', auctionHouse.address);
    const auctionImplAddress = await getImplementationAddress(ethers.provider, auctionHouse.address);
    console.log("AuctionHouse implementation:", auctionImplAddress);

}

main()
    .then(() =>
        process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });