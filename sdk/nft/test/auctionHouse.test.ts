// Chai test method
import { expect } from 'chai';

// Ethers Types
import { Contract, ethers } from 'ethers';

// AuctionHouse class
import { AuctionHouse } from '../src/auctionHouse';


// Hardhat localhost connection
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

describe('MediaFactory', () => {
  let auctionHouse: any;
  let signer: any;
  let auction: any;
  let isApproved: boolean;

  before(async () => {
    signer = provider.getSigner(0);

    auctionHouse = new AuctionHouse(signer, 1337);

    // Approve an aunction
    auction = await auctionHouse.createAuction(16);

    // State of the approved auction
    isApproved = auction.args.approved;
  });
});
