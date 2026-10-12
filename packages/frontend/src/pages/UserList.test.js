import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { getUsers } from '../services/api';
import UserList from './UserList';

jest.mock('../services/api', () => ({
  getUsers: jest.fn()
}));

const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

beforeEach(() => {
  jest.clearAllMocks();
  getUsers.mockResolvedValue([
    { created_at: daysAgo(2), firstname: 'Ada', id: 1, lastname: 'Lovelace', username: 'ada' },
    { created_at: daysAgo(14), firstname: 'Grace', id: 2, lastname: 'Hopper', username: 'grace' },
    { created_at: daysAgo(45), firstname: 'Alan', id: 3, lastname: 'Turing', username: 'alan' }
  ]);
});

test('loads users, searches names, filters by join date, and sorts results', async () => {
  render(<UserList />);
  expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 3 })[0]).toHaveTextContent('Ada Lovelace');

  fireEvent.change(screen.getByPlaceholderText('Search users...'), { target: { value: 'Alan' } });
  expect(screen.getByText('Alan Turing')).toBeInTheDocument();
  expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();

  fireEvent.change(screen.getByPlaceholderText('Search users...'), { target: { value: '' } });
  fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'week' } });
  expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  expect(screen.queryByText('Grace Hopper')).not.toBeInTheDocument();

  fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'username' } });
  fireEvent.click(screen.getByRole('button', { name: '↑' }));
  expect(screen.getAllByRole('heading', { level: 3 })[0]).toHaveTextContent('Ada Lovelace');
  fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'older' } });
  expect(screen.getByText('Alan Turing')).toBeInTheDocument();
});

test('shows an empty result and API errors', async () => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  getUsers.mockRejectedValue(new Error('network error'));

  render(<UserList />);
  expect(await screen.findByText('Failed to load users')).toBeInTheDocument();
  expect(screen.getByText('No users found matching your criteria')).toBeInTheDocument();
  errorSpy.mockRestore();
});
