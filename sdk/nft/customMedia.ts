import { Contract, ethers, Signer } from 'ethers';

import { contractAddresses } from './utils';

import { zapMarketAbi } from './abi';

class CustomMedia {
    zapMarket: Contract
    networkId: number;
    signer: Signer;

    constructor(networkId: number, signer: Signer, mediaIndex?: number) {

        this.networkId = networkId;

        this.signer = signer;

        this.zapMarket = new ethers.Contract(
            contractAddresses(networkId).zapMarketAddress,
            zapMarketAbi,
            signer,
        );

    }

}

export default CustomMedia;