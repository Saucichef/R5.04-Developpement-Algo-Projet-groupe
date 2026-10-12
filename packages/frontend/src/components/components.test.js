import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import ErrorBoundary from './ErrorBoundary';
import LoadingSpinner from './LoadingSpinner';
import Navigation from './Navigation';

beforeEach(() => {
  localStorage.clear();
});

test('renders an accessible loading indicator container', () => {
  const { container } = render(<LoadingSpinner />);

  const spinner = container.firstChild.firstChild;
  expect(spinner).toBeInTheDocument();
  expect(spinner.style.width).toBe('50px');
});

test('ErrorBoundary renders its children and displays a fallback after a render error', () => {
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const BrokenChild = () => {
    throw new Error('render failed');
  };

  const { rerender } = render(
    <ErrorBoundary>
      <p>Healthy content</p>
    </ErrorBoundary>
  );
  expect(screen.getByText('Healthy content')).toBeInTheDocument();

  rerender(
    <ErrorBoundary>
      <BrokenChild />
    </ErrorBoundary>
  );

  expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
  expect(screen.getByText('Error: render failed')).toBeInTheDocument();
  expect(logSpy).toHaveBeenCalled();
  logSpy.mockRestore();
  errorSpy.mockRestore();
});

test('Navigation displays user links and logs out', () => {
  localStorage.setItem('token', 'session-token');
  localStorage.setItem('user', JSON.stringify({ firstname: 'Ada' }));
  const onLogout = jest.fn();

  render(
    <MemoryRouter initialEntries={['/products']}>
      <Navigation onLogout={onLogout} />
      <Routes>
        <Route path="/login" element={<p>Login destination</p>} />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByRole('link', { name: 'Users' })).toHaveAttribute('href', '/users');
  expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('href', '/products');
  expect(screen.getByText(/Ada/)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

  expect(localStorage.getItem('token')).toBeNull();
  expect(localStorage.getItem('user')).toBeNull();
  expect(onLogout).toHaveBeenCalledTimes(1);
  expect(screen.getByText('Login destination')).toBeInTheDocument();
});
