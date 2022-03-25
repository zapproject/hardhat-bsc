const { task, taskArgs } = require('hardhat/config');

task('zapMarketClaimOwnership', 'Claims ownership over ZapMarket')
  .addParam('contractAddress', 'The address of ZapMarket')
  .setAction(async (taskArgs) => {
    // ZapMarket Contract Factory
    const ZapMarket = await ethers.getContractFactory('ZapMarket');

    // Connects the contract factory to the ZapMarket address passed in the params
    let zapMarket = ZapMarket.attach(taskArgs.contractAddress);

    // Claims ownership over ZapMarket
    await zapMarket.claimTransferOwnership();
  });
