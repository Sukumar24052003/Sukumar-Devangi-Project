import serverlessExpress from '@vendia/serverless-express';
import app, { initializeDatabase } from './app.js';


let server;

const bootstrap = async () => {
  await initializeDatabase();
  server = serverlessExpress({ app });
};

await bootstrap();

export const handler = async (event, context) => {
   console.log("Incoming path:", event.rawPath || event.path);
  return server(event, context);
};
