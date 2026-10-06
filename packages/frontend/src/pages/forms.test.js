import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { createProduct, loginUser, registerUser } from '../services/api';
import AddProduct from './AddProduct';
import Login from './Login';
import Register from './Register';

jest.mock('../services/api', () => ({
  createProduct: jest.fn(),
  loginUser: jest.fn(),
  registerUser: jest.fn()
}));

const renderWithDestination = (ui, path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      {ui}
      <Routes>
        <Route path="/products" element={<p>Products destination</p>} />
        <Route path="/login" element={<p>Login destination</p>} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

test('Login submits credentials, notifies the app, and navigates on success', async () => {
  const user = userEvent.setup();
  const onLogin = jest.fn();
  loginUser.mockResolvedValue({ token: 'token' });

  renderWithDestination(<Login onLogin={onLogin} />);
  await user.type(screen.getByPlaceholderText('Username'), 'ada');
  await user.type(screen.getByPlaceholderText('Password'), 'secret');
  await user.click(screen.getByRole('button', { name: 'Login' }));

  await waitFor(() => expect(loginUser).toHaveBeenCalledWith('ada', 'secret'));
  expect(onLogin).toHaveBeenCalledTimes(1);
  expect(await screen.findByText('Products destination')).toBeInTheDocument();
});

test('Login displays API errors and does not notify the app on failure', async () => {
  const onLogin = jest.fn();
  loginUser.mockRejectedValue({ error: 'Invalid credentials' });

  renderWithDestination(<Login onLogin={onLogin} />);
  fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'ada' } });
  fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrong' } });
  fireEvent.click(screen.getByRole('button', { name: 'Login' }));

  expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  expect(onLogin).not.toHaveBeenCalled();
});

test('Register submits all fields and navigates on success', async () => {
  const user = userEvent.setup();
  registerUser.mockResolvedValue({ token: 'token' });

  renderWithDestination(<Register />);
  await user.type(screen.getByPlaceholderText('First Name'), 'Ada');
  await user.type(screen.getByPlaceholderText('Last Name'), 'Lovelace');
  await user.type(screen.getByPlaceholderText('Username'), 'ada');
  await user.type(screen.getByPlaceholderText('Password'), 'secure');
  await user.click(screen.getByRole('button', { name: 'Register' }));

  await waitFor(() =>
    expect(registerUser).toHaveBeenCalledWith({
      firstname: 'Ada',
      lastname: 'Lovelace',
      password: 'secure',
      username: 'ada'
    })
  );
  expect(await screen.findByText('Products destination')).toBeInTheDocument();
});

test('Register displays API errors and links back to login', async () => {
  const user = userEvent.setup();
  registerUser.mockRejectedValue({ response: { data: { error: 'Username already exists' } } });

  renderWithDestination(<Register />);
  await user.click(screen.getByRole('button', { name: 'Register' }));

  expect(await screen.findByText('Username already exists')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login');
});

test('AddProduct validates required fields before making an API request', async () => {
  renderWithDestination(<AddProduct />);
  fireEvent.click(screen.getByRole('button', { name: 'Add Product' }));

  expect(await screen.findByText('All fields are required!')).toBeInTheDocument();
  expect(createProduct).not.toHaveBeenCalled();
});

test('AddProduct submits form data and navigates to products on success', async () => {
  const user = userEvent.setup();
  createProduct.mockResolvedValue({ id: 1 });

  renderWithDestination(<AddProduct />);
  await user.type(screen.getByPlaceholderText('Product Name'), 'Keyboard');
  await user.type(screen.getByPlaceholderText('Price'), '49.99');
  await user.type(screen.getByPlaceholderText('Stock'), '12');
  await user.click(screen.getByRole('button', { name: 'Add Product' }));

  await waitFor(() => expect(createProduct).toHaveBeenCalledWith({ name: 'Keyboard', price: '49.99', stock: '12' }));
  expect(await screen.findByText('Products destination')).toBeInTheDocument();
});

test('AddProduct displays API errors and Cancel navigates to products', async () => {
  const user = userEvent.setup();
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  createProduct.mockRejectedValue({ response: { data: { error: 'Product rejected' } } });

  renderWithDestination(<AddProduct />);
  await user.type(screen.getByPlaceholderText('Product Name'), 'Keyboard');
  await user.type(screen.getByPlaceholderText('Price'), '49');
  await user.type(screen.getByPlaceholderText('Stock'), '2');
  await user.click(screen.getByRole('button', { name: 'Add Product' }));

  expect(await screen.findByText('Product rejected')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(await screen.findByText('Products destination')).toBeInTheDocument();
  errorSpy.mockRestore();
});
