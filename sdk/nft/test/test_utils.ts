import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from 'ethers';
import * as testAccounts from './testAccounts.json'

export function getTestAccounts() {
    // for (account in testAccounts.private_keys){
    //     console.log(account)
    // }
    // let pk = testAccounts.private_keys
    let publicAddresses:String[] = Object.keys(testAccounts.private_keys)
    
    // pk = JSON.parse(pk.length)
    return publicAddresses;
}

// import { ethers, Wallet } from 'ethers';
// const ganache = require("ganache-core");
// const provider = new ethers.providers.Web3Provider(ganache.provider());
// const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

// export function getProvider(){
//     // const options = {
//     //     mnemonic:"ostrich mixture embrace quote comic until exchange rubber butter royal august stay"
//     // }
//     return new ethers.providers.Web3Provider(ganache.provider())
//     // export const provider = new ethers.providers.Web3Provider(ganache.provider(options))
    
// }

// console.log(provider)
// console.log(provider.provider)



/*
if private keys do not match, make sure to run ganache-cli command below. 
It will create the same public.private key for consistent developlment.

ganache-cli --mnemonic "ostrich mixture embrace quote comic until exchange rubber butter royal august stay"

*/

// const mainWallet: Wallet = new ethers.Wallet("0x89e2d8a81beffed50f4d29f642127f18b5c8c1212c54b18ef66a784d0a172819")

export function getSigners(provider: JsonRpcProvider, num = 10) {
    const signers: JsonRpcSigner[] = []
    for (let i = 0; i < num; i++) {
        signers.push(provider.getSigner(i))
    }
    return signers;
}

export function getWallets(provider: JsonRpcProvider, num = 10) {

    const mnemonic = "ostrich mixture embrace quote comic until exchange rubber butter royal august stay"

    const wallets: Wallet[] = []

    for (let i = 0; i < num; i++) {
        // wallets2.push(Wallet.fromMnemonic(mnemonic, `m/44'/60'/${i}'/0/0`).connect(provider))
        wallets.push(Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${i}`).connect(provider))
    }




    return wallets;

}
