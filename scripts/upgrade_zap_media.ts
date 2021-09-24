import { ethers, upgrades } from "hardhat";

async function main() {

    const signers = await ethers.getSigners();

    const ZapMediaV2 = await ethers.getContractFactory("ZapMediaV2", signers[0]);

    const zapMedia = await upgrades.upgradeProxy('', ZapMediaV2);
    console.log("ZapMediaV2 upgraded to:", zapMedia.address);

}

main()
    .then(() =>
        process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });