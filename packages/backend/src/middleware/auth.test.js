const jwt = require('jsonwebtoken');

const auth = require('./auth');

const createResponse = () => {
  const res = {
    json: jest.fn(),
    status: jest.fn()
  };
  res.status.mockReturnValue(res);
  return res;
};

const secret = 'your-super-secret-key-that-should-not-be-hardcoded';

test('rejects requests without a token', () => {
  const req = { headers: {} };
  const res = createResponse();
  const next = jest.fn();

  auth(req, res, next);

  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
  expect(next).not.toHaveBeenCalled();
});

test('rejects malformed and invalid bearer tokens', () => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const next = jest.fn();

  for (const authorization of ['Basic abc', 'Bearer invalid-token']) {
    const res = createResponse();
    auth({ headers: { authorization } }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to authenticate token' });
  }

  expect(next).not.toHaveBeenCalled();
  errorSpy.mockRestore();
});

test('verifies bearer token, sets req.user, and calls next', () => {
  const req = {
    headers: {
      authorization: `Bearer ${jwt.sign({ id: 12 }, secret)}`
    }
  };
  const res = createResponse();
  const next = jest.fn();

  auth(req, res, next);

  expect(req.user).toMatchObject({ id: 12 });
  expect(next).toHaveBeenCalledTimes(1);
  expect(res.status).not.toHaveBeenCalled();
});
