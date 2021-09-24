import { ethers, upgrades } from "hardhat";

async function main() {

    const signers = await ethers.getSigners();

    const ZapVaultV2 = await ethers.getContractFactory("ZapVaultV2", signers[0]);

    // Add proxy address
    const zapVaultV2 = await upgrades.upgradeProxy('', ZapVaultV2);
    console.log("ZapVaultV2 upgraded to:", zapVaultV2.address);

}

main()
    .then(() =>
        process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });