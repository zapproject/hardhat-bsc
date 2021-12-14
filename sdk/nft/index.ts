import { ethers } from 'ethers';
import { mediaFactoryAddress } from './addresses';
import { mediaFactoryAbi } from './abi';

async function test() {

    const provider = await new ethers.providers.JsonRpcProvider(
        'https://speedy-nodes-nyc.moralis.io/732ab4a941019375863742e4/eth/rinkeby'
    );

    const chainId = await provider.getNetwork();

    return chainId;

}

export async function deployMedia(network: string) {

    const mf = new ethers.Contract(
        mediaFactoryAddress.rinkeby,
        mediaFactoryAbi,
    )
}


deployMedia('Testing')

