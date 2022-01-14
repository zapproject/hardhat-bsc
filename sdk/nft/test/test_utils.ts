import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from 'ethers';

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

    // const PRIVATE_KEYS = [
    //     "0x89e2d8a81beffed50f4d29f642127f18b5c8c1212c54b18ef66a784d0a172819",
    //     "0x043192f7a8fb472d04ef7bb0ba1fbb3667198253cc8046e9e56626b804966cb3",
    //     "0xdd67d5a5cee4f497cb5aaff1e1572ac6769b312794935dce371f6364e9bb667f",
    //     "0x0f7931455e111234163f34a1150a077ee747f9b75dbee4ccc3d181d4f5938e8c",
    //     "0xd3fcc7d75bbf2c66dbfb8ee808d61498d85b5c77abae956fb7086808a7cc2a52",
    //     "0xaf5a5fe8174215ef0cafd8a8969e4f4de83fa5e67e77bcfd0e1cdfcd0ba83eea",
    //     "0xd0a4ca24b2c67bf89e39463bc4f543ce8b488f33bfde478888de1341438e6e63",
    //     "0x7534f8a7b95879bde0bd5a997f156965a7092263b940a2bf34e6bc92dc2b6b64",
    //     "0x81c92fdc4c4703cb0da2af8ceae63160426425935f3bb701edd53ffa5c227417",
    //     "0x915c40257f694fef7d8058fe4db4ba53f1343b592a8175ea18e7ece20d2987d7"
    // ]

    // const wallets: Wallet[] = []

    // for (let i = 0; i < num; i++) {
    //     wallets.push(new Wallet(PRIVATE_KEYS[i], provider))
    // }



    const mnemonic = "ostrich mixture embrace quote comic until exchange rubber butter royal august stay"

    const wallets: Wallet[] = []

    for (let i = 0; i < num; i++) {
        // wallets2.push(Wallet.fromMnemonic(mnemonic, `m/44'/60'/${i}'/0/0`).connect(provider))
        wallets.push(Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${i}`).connect(provider))
    }




    return wallets;

}
