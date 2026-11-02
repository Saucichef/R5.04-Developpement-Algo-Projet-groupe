const db = require('../db/database');
const productController = require('./productController');

jest.mock('../db/database', () => ({
  getDb: jest.fn()
}));

const createResponse = () => {
  const res = {
    json: jest.fn(),
    status: jest.fn()
  };
  res.status.mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('getAllProducts returns products with comparison data', async () => {
  const products = [
    { id: 1, price: 20 },
    { id: 2, price: 50 }
  ];
  const get = jest.fn((query, values, callback) => {
    callback(null, query.includes('COUNT') ? { total: 1 } : { avg: 35 });
  });
  db.getDb.mockReturnValue({
    all: jest.fn((query, values, callback) => callback(null, products)),
    get
  });
  const res = createResponse();
  const response = new Promise((resolve) => res.json.mockImplementation(resolve));

  productController.getAllProducts({}, res);
  await response;

  expect(get).toHaveBeenCalledTimes(4);
  expect(res.json).toHaveBeenCalledWith({
    data: [
      { avgPrice: 35, cheaperCount: 1, id: 1, price: 20 },
      { avgPrice: 35, cheaperCount: 1, id: 2, price: 50 }
    ],
    message: 'success'
  });
});

test('getAllProducts returns an error when the initial query fails', async () => {
  const res = createResponse();
  db.getDb.mockReturnValue({
    all: jest.fn((query, values, callback) => callback(new Error('read failed')))
  });

  productController.getAllProducts({}, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ error: 'read failed' });
});

test('getAllProducts still returns products if detail queries fail', async () => {
  const res = createResponse();
  db.getDb.mockReturnValue({
    all: jest.fn((query, values, callback) => callback(null, [{ id: 1, price: 20 }])),
    get: jest.fn((query, values, callback) => callback(new Error('detail failed')))
  });
  const response = new Promise((resolve) => res.json.mockImplementation(resolve));

  productController.getAllProducts({}, res);
  await response;

  expect(res.json).toHaveBeenCalledWith({
    data: [{ id: 1, price: 20 }],
    message: 'success'
  });
});

test('createProduct inserts a product and handles database errors', () => {
  const run = jest.fn(function (query, values, callback) {
    callback.call({ lastID: 4 }, null);
  });
  db.getDb.mockReturnValue({ run });
  const res = createResponse();
  const product = { name: 'Desk', price: 50, stock: 3 };

  productController.createProduct({ body: product }, res);

  expect(run.mock.calls[0][1]).toEqual(['Desk', 50, 3]);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith({ id: 4, ...product });

  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  res.status.mockClear();
  res.json.mockClear();
  db.getDb.mockReturnValue({
    run: jest.fn((query, values, callback) => callback(new Error('insert failed')))
  });
  productController.createProduct({ body: product }, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Error creating product' });
  errorSpy.mockRestore();
});

test('getProduct returns a product and forwards query failures', () => {
  const res = createResponse();
  db.getDb.mockReturnValue({
    get: jest.fn((query, values, callback) => callback(null, { id: 2, name: 'Book' }))
  });

  productController.getProduct({ params: { id: '2' } }, res);
  expect(res.json).toHaveBeenCalledWith({ data: { id: 2, name: 'Book' }, message: 'success' });

  res.status.mockClear();
  res.json.mockClear();
  db.getDb.mockReturnValue({
    get: jest.fn((query, values, callback) => callback(new Error('read failed')))
  });
  productController.getProduct({ params: { id: '2' } }, res);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ error: 'read failed' });
});

test('updateStock updates existing products and handles errors and missing IDs', () => {
  const res = createResponse();
  db.getDb.mockReturnValue({
    run: jest.fn(function (query, values, callback) {
      callback.call({ changes: 1 }, null);
    })
  });

  productController.updateStock({ body: { stock: 9 }, params: { id: '2' } }, res);
  expect(res.json).toHaveBeenCalledWith({ success: true });

  res.status.mockClear();
  res.json.mockClear();
  db.getDb.mockReturnValue({
    run: jest.fn(function (query, values, callback) {
      callback.call({ changes: 0 }, null);
    })
  });
  productController.updateStock({ body: { stock: 9 }, params: { id: '99' } }, res);
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });

  res.status.mockClear();
  res.json.mockClear();
  db.getDb.mockReturnValue({
    run: jest.fn((query, values, callback) => callback(new Error('update failed')))
  });
  productController.updateStock({ body: { stock: 9 }, params: { id: '2' } }, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update stock' });
});
