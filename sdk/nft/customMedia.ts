import { Contract, ethers, Signer } from 'ethers';

import { contractAddresses } from './utils';

import { zapMarketAbi } from './abi';

class CustomMedia {
    zapMarket: Contract
    // zapMedia: Contract
    networkId: number;
    signer: Signer;

    constructor(networkId: number, signer: Signer, mediaIndex?: number) {

        this.networkId = networkId;

        this.signer = signer;

        // if (mediaIndex === undefined) {

        //     this.zapMedia = new ethers.Contract(
        //         contractAddresses(networkId).zapMedia,
        //         zapMarketAbi,
        //         signer,
        //     );

        // }

        this.zapMarket = new ethers.Contract(
            contractAddresses(networkId).zapMarketAddress,
            zapMarketAbi,
            signer,
        );

    }

}

export default CustomMedia;