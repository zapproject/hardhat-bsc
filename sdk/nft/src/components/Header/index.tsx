import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { Button } from '../Toolkit';
import { injected } from '../../utils/web3React';

const Container = styled.div`
  padding: 50px;
`;

const WalletWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const Header = () => {
  const { active, account, library, connector, activate, deactivate } = useWeb3React();

  const connectHandler = useCallback(async () => {
    try {
      await activate(injected);
    } catch (err) {
      console.log(err);
    }
  }, [activate]);

  const disconnectHandler = useCallback(() => {
    try {
      deactivate();
    } catch (err) {
      console.log(err);
    }
  }, [deactivate]);

  return (
    <Container>
      <WalletWrapper>
        <Button type="button" onClick={!active ? connectHandler : disconnectHandler}>
          {!active ? 'Connect Wallet' : 'Disconnect Wallet'}
        </Button>
        {active ? (
          <div>
            Connected with <b>{account}</b>
          </div>
        ) : (
          <div>Not connected</div>
        )}
      </WalletWrapper>
    </Container>
  );
};

export default Header;
