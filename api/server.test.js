const request = require('supertest');
const server = require('./server');
const db = require('../data/dbConfig');

describe('server.js', () => {
  it('status 400 when not logged in', async () => {
    const res = await request(server).get('/api/jokes')
    expect(res.status).toBe(400);
  });
  it('should return json', async() => {
    const res = await request(server).get('/api/jokes');
    expect(res.type).toBe('application/json')
  });
});

describe('user register', () => {
  it('status 201 when adding a new user', async () => {
    await db('users').truncate()
    const res = await request(server).post('/api/auth/register').send({ username: 'mhillin', password: 'password123'});
    expect(res.status).toBe(201)
  })
  it('status 400 if bad username or password', async () => {
    await db('users').truncate()
    const res = await request(server).post('/api/auth/register').send({ username: 'mhillin', password: '' });
    expect(res.status).toBe(400)
  })
})

describe('login', () => {
  it('status 200 when correct login', async () => {
    const res = await request(server).post('/api/auth/login').send({ username: 'mhillin', password: 'password123' })
    expect(res.status).toBe(200);
  })
  it('status 401 when invalid user', async () => {
    const res = await request(server)
    .post('/api/auth/login')
    .send({ username: 'mhillinm', password: 'pass' })
    expect(res.status).toBe(401)
  })
})