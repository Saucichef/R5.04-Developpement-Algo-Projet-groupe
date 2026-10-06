import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { getProducts } from '../services/api';
import ProductList from './ProductList';

jest.mock('../services/api', () => ({
  getProducts: jest.fn()
}));

const products = [
  { id: 1, name: 'Keyboard', price: 40, stock: 0 },
  { id: 2, name: 'Monitor', price: 75, stock: 5 },
  { id: 3, name: 'Laptop', price: 120, stock: 20 }
];

beforeEach(() => {
  jest.clearAllMocks();
  getProducts.mockResolvedValue(products);
});

test('loads products and renders the add-product link', async () => {
  render(
    <MemoryRouter>
      <ProductList />
    </MemoryRouter>
  );

  expect(await screen.findByText('Keyboard')).toBeInTheDocument();
  expect(screen.getByText('Price: $75')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Add Product' })).toHaveAttribute('href', '/add-product');
});

test('searches by product text and applies price and stock filters', async () => {
  render(
    <MemoryRouter>
      <ProductList />
    </MemoryRouter>
  );
  await screen.findByText('Keyboard');

  fireEvent.change(screen.getByPlaceholderText('Search products...'), { target: { value: 'keyboad' } });
  expect(screen.getByText('Keyboard')).toBeInTheDocument();
  expect(screen.queryByText('Monitor')).not.toBeInTheDocument();

  fireEvent.change(screen.getByPlaceholderText('Search products...'), { target: { value: '' } });
  fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'medium' } });
  fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'low' } });
  expect(screen.getByText('Monitor')).toBeInTheDocument();
  expect(screen.queryByText('Keyboard')).not.toBeInTheDocument();

  fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'high' } });
  fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'available' } });
  expect(screen.getByText('Laptop')).toBeInTheDocument();
  expect(screen.queryByText('Monitor')).not.toBeInTheDocument();
});

test('shows the empty state and displays a load error when the API rejects', async () => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  getProducts.mockRejectedValue(new Error('network error'));

  render(
    <MemoryRouter>
      <ProductList />
    </MemoryRouter>
  );

  expect(await screen.findByText('Failed to load products')).toBeInTheDocument();
  expect(screen.getByText('No products found matching your criteria')).toBeInTheDocument();
  await waitFor(() => expect(getProducts).toHaveBeenCalledTimes(1));
  errorSpy.mockRestore();
});
