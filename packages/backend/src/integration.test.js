const request = require('supertest');

const app = require('./app');
const database = require('./db/database');

let token;

beforeAll(async () => {
  await database.connect(':memory:');
});

afterAll(async () => {
  await database.closeConnection();
});

test('registers, authenticates, and authorizes a user through API endpoints', async () => {
  const registration = await request(app)
    .post('/api/auth/register')
    .send({
      firstname: 'Alice',
      lastname: 'Example',
      password: 'password123',
      username: 'admi'
    })
    .expect(201);

  expect(registration.body).toMatchObject({ auth: true });
  expect(registration.body.token).toEqual(expect.any(String));

  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  await request(app)
    .post('/api/auth/register')
    .send({
      firstname: 'Alice',
      lastname: 'Example',
      password: 'password123',
      username: 'admi'
    })
    .expect(500, { error: 'Error creating user' });
  errorSpy.mockRestore();

  const login = await request(app)
    .post('/api/auth/login')
    .send({ password: 'password123', username: 'admi' })
    .expect(200);

  token = login.body.token;
  expect(login.body.user).toEqual({
    firstname: 'Alice',
    id: expect.any(Number),
    lastname: 'Example',
    username: 'admi'
  });

  const users = await request(app).get('/api/auth/users').set('Authorization', `Bearer ${token}`).expect(200);
  expect(users.body.map((user) => user.username)).toContain('admi');

  const similar = await request(app)
    .get('/api/auth/similar-usernames')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
  expect(similar.body.totalComparisons).toBe(1);
  expect(similar.body.similar).toContainEqual({
    distance: 1,
    user1: 'admi',
    user2: 'admin'
  });

  await request(app).get('/api/auth/users').expect(401, { error: 'No token provided' });
});

test('creates, lists, reads, and updates products through protected endpoints', async () => {
  const list = await request(app).get('/api/products').set('Authorization', `Bearer ${token}`).expect(200);
  expect(list.body.message).toBe('success');
  expect(list.body.data).toHaveLength(3);
  expect(list.body.data[0]).toHaveProperty('avgPrice');
  expect(list.body.data[0]).toHaveProperty('cheaperCount');

  const created = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Keyboard', price: 79.99, stock: 6 })
    .expect(201);

  expect(created.body).toEqual({
    id: expect.any(Number),
    name: 'Keyboard',
    price: 79.99,
    stock: 6
  });

  const product = await request(app)
    .get(`/api/products/${created.body.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
  expect(product.body.data).toMatchObject({ name: 'Keyboard', stock: 6 });

  await request(app)
    .patch(`/api/products/${created.body.id}/stock`)
    .set('Authorization', `Bearer ${token}`)
    .send({ stock: 10 })
    .expect(200, { success: true });

  const updated = await request(app)
    .get(`/api/products/${created.body.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
  expect(updated.body.data.stock).toBe(10);
});

test('rejects invalid credentials and reports unmatched routes', async () => {
  await request(app)
    .post('/api/auth/login')
    .send({ password: 'invalid', username: 'admi' })
    .expect(401, { auth: false, token: null });

  await request(app).get('/not-found').expect(404, { error: 'Not found' });
});

test('forwards unexpected route errors to the application error handler', async () => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  await request(app).post('/api/auth/register').send({ username: 'incomplete' }).expect(500, 'Something broke!');

  errorSpy.mockRestore();
});
