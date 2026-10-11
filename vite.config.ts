import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import express from 'express';
import { initDatabase } from './server/db';
import { apiRouter } from './server/api';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-middleware',
      configureServer(server) {
        initDatabase();
        const app = express();
        app.use(express.json());
        app.use('/api', apiRouter);
        server.middlewares.use(app);
      },
    },
  ],
  server: {
    port: 5173,
    host: true,
  },
});
