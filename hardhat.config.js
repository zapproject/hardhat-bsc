require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction(async taskArgs => {
    const account = web3.utils.toChecksumAddress(taskArgs.account);
    const balance = await web3.eth.getBalance(account);

    console.log(web3.utils.fromWei(balance, "ether"), "ETH");
  });``
module.exports = {};


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

// PROJECT ID
// 252454d8211b44b188a7be214ca4ac2f
// PROJECT SECRET
// 3ee31b9d458a4872bfca4ff8986dcaed
// ENDPOINTS
// Görli
// https://goerli.infura.io/v3/252454d8211b44b188a7be214ca4ac2f
// wss://goerli.infura.io/ws/v3/252454d8211b44b188a7be214ca4ac2f


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.4.24",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 20000
  }
};
