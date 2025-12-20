import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('User Routes', () => {
  // ========== PROFILE ==========
  describe('GET /profile', () => {
    it('should return 401 without authorization header', async () => {
      const response = await request(app).get('/profile');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 with invalid token format', async () => {
      const response = await request(app)
        .get('/profile')
        .set('Authorization', 'InvalidToken');

      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid Bearer token', async () => {
      const response = await request(app)
        .get('/profile')
        .set('Authorization', 'Bearer invalid-token-here');

      expect(response.status).toBe(401);
    });

    it('should return 401 with expired token', async () => {
      // Expired JWT token (for testing purposes)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAxfQ.invalid';
      
      const response = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });
  });
});
