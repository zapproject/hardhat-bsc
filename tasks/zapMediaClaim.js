const { task, taskArgs } = require('hardhat/config');

task('zapMediaClaimOwnership', 'Claims ownership over ZapMedia')
  .addParam('contractAddress', 'The address of ZapMedia')
  .setAction(async (taskArgs) => {
    // ZapMedia Contract Factory
    const ZapMedia = await ethers.getContractFactory('ZapMedia');

    // Connects the contract factory to the ZapMedia address passed in the params
    let zapMedia = ZapMedia.attach(taskArgs.contractAddress);

    // Claims ownership over ZapMedia
    await zapMedia.claimTransferOwnership();
  });
