import { ethers, upgrades } from "hardhat";
import { BigNumber } from 'ethers';

async function main() {

    const signers = await ethers.getSigners();

    // ZapTokenBSC testnet address used for the Faucet
    const tokenAddress = '0x09d8AF358636D9BCC9a3e177B66EB30381a4b1a8';

    const platformFee = {

        fee: {
            value: BigNumber.from('5000000000000000000')
        },

    };

    const ZapVault = await ethers.getContractFactory("ZapVault");
    const zapVault = await upgrades.deployProxy(
        ZapVault,
        [tokenAddress],
        { initializer: 'initializeVault' }
    );
    await zapVault.deployed();
    console.log("ZapVault deployed to:", zapVault.address);

    const ZapMarket = await ethers.getContractFactory('ZapMarket', signers[0]);
    const zapMarket = await upgrades.deployProxy(
        ZapMarket,
        [zapVault.address],
        { initializer: 'initializeMarket' }
    );
    await zapMarket.deployed();
    console.log('ZapMarket deployed to:', zapMarket.address);

    await zapMarket.setFee(platformFee);

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

    const AuctionHouse = await ethers.getContractFactory('AuctionHouse', signers[0]);
    const auctionHouse = await upgrades.deployProxy(AuctionHouse,
        [tokenAddress],
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