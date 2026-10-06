import axios from 'axios';

import { createProduct, getProducts, getUsers, loginUser, logout, registerUser } from './api';

jest.mock('axios');

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

test('loginUser stores token and user and returns the response data', async () => {
  const data = { token: 'auth-token', user: { firstname: 'Ada' } };
  axios.post.mockResolvedValue({ data });

  await expect(loginUser('ada', 'secret')).resolves.toEqual(data);
  expect(axios.post).toHaveBeenCalledWith('http://localhost:3001/api/auth/login', {
    password: 'secret',
    username: 'ada'
  });
  expect(localStorage.getItem('token')).toBe('auth-token');
  expect(localStorage.getItem('user')).toBe(JSON.stringify(data.user));
});

test('loginUser rethrows API error data', async () => {
  axios.post.mockRejectedValue({ response: { data: { error: 'Unauthorized' } } });

  await expect(loginUser('ada', 'wrong')).rejects.toEqual({ error: 'Unauthorized' });
});

test('registerUser sends form data and stores its token', async () => {
  const userData = { password: 'secret', username: 'ada' };
  axios.post.mockResolvedValue({ data: { token: 'registered-token' } });

  await expect(registerUser(userData)).resolves.toEqual({ token: 'registered-token' });
  expect(axios.post).toHaveBeenCalledWith('http://localhost:3001/api/auth/register', userData);
  expect(localStorage.getItem('token')).toBe('registered-token');
});

test('getUsers attaches the saved token and returns response data', async () => {
  localStorage.setItem('token', 'users-token');
  axios.get.mockResolvedValue({ data: [{ id: 1 }] });

  await expect(getUsers()).resolves.toEqual([{ id: 1 }]);
  expect(axios.get).toHaveBeenCalledWith('http://localhost:3001/api/auth/users', {
    headers: { Authorization: `Bearer ${'users-token'}` }
  });
});

test('getProducts processes price comparisons and returns an empty list on errors', async () => {
  localStorage.setItem('token', 'products-token');
  axios.get.mockResolvedValue({
    data: {
      data: [
        { id: 1, name: 'Cheap', price: 10 },
        { id: 2, name: 'Middle', price: 20 },
        { id: 3, name: 'Costly', price: 30 }
      ]
    }
  });

  await expect(getProducts()).resolves.toEqual([
    { id: 1, isCheapest: true, moreExpensiveCount: 2, name: 'Cheap', price: 10 },
    { id: 2, isCheapest: false, moreExpensiveCount: 1, name: 'Middle', price: 20 },
    { id: 3, isCheapest: false, moreExpensiveCount: 0, name: 'Costly', price: 30 }
  ]);
  expect(axios.get).toHaveBeenCalledWith('http://localhost:3001/api/products', {
    headers: { Authorization: `Bearer ${'products-token'}` }
  });

  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  axios.get.mockRejectedValue(new Error('offline'));
  await expect(getProducts()).resolves.toEqual([]);
  errorSpy.mockRestore();
});

test('createProduct sends the product and auth token; logout clears session data', async () => {
  localStorage.setItem('token', 'create-token');
  axios.post.mockResolvedValue({ data: { id: 3 } });
  const product = { name: 'Desk', price: 25, stock: 4 };

  await expect(createProduct(product)).resolves.toEqual({ id: 3 });
  expect(axios.post).toHaveBeenCalledWith('http://localhost:3001/api/products', product, {
    headers: { Authorization: `Bearer ${'create-token'}` }
  });

  localStorage.setItem('user', JSON.stringify({ firstname: 'Ada' }));
  logout();
  expect(localStorage.getItem('token')).toBeNull();
  expect(localStorage.getItem('user')).toBeNull();
});
