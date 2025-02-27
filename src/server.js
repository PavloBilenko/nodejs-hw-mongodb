import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import contactsRouter from './routes/contacts.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const setupServer = () => {
  const app = express();

  // Завантаження документації Swagger
  const swaggerDocument = YAML.load('./docs/openapi.yaml');

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(pino());
  app.use(cookieParser());

  // Роутинг
  app.use('/auth', authRouter);
  app.use('/contacts', contactsRouter);

  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Обробка помилок
  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📄 API Docs available at http://localhost:${PORT}/api-docs`);
  });
};

export default setupServer;
