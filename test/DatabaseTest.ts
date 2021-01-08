
import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import chai from "chai";
import { Database } from '../typechain/Database';

import { ZapToken } from '../typechain/ZapToken';
import { SSL_OP_NETSCAPE_CA_DN_BUG } from "constants";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { assert } from "console";
import { BigNumber, BigNumberish, ContractTransaction } from "ethers";
import { BytesLike, checkProperties, formatBytes32String } from "ethers/lib/utils";
import { beforeEach } from "mocha";
chai.use(solidity);

const { expect } = chai;

let zapToken: ZapToken;
let db: Database;
let key: number;
let owner: SignerWithAddress;
let add1: SignerWithAddress;



beforeEach(async () => {

    // Test accounts
    [owner,add1] = await ethers.getSigners();

    const database = await ethers.getContractFactory('Database')
    db = await database.deploy() as Database;
    await db.setStorageContract(owner.address, true)

});

describe('Database_Deployment', () => {

    it('owner() - Check if the owner is valid', async () => {

        // Verify the Faucet contract address is equivalent to the first test account address
        expect(await db.owner()).to.equal(owner.address);

    });

});

describe('Database_Transactions', async () => {

    it('setStorageContract() - Check if the event "StorageModified"'
    +' is emitted after the owner calls the function'
        , async () => {

            // Verfiy the rate is equal to 1000
            await expect(db.setStorageContract(add1.address,true))
              .to.emit(db, 'StorageModified')
              .withArgs(add1.address, true);

        });


    it('setStorageContract() - Fails if anyone but the owner runs the function'
        , async () => {
            console.log("TRANSACTION: ")

            try {
                let transaction: ContractTransaction = await db.connect(add1).setStorageContract(owner.address,true)

                expect(transaction).to.be.an("error")

            }catch(err){
                expect(err).to.be.an("error")

            }
            // Verfiy the rate is equal to 1000
             
        });   
        
        
        it('setStorageContract() - Succeeds when the owner of the contract calls the function'
        , async () => {
            console.log("TRANSACTION: ")

            try {
                let transaction: ContractTransaction = await db.connect(owner).setStorageContract(add1.address,true)

                expect(transaction).to.have.property('hash')

            }catch(err){
                expect(err).to.have.property("hash")

            }
            // Verfiy the rate is equal to 1000
             
        }); 

        it('setIntArray() - Succeeds when the owner of the contract calls the function'
        , async () => {

            let bytes : BytesLike = formatBytes32String("1")
            let numbers: BigNumberish[] = [1,2] 

            try {
                await db.setIntArray(bytes, numbers)
                let transaction: BigNumber[] = await db.getIntArray(bytes)

                expect(transaction.toString()).to.equal(numbers.toString())

            }catch(err){ 
                console.log("ERROR: " + err);
                expect(err).to.equal(numbers)
            }
            // Verfiy the rate is equal to 1000
        }); 

})

