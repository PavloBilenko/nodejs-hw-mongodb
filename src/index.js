import 'dotenv/config';
import initMongoConnection from './db/initMongoConnection.js';
import setupServer from './server.js';

async function startApp() {
  await initMongoConnection();
  setupServer();
}

startApp();
