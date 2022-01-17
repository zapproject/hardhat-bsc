import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import { fromRpcSig } from 'ethereumjs-util';
import { signTypedData_v4 } from 'eth-sig-util'
import { EIP712Domain, EIP712Signature } from '../src/types';
import { Wallet } from 'ethers'





export function getSigners(provider: JsonRpcProvider, num = 10) {
  const signers: JsonRpcSigner[] = []
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
) {
  
  const tokenId = mediaId
    
  const types = {
    Permit: [
      { name: 'spender', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  };
  const value = {
    spender: toAddress,
    tokenId,
    nonce,
    deadline,
  };
  let sig:any = await owner._signTypedData(
    domain,
    types,
    value
  );
  sig = fromRpcSig(sig);
  sig = {
    v: sig.v,
    r: sig.r,
    s: sig.s,
    deadline: deadline.toString(),
  }
  return sig;
}