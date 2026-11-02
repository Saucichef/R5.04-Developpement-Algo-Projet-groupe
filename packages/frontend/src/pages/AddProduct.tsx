import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createProduct } from '../services/api';

const AddProduct = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !price || !stock) {
      setError('All fields are required!');
      return;
    }

    try {
      await createProduct({
        name,
        price: price,
        stock: stock
      });
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create product');
      console.error('Error creating product:', err);
    }
  };

  return (
    <div
      style={{
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        margin: '0 auto',
        maxWidth: '400px',
        padding: '20px'
      }}
    >
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Add New Product</h2>

      {error && (
        <div
          style={{
            backgroundColor: '#ffebee',
            borderRadius: '4px',
            color: 'red',
            marginBottom: '10px',
            padding: '10px'
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}
      >
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '8px'
          }}
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '8px'
          }}
        />

        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '8px'
          }}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => navigate('/products')}
            style={{
              backgroundColor: '#f44336',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              flex: 1,
              padding: '10px'
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            style={{
              backgroundColor: '#4CAF50',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              flex: 1,
              padding: '10px'
            }}
          >
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
