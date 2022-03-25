const { task, taskArgs } = require('hardhat/config');

task('zapVaultClaimOwnership', 'Claim ownership over ZapVault')
  .addParam('contractAddress', 'The address of ZapVault')
  .setAction(async (taskArgs) => {
    // ZapVault Contract Factory
    const ZapVault = await ethers.getContractFactory('ZapVault');

    // Connects the contract factory to the ZapVault address passed in the params
    let zapVault = ZapVault.attach(taskArgs.contractAddress);

    // Claims ownership over ZapVault
    await zapVault.claimTransferOwnership();
  });
