import { GraphQLClient } from 'graphql-request';
import { Query_Tokens } from './queries';

const API_URL = 'https://indexer-dev-rinkeby.zora.co/v1/graphql';

class NFTsQuery {
  helper: GraphQLClient;

  constructor() {
    this.helper = new GraphQLClient(API_URL);
  }

  gueryTokens() {
    return this.helper.request(Query_Tokens).then((response) => {
      return response;
    });
  }
}

export default new NFTsQuery();
