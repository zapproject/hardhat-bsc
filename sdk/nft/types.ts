import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { BytesLike } from '@ethersproject/bytes'

/**
 * Internal type to represent a Decimal Value
 */
export type DecimalValue = { value: BigNumber }

export type MediaData = {
    tokenURI: any
    metadataURI: any
    contentHash: any
    metadataHash: any
}

export type BidShares = {
    collaborators: any
    collabShares: any
    creator: any
    owner: any
}
