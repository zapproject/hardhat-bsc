import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

import { HardhatUserConfig } from "hardhat/types";

import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-typechain";
import "hardhat-deploy";
import './tasks/faucet';
import './tasks/checkbalance';
import './tasks/checkbalances';
import './tasks/buyzap';
import './tasks/initProvider';

// TODO: reenable solidity-coverage when it works
// import "solidity-coverage";

const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const RINKEBY_PRIVATE_KEY =
  process.env.RINKEBY_PRIVATE_KEY! ||
  "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3"; // well known private key
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const config: HardhatUserConfig = {

  // Config setup to use the tasks

  // 1. defaultNetwork should be set to 'hardhat'
  // 2. Open a terminal and run 'npx hardhat node'
  // 3. Go back to hardhat.config.ts and set defaultNetwork to 'localhost'
  // 4. Open another terminal and run 'npx hardhat run --network localhost scripts/deploy.ts
  // 5. Run any task available in the terminal

  defaultNetwork: 'localhost',
  solidity: {
    compilers: [{ version: "0.4.24", settings: {} }],
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",

    },
    hardhat: {

    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [RINKEBY_PRIVATE_KEY],
    },
    coverage: {
      url: "http://127.0.0.1:8555", // Coverage launches its own ganache-cli client
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;
