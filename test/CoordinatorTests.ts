import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import chai from "chai";
import mocha from "mocha";

import { ZapCoordinator } from "../typechain/ZapCoordinator";
import { Database } from "../typechain/Database";
import { Registry } from "../typechain/Registry";
// import { CurrentCost } from "../typechain/CurrentCost";
// import { sign } from "crypto";

chai.use(solidity);
const { expect} = chai;

describe("ZapCoordinator", () => {
    let coordinator: ZapCoordinator;
    let db : Database;
    let registry: Registry;
  
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

      const registryFactory = await ethers.getContractFactory(
        "Registry",
        signers[0]
      );
      
      registry = (await registryFactory.deploy(coordinator.address)) as Registry;

      await db.transferOwnership(coordinator.address)
      await coordinator.addImmutableContract('DATABASE', db.address)
    }); 

    it("COORDINATOR_1 - addImmutableContract() - Check that we can set the DATABASE to provider", async function () {
        // Do nothing, this happens in beforeEach
    });

    it("COORDINATOR_2 - addImmutableContract() - Check that we can't set the DATABASE to a null address", async function () {
      await expect(coordinator.addImmutableContract('DATABASE', '0x0000000000000000000000000000000000000000')).to.reverted;
    });

    it("COORDINATOR_3 - addImmutableContract() - Check that when we set the DATABASE it updates db", async function () {
        let addr = await coordinator.db()
        await expect(addr).to.equal(db.address);
    });

    it("COORDINATOR_4 - getContract() - Check that we can get the DATABASE address after setting it", async function () {
      let addr = await coordinator.getContract('DATABASE');
      await expect(addr).to.equal(db.address);
    });

    it("COORDINATOR_5 - getContractName() - Check that DATABASE doesn't add to loadedContracts", async function () {
      await expect(coordinator.getContractName(0)).to.reverted;
    });

    it("COORDINATOR_6 - updateContract() - Check that we can update REGISTRY", async function () {
        const signers = await ethers.getSigners();
   
        await expect(coordinator.updateContract('REGISTRY', registry.address))
          .to.emit(coordinator,'UpdatedContract')
          .withArgs(
            'REGISTRY',
            '0x0000000000000000000000000000000000000000',
            registry.address
          );
    });

  //   it("COORDINATOR_7 - updateContract() - Check that we can't update REGISTRY from an address that's not the owner", async function () {
  //     const reg = await Registry.new(this.test.coord.address);
  //     await this.test.coord.updateContract('REGISTRY', reg.address, { from: accounts[1] }).should.be.rejectedWith(EVMRevert);
  // });
});


// Emitting events
// Testing what events were emitted with what arguments:

// await expect(token.transfer(walletTo.address, 7))
//   .to.emit(token, 'Transfer')
//   .withArgs(wallet.address, walletTo.address, 7);
