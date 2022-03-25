const { task, taskArgs } = require('hardhat/config');

task(
  'zapMarketInitOwnership',
  'Initiates the ownership transferring process for ZapMarket'
)
  .addParam('contractAddress', 'The address of ZapMarket')
  .addParam('newOwner', 'The address of the new owner')
  .setAction(async (taskArgs) => {
    // ZapMarket Contract Factory
    const ZapMarket = await ethers.getContractFactory('ZapMarket');

    // Connects the contract factory to the ZapMarket address passed in the params
    let zapMarket = ZapMarket.attach(taskArgs.contractAddress);

    // Initiates the transfer process to the new owner address passed in the params
    await zapMarket.initTransferOwnership(taskArgs.newOwner);
  });
