import { act, renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { useApi } from './useApi';
import { useAuth } from './useAuth';

jest.mock('axios');

const wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

test('useApi runs HTTP helpers with auth headers and returns response data', async () => {
  localStorage.setItem('token', 'api-token');
  axios.mockResolvedValue({ data: { ok: true } });
  const { result } = renderHook(() => useApi());

  await act(async () => {
    await expect(result.current.get('/users')).resolves.toEqual({ ok: true });
    await expect(result.current.post('/users', { name: 'Ada' })).resolves.toEqual({ ok: true });
    await expect(result.current.put('/users/1', { name: 'Grace' })).resolves.toEqual({ ok: true });
    await expect(result.current.delete('/users/1')).resolves.toEqual({ ok: true });
  });

  expect(axios).toHaveBeenNthCalledWith(1, {
    headers: { Authorization: `Bearer ${'api-token'}` },
    method: 'GET',
    url: '/users'
  });
  expect(axios).toHaveBeenNthCalledWith(2, {
    data: { name: 'Ada' },
    headers: { Authorization: `Bearer ${'api-token'}` },
    method: 'POST',
    url: '/users'
  });
  expect(result.current.loading).toBe(false);
  expect(result.current.error).toBeNull();
});

test('useApi exposes request errors and clears loading state', async () => {
  const apiError = new Error('request failed');
  apiError.response = { data: { error: 'Unavailable' } };
  axios.mockRejectedValue(apiError);
  const { result } = renderHook(() => useApi());

  await act(async () => {
    await expect(result.current.request({ method: 'GET', url: '/failure' })).rejects.toBe(apiError);
  });

  expect(result.current.error).toBe('Unavailable');
  expect(result.current.loading).toBe(false);
  expect(axios).toHaveBeenCalledWith({
    headers: { Authorization: undefined },
    method: 'GET',
    url: '/failure'
  });
});

test('useAuth restores, logs in, and logs out a user', async () => {
  localStorage.setItem('token', 'existing-token');
  localStorage.setItem('user', JSON.stringify({ firstname: 'Ada' }));
  const { result } = renderHook(() => useAuth(), { wrapper });

  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.user).toEqual({ firstname: 'Ada' });

  act(() => result.current.login('next-token', { firstname: 'Grace' }));
  expect(result.current.user).toEqual({ firstname: 'Grace' });
  expect(localStorage.getItem('token')).toBe('next-token');

  act(() => result.current.logout());
  expect(result.current.user).toBeNull();
  expect(localStorage.getItem('user')).toBeNull();
});

test('useAuth starts without a user', async () => {
  const { result } = renderHook(() => useAuth(), { wrapper });
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.user).toBeNull();
});
