// import { ethers, Wallet } from 'ethers';
const { defaultAccounts } = require("ethereum-waffle");
const ganache = require("ganache-core");
const options = {
    mnemonic:"ostrich mixture embrace quote comic until exchange rubber butter royal august stay",
    account_keys_path:"./test/testAccounts.json"
}

const server = ganache.server(options);
// const provider = server.provider;
const port = 8545
// server.listen(port);
server.listen(port, function(err, blockchain) {
    if(err){
        console.log(err);
    }
    else {
        console.log("Ganache up and running.")
    }
});
