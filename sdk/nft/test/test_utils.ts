import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import { fromRpcSig } from 'ethereumjs-util';
import { signTypedData_v4 } from 'eth-sig-util'
import { EIP712Domain, EIP712Signature } from '../src/types';
import { BigNumber, BytesLike, Wallet } from 'ethers'
import { hexDataLength, hexlify, isHexString } from 'ethers/lib/utils';
import invariant from 'tiny-invariant';





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

export async function signMintWithSigMessage(
  owner: Wallet,
  contentHash: BytesLike,
  metadataHash: BytesLike,
  creatorShareBN: BigNumber,
  nonce: number,
  deadline: number,
  domain: EIP712Domain
): Promise<EIP712Signature> {
  try {
    validateBytes32(contentHash)
    validateBytes32(metadataHash)
  } catch (err: any) {
    return Promise.reject(err.message)
  }

  const creatorShare = creatorShareBN.toString()

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
            MintWithSig: [
              { name: 'contentHash', type: 'bytes32' },
              { name: 'metadataHash', type: 'bytes32' },
              { name: 'creatorShare', type: 'uint256' },
              { name: 'nonce', type: 'uint256' },
              { name: 'deadline', type: 'uint256' },
            ],
          },
          primaryType: 'MintWithSig',
          domain: domain,
          message: {
            contentHash,
            metadataHash,
            creatorShare,
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

/**
 * Validates if the input is exactly 32 bytes
 * Expects a hex string with a 0x prefix or a Bytes type
 *
 * @param value
 */
 export function validateBytes32(value: BytesLike) {
  if (typeof value == 'string') {
    if (isHexString(value) && hexDataLength(value) == 32) {
      return
    }

    invariant(false, `${value} is not a 0x prefixed 32 bytes hex string`)
  } else {
    if (hexDataLength(hexlify(value)) == 32) {
      return
    }

    invariant(false, `value is not a length 32 byte array`)
  }
}
