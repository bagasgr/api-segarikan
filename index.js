import express from 'express';
import cors from 'cors';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());             // Izinkan semua origin
app.use(express.json());     // Parsing JSON

// Simulasi database user (di memori)
let users = [];

// Endpoint register user
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Validasi data
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Semua field harus diisi' });
  }

  // Cek user sudah ada
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(409).json({ message: 'Email sudah terdaftar' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
    };
    users.push(newUser);

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

// Route lain (data.json)
app.get('/api/data', (req, res) => {
  const data = JSON.parse(fs.readFileSync('data.json'));
  res.json(data);
});

app.post('/api/data', (req, res) => {
  const newData = req.body;
  const data = JSON.parse(fs.readFileSync('data.json'));
  data.push(newData);
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  res.json({ message: 'Data berhasil ditambahkan!', data: newData });
});

app.delete('/api/data/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let data = JSON.parse(fs.readFileSync('data.json'));
  const index = data.findIndex(item => item.id === id);

  if (index !== -1) {
    const deleted = data.splice(index, 1)[0];
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    res.json({ message: 'Data berhasil dihapus!', deleted });
  } else {
    res.status(404).json({ message: 'Data tidak ditemukan!' });
  }
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`API berjalan di http://localhost:${PORT}`);
});
