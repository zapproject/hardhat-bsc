import { ethers, deployments, getNamedAccounts, getUnnamedAccounts } from "hardhat";
import hre from "hardhat";

import { AuctionHouse, ZapMedia, ZapTokenBSC } from "../typechain";
import { keccak256 } from "ethers/lib/utils";

import { BigNumber } from "@ethersproject/bignumber";

async function main() {
    const { deployer } = await getNamedAccounts();
    const [ deployerAsSigner, bidder, collab1, collab2, collab3 ] = await ethers.getSigners();

    console.log("Retrieving deployments...");

    const ZapTokenDeployment = await deployments.get('ZapTokenBSC');
    const zapMediaAddress = "0xC0e6583d38D5C3AF8BC87411E2df5d905A496171"; // Rinkeby Zap Collection
    const ZMDeployment = await deployments.get('ZapMedia');
    const AuctionHouseDeployment = await deployments.get('AuctionHouse');

    const zapMedia = new ethers.Contract(zapMediaAddress, ZMDeployment.abi, deployerAsSigner) as ZapMedia;
    const zapToken = await ethers.getContractAt(
        ZapTokenDeployment.abi, ZapTokenDeployment.address, deployerAsSigner
    ) as ZapTokenBSC;
    const auctionHouse = await ethers.getContractAt(
        AuctionHouseDeployment.abi, AuctionHouseDeployment.address, deployerAsSigner
    ) as AuctionHouse;

    console.log("Setting up minting...");
    const metadataHex = ethers.utils.formatBytes32String(
        `{}`
    );
    const metadataHash = keccak256(metadataHex);
    const hash = ethers.utils.arrayify(metadataHash);

    // const signers = await ethers.getSigners();

    console.log("Minting token...");
    await zapMedia.mint(
        {
          tokenURI: "zap.co",
          metadataURI: "zap.co",
          contentHash: hash,
          metadataHash: hash,
        },
        {
          collaborators: [
            collab1.address,
            collab2.address,
            collab3.address
          ],
          collabShares: [
            BigNumber.from('15000000000000000000'),
            BigNumber.from('15000000000000000000'),
            BigNumber.from('15000000000000000000')
          ]
          ,
          creator: {
            value: BigNumber.from('15000000000000000000')
          },
          owner: {
            value: BigNumber.from('35000000000000000000')
          },
        }
    );

    console.log("Approving Auction House...");
    zapMedia.approve(AuctionHouseDeployment.address, 0);

    console.log("Creating Auction...");
    const duration = 60 * 60 * 24
    const reservePrice = BigNumber.from(10).pow(18).div(2);
    await auctionHouse.createAuction(
        0,
        zapMediaAddress,
        duration,
        reservePrice,
        deployer,
        5,
        ZapTokenDeployment.address
    );

    console.log("Starting Auction...");
    await auctionHouse.startAuction(0, true);
    await auctionHouse.setAuctionReservePrice(0, ethers.utils.parseEther("500.0"));

    console.log("Minting ZapToken for the bidder...");
    await zapToken.allocate(bidder.address, ethers.utils.parseEther("600.0"));

    console.log("Creating bid");
    await auctionHouse.connect(bidder).createBid(
        0,
        ethers.utils.parseEther("505.0"),
        zapMediaAddress
    );

}

main()
    .then(() =>
        process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

