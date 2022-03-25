const { task, taskArgs } = require('hardhat/config');

task(
  'zapMediaInitOwnership',
  'Initiates the ownership transferring process for ZapMedia'
)
  .addParam('contractAddress', 'The address of ZapMedia')
  .addParam('newOwner', 'The address of the new owner')
  .setAction(async (taskArgs) => {
    // ZapMedia Contract Factory
    const ZapMedia = await ethers.getContractFactory('ZapMedia');

    // Connects the contract factory to the ZapMedia address passed in the params
    let zapMedia = ZapMedia.attach(taskArgs.contractAddress);

    // Initiates the transfer process to the new owner address passed in the params
    await zapMedia.initTransferOwnership(taskArgs.newOwner);
  });
