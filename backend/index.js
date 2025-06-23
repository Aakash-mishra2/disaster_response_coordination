import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import disasterRoutes from './routes/disasterRoutes.js';
import { initSocket } from './socket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

app.use(cors());
app.use(express.json());

// Mock authentication middleware
const users = {
  netrunnerX: { id: 'netrunnerX', role: 'admin' },
  reliefAdmin: { id: 'reliefAdmin', role: 'admin' },
  citizen1: { id: 'citizen1', role: 'contributor' },
  citizen2: { id: 'citizen2', role: 'contributor' }
};
app.use((req, res, next) => {
  const username = req.query.user || req.headers['x-user'] || 'netrunnerX';
  req.user = users[username] || users['netrunnerX'];
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Disaster Coordination API running' });
});

app.use('/disasters', disasterRoutes);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
