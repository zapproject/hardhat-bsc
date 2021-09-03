import { ethers, upgrades } from "hardhat";
import hre from "hardhat";

async function main() {

    const signers = await ethers.getSigners()

    const marketProxyAddress = (await hre.deployments.get('ZapMarket_Proxy')).address;

    const ZapMarketV2 = await ethers.getContractFactory('ZapMarketV2', signers[0])

    const zapMarketV2 = await ZapMarketV2.deploy()
    await zapMarketV2.deployed()
    console.log("ZapMarketV2", zapMarketV2.address)

    console.log("Upgrading ZapMarket...");

    await upgrades.upgradeProxy(marketProxyAddress, ZapMarketV2)

    const zapMarket = await ZapMarketV2.attach(marketProxyAddress);

}

main()
    .then(() =>
        process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });