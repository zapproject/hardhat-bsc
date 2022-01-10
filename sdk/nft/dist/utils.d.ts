import { DecimalValue, MediaData, Ask } from './types';
import { BigNumberish, BytesLike } from 'ethers';
/**
 * Returns the MediaFactory, ZapMarket, and ZapMedia contract addresses depending on the networkId.
 * @param {string} networkId- The numeric value that routes to a blockchain network.
 */
export declare const contractAddresses: (networkId: number) => any;
export declare const validateBidShares: (collabShares: Array<DecimalValue>, creator: DecimalValue, owner: DecimalValue) => void;
/**
 * Constructs an Ask.
 *
 * @param currency
 * @param amount
 */
export declare function constructAsk(currency: string, amount: BigNumberish): Ask;
/**
 * Decimal is a class to make it easy to go from Javascript / Typescript `number` | `string`
 * to ethers `BigDecimal` with the ability to customize precision
 */
export declare class Decimal {
    /**
     * Returns a `DecimalValue` type from the specified value and precision
     * @param value
     * @param precision
     */
    static new(value: number | string, precision?: number): any;
    /**
     * Returns the number of decimals for value
     * @param value
     */
    private static countDecimals;
}
/**
 * Constructs a MediaData type.
 *
 * @param tokenURI
 * @param metadataURI
 * @param contentHash
 * @param metadataHash
 */
export declare function constructMediaData(tokenURI: string, metadataURI: string, contentHash: BytesLike, metadataHash: BytesLike): MediaData;
/**
 * Constructs a BidShares type.
 * Throws an error if the BidShares do not sum to 100 with 18 trailing decimals.
 *
 * @param creator
 * @param owner
 * @param prevOwner
 */
export declare function constructBidShares(collaborators: Array<string>, collabShares: Array<number>, creator: number, owner: number): any;
/**
 * Validates the URI is prefixed with `https://`
 *
 * @param uri
 */
export declare function validateURI(uri: string): void;
