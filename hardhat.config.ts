import { config as dotEnvConfig } from "dotenv";

dotEnvConfig();

import '@openzeppelin/hardhat-upgrades';
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-gas-reporter"
import "hardhat-typechain";
import "hardhat-deploy";
import './tasks/faucet';
import './tasks/checkbalance';
import './tasks/checkbalances';
import './tasks/buyzap';
import './tasks/initProvider';
import './tasks/initProviderCurve';
import './tasks/setEndpointParams';
import './tasks/bond';
import './tasks/dispatch';
import './tasks/dispatchCoinGecko';
import './tasks/dispatchCGPriceClient';
import './tasks/dispatchBittrex';
import './tasks/checkClient';
import './tasks/verifyZap';
// import './tasks/mine';

require("hardhat-tracer");

import { getBSCGasPrice } from './scripts/getGasPrice'
const fs = require('fs');  // required for reading BSC gas price

// TODO: reenable solidity-coverage when it works
// import "solidity-coverage";

const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const RINKEBY_PRIVATE_KEY =
  process.env.RINKEBY_PRIVATE_KEY! ||
  "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3"; // well known private key
const BSC_API_KEY = process.env.BSC_API_KEY;
const KOVAN_PRIVATE_KEY = process.env.KOVAN_PRIVATE_KEY ||
  "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3";

getBSCGasPrice()

const config = {
  solidity: {
    compilers: [
      { version: '0.4.24', settings: {} },
      { version: '0.5.16', settings: {} },
      { version: '0.6.8', settings: {} },
      { version: '0.7.3', settings: {} },
      { version: '0.8.4', settings: {} }
    ]
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    gasPrice: 0.0,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY
  },
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545/',
      live: false,
      saveDeployments: true,
      tags: ["local"],
      allowUnlimitedContractSize: true,

    },
    // Will throw an error if the MNEMONIC env variable is non existent
    // Only used for deploying to the BSC testnet
    testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      // accounts: { mnemonic: process.env.MNEMONIC }
    },
    hardhat: {
      gasPrice: 8000000000,
      allowUnlimitedContractSize: true,

    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [RINKEBY_PRIVATE_KEY]
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [KOVAN_PRIVATE_KEY]
    },
    coverage: {
      url: 'http://127.0.0.1:8555' // Coverage launches its own ganache-cli client
    }
  },

  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: BSC_API_KEY
  },

  namedAccounts: {
    deployer: {
      31337: 0,
    }
  },

  mocha: {
    timeout: 1000000
  }
};

// read BSC gas price and assign the gas reporter and hardhat network's gas price to it
try {
  let data = fs.readFileSync("./output/bscGas.txt", 'utf8')
  data = data.replaceAll('"', '')
  data = Number.parseInt(data)
  config.networks.hardhat.gasPrice = data
  let parsedData = (data / 1000000000).toFixed(2)  // round to 2 decimal places
  config.gasReporter.gasPrice = Number(parsedData)
} catch (err) {
  console.error(err)
}

export default config;