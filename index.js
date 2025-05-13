import express from 'express';
import cors from 'cors';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

// Izinkan semua origin
app.use(cors());

// Parsing JSON
app.use(express.json());

// Ambil semua data
app.get('/api/data', (req, res) => {
  const data = JSON.parse(fs.readFileSync('data.json'));
  res.json(data);
});

// Tambah data baru
app.post('/api/data', (req, res) => {
  const newData = req.body;
  const data = JSON.parse(fs.readFileSync('data.json'));
  data.push(newData);
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  res.json({ message: 'Data berhasil ditambahkan!', data: newData });
});

// Hapus data berdasarkan ID
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
