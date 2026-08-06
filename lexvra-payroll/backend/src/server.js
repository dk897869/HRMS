require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const seedData = require('./helpers/seed');
const { initSocket } = require('./sockets/socketHandler');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to Database
  await connectDB();
  // Execute initial seed data
  await seedData();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 LEXVRA HRMS Backend Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=======================================================`);
  });
};

startServer();
