import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import chai from "chai";
import mocha from "mocha";

import { ZapCoordinator } from "../typechain/ZapCoordinator";
import { Database } from "../typechain/Database";
import { Registry } from "../typechain/Registry";
import { CurrentCost } from "../typechain/CurrentCost";
import { sign } from "crypto";

chai.use(solidity);
const { expect } = chai;

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
      await coordinator.addImmutableContract('DATABASE', db.address)
    }); 

    it("addImmutableContract() - Check that we can set the DATABASE to provider", async function () {
        // Do nothing, this happens in beforeEach
    });

    it("addImmutableContract() - Check that we can't set the DATABASE to provider with the wrong owner", async function () {
        //await this.test.coord.addImmutableContract('DATABASE', db.address, { from: accounts[1] })
    });

});
