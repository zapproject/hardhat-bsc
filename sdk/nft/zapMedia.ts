import { Contract, ethers, Signer } from 'ethers';

import { contractAddresses } from './utils';

import { zapMarketAbi, zapMediaAbi } from './abi';

const zapMedia = async (networkId: number, signer: Signer, mediaIndex?: any) => {

    let zapMarket = new ethers.Contract(
        contractAddresses(networkId).zapMarketAddress,
        zapMarketAbi,
        signer
    );

    if (mediaIndex === undefined) {

        const internalMedia = new ethers.Contract(
            contractAddresses(networkId).zapMediaAddress,
            zapMediaAbi,
            signer,
        );

        return internalMedia

    } else {

        const signerAddress = await signer.getAddress();

        const media = await zapMarket.mediaContracts(signerAddress, ethers.BigNumber.from(mediaIndex));

        const customMedia = new ethers.Contract(
            media,
            zapMediaAbi,
            signer,
        );

        return customMedia
    }
}

class ZapMedia {
    networkId: number;
    mediaIndex: any
    contract: any
    signer: Signer;

    constructor(networkId: number, signer: Signer, mediaIndex?: number) {

        this.networkId = networkId;

        this.signer = signer;

        this.mediaIndex = mediaIndex;

        this.contract = zapMedia(networkId, signer, mediaIndex)


    }

    async test(): Promise<void> {
        return this.contract
    }


}

export default ZapMedia;