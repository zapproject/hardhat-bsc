import { ethers } from 'hardhat';
import { solidity } from 'ethereum-waffle';
import chai from 'chai';
import { Database } from '../typechain/Database';

import { ZapToken } from '../typechain/ZapToken';
import { SSL_OP_NETSCAPE_CA_DN_BUG } from 'constants';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { assert } from 'console';
import { BigNumber, BigNumberish, ContractTransaction } from 'ethers';
import {
  Bytes,
  BytesLike,
  checkProperties,
  formatBytes32String,
  hexConcat,
  hexlify,
  randomBytes
} from 'ethers/lib/utils';
import { beforeEach } from 'mocha';

chai.use(solidity);

const { expect } = chai;

let zapToken: ZapToken;
let db: Database;
let key: number;
let owner: SignerWithAddress;
let add1: SignerWithAddress;

//TODO: Write tests incorporating the "storageOnly" guard condition for the setter functions

beforeEach(async () => {
  // Test accounts
  [owner, add1] = await ethers.getSigners();

  const database = await ethers.getContractFactory('Database');
  db = (await database.deploy()) as Database;
  await db.setStorageContract(owner.address, true);
});

describe('Database_Deployment', () => {
  it('owner() - Check if the owner is valid', async () => {
    expect(await db.owner()).to.equal(owner.address);
  });
});

describe('Database_Transactions', async () => {
  it(
    'setStorageContract() - Check if the event "StorageModified"' +
      ' is emitted after the owner calls the function',
    async () => {
      await expect(db.setStorageContract(add1.address, true))
        .to.emit(db, 'StorageModified')
        .withArgs(add1.address, true);
    }
  );

  it('setStorageContract() - Fails if anyone but the owner runs the function', async () => {
    try {
      let transaction: ContractTransaction = await db
        .connect(add1)
        .setStorageContract(owner.address, true);

      expect(transaction).to.be.an('error');
    } catch (err) {
      expect(err).to.be.an('error');
    }
  });

  it('setStorageContract() - Succeeds when the owner of the contract calls the function', async () => {
    try {
      let transaction: ContractTransaction = await db
        .connect(owner)
        .setStorageContract(add1.address, true);

      expect(transaction).to.have.property('hash');
    } catch (err) {
      expect(err).to.have.property('hash');
    }
  });

  it('setBytes32() - Tests if a byte can be set in the DB', async () => {
    let input_byte_key: BytesLike = formatBytes32String('1');
    let input_byte_val: BytesLike = formatBytes32String('2');

    try {
      await db.setBytes32(input_byte_key, input_byte_val);
      let transaction: BytesLike = await db.getBytes32(input_byte_key);

      expect(transaction.toString()).to.equal(input_byte_val.toString());
    } catch (err) {
      expect(err).to.equal(input_byte_val.toString());
    }
  });

  it('setNumber() - Tests if a number can be set in the DB', async () => {
    let input_byte_key: BytesLike = formatBytes32String('1');
    let input_number_val: BigNumberish = 2;

    try {
      await db.setNumber(input_byte_key, input_number_val);
      let transaction: BigNumberish = await db.getNumber(input_byte_key);

      expect(transaction).to.equal(input_number_val);
    } catch (err) {
      expect(err).to.equal(input_number_val);
    }
  });

  it('setBytes() - Tests if a byte can be set in the DB', async () => {
    let input_byte_key: BytesLike = formatBytes32String('1');
    let input_byte_val: BytesLike = formatBytes32String('2');

    try {
      await db.setBytes(input_byte_key, input_byte_val);
      let transaction: BytesLike = await db.getBytes(input_byte_key);

      expect(transaction.toString()).to.equal(input_byte_val.toString());
    } catch (err) {
      expect(err).to.equal(input_byte_val.toString());
    }
  });

  it('setIntArray() - Tests if an int array can be set in the DB', async () => {
    let input_byte_key: BytesLike = formatBytes32String('1');
    let input_int_array: BigNumberish[] = [1, 2];

    try {
      await db.setIntArray(input_byte_key, input_int_array);
      let transaction: BigNumber[] = await db.getIntArray(input_byte_key);

      expect(transaction.toString()).to.equal(input_int_array.toString());
    } catch (err) {
      expect(err).to.equal(input_int_array);
    }
  });

  it('setIntArrayIndex() - Tests if an int array can be overwritten in the DB', async () => {
    let input_byte_key: BytesLike = formatBytes32String('1');
    let input_int_array: BigNumberish[] = [1];
    let input_int_val: number = 2;
    let test_index: number = 0;

    try {
      await db.setIntArray(input_byte_key, input_int_array);

      let transaction: BigNumber[] = await db.getIntArray(input_byte_key);

      expect(transaction.toString()).to.equal(input_int_array.toString());

      await db.setIntArrayIndex(input_byte_key, test_index, input_int_val);

      transaction = await db.getIntArray(input_byte_key);

      expect(transaction.toString()).to.equal(input_int_val.toString());
    } catch (err) {
      expect(err).to.equal(input_int_val);
    }
  });

  it('setIntArrayIndex() - Tests if an int array fails when an out of bounds index is overwritten', async () => {
    let input_byte_key: BytesLike = formatBytes32String('1');
    let input_int_array: BigNumberish[] = [1];
    let input_int_val: number = 2;
    let test_index: number = 1;

    try {
      await db.setIntArray(input_byte_key, input_int_array);

      let transaction: BigNumber[] = await db.getIntArray(input_byte_key);

      expect(transaction.toString()).to.equal(input_int_array.toString());

      await db.setIntArrayIndex(input_byte_key, test_index, input_int_val);

      transaction = await db.getIntArray(input_byte_key);

      expect(transaction).to.be.an('error');
    } catch (err) {
      expect(err).to.be.an('error');
    }
  });

  it('pushIntArray() - Tests if an int array can be pushed to in the DB', async () => {
    let input_byte_key: BytesLike = formatBytes32String('1');
    let input_int_array: BigNumberish[] = [1];
    let input_int_val: number = 2;
    let final_output_int_array: BigNumberish[] = [1, 2];

    try {
      await db.setIntArray(input_byte_key, input_int_array);

      let transaction: BigNumber[] = await db.getIntArray(input_byte_key);

      expect(transaction.toString()).to.equal(input_int_array.toString());

      await db.pushIntArray(input_byte_key, input_int_val);

      transaction = await db.getIntArray(input_byte_key);

      expect(transaction.toString()).to.equal(
        final_output_int_array.toString()
      );
    } catch (err) {
      expect(err).to.equal(final_output_int_array);
    }
  });

  it('setBytesArray() - Tests if an byte array can be set in the DB', async () => {
    let input_byte_key: BytesLike = formatBytes32String('1');
    let input_byte_array: BytesLike[] = [
      formatBytes32String('a'),
      formatBytes32String('b')
    ];

    try {
      await db.setBytesArray(input_byte_key, input_byte_array);
      let transaction: BytesLike[] = await db.getBytesArray(input_byte_key);

      expect(JSON.stringify(transaction)).to.equal(
        JSON.stringify(input_byte_array)
      );
    } catch (err) {
      expect(err).to.equal(input_byte_array);
    }
  });

  it('setBytesArrayIndex() - Tests if an byte array can be overwritten in the DB', async () => {
    let input_byte_key: BytesLike = formatBytes32String('1');
    let input_byte_array: BytesLike[] = [formatBytes32String('a')];
    let input_byte_val: BytesLike = formatBytes32String('b');
    let test_index: number = 0;

    try {
      await db.setBytesArray(input_byte_key, input_byte_array);

      let transaction: BytesLike[] = await db.getBytesArray(input_byte_key);

      expect(transaction.toString()).to.equal(input_byte_array.toString());

      await db.setBytesArrayIndex(input_byte_key, test_index, input_byte_val);

      transaction = await db.getBytesArray(input_byte_key);

      expect(JSON.stringify(transaction)).to.equal(
        JSON.stringify([input_byte_val])
      );
    } catch (err) {
      expect(err).to.equal(input_byte_val);
    }
  });

  it('setBytesArrayIndex() - Tests if an byte array fails when an out of bounds index is overwritten', async () => {
    let input_byte_key: BytesLike = formatBytes32String('1');
    let input_byte_array: BytesLike[] = [formatBytes32String('a')];
    let input_byte_val: BytesLike = formatBytes32String('b');
    let test_index: number = 1;

    try {
      await db.setBytesArray(input_byte_key, input_byte_array);

      let transaction: BytesLike[] = await db.getBytesArray(input_byte_key);

      expect(transaction.toString()).to.equal(input_byte_array.toString());

      await db.setBytesArrayIndex(input_byte_key, test_index, input_byte_val);

      transaction = await db.getBytesArray(input_byte_key);

      expect(transaction).to.be.an('error');
    } catch (err) {
      expect(err).to.be.an('error');
    }
  });

  it('pushBytesArray() - Tests if an byte array can be pushed to in the DB', async () => {
    let input_byte_key: BytesLike = formatBytes32String('1');
    let input_byte_array: BytesLike[] = [formatBytes32String('a')];
    let input_byte_val: BytesLike = formatBytes32String('b');
    let final_output_byte_array: BigNumberish[] = [
      formatBytes32String('a'),
      formatBytes32String('b')
    ];

    try {
      await db.setBytesArray(input_byte_key, input_byte_array);

      let transaction: BytesLike[] = await db.getBytesArray(input_byte_key);

      expect(transaction.toString()).to.equal(input_byte_array.toString());

      await db.pushBytesArray(input_byte_key, input_byte_val);

      transaction = await db.getBytesArray(input_byte_key);

      expect(JSON.stringify(transaction)).to.equal(
        JSON.stringify(final_output_byte_array)
      );
    } catch (err) {
      expect(err).to.equal(final_output_byte_array);
    }
  });

  it('setAddressArray() - Tests if an address array can be set in the DB', async () => {
    let input_byte_key: BytesLike = formatBytes32String('1');
    let input_address_array: string[] = [ethers.constants.AddressZero];

    try {
      await db.setAddressArray(input_byte_key, input_address_array);
      let transaction: BytesLike[] = await db.getAddressArray(input_byte_key);

      expect(JSON.stringify(transaction)).to.equal(
        JSON.stringify(input_address_array)
      );
    } catch (err) {
      expect(err).to.equal(input_address_array);
    }
  });

  it('setAddressArrayIndex() - Tests if an address array can be overwritten in the DB', async () => {
    let input_byte_key: BytesLike = formatBytes32String('1');
    let input_address_array: string[] = [ethers.constants.AddressZero];
    let input_address_val: string = add1.address;
    let test_index: number = 0;

    try {
      await db.setAddressArray(input_byte_key, input_address_array);

      let transaction: BytesLike[] = await db.getAddressArray(input_byte_key);

      expect(transaction.toString()).to.equal(input_address_array.toString());

      await db.setAddressArrayIndex(
        input_byte_key,
        test_index,
        input_address_val
      );

      transaction = await db.getAddressArray(input_byte_key);

      expect(JSON.stringify(transaction)).to.equal(
        JSON.stringify([input_address_val])
      );
    } catch (err) {
      expect(err).to.equal(input_address_val);
    }
  });

  it('setAddressArrayIndex() - Tests if an byte array fails when an out of bounds index is overwritten', async () => {
    let input_byte_key: BytesLike = formatBytes32String('1');
    let input_address_array: string[] = [ethers.constants.AddressZero];
    let input_address_val: string = add1.address;
    let test_index: number = 1;

    try {
      await db.setAddressArray(input_byte_key, input_address_array);

      let transaction: BytesLike[] = await db.getAddressArray(input_byte_key);

      expect(transaction.toString()).to.equal(input_address_array.toString());

      await db.setAddressArrayIndex(
        input_byte_key,
        test_index,
        input_address_val
      );

      transaction = await db.getAddressArray(input_byte_key);

      expect(transaction).to.be.an('error');
    } catch (err) {
      expect(err).to.be.an('error');
    }
  });

  it('pushAddressArray() - Tests if an address array can be pushed to in the DB', async () => {
    let input_byte_key: BytesLike = formatBytes32String('1');
    let input_address_array: string[] = [ethers.constants.AddressZero];
    let input_address_val: string = add1.address;
    let final_output_address_array: string[] = [
      ethers.constants.AddressZero,
      add1.address
    ];

    try {
      await db.setAddressArray(input_byte_key, input_address_array);

      let transaction: BytesLike[] = await db.getAddressArray(input_byte_key);

      expect(transaction.toString()).to.equal(input_address_array.toString());

      await db.pushAddressArray(input_byte_key, input_address_val);

      transaction = await db.getAddressArray(input_byte_key);

      expect(JSON.stringify(transaction)).to.equal(
        JSON.stringify(final_output_address_array)
      );
    } catch (err) {
      expect(err).to.equal(final_output_address_array);
    }
  });
});
