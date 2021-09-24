import { ethers, upgrades } from "hardhat";

async function main() {

    const signers = await ethers.getSigners();

    const ZapMediaV2 = await ethers.getContractFactory("ZapMediaV2", signers[0]);

    // Add proxy address
    const zapMediaV2 = await upgrades.upgradeProxy('', ZapMediaV2);
    console.log("ZapMediaV2 upgraded to:", zapMediaV2.address);

}

main()
    .then(() =>
        process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });