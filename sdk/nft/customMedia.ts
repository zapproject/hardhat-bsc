import { Contract, ethers, Signer } from 'ethers';

class CustomMedia {
    networkId: number;
    signer: Signer;


    constructor(networkId: number, signer: Signer) {
        this.networkId = networkId;
        this.signer = signer;
    }


}