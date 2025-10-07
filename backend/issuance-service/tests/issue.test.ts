import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index';

// Ensure test env isolates data path if desired by setting DATA_FILE before importing app.

describe('issuance API', () => {
  it('issues a new credential and is idempotent', async () => {
    const payload = { name: 'Alice', role: 'admin' };
    const r1 = await request(app).post('/issue').send(payload);
    expect([200,201]).toContain(r1.status);
    expect(r1.body.credentialId).toBeTruthy();
    const r2 = await request(app).post('/issue').send(payload);
    expect(r2.status).toBe(200);
    expect(r2.body.credentialId).toBe(r1.body.credentialId);
  });
});
  });
});
