import { gql } from 'graphql-request';

export const Query_Tokens = gql`
  {
    Token(limit: 20, order_by: { mintTransferEvent: { blockNumber: desc } }) {
      tokenId
      address
      minter
      owner
      mintTransferEvent {
        blockTimestamp
      }
      metadata {
        json
      }
    }
  }
`;

export const Query_Token_ByAddress = (address: string) => {
  return gql`
    {
      Token(where: { address: { _eq: "${address}" } }, order_by: { tokenId: asc }, limit: 100) {
        tokenId
        address
        minter
        owner
        metadata {
          json
        }
      }
    }
  `;
};

export const queryMedia = gql`
  {
    Media(order_by: { tokenId: desc }, limit: 100) {
      tokenId
      creator
      creatorBidShare
      owner
      contentURI
      metadataURI
      contentHash
      metadataHash
      metadata {
        json
      }
    }
  }
`;

export const Query_Auction = gql`
  {
    Auction(
      where: { lastBidder: { _is_null: false }, _not: { endedEvent: {} } }
      order_by: { auctionId: desc }
      limit: 10
    ) {
      tokenContract
      tokenId
      tokenOwner
      auctionCurrency
      reservePrice
      curator
      curatorFee
      approved
      expiresAt
      winner
      lastBidder
      lastBidAmount
    }
  }
`;
