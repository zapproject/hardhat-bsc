import { ethers, upgrades } from "hardhat";
import hre from "hardhat";

async function main() {

    const signers = await ethers.getSigners();

    const tokenAddress = (await hre.deployments.get('ZapTokenBSC')).address;

    const ZapMarketImplementation = await ethers.getContractFactory('ZapMarket', signers[0]);
    const zapMarketImplementation = await ZapMarketImplementation.deploy();
    await zapMarketImplementation.deployed();

    const ZapMarketProxy = await ethers.getContractFactory('ZapMarket', signers[0]);
    const zapMarketProxy = await upgrades.deployProxy(ZapMarketProxy, { initializer: 'initialize' });
    await zapMarketProxy.deployed();
    console.log('ZapMarket Proxy deployed to:', zapMarketProxy.address);

    // ZapMedia may be changed in the future to be upgradeable
    const ZapMedia = await ethers.getContractFactory('ZapMedia', signers[0]);
    const zapMedia = await ZapMedia.deploy('ZapMedia', 'ZAPBSC', zapMarketImplementation.address, true);
    await zapMedia.deployed();
    console.log('ZapMedia deployed to:', zapMedia.address);

    // AuctionHouse may be changed in the future to be upgradeable
    // AucionHouse will change to handle more than one Media contract
    const AuctionHouse = await ethers.getContractFactory('AuctionHouse', signers[0]);
    const auctionHouse = await AuctionHouse.deploy(zapMedia.address, tokenAddress);
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