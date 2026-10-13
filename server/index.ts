import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { initDatabase } from './db';
import { apiRouter } from './api';
import { connectMongoDB } from './mongodb';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize SQLite Database schema and seeds
initDatabase();

// Connect to MongoDB asynchronously if available or configured
connectMongoDB().catch((err) => {
  console.log('[MongoDB] Startup notice: MongoDB connection pending or not configured yet.');
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Root welcome & API Documentation
app.get('/', (req, res) => {
  res.json({
    name: 'ClubSphere Backend REST API',
    status: 'online',
    version: '1.0.0',
    port: PORT,
    endpoints: {
      status: '/api/status',
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        changePassword: 'POST /api/auth/change-password',
        users: 'GET /api/auth/users',
      },
      dashboards: {
        student: 'GET /api/dashboard/student',
        admin: 'GET /api/dashboard/admin',
      },
      clubs: {
        list: 'GET /api/clubs',
        details: 'GET /api/clubs/:id',
        create: 'POST /api/clubs',
        join: 'POST /api/clubs/:id/join',
        leave: 'POST /api/clubs/:id/leave',
      },
      events: {
        list: 'GET /api/events',
        details: 'GET /api/events/:id',
        create: 'POST /api/events',
        register: 'POST /api/events/:id/register',
        cancel: 'DELETE /api/events/:id/register',
      },
      attendance: {
        roster: 'GET /api/events/:id/attendance',
        mark: 'POST /api/events/:id/attendance',
      },
      leaderboard: 'GET /api/leaderboard',
    },
    message: 'Backend is fully operational and accessible directly!',
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mount /api router
app.use('/api', apiRouter);

// Serve built Vite frontend in production
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start server
(async () => {
  const server = await (app.listen as any)(PORT);
  // Patch: if listen returned a net.Server use its address; otherwise just log
  const addr = typeof server?.address === 'function' ? server.address() : null;
  const port = (addr && typeof addr === 'object') ? addr.port : PORT;
  console.log(`=================================================`);
  console.log(`🚀 ClubSphere Backend running on http://localhost:${port}`);
  console.log(`📡 Direct API endpoints accessible at http://localhost:${port}/api`);
  console.log(`=================================================`);

  // Keep process alive
  process.stdin.resume();
})();
