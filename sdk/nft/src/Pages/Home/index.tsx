import { useState, useEffect } from 'react';
import { request } from 'graphql-request';
import styled from 'styled-components';
import { Image as BaseImage, Title, Content } from '../../components/Toolkit';

import { Query_Tokens } from '../../graph/queries';

const Container = styled.div`
  padding: 50px 50px;
`;

const NFtsCardWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  grid-row-gap: 32px;
  grid-column-gap: 32px;
  align-items: center;
  justify-items: center;
  margin-bottom: 52px;
`;

const NFTCard = styled.div`
  width: 320px;
  border: 1px solid white;
`;

const Image = styled(BaseImage)`
  width: 100%;
  height: 320px;
`;

const ContentWrapper = styled.div`
  padding: 20px 25px;
`;

const Home = () => {
  const API_URL = 'https://indexer-prod-mainnet.zora.co/v1/graphql';

  const [nfts, setNfts] = useState([]);

  useEffect(() => {
    request(API_URL, Query_Tokens).then((data) => setNfts(data.Token));
  }, []);

  return (
    <Container>
      <NFtsCardWrapper>
        {nfts.map((nft: any) => (
          <NFTCard key={nft.tokenId}>
            <Image src={nft?.metadata?.json?.image} width={320} height={320} alt="NFT" />
            <ContentWrapper>
              <Title mb="10px">{nft?.metadata?.json?.name}</Title>
              <Content>{nft?.metadata?.json?.description}</Content>
            </ContentWrapper>
          </NFTCard>
        ))}
      </NFtsCardWrapper>
    </Container>
  );
};

export default Home;
