import { ethers, upgrades } from "hardhat";
import hre from "hardhat";

async function main() {

    const { deployments } = hre;

    const marketProxyAddress = (await deployments.get('ZapMarket_Proxy')).address

    const ZapMarketV2 = await ethers.getContractFactory('ZapMarketV2');

    console.log("Upgrading ZapMarket...");

    await upgrades.upgradeProxy(marketProxyAddress, ZapMarketV2)

}

main()
    .then(() =>
        process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });