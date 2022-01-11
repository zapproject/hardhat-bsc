import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
/**
 * Internal type to represent a Decimal Value
 */
export declare type DecimalValue = {
    value: BigNumber;
};
export declare type MediaData = {
    tokenURI: any;
    metadataURI: any;
    contentHash: any;
    metadataHash: any;
};
/**
 * Zap Media Protocol Ask
 */
export declare type Ask = {
    currency: string;
    amount: BigNumberish;
};
/**
 * Zap Media Protocol Bid
 */
export declare type Bid = {
    currency: string;
    amount: BigNumberish;
    bidder: string;
    recipient: string;
    sellOnShare: DecimalValue;
};
export declare type BidShares = {
    collaborators: any;
    collabShares: any;
    creator: any;
    owner: any;
};
