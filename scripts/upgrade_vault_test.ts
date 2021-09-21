import { ethers, upgrades } from "hardhat";

async function main() {

    const signers = await ethers.getSigners();

    const ZapVaultV2 = await ethers.getContractFactory("ZapVaultV2", signers[0]);

    // Uses a BSC testnet address
    const zapVaultV2 = await upgrades.upgradeProxy('0x8bAC535A5E475E49Ae28b92873a9C96A511Ad939', ZapVaultV2);
    console.log("ZapVaultV2 upgraded to:", zapVaultV2.address);

}

main()
    .then(() =>
        process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });