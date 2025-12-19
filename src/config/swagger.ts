import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API',
      version: '1.0.0',
      description: 'Authentication API with JWT',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://express-api-staging-930232233150.us-central1.run.app',
        description: 'Staging server',
      },
      {
        url: 'https://express-api-prod-930232233150.us-central1.run.app',
        description: 'Production server',
      },
    ],
  },
  // Шлях до файлів з анотаціями @swagger
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);