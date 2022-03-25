const { task, taskArgs } = require('hardhat/config');

task('mediaFactoryTransfer', 'Transfers new ownership over MediaFactory')
  .addParam('contractAddress', 'The address of MediaFactory')
  .addParam('newOwner', 'The address of the new owner')
  .setAction(async (taskArgs) => {
    // MediaFactory Contract Factory
    const MediaFactory = await ethers.getContractFactory('MediaFactory');

    // Connects the contract factory to the MediaFactory address passed in the params
    let mediaFactory = MediaFactory.attach(taskArgs.contractAddress);

    // Transfers ownership to the new owner address passed in the params
    await mediaFactory.transferOwnership(taskArgs.newOwner);
  });
