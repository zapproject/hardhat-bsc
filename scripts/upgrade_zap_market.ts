import { ethers, upgrades } from "hardhat";

async function main() {

    const signers = await ethers.getSigners();

    const ZapMarketV2 = await ethers.getContractFactory("ZapMarketV2", signers[0]);

    // Add proxy address
    const zapMarketV2 = await upgrades.upgradeProxy('', ZapMarketV2);
    console.log("ZapMarketV2 upgraded to:", zapMarketV2.address);

}

main()
    .then(() =>
        process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });