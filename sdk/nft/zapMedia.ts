import { Contract, ethers, Signer, ContractTransaction } from 'ethers';

import { contractAddresses } from './utils';

import { zapMarketAbi, zapMediaAbi } from './abi';

import { MediaData, BidShares } from './types';

import invariant from 'tiny-invariant';

import { network } from 'hardhat';

const info = async (networkId: number, signer: Signer) => {
    const zapMarket = new ethers.Contract(
        contractAddresses(networkId).zapMarketAddress,
        zapMarketAbi,
        signer,
    );

    return zapMarket;
};

class ZapMedia {
    networkId: number;
    mediaIndex: any;
    contract: any;
    signer: Signer;

    constructor(networkId: number, signer: Signer, mediaIndex?: number) {
        this.networkId = networkId;

        this.signer = signer;

        this.mediaIndex = mediaIndex;

        if (!ethers.Signer.isSigner(signer)) {
            invariant(false, 'ZapMedia Constructor: Invalid Signer.');
        }

        if (mediaIndex === undefined) {
            this.contract = new ethers.Contract(
                contractAddresses(networkId).zapMediaAddress,
                zapMediaAbi,
                signer,
            );
        } else {
        }
    }

    /**
     * Mints a new piece of media on an instance of the Zora Media Contract
     * @param mintData
     * @param bidShares
     */
    public async mint(mediaData: MediaData, bidShares: BidShares): Promise<any> {
        // console.log(mediaData)
        // console.log(bidShares)

        // const gasEstimate = await this.contract.estimateGas.mint(mediaData, bidShares);

        return await this.contract.mint(mediaData, bidShares);
    }

    public async updateContentURI(
        mediaId: number,
        tokenURI: string
    ): Promise<any> {

        if (mediaId === undefined) {
            invariant(
                false,
                'ZapMedia - updateContentURI: TokenId was not specified.'
            )
        }

    }


}
export default ZapMedia;
