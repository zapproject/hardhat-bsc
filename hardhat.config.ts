import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

import '@openzeppelin/hardhat-upgrades';
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-gas-reporter"
import "hardhat-typechain";
import "hardhat-deploy";
import "hardhat-contract-sizer";
import './tasks/faucet';
import './tasks/checkbalance';
import './tasks/checkbalances';
import './tasks/buyzap';
import './tasks/initProvider';
import './tasks/initProviderCurve';
import './tasks/setEndpointParams';
import './tasks/bond';
import './tasks/dispatch';
// import './tasks/dispatchCoinGecko';
// import './tasks/dispatchCGPriceClient';
// import './tasks/dispatchBittrex';
// import './tasks/checkClient';
import './tasks/verifyContract.js'
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
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
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
      { version: '0.7.6', settings: {} },
      {
        version: '0.8.4',
        settings: {
          optimizer: {
            enabled: true
            // runs
          }
        }
      }
    ]
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    gasPrice: 0.0,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY
  },
  networks: {
    mainnet: {
      url: 'https://mainnet.infura.io/v3/bc0266c92ce34146865122a0b095f44c',
      accounts: { mnemonic: process.env.MNEMONIC },
      gasPrice: 160463534099,
      gas: 34000000,
      gasMultiplier: 2,
      blockGasLimit: 34000000,
      timeout: 900000,
    },
    rinkeby: {
      url: 'https://speedy-nodes-nyc.moralis.io/732ab4a941019375863742e4/eth/rinkeby',
      accounts: [RINKEBY_PRIVATE_KEY],
      timeout: 60000,
      gas: 30000000, //30 mil
      gasPrice: 2000000000, //2 gwei
      gasMultiplier: 2
    },
    kovan: {
      url: 'https://speedy-nodes-nyc.moralis.io/732ab4a941019375863742e4/eth/kovan',
      accounts: [KOVAN_PRIVATE_KEY]
    },
    binanceMainnet: {
      url: 'https://bsc-dataseed.binance.org/',
      chainId: 56,
      gas: 2000000,
      gasPrice: "auto",
      accounts: { mnemonic: process.env.MNEMONIC },
      timeout: 300000
    },
    testnet: {
      url: 'https://speedy-nodes-nyc.moralis.io/732ab4a941019375863742e4/bsc/testnet',
      chainId: 97,
      gasPrice: 20000000000,
      accounts: { mnemonic: process.env.MNEMONIC },
      timeout: 300000
    },
    hardhat: {
      gas: 12000000,
      gasPrice: 10000000000,
      blockGasLimit: 0x1fffffffffffff,
      allowUnlimitedContractSize: true,
      timeout: 300000
    },
    localhost: {
      url: 'http://127.0.0.1:8545/'
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
  mocha: {
    timeout: 1000000
  },
  namedAccounts: {
    deployer: {
      default: 0 // here this will by default take the first account as deployer
    }
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
