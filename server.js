console.log('✅ server.js has started');

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'cafes.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve index.html and static files

// GET all cafes
app.get('/api/cafes', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Read error:', err);
      return res.status(500).json({ error: 'Failed to read cafes file.' });
    }
    res.json(JSON.parse(data));
  });
});

// POST new cafe
app.post('/api/cafes', (req, res) => {
  console.log('✅ Received POST:', req.body);

  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('❌ Failed to read cafes file:', err);
      return res.status(500).json({ error: 'Failed to read cafes file.' });
    }

    let cafes;
    try {
      cafes = JSON.parse(data);
    } catch (e) {
      console.warn('⚠️ cafes.json was empty or invalid, starting with an empty array.');
      cafes = [];
    }

    cafes.push(req.body);

    fs.writeFile(DATA_FILE, JSON.stringify(cafes, null, 2), (err) => {
      if (err) {
        console.error('❌ Failed to write cafes file:', err);
        return res.status(500).json({ error: 'Failed to write cafes file.' });
      }

      console.log('✅ Cafe saved to file.');
      res.status(201).json({ message: 'Cafe added successfully' });
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
