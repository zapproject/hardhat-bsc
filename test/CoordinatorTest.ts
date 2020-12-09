import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";

import { ZapCoordinator } from "../typechain/ZapCoordinator";
import { Database } from "../typechain/Database";
import { Registry } from "../typechain/Registry";
import { CurrentCost } from "../typechain/CurrentCost";
import { sign } from "crypto";

chai.use(solidity);
const { expect, should } = chai;

describe("ZapCoordinator", () => {
    let coordinator: ZapCoordinator;
    let db : Database;
  
    beforeEach(async () => {
      const signers = await ethers.getSigners();

      const coordinatorFactory = await ethers.getContractFactory(
        "ZapCoordinator",
        signers[0]
      );
      coordinator = (await coordinatorFactory.deploy()) as ZapCoordinator;
      await coordinator.deployed();

      const dbFactory = await ethers.getContractFactory(
        "Database",
        signers[0]
      );
      db = (await dbFactory.deploy()) as Database;
      await coordinator.deployed();
      
      await db.transferOwnership(coordinator.address)
    });

//         await this.currentTest.db.transferOwnership(this.currentTest.coord.address).should.be.fulfilled;
//         await this.currentTest.coord.addImmutableContract('DATABASE', this.currentTest.db.address).should.be.fulfilled;
//     });

//     it("COORDINATOR_1 - addImmutableContract() - Check that we can set the DATABASE to provider", async function () {
//         // Do nothing, this happens in beforeEach
//     });

// describe("Counter", () => {
//   let counter: Counter;

//   beforeEach(async () => {
//     // 1
//     const signers = await ethers.getSigners();

//     // 2
//     const counterFactory = await ethers.getContractFactory(
//       "Counter",
//       signers[0]
//     );
//     counter = (await counterFactory.deploy()) as Counter;
//     await counter.deployed();
//     const initialCount = await counter.getCount();

//     // 3
//     expect(initialCount).to.eq(0);
//     expect(counter.address).to.properAddress;
//   });

//   // 4
//   describe("count up", async () => {
//     it("should count up", async () => {
//       await counter.countUp();
//       let count = await counter.getCount();
//       expect(count).to.eq(1);
//     });
//   });

//   // describe("count down", async () => {
//   //   // 5
//   //   it("should fail", async () => {
//   //     // this test will fail
//   //     await counter.countDown();
//   //   });

//   //   it("should count down", async () => {
//   //     await counter.countUp();

//   //     await counter.countDown();
//   //     const count = await counter.getCount();
//   //     expect(count).to.eq(0);
//   //   });
//   // });
});
