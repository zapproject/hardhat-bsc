// Chai test method
import { expect } from 'chai';

// Ethers Types
import { Contract, ethers } from 'ethers';

// AuctionHouse class
import { AuctionHouse } from '../src/auctionHouse';


// Hardhat localhost connection
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

describe('AuctionHouse', () => {
  let auctionHouse: any;
  let signer: any;
  let auctionId: string;

  before(async () => {
    signer = provider.getSigner(0);

    auctionHouse = new AuctionHouse(signer, 1337);

    // Create an aunction
    auctionId = await auctionHouse.createAuction(16, '', 1800, 100, '', 10, '0x15');
  });
});
