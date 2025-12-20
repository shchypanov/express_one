import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Auth Routes', () => {
  // ========== SIGNUP ==========
  describe('POST /auth/signup', () => {
    it('should return 422 if email is missing', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          password: 'password123',
          name: 'Test User',
        });

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 422 if password is too short', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: '123',
          name: 'Test User',
        });

      expect(response.status).toBe(422);
    });

    it('should return 422 if name is missing', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(422);
    });

    it('should return 422 if email format is invalid', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'not-an-email',
          password: 'password123',
          name: 'Test User',
        });

      expect(response.status).toBe(422);
    });

    it('should return 422 if body is empty', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({});

      expect(response.status).toBe(422);
    });
  });

  // ========== SIGNIN ==========
  describe('POST /auth/signin', () => {
    it('should return 422 if email is missing', async () => {
      const response = await request(app)
        .post('/auth/signin')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(422);
    });

    it('should return 422 if password is missing', async () => {
      const response = await request(app)
        .post('/auth/signin')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(422);
    });

    it('should return 422 if email format is invalid', async () => {
      const response = await request(app)
        .post('/auth/signin')
        .send({
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(422);
    });
  });

  // ========== HEALTH ==========
  describe('GET /health', () => {
    it('should return status ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });

    it('should return timestamp', async () => {
      const response = await request(app).get('/health');

      expect(response.body).toHaveProperty('timestamp');
    });
  });

  // ========== 404 ==========
  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not Found');
    });

    it('should return 404 for unknown POST routes', async () => {
      const response = await request(app)
        .post('/unknown-route')
        .send({ data: 'test' });

      expect(response.status).toBe(404);
    });
  });
});
