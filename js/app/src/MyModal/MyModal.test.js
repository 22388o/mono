import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { MyModal } from './MyModal';

describe('<MyModal />', () => {
  it('renders children when passed in', () => {
    const childText = "Hello Modal!";

    render(
      <MyModal open={true}>
        {childText}
      </MyModal>
    );

    expect(screen).toMatchSnapshot();
    expect(screen.getByText(childText)).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    const childText = "Hello Modal!";

    const { container } = render(
      <MyModal open={false}>
        {childText}
      </MyModal>
    );

    expect(container.querySelector('.modal-container')).not.toBeInTheDocument();
  });
});
