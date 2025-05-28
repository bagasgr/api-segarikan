import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Simulasi database user yang sama seperti di register.js
let users = [];

const SECRET_KEY = 'rahasia_super_aman'; // Ganti dengan env variable di production

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metode tidak diizinkan' });
  }

  const { email, password } = req.body;

  // Validasi input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi' });
  }

  // Cari user berdasarkan email
  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Email atau password salah' });
  }

  // Cocokkan password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Email atau password salah' });
  }

  // Buat token
  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    SECRET_KEY,
    { expiresIn: '60d' } // Token berlaku 7 hari
  );

  return res.status(200).json({
    success: true,
    message: 'Login berhasil',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
}
