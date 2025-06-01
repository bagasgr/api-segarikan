// File: index.js
const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'segarikan-secret-key';

// Konfigurasi CORS dengan opsi lengkap
const corsOptions = {
  origin: '*', // Untuk development, izinkan semua origin. Ganti dengan daftar origin produksi jika perlu.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200, // Untuk legacy browser agar preflight sukses
};

app.use(cors(corsOptions));

// Handle preflight OPTIONS request untuk semua route
app.options('*', cors(corsOptions));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Setup multer untuk upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

let users = [];
let stories = [];

// Middleware autentikasi token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: true, message: 'Token required' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: true, message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Register user
app.post('/v1/register', (req, res) => {
  const { name, email, password } = req.body;
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: true, message: 'Email already exists' });
  }
  const user = { id: Date.now().toString(), name, email, password };
  users.push(user);
  res.json({ error: false, message: 'User Created' });
});

// Login user
app.post('/v1/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: true, message: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id, name: user.name }, SECRET_KEY);
  res.json({ error: false, message: 'success', loginResult: { userId: user.id, name: user.name, token } });
});

// Tambah cerita baru (harus autentikasi + upload foto)
app.post('/v1/stories', authenticateToken, upload.single('photo'), (req, res) => {
  const { description, lat, lon } = req.body;
  const photoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  const story = {
    id: 'story-' + Date.now(),
    name: req.user.name,
    description,
    photoUrl,
    createdAt: new Date(),
    lat: parseFloat(lat) || null,
    lon: parseFloat(lon) || null
  };
  stories.push(story);
  res.json({ error: false, message: 'success' });
});

// Tambah cerita guest (tanpa autentikasi, upload foto)
app.post('/v1/stories/guest', upload.single('photo'), (req, res) => {
  const { description, lat, lon } = req.body;
  const photoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  const story = {
    id: 'story-' + Date.now(),
    name: 'Guest',
    description,
    photoUrl,
    createdAt: new Date(),
    lat: parseFloat(lat) || null,
    lon: parseFloat(lon) || null
  };
  stories.push(story);
  res.json({ error: false, message: 'success' });
});

// Ambil semua cerita (harus autentikasi)
app.get('/v1/stories', authenticateToken, (req, res) => {
  const { location } = req.query;
  let listStory = stories;
  if (location == '1') {
    listStory = stories.filter(s => s.lat !== null && s.lon !== null);
  }
  res.json({ error: false, message: 'Stories fetched successfully', listStory });
});

// Ambil detail cerita berdasarkan id (harus autentikasi)
app.get('/v1/stories/:id', authenticateToken, (req, res) => {
  const story = stories.find(s => s.id === req.params.id);
  if (!story) return res.status(404).json({ error: true, message: 'Story not found' });
  res.json({ error: false, message: 'Story fetched successfully', story });
});

app.listen(PORT, () => console.log(`SegarIkan API running on port ${PORT}`));
