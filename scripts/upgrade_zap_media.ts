import { ethers, upgrades } from "hardhat";

async function main() {

    const signers = await ethers.getSigners();

    const ZapMedia = await ethers.getContractFactory("ZapMedia", signers[0]);

    // Uses a BSC testnet address
    const zapMedia = await upgrades.upgradeProxy('0xA7737097C55cfC67Dc6914A5672A2160CCA1e9f1', ZapMedia);
    console.log("ZapMediaV2 upgraded to:", zapMedia.address);

}

main()
    .then(() =>
        process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });