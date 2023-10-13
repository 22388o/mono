import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { MobileWarningPage } from './MobileWarningPage';

describe('MobileWarningPage component test', () => {
  it('renders component', async () => {

    const {container} = render(
      <MobileWarningPage />
    );

    expect(container).toMatchSnapshot();
  });
});
