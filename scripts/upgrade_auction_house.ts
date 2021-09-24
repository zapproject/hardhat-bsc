import { ethers, upgrades } from "hardhat";

async function main() {

    const signers = await ethers.getSigners();

    const AuctionHouseV2 = await ethers.getContractFactory("AuctionHouseV2", signers[0]);

    // Add proxy address
    const auctionHouseV2 = await upgrades.upgradeProxy('', AuctionHouseV2);
    console.log("AuctionHouseV2 upgraded to:", auctionHouseV2.address);

}

main()
    .then(() =>
        process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });