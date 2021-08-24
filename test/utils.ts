import { fromRpcSig } from 'ethereumjs-util';

export async function signMintWithSig (zapMedia1: any, signers: any, contentHash: any, metadataHash: any, version: string) {
	const nonce = (await zapMedia1.mintWithSigNonces(signers[1].address)).toNumber();
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