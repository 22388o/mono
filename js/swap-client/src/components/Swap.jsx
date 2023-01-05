import React from 'react';
import { Header, Image } from 'semantic-ui-react'
import { SwapDemo } from './SwapDemo'

export const Swap = () => {
  return (
    <div className="App">
      <div>
        <Image
          centered
          circular
          size='large'
          src='https://pbs.twimg.com/profile_banners/1082726135941586949/1650477093/1500x500'
        />
        <Header as='h2' icon textAlign='center'>
          <Header.Content>Portal Lightning Swap Demo</Header.Content>
        </Header>
        <br />
      </div>
      <SwapDemo />
    </div>
  );
}