const request = require('supertest');
const app = require('../src/server');

describe('API', () => {
  test('GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('GET /stock and GET /stock/:key', async () => {
    const res = await request(app).get('/stock');
    expect(res.statusCode).toBe(200);
    expect(res.body.paracetamol).toBeDefined();

    const item = await request(app).get('/stock/paracetamol');
    expect(item.statusCode).toBe(200);
    expect(item.body.name).toMatch(/Paracetamol/);
  });

  test('POST /stock/:key/sell', async () => {
    const res = await request(app).post('/stock/paracetamol/sell').send({ qty: 1 });
    expect([200,201,204]).toContain(res.statusCode);
    expect(res.body.success).toBe(true);
  });

  test('POST /generate-qr returns json payload', async () => {
    const res = await request(app).post('/generate-qr').send({ format: 'json' });
    expect(res.statusCode).toBe(200);
    expect(res.body.payload).toBeDefined();
    expect(res.body.ascii).toBeDefined();
  });
});
