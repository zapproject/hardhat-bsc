import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';


export function getSigners(provider:JsonRpcProvider, num=10){
    const signers:JsonRpcSigner[] = []
    for (let i = 0; i < num; i++) {
        signers.push(provider.getSigner(i))
    }
    return signers;     
}

