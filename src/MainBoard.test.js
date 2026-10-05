import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import MainBoard from './components/mainBoard';

// Mock react-p5 component for headless JSDOM testing
jest.mock('react-p5', () => () => <div data-testid="p5-sketch" />);

test('renders Tetris 2D title, toolbar, and virtual directional buttons', () => {
    const { getByText, getAllByText } = render(<MainBoard />);
    expect(getByText('TETRIS 2D')).toBeInTheDocument();
    expect(getByText(/New Game/i)).toBeInTheDocument();
    expect(getAllByText(/Pause/i)[0]).toBeInTheDocument();
    expect(getByText('↻')).toBeInTheDocument();
    expect(getByText('◀')).toBeInTheDocument();
    expect(getByText('▶')).toBeInTheDocument();
    expect(getByText('▼')).toBeInTheDocument();
});
