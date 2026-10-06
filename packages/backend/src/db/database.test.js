const database = require('./database');
const initDatabase = require('./migrations/init');

const run = (db, query, values = []) =>
  new Promise((resolve, reject) => {
    db.run(query, values, function (error) {
      if (error) {
        reject(error);
        return;
      }
      resolve({ changes: this.changes, lastID: this.lastID });
    });
  });

const get = (db, query, values = []) =>
  new Promise((resolve, reject) => {
    db.get(query, values, (error, row) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(row);
    });
  });

afterEach(async () => {
  await database.closeConnection();
});

test('connect initializes an in-memory database and supports CRUD operations', async () => {
  expect(() => database.getDb()).toThrow('Database not connected. Call connect() first.');

  const db = await database.connect(':memory:');
  expect(database.getDb()).toBe(db);
  expect(await database.connect(':memory:')).toBe(db);
  await initDatabase(db);
  expect(await get(db, 'SELECT username FROM users WHERE username = ?', ['admin'])).toEqual({
    username: 'admin'
  });
  expect((await get(db, 'SELECT COUNT(*) as count FROM products')).count).toBe(3);

  const inserted = await run(db, 'INSERT INTO products (name, price, stock) VALUES (?, ?, ?)', [
    'Test product',
    12.5,
    4
  ]);
  expect(await get(db, 'SELECT name, price, stock FROM products WHERE id = ?', [inserted.lastID])).toEqual({
    name: 'Test product',
    price: 12.5,
    stock: 4
  });

  await run(db, 'UPDATE products SET stock = ? WHERE id = ?', [8, inserted.lastID]);
  expect((await get(db, 'SELECT stock FROM products WHERE id = ?', [inserted.lastID])).stock).toBe(8);
  const deleted = await run(db, 'DELETE FROM products WHERE id = ?', [inserted.lastID]);
  expect(deleted.changes).toBe(1);
  expect(await get(db, 'SELECT id FROM products WHERE id = ?', [inserted.lastID])).toBeUndefined();
});

test('closeConnection can be called when disconnected', async () => {
  await expect(database.closeConnection()).resolves.toBeUndefined();
});
