import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { ActivityTab } from './ActivityTab';

describe('ActivityTab component test', () => {
  it('renders component', () => {

    const {container} = render(
      <ActivityTab />
    );

    expect(container).toMatchSnapshot();
  });
});
