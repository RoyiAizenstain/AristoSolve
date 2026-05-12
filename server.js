const express = require('express');
const app = express();
const logger = require('./middleware/logger');

app.use(express.json());
app.use(logger);

app.use('/users', require('./routes/users'));
app.use('/problems', require('./routes/problems'));
app.use('/conversations', require('./routes/conversations'));
app.use('/evaluations', require('./routes/evaluations'));
app.use('/progress', require('./routes/progress'));

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
