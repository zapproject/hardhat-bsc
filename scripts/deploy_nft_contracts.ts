import { ethers, upgrades } from "hardhat";
import hre from "hardhat";

async function main() {

    const signers = await ethers.getSigners();

    const tokenAddress = (await hre.deployments.get('ZapTokenBSC')).address;

    const ZapMarketProxy = await ethers.getContractFactory('ZapMarket', signers[0]);
    const zapMarketProxy = await upgrades.deployProxy(ZapMarketProxy, { initializer: 'initialize' });
    await zapMarketProxy.deployed();
    console.log('ZapMarket Proxy deployed to:', zapMarketProxy.address);

    const ZapMediaProxy = await ethers.getContractFactory('ZapMedia', signers[0]);
    const zapMediaProxy = await upgrades.deployProxy(
        ZapMediaProxy,
        [
            "ZapMedia",
            "ZAPBSC",
            zapMarketProxy.address,
            true,
            'https://ipfs.moralis.io:2053/ipfs/Qmb6X5bYB3J6jq9JPmd5FLx4fa4JviXfV11yN42i96Q5Xt'
        ],
    );
    await zapMediaProxy.deployed();
    console.log('ZapMedia Proxy deployed to:', zapMediaProxy.address);

    // AuctionHouse may be changed in the future to be upgradeable
    // AucionHouse will change to handle more than one Media contract
    const AuctionHouse = await ethers.getContractFactory('AuctionHouse', signers[0]);
    const auctionHouse = await AuctionHouse.deploy(tokenAddress);
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