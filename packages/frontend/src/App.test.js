import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import App from './App';
import { getProducts, loginUser, logout } from './services/api';

jest.mock('./services/api', () => ({
  createProduct: jest.fn(),
  getProducts: jest.fn(),
  getUsers: jest.fn(),
  loginUser: jest.fn(),
  logout: jest.fn(),
  registerUser: jest.fn()
}));

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
  jest.clearAllMocks();
  getProducts.mockResolvedValue([]);
  logout.mockImplementation(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  });
});

test('redirects unauthenticated users to login', async () => {
  render(<App />);

  expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument();
});

test('completes login, renders authenticated navigation, and logs out', async () => {
  loginUser.mockImplementation(async () => {
    localStorage.setItem('token', 'valid-token');
    localStorage.setItem('user', JSON.stringify({ firstname: 'Ada' }));
  });

  render(<App />);

  fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'ada' } });
  fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'secret' } });
  fireEvent.click(screen.getByRole('button', { name: 'Login' }));

  expect(await screen.findByRole('heading', { name: 'Products' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

  expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument();
  expect(logout).toHaveBeenCalledTimes(1);
  expect(localStorage.getItem('token')).toBeNull();
});

test('redirects authenticated users from the root route to products', async () => {
  localStorage.setItem('token', 'valid-token');
  localStorage.setItem('user', JSON.stringify({ firstname: 'Ada' }));

  render(<App />);

  expect(await screen.findByRole('heading', { name: 'Products' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
});

test('updates authentication state when another tab changes storage', async () => {
  render(<App />);
  expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument();

  localStorage.setItem('token', 'external-token');
  window.dispatchEvent(new Event('storage'));

  expect(await screen.findByRole('button', { name: 'Logout' })).toBeInTheDocument();
});
