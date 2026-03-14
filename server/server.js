import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import studentRoutes from './routes/student.js';
import adminRoutes from './routes/admin.js';

dotenv.config({ path: './server/.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', studentRoutes);
app.use('/api', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React build (production)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// All non-API routes go to React (handles /admin/login, /student/login etc.)
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Exam Portal API Server running on http://localhost:${PORT}`);
});