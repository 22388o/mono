import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { Footer } from './index';

describe('Footer component test', () => {
  it('renders component', async () => {

    const {container} = render(
      <Footer />
    );

    expect(container).toMatchSnapshot();
  });
});
