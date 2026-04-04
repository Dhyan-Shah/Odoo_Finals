require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const { initSocket } = require('./socket/socketHandler');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const waiterRoutes = require('./routes/waiter');
const kitchenRoutes = require('./routes/kitchen');
const customerRoutes = require('./routes/customer');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/waiter', waiterRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/customer', customerRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date() }));

// Socket.io
initSocket(io);

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await seedAdmin();
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function seedAdmin() {
  const User = require('./models/User');
  const bcrypt = require('bcryptjs');
  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    const hashed = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Super Admin',
      email: 'admin@cafe.com',
      password: hashed,
      role: 'admin',
      active: true,
    });
    console.log('✅ Default admin created: admin@cafe.com / admin123');
  }
}
