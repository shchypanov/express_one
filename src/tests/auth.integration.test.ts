import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Auth Integration Tests', () => {
  const testUser = {
    email: 'integration@test.com',
    password: 'password123',
    name: 'Integration Test User',
  };

  // ========== SIGNUP ==========
  describe('POST /auth/signup', () => {
    it('should create a new user and return tokens', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.name).toBe(testUser.name);
      expect(response.body.user).not.toHaveProperty('password'); // Password should not be exposed
    });

    it('should set refresh token cookie', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'cookie@test.com',
          password: 'password123',
          name: 'Cookie Test',
        });

      expect(response.status).toBe(201);
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('refreshToken');
    });

    it('should return 409 if user already exists', async () => {
      // First signup
      await request(app).post('/auth/signup').send(testUser);

      // Second signup with same email
      const response = await request(app)
        .post('/auth/signup')
        .send(testUser);

      expect(response.status).toBe(409);
      expect(response.body.error).toContain('exists');
    });
  });

  // ========== SIGNIN ==========
  describe('POST /auth/signin', () => {
    it('should login existing user and return tokens', async () => {
      // First create user
      await request(app).post('/auth/signup').send(testUser);

      // Then signin
      const response = await request(app)
        .post('/auth/signin')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should return 401 for wrong password', async () => {
      // Create user
      await request(app).post('/auth/signup').send(testUser);

      // Signin with wrong password
      const response = await request(app)
        .post('/auth/signin')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/auth/signin')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
    });
  });

  // ========== PROTECTED ROUTE ==========
  describe('GET /profile', () => {
    it('should return user profile with valid token', async () => {
      // Signup and get token
      const signupResponse = await request(app)
        .post('/auth/signup')
        .send(testUser);

      const { accessToken } = signupResponse.body;

      // Get profile
      const response = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.name).toBe(testUser.name);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
    });
  });

  // ========== REFRESH TOKEN ==========
  describe('POST /auth/refresh', () => {
    it('should return new access token with valid refresh token', async () => {
      // Signup
      const signupResponse = await request(app)
        .post('/auth/signup')
        .send(testUser);

      // Extract refresh token from cookie
      const cookies = signupResponse.headers['set-cookie'];

      // Refresh
      const response = await request(app)
        .post('/auth/refresh')
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
    });

    it('should return 401 without refresh token cookie', async () => {
      const response = await request(app).post('/auth/refresh');

      expect(response.status).toBe(401);
    });
  });

  // ========== SIGNOUT ==========
  describe('POST /auth/signout', () => {
    it('should clear refresh token and return success', async () => {
      // Signup
      const signupResponse = await request(app)
        .post('/auth/signup')
        .send(testUser);

      const cookies = signupResponse.headers['set-cookie'];

      // Signout
      const response = await request(app)
        .post('/auth/signout')
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('success');
    });

    it('should invalidate refresh token after signout', async () => {
      // Signup
      const signupResponse = await request(app)
        .post('/auth/signup')
        .send(testUser);

      const cookies = signupResponse.headers['set-cookie'];

      // Signout
      await request(app)
        .post('/auth/signout')
        .set('Cookie', cookies);

      // Try to refresh - should fail
      const refreshResponse = await request(app)
        .post('/auth/refresh')
        .set('Cookie', cookies);

      expect(refreshResponse.status).toBe(401);
    });
  });

  // ========== FULL FLOW ==========
  describe('Full Authentication Flow', () => {
    it('should complete signup → signin → profile → signout flow', async () => {
      // 1. Signup
      const signupResponse = await request(app)
        .post('/auth/signup')
        .send(testUser);

      expect(signupResponse.status).toBe(201);
      const { accessToken: signupToken } = signupResponse.body;
      const signupCookies = signupResponse.headers['set-cookie'];

      // 2. Access profile with signup token
      const profileResponse1 = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${signupToken}`);

      expect(profileResponse1.status).toBe(200);

      // 3. Signin (new token)
      const signinResponse = await request(app)
        .post('/auth/signin')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(signinResponse.status).toBe(200);
      const { accessToken: signinToken } = signinResponse.body;
      const signinCookies = signinResponse.headers['set-cookie'];

      // 4. Access profile with signin token
      const profileResponse2 = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${signinToken}`);

      expect(profileResponse2.status).toBe(200);

      // 5. Refresh token
      const refreshResponse = await request(app)
        .post('/auth/refresh')
        .set('Cookie', signinCookies);

      expect(refreshResponse.status).toBe(200);
      const { accessToken: refreshedToken } = refreshResponse.body;

      // 6. Access profile with refreshed token
      const profileResponse3 = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${refreshedToken}`);

      expect(profileResponse3.status).toBe(200);

      // 7. Signout
      const signoutResponse = await request(app)
        .post('/auth/signout')
        .set('Cookie', signinCookies);

      expect(signoutResponse.status).toBe(200);

      // 8. Refresh should fail after signout
      const refreshAfterSignout = await request(app)
        .post('/auth/refresh')
        .set('Cookie', signinCookies);

      expect(refreshAfterSignout.status).toBe(401);
    });
  });
});
