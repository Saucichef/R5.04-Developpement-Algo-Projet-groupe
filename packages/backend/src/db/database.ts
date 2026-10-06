import { Database } from "sqlite3";
import path from 'path';

const sqlite3 = require('sqlite3').verbose();
const initDatabase = require('./migrations/init');

let database: Database | null = null;

const DB_PATH = path.join(__dirname, '..', 'database.sqlite');

const fs = require('fs');

const connect = async () => {
  if (database) {
    return database;
  }

  return new Promise((resolve, reject) => {
    try {
      if (fs.existsSync(DB_PATH)) {
        const stats = fs.statSync(DB_PATH);
        console.log('Database file size:', stats.size, 'bytes');

        const files = fs.readdirSync(__dirname);
        console.log('Files in db directory:', files.length);
      }

      database = new sqlite3.Database(DB_PATH, async (err: Error) => {
        if (err) {
          console.error('Error connecting to database:', err);
          reject(err);
          return;
        }

        console.log('Connected to SQLite database');

        try {
          await initDatabase(database);
          console.log('Database initialized');
          resolve(database);
        } catch (initErr) {
          console.error('Error initializing database:', initErr);
          reject(initErr);
        }
      });

    } catch (err) {
      console.error('Failed to create database connection:', err);
      reject(err);
    }
  });
};

// Get database instance - throws error if not connected
const getDb = () => {
  if (!database) {
    throw new Error('Database not connected. Call connect() first.');
  }
  return database;
};

const closeConnection = () => {
  return new Promise<void>((resolve, reject) => {
    if (!database) {
      resolve();
      return;
    }

    database.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
        reject(err);
        return;
      }
      database = null;
      resolve();
    });
  });
};


const db = {
  connect,
  getDb,
  closeConnection,
};

export default db;
