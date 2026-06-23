require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const path    = require('path');
const app = express();
const logger = require('./middleware/logger');

app.use(express.json());
app.use(logger);

app.use((req, res, next) => {
  const allowed = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.header('Access-Control-Allow-Origin', allowed);
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-user-role, x-user-id');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/problems', require('./routes/problems'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/evaluations', require('./routes/evaluations'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/settings', require('./routes/settings'));

// Serve React production build (monolithic deployment)
const buildPath = path.join(__dirname, '../../frontend/build');
app.use(express.static(buildPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

const httpServer = require('http').createServer(app);
const io = require('./socket')(httpServer);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
