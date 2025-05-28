// pages/api/register.js
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const filePath = path.join(process.cwd(), 'users.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metode tidak diizinkan' });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Semua field harus diisi' });
  }

  const fileData = fs.readFileSync(filePath, 'utf8');
  const users = JSON.parse(fileData);

  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(409).json({ message: 'Email sudah terdaftar' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, name, email, password: hashedPassword };
    users.push(newUser);
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}
