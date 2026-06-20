require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const app = express();
const logger = require('./middleware/logger');

app.use(express.json());
app.use(logger);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
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

const httpServer = require('http').createServer(app);
const io = require('./socket')(httpServer);

httpServer.listen(3000, () => console.log('Server running on http://localhost:3000'));
