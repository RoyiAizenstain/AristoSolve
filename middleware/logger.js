const logger = (req, res, next) => {
  const start = Date.now();
  const url = req.originalUrl;
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${url} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
};

module.exports = logger;
