const ethers = require('ethers');

const zapTokenJson = require('./ZapTokenBSC.json');

const zapVaultJson = require('./ZapVault.json');

const ganache = require('ganache-cli');
const provider = new ethers.providers.Web3Provider(ganache.provider());

const signer = provider.getSigner(0);

const deployZapToken = async () => {
  const tokenFactory = new ethers.ContractFactory(zapTokenJson.abi, zapTokenJson.bytecode, signer);

  // Deploy an instance of the contract
  const zapToken = await tokenFactory.deploy();
  await zapToken.deployed();

  return zapToken;
};

const deployZapVault = async () => {
  const zapTokenAddress = (await deployZapToken()).address;

  const vaultFactory = new ethers.ContractFactory(zapVaultJson.abi, zapVaultJson.bytecode, signer);

  let zapVault = await vaultFactory.deploy();

  await zapVault.deployed();

  zapVault = zapVault.initialize(zapTokenAddress);

  return zapVault;
};

// const vaultFactory = new ethers.ContractFactory(y.abi, y.bytecode, signer)
// const vault = await vaultFactory.deploy()
// await vault.deployed()

// await vault.initializeVault(token.address)

// console.log(await vault.vaultBalance())
module.exports = {
  deployZapToken: deployZapToken,
  deployZapVault: deployZapVault,
};
