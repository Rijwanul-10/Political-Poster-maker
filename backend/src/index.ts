import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import mongoose from 'mongoose';
import { config } from './config';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import { ensureAdminUser } from './services/seedAdmin';

const app = express();
const PORT = config.port || 5000;

app.use(cors());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploads
const uploadsPath = path.resolve(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  const isConnected = mongoose.connection.readyState === 1;
  let templateCount = 0;
  if (isConnected) {
    try {
      templateCount = await mongoose.connection.db.collection('templates').countDocuments();
    } catch (e) {
      // ignore
    }
  }
  res.json({ 
    status: 'ok', 
    db: isConnected ? 'connected' : 'disconnected',
    dbName: mongoose.connection.name,
    templatesCount: templateCount
  });
});

// Mount API routers under /api
app.use('/api', apiRouter);

// Global error handling middleware
app.use(errorHandler);

async function startServer() {
  try {
    if (config.mongoUri) {
      await mongoose.connect(config.mongoUri, {
        dbName: 'political_poster',
      });
      console.log('✅ Connected to MongoDB Atlas (database: political_poster)');
      await ensureAdminUser();
    } else {
      console.warn('⚠️ Warning: MONGODB_URI is not set');
    }
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB', err);
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT} (without DB)`);
    });
  }
}

startServer();
