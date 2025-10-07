import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index';

describe('verification API', () => {
  it('returns 400 for invalid JSON', async () => {
    const r = await request(app).post('/verify').send(null);
    expect(r.status).toBe(400);
  });
});
