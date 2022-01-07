import { ethers, BigNumber } from 'ethers';

import * as abis from './abi';

import * as bytecodes from './bytecode';

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

const signer = provider.getSigner(0);

let zapTokenAddress: string;
let zapVaultAddress: string;
let zapMarketAddress: string;
let zapMediaImplAddress: string;
let mediaFactoryAddress: string;

export const deployZapToken = async () => {
  const tokenFactory = new ethers.ContractFactory(
    abis.zapTokenBscAbi,
    bytecodes.zapTokenBscBytecode,
    signer,
  );

  const zapToken = await tokenFactory.deploy();

  await zapToken.deployed();

  zapTokenAddress = zapToken.address;

  return zapToken;
};

export const deployZapVault = async () => {
  const vaultFactory = new ethers.ContractFactory(
    abis.zapVaultAbi,
    bytecodes.zapVaultBytecode,
    signer,
  );

  let zapVault = await vaultFactory.deploy();

  await zapVault.deployed();

  zapVault.initializeVault(zapTokenAddress);

  zapVaultAddress = zapVault.address;

  return zapVault;
};

export const deployZapMarket = async () => {
  // Sets the fee at to 5%
  const platformFee = {
    fee: {
      value: BigNumber.from('5000000000000000000'),
    },
  };

  const marketFactory = new ethers.ContractFactory(
    abis.zapMarketAbi,
    bytecodes.zapMarketBytecode,
    signer,
  );

  let zapMarket = await marketFactory.deploy();

  await zapMarket.deployed();

  zapMarketAddress = zapMarket.address;

  await zapMarket.initializeMarket(zapVaultAddress);
  await zapMarket.setFee(platformFee);
  return zapMarket;
};

export const deployZapMediaImpl = async () => {
  const mediaFactory = new ethers.ContractFactory(
    abis.zapMediaAbi,
    bytecodes.zapMediaBytecode,
    signer,
  );

  let zapMedia = await mediaFactory.deploy();

  await zapMedia.deployed();

  zapMediaImplAddress = zapMedia.address;

  return zapMedia;
};

export const deployMediaFactory = async () => {
  const mediaFactoryFactory = new ethers.ContractFactory(
    abis.mediaFactoryAbi,
    bytecodes.mediaFactoryBytecode,
    signer,
  );

  let mediaFactory = await mediaFactoryFactory.deploy();

  await mediaFactory.deployed();

  mediaFactoryAddress = mediaFactory.address;

  await mediaFactory.initialize(zapMarketAddress, zapMediaImplAddress);

  return mediaFactory;
};

export const deployZapMedia = async () => {
  // ZapMarket contract instance
  const zapMarket = new ethers.Contract(zapMarketAddress, abis.zapMarketAbi, signer);

  // MediaFactory contract instance
  const mediaFactory = new ethers.Contract(mediaFactoryAddress, abis.mediaFactoryAbi, signer);

  // Sets the MediaFactory to ZapMarket
  await zapMarket.setMediaFactory(mediaFactoryAddress);

  const deployMedia = await mediaFactory.deployMedia(
    'TEST COLLECTION',
    'TC',
    zapMarket.address,
    true,
    'https://testing.com',
  );

  const receipt = await deployMedia.wait();

  const eventLogs = receipt.events[receipt.events.length - 1];

  const zapMediaAddress = eventLogs.args.mediaContract;

  const zapMedia = new ethers.Contract(zapMediaAddress, abis.zapMediaAbi, signer);

  await zapMedia.deployed();

  await zapMedia.claimTransferOwnership();

  return zapMedia;
};
