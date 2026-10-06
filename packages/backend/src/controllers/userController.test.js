const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('../db/database');
const userController = require('./userController');

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

test('registerUser hashes the password and returns a signed token', () => {
  const run = jest.fn(function (query, values, callback) {
    callback.call({ lastID: 7 }, null);
  });
  db.getDb.mockReturnValue({ run });
  const res = createResponse();

  userController.registerUser(
    { body: { firstname: 'Ada', lastname: 'Lovelace', password: 'secret', username: 'ada' } },
    res
  );

  const [query, values] = run.mock.calls[0];
  expect(query).toContain('INSERT INTO users');
  expect(values[0]).toBe('ada');
  expect(bcrypt.compareSync('secret', values[1])).toBe(true);
  expect(values.slice(2)).toEqual(['Ada', 'Lovelace']);

  const payload = res.json.mock.calls[0][0];
  expect(res.status).toHaveBeenCalledWith(201);
  expect(payload.auth).toBe(true);
  expect(jwt.verify(payload.token, 'your-super-secret-key-that-should-not-be-hardcoded')).toMatchObject({
    id: 7
  });
});

test('registerUser reports database failures', () => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const run = jest.fn((query, values, callback) => callback(new Error('insert failed')));
  db.getDb.mockReturnValue({ run });
  const res = createResponse();

  userController.registerUser(
    {
      body: { firstname: 'Ada', lastname: 'Lovelace', password: 'secret', username: 'ada' }
    },
    res
  );

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Error creating user' });
  errorSpy.mockRestore();
});

test('loginUser returns server and not-found errors', () => {
  const res = createResponse();
  db.getDb.mockReturnValue({
    get: jest.fn((query, values, callback) => callback(new Error('select failed')))
  });

  userController.loginUser({ body: { username: 'ada' } }, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Error on the server.' });

  res.status.mockClear();
  res.json.mockClear();
  db.getDb.mockReturnValue({
    get: jest.fn((query, values, callback) => callback(null, undefined))
  });

  userController.loginUser({ body: { username: 'missing' } }, res);
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: 'No user found.' });
});

test('loginUser rejects an incorrect password and returns user data on success', () => {
  const passwordHash = bcrypt.hashSync('correct', 8);
  const get = jest.fn((query, values, callback) =>
    callback(null, {
      firstname: 'Ada',
      id: 3,
      lastname: 'Lovelace',
      password: passwordHash,
      username: 'ada'
    })
  );
  db.getDb.mockReturnValue({ get });
  const res = createResponse();

  userController.loginUser({ body: { password: 'wrong', username: 'ada' } }, res);
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ auth: false, token: null });

  res.status.mockClear();
  res.json.mockClear();
  userController.loginUser({ body: { password: 'correct', username: 'ada' } }, res);

  const payload = res.json.mock.calls[0][0];
  expect(res.status).toHaveBeenCalledWith(200);
  expect(payload.user).toEqual({
    firstname: 'Ada',
    id: 3,
    lastname: 'Lovelace',
    username: 'ada'
  });
  expect(jwt.verify(payload.token, 'your-super-secret-key-that-should-not-be-hardcoded')).toMatchObject({
    id: 3
  });
});

test('getAllUsers returns users and handles database errors', () => {
  const users = [{ id: 1, username: 'ada' }];
  const res = createResponse();
  db.getDb.mockReturnValue({
    all: jest.fn((query, values, callback) => callback(null, users))
  });

  userController.getAllUsers({}, res);
  expect(res.json).toHaveBeenCalledWith(users);

  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  res.status.mockClear();
  res.json.mockClear();
  db.getDb.mockReturnValue({
    all: jest.fn((query, values, callback) => callback(new Error('select failed')))
  });
  userController.getAllUsers({}, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Error getting users' });
  errorSpy.mockRestore();
});

test('findSimilarUsernames compares case-insensitively and reports DB errors', () => {
  const res = createResponse();
  db.getDb.mockReturnValue({
    all: jest.fn((query, values, callback) =>
      callback(null, [{ username: 'Ada' }, { username: 'ada' }, { username: 'Alan' }])
    )
  });

  userController.findSimilarUsernames({}, res);
  expect(res.json).toHaveBeenCalledWith({
    similar: [
      { distance: 0, user1: 'Ada', user2: 'ada' },
      { distance: 2, user1: 'Ada', user2: 'Alan' },
      { distance: 2, user1: 'ada', user2: 'Alan' }
    ],
    totalComparisons: 3
  });

  res.status.mockClear();
  res.json.mockClear();
  db.getDb.mockReturnValue({
    all: jest.fn((query, values, callback) => callback(new Error('query failed')))
  });
  userController.findSimilarUsernames({}, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'query failed' });
});
