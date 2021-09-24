import { ethers, upgrades } from "hardhat";

async function main() {

    const signers = await ethers.getSigners();

    const ZapMarket = await ethers.getContractFactory("ZapMarket", signers[0]);

    // Uses a BSC testnet address
    const zapMarket = await upgrades.upgradeProxy('0x92309e3c12f13C306CEF3BDF82d98E5974Bf3Ad0', ZapMarket);
    console.log("ZapMarketV2 upgraded to:", zapMarket.address);

}

main()
    .then(() =>
        process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });