import { ethers, upgrades } from "hardhat";

async function main() {

    const signers = await ethers.getSigners();

    const ZapMarketV2 = await ethers.getContractFactory("ZapMarketV2", signers[0]);

    // Uses a BSC testnet address
    const zapMarketV2 = await upgrades.upgradeProxy('0x15e85CaC4198Fd50E182Aad6Af95Dd2F8a07eb91', ZapMarketV2);
    console.log("ZapMarketV2 upgraded to:", zapMarketV2.address);

}

main()
    .then(() =>
        process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });