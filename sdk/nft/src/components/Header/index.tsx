import React, { useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { Zora } from '@zoralabs/zdk';

import { Button } from '../Toolkit';
import { injected } from '../../utils/web3React';
import getAddress from '../../utils/getAddress';

const Container = styled.div`
  padding: 50px;
`;

const WalletWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const Header = () => {
  const { active, account, library, chainId, activate, deactivate } = useWeb3React();

  useEffect(() => {
    if (chainId) {
      const wallet = library.getSigner();

      const zora = new Zora(wallet, chainId);
      console.log(zora);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

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
        {account ? <div>{getAddress(account)}</div> : <div>Not connected</div>}
      </WalletWrapper>
    </Container>
  );
};

export default Header;
