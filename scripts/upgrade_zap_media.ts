import { ethers, upgrades } from "hardhat";

async function main() {

    const signers = await ethers.getSigners();

    const ZapMediaV2 = await ethers.getContractFactory("ZapMediaV2", signers[0]);

    // Uses a BSC testnet address
    const zapMediaV2 = await upgrades.upgradeProxy('0x34fCb1A9995c1A90D2Aa9F09796d5699FEF433e5', ZapMediaV2);
    console.log("ZapMediaV2 upgraded to:", zapMediaV2.address);

}

main()
    .then(() =>
        process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });