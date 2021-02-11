# Zap Hardhat Development Enviroment

## Installation

`npm install`

`npm run build`

### Build Contracts and Generate Typechain Typings

`npm run compile`

### Run Hardhat Node & Run Tasks

In order to run tasks, complete the following steps:

1. ```./start.sh``` This will run the localhost hardhat node and deploy your contracts to it.
2. Open a new terminal, ```npx hardhat --network localhost [your-task-here]```

### Run Contract Tests & Get Callstacks

`npx hardhat node`

`npm run test`


### Run Contract Tests and Generate Gas Usage Report

In one terminal run `npm`

Then in another run `npm run test -- --network localhost`

Notes:

- When running with this `localhost` option, you get a gas report but may not get good callstacks
- See [here](https://github.com/cgewecke/eth-gas-reporter#installation-and-config) for how to configure the gas usage report.

### Run Coverage Report for Tests

`npm run coverage`

Notes:

- running a coverage report currently deletes artifacts, so after each coverage run you will then need to run `npx hardhat clean` followed by `npm run build` before re-running tests

### Deploy to Ethereum

Create/modify network config in `hardhat.config.ts` and add API key and private key, then run:

`npx hardhat run --network rinkeby scripts/deploy.ts`
### -or- Just use Docker
Right click on the dockerfile and click "build image", tag the image (ex) - "zaphardhatdevelop:latest"
Run  `docker run -td zaphardhatdevelop`, the command `npx hardhat node` will run automatically
To Deploy to localhost,
-Open Docker Desktop, click the cli button marked with ">-"
Run `npx hardhat run --network localhost scripts/deploy.ts`
