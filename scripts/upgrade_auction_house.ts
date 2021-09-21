import { ethers, upgrades } from "hardhat";

async function main() {

    const signers = await ethers.getSigners();

    const AuctionHouseV2 = await ethers.getContractFactory("AuctionHouseV2", signers[0]);

    // Uses a BSC testnet address
    const auctionHouseV2 = await upgrades.upgradeProxy('0x612AEe0e1427C195401f79D06F063ea70595922c', AuctionHouseV2);
    console.log("ZapMarketV2 upgraded to:", auctionHouseV2.address);

}

main()
    .then(() =>
        process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });