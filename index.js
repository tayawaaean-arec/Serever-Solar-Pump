const express = require('express');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Example route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Example API route
app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello from API', data: [1, 2, 3, 4] });
});

// Start the server (for local testing)
const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

module.exports = app;
