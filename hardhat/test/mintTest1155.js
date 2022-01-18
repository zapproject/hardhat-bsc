const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { mnemonicToSeed } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const Web3 = require("web3");

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

const DATA = "0x02";

///////////////////////////////////////////////////////////
// SEE https://hardhat.org/tutorial/testing-contracts.html
// FOR HELP WRITING TESTS
// USE https://github.com/gnosis/mock-contract FOR HELP
// WITH MOCK CONTRACT
///////////////////////////////////////////////////////////

// Start test block
describe("===12k Drop Test===", function () {
  let deployer, owner, paymentReceiver, signer1, signer2, signer3;

  let sma;
  let Haredrop001;
  let itemGroupId = ethers.BigNumber.from(1);
  let shiftedItemGroupId = itemGroupId.shl(128);
  let itemGroupId2 = ethers.BigNumber.from(2);
  let shiftedItemGroupId2 = itemGroupId2.shl(128);
  before(async function () {
    this.SuperMerkleAccess = await ethers.getContractFactory("MerkleAccess");
    this.SuperMerkleDistributor = await ethers.getContractFactory(
      "MerkleDistributor"
    );
    this.Haredrop001 = await ethers.getContractFactory("Haredrop001");
  });

  beforeEach(async function () {
    [deployer, owner, paymentReceiver, signer1, signer2, signer3] =
      await ethers.getSigners();

    sma = await this.SuperMerkleAccess.deploy();
    await sma.deployed();

    smd = await this.SuperMerkleDistributor.deploy();
    await smd.deployed();

    Haredrop001 = await this.Haredrop001.deploy(
      deployer.address,
      "Super",
      "://ipfs/uri/{id}",
      "://ipfs/uri/{id}",
      NULL_ADDRESS
    );
    await Haredrop001.deployed();

    mintRight = await Haredrop001.MINT();
    UNIVERSAL = await Haredrop001.UNIVERSAL();
  });

  describe("Redeem Test", function () {
    it("should check validity of fungile distribution claim", async function () {
      // console.log(ethers.utils.solidityKeccak256(["uint256", "address", "uint256"], [0, deployer.address, ethers.utils.parseEther("10")]));
      // console.log(ethers.utils.solidityKeccak256(["uint256", "address", "uint256"], [1, owner.address, ethers.utils.parseEther("20")]));
      // console.log(ethers.utils.solidityKeccak256(["uint256", "address", "uint256"], [2, paymentReceiver.address, ethers.utils.parseEther("30")]));
      // console.log(ethers.utils.solidityKeccak256(["uint256", "address", "uint256"], [3, signer1.address, ethers.utils.parseEther("40")]));
      // console.log(ethers.utils.solidityKeccak256(["uint256", "address", "uint256"], [4, signer2.address, ethers.utils.parseEther("50")]));
      // console.log(ethers.utils.solidityKeccak256(["uint256", "address", "uint256"], [5, signer3.address, ethers.utils.parseEther("60")]));
      // console.log(ethers.utils.solidityKeccak256(["bytes32", "bytes32"], ["0x5918074afc15e9bab16521dabc53246600c388c85525f9e75506243451825406", "0xa5e50f91592e918fc37296931af94b89ace9e46d99b9ef57b7be4bda8f9aab56"]));
      // console.log(ethers.utils.solidityKeccak256(["bytes32", "bytes32"], [
      //     ethers.utils.solidityKeccak256(["bytes32", "bytes32"], ["0x5918074afc15e9bab16521dabc53246600c388c85525f9e75506243451825406", "0xa5e50f91592e918fc37296931af94b89ace9e46d99b9ef57b7be4bda8f9aab56"]),
      //     ethers.utils.solidityKeccak256(["bytes32", "bytes32"], ["0xe8e2b107edd219e60c651619c8c384aa8f4a5695aa0228e3ff1ef598bf33e718", "0x6f34a36253d471e720266ce6c5ed897aea1f924a4e62740eb79421fdebd43f6e"])
      // ]));

      /* Off-chain list of addresses and hashes
            Index   Address                                     Amount
            0       0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266  10      hash =  0x5918074afc15e9bab16521dabc53246600c388c85525f9e75506243451825406  hash = 0x480d00bdcaea899bbd9ba838debe68d15bcb80307fc0fb2f4d88b2052f6ee7e8  hash =  0x1a6a5182d27d87650d5234b9b2b228ef72f0a827df03350504971e8a415f9323  Roothash = 0xdd031be2b72c829a7244d171a84cc5a863ac690dc9dfc47152e3cf0e6af348b3 
            1       0x70997970C51812dc3A010C7d01b50e0d17dc79C8  20      hash =  0xa5e50f91592e918fc37296931af94b89ace9e46d99b9ef57b7be4bda8f9aab56  
            2       0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC  30      hash =  0xe8e2b107edd219e60c651619c8c384aa8f4a5695aa0228e3ff1ef598bf33e718  hash = 0x69a6f6cb77ea5e6e96695aa450b9dba6edee38f332724b0715cb1e6eee6e582a
            3       0x90F79bf6EB2c4f870365E785982E1f101E93b906  40      hash =  0x6f34a36253d471e720266ce6c5ed897aea1f924a4e62740eb79421fdebd43f6e  
            4       0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65  50      hash =  0x71a8e321d3c283547aa8aa471dc984e747230cedaff02e871e0078520d77151d  hash = 0x61f95108dbae27cb81ffb01ab8c44bf96768d5b0ccccd1e5702697e740e05139  hash =  0x9f9f84a76cb36c30f7de2460f8e98cf3fe47645fab7ff47ff041136b4f5ac4ab
            5       0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc  60      hash =  0x767aac3457726e30b98de04b4e1b178266da4403a0e4a4c3dd8faaa87da3c823  
            */

      let block = await ethers.provider.getBlock();
      await Haredrop001.connect(deployer).setPermit(
        smd.address,
        UNIVERSAL,
        mintRight,
        ethers.constants.MaxUint256
      );

      let groupId = ethers.BigNumber.from(1);
      let merkle1, merkle2, merkle3, merkle4, merkle5, merkle6;
      let merkle7, merkle8, merkle9;
      let merkle10, merkle11;
      let merkle12;

      for (let i = 0; i < 1; i++) {
        // merkle hashes
        merkle1 = ethers.utils.solidityKeccak256(
          ["uint256", "address", "uint256"],
          [0, deployer.address, ethers.utils.parseEther("1")]
        );
        merkle2 = ethers.utils.solidityKeccak256(
          ["uint256", "address", "uint256"],
          [1, owner.address, ethers.utils.parseEther("1")]
        );
        merkle3 = ethers.utils.solidityKeccak256(
          ["uint256", "address", "uint256"],
          [2, paymentReceiver.address, ethers.utils.parseEther("1")]
        );
        merkle4 = ethers.utils.solidityKeccak256(
          ["uint256", "address", "uint256"],
          [3, signer1.address, ethers.utils.parseEther("1")]
        );
        merkle5 = ethers.utils.solidityKeccak256(
          ["uint256", "address", "uint256"],
          [4, signer2.address, ethers.utils.parseEther("1")]
        );
        merkle6 = ethers.utils.solidityKeccak256(
          ["uint256", "address", "uint256"],
          [5, deployer.address, ethers.utils.parseEther("1")]
        );
        merkle7 = ethers.utils.solidityKeccak256(
          ["bytes32", "bytes32"],
          [merkle1, merkle2]
        );
        merkle8 = ethers.utils.solidityKeccak256(
          ["bytes32", "bytes32"],
          [merkle3, merkle4]
        );
        merkle9 = ethers.utils.solidityKeccak256(
          ["bytes32", "bytes32"],
          [merkle5, merkle6]
        );
        merkle10 = ethers.utils.solidityKeccak256(
          ["bytes32", "bytes32"],
          [merkle7, merkle8]
        );
        merkle11 = ethers.utils.solidityKeccak256(
          ["bytes32", "bytes32"],
          [merkle9, merkle9]
        );
        merkle12 = ethers.utils.solidityKeccak256(
          ["bytes32", "bytes32"],
          [merkle10, merkle11]
        );

        await Haredrop001.connect(deployer).configureGroup(itemGroupId, {
          name: "MockNFT" + groupId.value,
          supplyType: 0,
          supplyData: ethers.utils.parseEther("6"),
          itemType: 1,
          itemData: 0,
          burnType: 1,
          burnData: 6,
        });

        smd
          .connect(deployer)
          .setDistributionRound(
            itemGroupId,
            merkle12,
            block.timestamp,
            block.timestamp + 60,
            Haredrop001.address,
            0,
            0
          );
        let merkleRoot = await smd
          .connect(deployer)
          .distributionRoots(itemGroupId);
        await expect(merkleRoot.merkleRoot).to.be.equal(merkle12);
        await smd.connect(paymentReceiver).redeem(
          itemGroupId, // MerkleRoot maping Id
          2, // Index of Node in the list off-chain
          paymentReceiver.address, // Address at that index
          shiftedItemGroupId,
          ethers.utils.parseEther("1"),
          [merkle4, merkle7, merkle11]
        ); // Related hashes from Off-chain

        await expect(
          await Haredrop001.balanceOf(
            paymentReceiver.address,
            shiftedItemGroupId.add(1)
          )
        ).to.be.equal(ethers.utils.parseEther(groupId.toString()));

        groupId = groupId.add(1);
      }
    });
  });
});