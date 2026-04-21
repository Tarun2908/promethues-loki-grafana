const express = require('express');
const request = require('supertest');
const loanRouter = require('./loans');
const { clearLoans } = require('../models/loanStore');

// Minimal Express app for testing the router in isolation
function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/loans', loanRouter);
  return app;
}

let app;

beforeEach(() => {
  clearLoans();
  app = createTestApp();
});

describe('POST /api/loans', () => {
  const validPayload = {
    borrowerName: 'Jane Doe',
    loanAmount: 50000,
    loanTerm: 36,
  };

  test('creates a loan and returns 201 with loan data', async () => {
    const res = await request(app).post('/api/loans').send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.borrowerName).toBe('Jane Doe');
    expect(res.body.loanAmount).toBe(50000);
    expect(res.body.loanTerm).toBe(36);
    expect(res.body.status).toBe('SUBMITTED');
    expect(res.body.id).toBeDefined();
    expect(res.body.createdAt).toBeDefined();
    expect(res.body.updatedAt).toBeDefined();
  });

  test('returns 400 with VALIDATION_ERROR when borrowerName is missing', async () => {
    const res = await request(app)
      .post('/api/loans')
      .send({ loanAmount: 50000, loanTerm: 36 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
    expect(res.body.message).toBeDefined();
    expect(res.body.details).toEqual(expect.any(Array));
    expect(res.body.details.length).toBeGreaterThan(0);
  });

  test('returns 400 when loanAmount is negative', async () => {
    const res = await request(app)
      .post('/api/loans')
      .send({ borrowerName: 'Jane', loanAmount: -100, loanTerm: 12 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  test('returns 400 when loanTerm is not an integer', async () => {
    const res = await request(app)
      .post('/api/loans')
      .send({ borrowerName: 'Jane', loanAmount: 1000, loanTerm: 12.5 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/loans', () => {
  test('returns 200 with empty array when no loans exist', async () => {
    const res = await request(app).get('/api/loans');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns 200 with all created loans', async () => {
    await request(app)
      .post('/api/loans')
      .send({ borrowerName: 'Alice', loanAmount: 10000, loanTerm: 12 });
    await request(app)
      .post('/api/loans')
      .send({ borrowerName: 'Bob', loanAmount: 20000, loanTerm: 24 });

    const res = await request(app).get('/api/loans');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('GET /api/loans/:id', () => {
  test('returns 200 with the loan when it exists', async () => {
    const createRes = await request(app)
      .post('/api/loans')
      .send({ borrowerName: 'Jane', loanAmount: 5000, loanTerm: 6 });

    const res = await request(app).get(`/api/loans/${createRes.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createRes.body.id);
    expect(res.body.borrowerName).toBe('Jane');
  });

  test('returns 404 with NOT_FOUND for non-existent ID', async () => {
    const res = await request(app).get('/api/loans/non-existent-id');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('NOT_FOUND');
    expect(res.body.message).toBe('Loan application not found');
  });
});

describe('PATCH /api/loans/:id/status', () => {
  test('updates status and returns 200 with updated loan', async () => {
    const createRes = await request(app)
      .post('/api/loans')
      .send({ borrowerName: 'Jane', loanAmount: 5000, loanTerm: 6 });

    const res = await request(app)
      .patch(`/api/loans/${createRes.body.id}/status`)
      .send({ status: 'APPROVED' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('APPROVED');
    expect(res.body.id).toBe(createRes.body.id);
    expect(res.body.borrowerName).toBe('Jane');
  });

  test('returns 404 when loan does not exist', async () => {
    const res = await request(app)
      .patch('/api/loans/non-existent-id/status')
      .send({ status: 'APPROVED' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('NOT_FOUND');
  });

  test('returns 400 with VALIDATION_ERROR for invalid status', async () => {
    const createRes = await request(app)
      .post('/api/loans')
      .send({ borrowerName: 'Jane', loanAmount: 5000, loanTerm: 6 });

    const res = await request(app)
      .patch(`/api/loans/${createRes.body.id}/status`)
      .send({ status: 'INVALID_STATUS' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
    expect(res.body.details).toEqual(expect.any(Array));
  });

  test('returns 400 when status field is missing', async () => {
    const createRes = await request(app)
      .post('/api/loans')
      .send({ borrowerName: 'Jane', loanAmount: 5000, loanTerm: 6 });

    const res = await request(app)
      .patch(`/api/loans/${createRes.body.id}/status`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });
});
