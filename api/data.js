import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data.json');

export default function handler(req, res) {
  let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (req.method === 'GET') {
    // Ambil semua data
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    // Tambah data baru
    const newData = req.body;
    data.push(newData);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return res.status(201).json({ message: 'Data berhasil ditambahkan', data: newData });
  }

  if (req.method === 'DELETE') {
    // Hapus data berdasarkan ID atau index
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'ID diperlukan untuk menghapus data' });
    }

    const index = data.findIndex(item => String(item.id) === String(id));
    if (index === -1) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    const deleted = data.splice(index, 1);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return res.status(200).json({ message: 'Data berhasil dihapus', deleted });
  }

  // Method tidak didukung
  res.status(405).json({ message: 'Method tidak diizinkan' });
}
