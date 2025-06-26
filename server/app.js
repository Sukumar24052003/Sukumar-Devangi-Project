import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import spaceRoutes from './routes/space.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import proposalRoutes from './routes/proposal.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import pipelineRoutes from './routes/pipeline.routes.js';
import debugRoutes from './routes/debug.routes.js';
import User from './models/user.model.js';

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use((req, res, next) => {
  console.log(`📥 Express received: ${req.method} ${req.url}`);
   if (req.url.startsWith('/default')) {
    req.url = req.url.replace(/^\/default/, '');
  }
  next();
});

app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.download(filePath);
});

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174','https://new-devangi-outdoor-1.onrender.com','https://new-devangi-outdoor.onrender.com'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/spaces', spaceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pipeline', pipelineRoutes);
app.use('/debug', debugRoutes);

app.use((req, res, next) => {
  res.status(404).send({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Internal Server Error' });
});

export async function initializeDatabase() {
  const MONGO_URI = process.env.MONGO_URI;
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (!existingAdmin) {
    const adminUser = new User({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      phone: process.env.ADMIN_PHONE,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
    });
    await adminUser.save();
    console.log('✅ Admin account created');
  } else {
    console.log('ℹ️ Admin already exists');
  }
}

export default app;