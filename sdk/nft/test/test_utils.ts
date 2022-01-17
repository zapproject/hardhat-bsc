import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import { fromRpcSig } from 'ethereumjs-util';
import { signTypedData_v4 } from 'eth-sig-util'
import { EIP712Domain, EIP712Signature } from '../src/types';
import { Wallet } from 'ethers'





export function getSigners(provider:JsonRpcProvider, num=10){
    const signers:JsonRpcSigner[] = []
    for (let i = 0; i < num; i++) {
        signers.push(provider.getSigner(i))
    }
    return signers;     
}


export async function signPermitMessage(
    owner: Wallet,
    toAddress: string,
    mediaId: number,
    nonce: number,
    deadline: number,
    domain: EIP712Domain
  ): Promise<EIP712Signature> {
    const tokenId = mediaId
  
    return new Promise<EIP712Signature>(async (res, reject) => {
      try {
        const sig = signTypedData_v4(Buffer.from(owner.privateKey.slice(2), 'hex'), {
          data: {
            types: {
              EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' },
              ],
              Permit: [
                { name: 'spender', type: 'address' },
                { name: 'tokenId', type: 'uint256' },
                { name: 'nonce', type: 'uint256' },
                { name: 'deadline', type: 'uint256' },
              ],
            },
            primaryType: 'Permit',
            domain: domain,
            message: {
              spender: toAddress,
              tokenId,
              nonce,
              deadline,
            },
          },
        })
  
        const response = fromRpcSig(sig)
  
        res({
          r: response.r,
          s: response.s,
          v: response.v,
          deadline: deadline.toString(),
        })
      } catch (e) {
        console.error(e)
        reject(e)
      }
    })
  }