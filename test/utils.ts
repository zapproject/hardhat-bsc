import { fromRpcSig } from 'ethereumjs-util';
import { ZapMedia } from '../typechain/ZapMedia';

export async function signPermit (
	zapMedia1: ZapMedia,
	toAddress: any,
	signers: any,
	tokenId: any,
	version: string
) {
	const nonce = (await zapMedia1.getPermitNonce(signers[3].address, tokenId)).toNumber();
	const deadline = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24; // 24 hours
	const name = await zapMedia1.name();

	const chainId = await signers[5].getChainId();
	const domain = {
		name,
		version,
		chainId,
		verifyingContract: zapMedia1.address,
	};
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
	let sig = await signers[3]._signTypedData(
		domain,
		types,
		value
	);
	sig = fromRpcSig(sig);
	sig = {
		r: sig.r,
		s: sig.s,
		v: sig.v,
		deadline: deadline.toString(),
	}
	
	return sig;
}

export async function signMintWithSig (
	zapMedia1: ZapMedia,
	signers: any,
	contentHash: any,
	metadataHash: any,
	version: string
) {
	const nonce = (await zapMedia1.getSigNonces(signers[1].address)).toNumber();
	const deadline = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24; // 24 hours
	const name = await zapMedia1.name();

	const chainId = await signers[1].getChainId();
	const creatorShare = BigInt(10000000000000000000);
	const domain = {
		name,
		version,
		chainId,
		verifyingContract: zapMedia1.address,
	};
	const types = {
		MintWithSig: [
			{ name: 'contentHash', type: 'bytes32' },
			{ name: 'metadataHash', type: 'bytes32' },
			{ name: 'creatorShare', type: 'uint256' },
			{ name: 'nonce', type: 'uint256' },
			{ name: 'deadline', type: 'uint256' },
		],
	};
	const value = {
		contentHash,
		metadataHash,
		creatorShare,
		nonce,
		deadline,
	};
	let sig = await signers[1]._signTypedData(
		domain,
		types,
		value
	);
	sig = fromRpcSig(sig);
	sig = {
		r: sig.r,
		s: sig.s,
		v: sig.v,
		deadline: deadline.toString(),
	}
	
	return sig;
}