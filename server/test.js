const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Simple test endpoint
app.post('/test', (req, res) => {
  console.log('Received test request:', req.body);
  res.json({ success: true, message: 'Test successful' });
});

app.listen(3002, () => {
  console.log('Test server running on port 3002');
});
