const ethers = require('ethers');

const abis = require('./abi');

const bytecodes = require('./bytecode');

const ganache = require('ganache-cli');
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

const signer = provider.getSigner(0);

let zapTokenAddress;
let zapVaultAddress;
let zapMarketAddress;
let zapMediaImplAddress;
let mediaFactoryAddress;

const deployZapToken = async () => {
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

const deployZapVault = async () => {
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

const deployZapMarket = async () => {
  const marketFactory = new ethers.ContractFactory(
    abis.zapMarketAbi,
    bytecodes.zapMarketBytecode,
    signer,
  );

  let zapMarket = await marketFactory.deploy();

  await zapMarket.deployed();

  zapMarketAddress = zapMarket.address;

  zapMarket.initializeMarket(zapVaultAddress);

  return zapMarket;
};

const deployZapMediaImpl = async () => {
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

const deployMediaFactory = async () => {
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

const deployZapMedia = async () => {
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

module.exports = {
  deployZapToken: deployZapToken,
  deployZapVault: deployZapVault,
  deployZapMarket: deployZapMarket,
  deployZapMediaImpl: deployZapMediaImpl,
  deployMediaFactory: deployMediaFactory,
  deployZapMedia: deployZapMedia,
};
