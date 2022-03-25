const { task, taskArgs } = require('hardhat/config');

task(
  'zapVaultInitOwnership',
  'Initiates the ownership transferring process for ZapVault'
)
  .addParam('contractAddress', 'The address of ZapVault')
  .addParam('newOwner', 'The address of the new owner')
  .setAction(async (taskArgs) => {
    // ZapVault Contract Factory
    const ZapVault = await ethers.getContractFactory('ZapVault');

    // Connects the contract factory to the ZapVault address passed in the params
    let zapVault = ZapVault.attach(taskArgs.contractAddress);

    // Initiates the transfer process to the new owner address passed in the params
    await zapVault.initTransferOwnership(taskArgs.newOwner);
  });
