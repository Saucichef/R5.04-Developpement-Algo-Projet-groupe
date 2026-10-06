const bcrypt = require('bcryptjs');

const run = (db, query, values = []) =>
  new Promise((resolve, reject) => {
    db.run(query, values, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

const get = (db, query) =>
  new Promise((resolve, reject) => {
    db.get(query, [], (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
    });
  });

const initDatabase = async (db) => {
  await run(
    db,
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstname TEXT,
      lastname TEXT,
      username TEXT UNIQUE,
      password TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    )
  `
  );

  await run(
    db,
    `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL DEFAULT 0,
      stock INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME
    )
  `
  );

  const users = await get(db, 'SELECT COUNT(*) as count FROM users');
  if (users.count === 0) {
    const hashedPassword = bcrypt.hashSync('admin123', 8);
    await run(db, 'INSERT INTO users (firstname, lastname, username, password) VALUES (?, ?, ?, ?)', [
      'Admin',
      'User',
      'admin',
      hashedPassword
    ]);
  }

  const products = await get(db, 'SELECT COUNT(*) as count FROM products');
  if (products.count === 0) {
    const sampleProducts = [
      ['Laptop', 999.99, 10],
      ['Smartphone', 499.99, 15],
      ['Headphones', 79.99, 20]
    ];

    for (const product of sampleProducts) {
      await run(db, 'INSERT INTO products (name, price, stock) VALUES (?, ?, ?)', product);
    }
  }
};

module.exports = initDatabase;
