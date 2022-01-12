import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { BytesLike } from '@ethersproject/bytes';

/**
 * Internal type to represent a Decimal Value
 */
export type DecimalValue = { value: BigNumber };

export type MediaData = {
  tokenURI: any;
  metadataURI: any;
  contentHash: any;
  metadataHash: any;
};

/**
 * Zap Media Protocol Ask
 */
export type Ask = {
  currency: string;
  amount: BigNumberish;
};

/**
 * Zap Media Protocol Bid
 */
export type Bid = {
  currency: string;
  amount: BigNumberish;
  bidder: string;
  recipient: string;
  sellOnShare: DecimalValue;
};

export type BidShares = {
  collaborators: any;
  collabShares: any;
  creator: any;
  owner: any;
};
