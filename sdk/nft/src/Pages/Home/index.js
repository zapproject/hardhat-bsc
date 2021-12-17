import { useCallback } from 'react';
import styled from 'styled-components';
import Web3 from 'web3';
import { useWeb3React } from '@web3-react/core';
import { useNFT, useNFTMetadata } from '@zoralabs/nft-hooks';
import { AuctionHouse } from '@zoralabs/zdk';
import {
  Button as BaseButton,
  Flex,
  Image as BaseImage,
  Title,
  SubTitle,
  Content,
} from '../../components/Toolkit';
import timeDiffCalc from '../../utils/timeDiffCalc';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 50px 50px;
`;

const NFTCard = styled.div`
  display: flex;
  width: 1000px;
  border: 1px solid white;
`;

const Image = styled(BaseImage)`
  width: 500px;
  height: 500px;
`;

const ContentWrapper = styled.div`
  padding: 20px 25px;
`;

const Button = styled(BaseButton)`
  width: 100%;
  padding: 12px 24px;
  font-size: 22px;
  line-height: 1.3;
  font-family: NiramitRegular;
  border: ${({ theme }) => `2px solid ${theme.colors.primaryText}`};
  border-radius: 5px;
`;

const Home = () => {
  const contractAddress = '0xabEFBc9fD2F806065b4f3C237d4b59D9A97Bcac7';
  const auctionId = '6713';
  const { chainId, library } = useWeb3React();

  const { data } = useNFT(contractAddress, auctionId);
  console.log(data);
  const metadataURI = data?.nft?.metadataURI;
  const { metadata } = useNFTMetadata(metadataURI);
  // const mimeType = metadata?.mimeType;
  const contentURI = data?.zoraNFT?.contentURI?.replace('://', '/');
  const path = `https://zora-dev.mypinata.cloud/${contentURI}`;
  const highestBid = data?.pricing?.reserve?.current?.highestBid?.pricing?.amount;
  const reservePrice = data?.pricing?.reserve?.reservePrice?.amount;
  const currency = data?.pricing?.reserve?.current?.highestBid?.pricing?.currency?.symbol;
  const timeDiff =
    new Date(parseInt(data?.pricing?.reserve?.expectedEndTimestamp) * 1000) - new Date();

  const bidHandler = useCallback(async () => {
    const wallet = library.getSigner();
    const auctionHouse = new AuctionHouse(wallet, chainId);
    await auctionHouse.createBid(auctionId, Web3.utils.toWei(highestBid, 'ether'));
  }, [chainId, highestBid, library]);

  return (
    <Container>
      {data && (
        <NFTCard>
          <Image src={path} alt="NFT" />
          <ContentWrapper>
            <Title mb="20px">{metadata?.name}</Title>
            <Content mb="20px">{metadata?.description}</Content>
            <Flex mb="10px">
              <SubTitle>Highest Bid:&nbsp;&nbsp;</SubTitle>
              <Content>
                {Web3.utils.fromWei(highestBid, 'ether')} {currency}
              </Content>
            </Flex>
            <Flex mb="10px">
              <SubTitle>Reserve Price:&nbsp;&nbsp;</SubTitle>
              <Content>
                {Web3.utils.fromWei(reservePrice, 'ether')} {currency}
              </Content>
            </Flex>
            <Flex mb="20px">
              <SubTitle>Auction End Time:&nbsp;&nbsp;</SubTitle>
              <Content>{timeDiffCalc(timeDiff)}</Content>
            </Flex>
            <Button type="button" onClick={bidHandler}>
              Place Bid
            </Button>
          </ContentWrapper>
        </NFTCard>
      )}
    </Container>
  );
};

export default Home;
