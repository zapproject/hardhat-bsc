import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { Aggregator, Zap, ZapDispute, ZapLibrary, ZapMaster, ZapToken, ZapTokenBSC, } from "../typechain";
import { ContractFactory } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/bignumber";
const { dataIDs } = require("./utils/dataIDs");

let owner: SignerWithAddress;
let acc1: SignerWithAddress;
let acc2: SignerWithAddress;
let acc3: SignerWithAddress;
let acc4: SignerWithAddress;
let acc5: SignerWithAddress;

let Agg: Aggregator;
let ZM: ZapMaster;
let zapToken: ZapTokenBSC;
let zapDotSol: Zap;

describe("All tests", function () {

  it("CRUD for data IDs", async function () {
    // Test initial state.
    {
      let res = await Agg.dataIDsAll();

      for (let i = 0; i < res.length; i++) {
        expect(res[i].id).to.equal(dataIDs[i].id);
        expect(res[i].granularity).to.equal(dataIDs[i].granularity);
        expect(res[i].name).to.equal(dataIDs[i].name);
      }
    }
    // Test replacing all.
    {
      let IDs = [
        {
          id: 999,
          granularity: 1,
          name: "cool"
        }
      ]
      await Agg.replaceDataIDs(IDs);
      let res = await Agg.dataIDsAll();

      expect(res.length).to.equal(IDs.length);
      expect(res[0].id).to.equal(IDs[0].id);
      expect(res[0].granularity).to.equal(IDs[0].granularity);
      expect(res[0].name).to.equal(IDs[0].name);
    }

    // Test pushing a new data ID a single one.
    {
      let resBefore = await Agg.dataIDsAll();
      let newID = {
        id: 999,
        granularity: 1,
        name: "cool"
      }
      await Agg.pushDataID(newID);
      let resAfter = await Agg.dataIDsAll();

      expect(resAfter.length).to.equal(resBefore.length + 1);
      expect(resAfter[resAfter.length - 1].id).to.equal(newID.id);
      expect(resAfter[resAfter.length - 1].granularity).to.equal(newID.granularity);
      expect(resAfter[resAfter.length - 1].name).to.equal(newID.name);
    }

    // Test updating a single one.
    {
      let id = 0
      let updatedID = {
        id: 999,
        granularity: 1,
        name: "cool"
      }
      await Agg.setDataID(id, updatedID);
      let res = await Agg.dataIDsAll();

      expect(res[id].id).to.equal(updatedID.id);
      expect(res[id].granularity).to.equal(updatedID.granularity);
      expect(res[id].name).to.equal(updatedID.name);
    }

  });

  it("Should return the totalTip for a request", async function () {
    await zapToken.mint(acc1.address, BigInt(3));
    await zapToken.connect(acc1).approve(ZM.address, 3);
    await zapDotSol.attach(ZM.address).connect(acc1).addTip(1, 3);
    expect(await Agg.totalTip(1)).to.equal(3);
  });

  it("Should return the current reward amount", async function () {
    // 5min past last submitted value.
    {
      const timeOfLastValue = (await Agg.timeOfLastValue());
      await ethers.provider.send("evm_setNextBlockTimestamp", [(timeOfLastValue.add(BigNumber.from("600"))).toNumber()]);
      await ethers.provider.send("evm_mine", []);
      expect(await Agg.currentReward()).to.equal(BigInt(1e18));
    }

    // 10min past last submitted value.
    {
      const timeOfLastValue = (await Agg.timeOfLastValue());
      await ethers.provider.send("evm_setNextBlockTimestamp", [(timeOfLastValue.add(BigNumber.from("900"))).toNumber()]);
      await ethers.provider.send("evm_mine", []);
      expect(await Agg.currentReward()).to.equal(BigInt(2e18));
    }

    // 15min past last submitted value with a tip.
    {
      const timeOfLastValue = (await Agg.timeOfLastValue());
      await ethers.provider.send("evm_setNextBlockTimestamp", [(timeOfLastValue.add(BigNumber.from("1200"))).toNumber()]);
      // Send 10TRB tip. Miners get 1/10 so a single miner's reward should be 1TRB.
      await zapDotSol.attach(ZM.address).addTip(1, BigInt(10e18));
      expect(await Agg.currentReward()).to.equal(BigInt(4e18));
    }
  });

  it("Should return the last N submitted values", async function () {
    await zapToken.connect(owner).mint(acc1.address, BigInt(1e18 * 500000));
    await zapToken.connect(owner).mint(acc2.address, BigInt(1e18 * 500000));
    await zapToken.connect(owner).mint(acc3.address, BigInt(1e18 * 500000));
    await zapToken.connect(owner).mint(acc4.address, BigInt(1e18 * 500000));
    await zapToken.connect(owner).mint(acc5.address, BigInt(1e18 * 500000));

    await zapToken.connect(acc1).approve(zapDotSol.address, BigInt(1e18 * 500000));
    await zapToken.connect(acc2).approve(zapDotSol.address, BigInt(1e18 * 500000));
    await zapToken.connect(acc3).approve(zapDotSol.address, BigInt(1e18 * 500000));
    await zapToken.connect(acc4).approve(zapDotSol.address, BigInt(1e18 * 500000));
    await zapToken.connect(acc5).approve(zapDotSol.address, BigInt(1e18 * 500000));

    await zapDotSol.connect(acc1).depositStake();
    await zapDotSol.connect(acc2).depositStake();
    await zapDotSol.connect(acc3).depositStake();
    await zapDotSol.connect(acc4).depositStake();
    await zapDotSol.connect(acc5).depositStake();

    let valExp1 = []
    valExp1[1] = 11;
    valExp1[2] = 12;
    valExp1[3] = 13;
    valExp1[4] = 14;
    valExp1[5] = 15;

    await ZM.connect(acc1).submitMiningSolution("", [1, 2, 3, 4, 5], [valExp1[1], valExp1[2], valExp1[3], valExp1[4], valExp1[5]]);
    await ZM.connect(acc2).submitMiningSolution("", [1, 2, 3, 4, 5], [valExp1[1], valExp1[2], valExp1[3], valExp1[4], valExp1[5]]);
    await ZM.connect(acc3).submitMiningSolution("", [1, 2, 3, 4, 5], [valExp1[1], valExp1[2], valExp1[3], valExp1[4], valExp1[5]]);
    await ZM.connect(acc4).submitMiningSolution("", [1, 2, 3, 4, 5], [valExp1[1], valExp1[2], valExp1[3], valExp1[4], valExp1[5]]);
    await ZM.connect(acc5).submitMiningSolution("", [1, 2, 3, 4, 5], [valExp1[1], valExp1[2], valExp1[3], valExp1[4], valExp1[5]]);
    const timeOfLastValue1 = (await Agg.timeOfLastValue());

    await ethers.provider.send("evm_setNextBlockTimestamp", [(timeOfLastValue1.add(BigNumber.from("9000"))).toString()]); // Forward 15min so that it takes any nonce solution.
    let valExp2 = []
    valExp2[1] = 21;
    valExp2[2] = 22;
    valExp2[3] = 23;
    valExp2[4] = 24;
    valExp2[5] = 25;
    await ZM.connect(acc1).submitMiningSolution("", [5, 4, 3, 2, 1], [valExp2[5], valExp2[4], valExp2[3], valExp2[2], valExp2[1]]);
    await ZM.connect(acc2).submitMiningSolution("", [5, 4, 3, 2, 1], [valExp2[5], valExp2[4], valExp2[3], valExp2[2], valExp2[1]]);
    await ZM.connect(acc3).submitMiningSolution("", [5, 4, 3, 2, 1], [valExp2[5], valExp2[4], valExp2[3], valExp2[2], valExp2[1]]);
    await ZM.connect(acc4).submitMiningSolution("", [5, 4, 3, 2, 1], [valExp2[5], valExp2[4], valExp2[3], valExp2[2], valExp2[1]]);
    await ZM.connect(acc5).submitMiningSolution("", [5, 4, 3, 2, 1], [valExp2[5], valExp2[4], valExp2[3], valExp2[2], valExp2[1]]);
    const timeOfLastValue2 = (await Agg.timeOfLastValue()).toBigInt();




    let res = await Agg.getLastValues(1, 2);

    // The order of the returned values is reversed. Newest to oldest.
    expect(res[0].value).to.equal(valExp2[1]);
    expect(res[0].timestamp).to.equal(timeOfLastValue2);

    expect(res[1].value).to.equal(valExp1[1]);
    expect(res[1].timestamp).to.equal(timeOfLastValue1);


    // When calling getLastValuesAll should get the same result, but without specifing which data ID the request is for.
    res = await Agg.getLastValuesAll(2)
    expect(res.length).to.equal(2 * dataIDs.length);

    let pos = 1

    for (let index = 0; index < 10; index++) {
      if (index % 2) {
        expect(res[index].value).to.equal(valExp1[pos]);
        expect(res[index].timestamp).to.equal(timeOfLastValue1);
        pos++
      } else {
        expect(res[index].value).to.equal(valExp2[pos]);
        expect(res[index].timestamp).to.equal(timeOfLastValue2);
      }
    }

    // A request over the max values count should still return the max available.
    res = await Agg.getLastValues(1, 9999);
    expect(res.length).to.equal(2);

  });
});

beforeEach(async function () {
  [owner, acc1, acc2, acc3, acc4, acc5] = await ethers.getSigners();
  let fact: ContractFactory;
  let library: ZapLibrary;

  // Deploy ZapToken.
  fact = await ethers.getContractFactory("ZapTokenBSC", owner);
  zapToken = await fact.deploy() as ZapTokenBSC;
  await zapToken.deployed();

  // Deploy ZapLibrary.
  fact = await ethers.getContractFactory(
    "ZapLibrary",
    {
    }
  );
  library = await fact.deploy() as ZapLibrary;
  await library.deployed();

  // Deploy ZapDispute.
  fact = await ethers.getContractFactory(
    "ZapDispute",
    {
    }
  );
  const dispute = await fact.deploy();
  await dispute.deployed();

  // Deploy ZapStake.
  fact = await ethers.getContractFactory(
    "ZapStake",
    {
      libraries: {
        ZapDispute: dispute.address,
      }
    }
  );
  const stake = await fact.deploy();
  await stake.deployed();

  fact = await ethers.getContractFactory("Zap", {

      libraries: {
          ZapStake: stake.address,
          ZapDispute: dispute.address,
          ZapLibrary: library.address,
      },
      signer: owner
  });
  zapDotSol = await fact.deploy(zapToken.address) as Zap;
  await zapDotSol.deployed();

  // Deploy the main contract.
    fact = await ethers.getContractFactory(
    "ZapMaster",
    {
      libraries: {
        ZapStake: stake.address,
      }
    }
  );
  ZM = await fact.deploy(zapDotSol.address, zapToken.address) as ZapMaster;
  await ZM.deployed();


  // Deploy the actual contract to test.
  fact = await ethers.getContractFactory("Aggregator");
  Agg = await fact.deploy(ZM.address) as Aggregator;
  await Agg.deployed();

  // Set the initial required state for the test tasks.
  await zapToken.mint(owner.address, BigInt(1e18 * 500000));
  await zapToken.mint(ZM.address, BigInt(1e18 * 500000));

  await Agg.replaceDataIDs(dataIDs);
});
