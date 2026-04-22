import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Users
app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT * FROM users').all();
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const { id, name, email, password, role, phone, emergencyContact, medicalHistory } = req.body;
  
  try {
    const stmt = db.prepare('INSERT INTO users (id, name, email, password, role, phone, emergencyContact, medicalHistory) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, name, email, password, role || 'patient', phone, emergencyContact, medicalHistory);
    res.json({ id, name, email, role: role || 'patient', phone });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ error: 'User with this email already exists.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.put('/api/users/:id', (req, res) => {
  const { name, email, password, role, phone, emergencyContact, medicalHistory } = req.body;
  const updates = [];
  const params = [];
  
  if (name !== undefined) { updates.push('name = ?'); params.push(name); }
  if (email !== undefined) { updates.push('email = ?'); params.push(email); }
  if (password !== undefined) { updates.push('password = ?'); params.push(password); }
  if (role !== undefined) { updates.push('role = ?'); params.push(role); }
  if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
  if (emergencyContact !== undefined) { updates.push('emergencyContact = ?'); params.push(emergencyContact); }
  if (medicalHistory !== undefined) { updates.push('medicalHistory = ?'); params.push(medicalHistory); }
  
  if (updates.length === 0) return res.json({ success: true });
  
  params.push(req.params.id);
  const stmt = db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...params);
  
  const updatedUser = db.prepare('SELECT id, name, email, role, phone, emergencyContact, medicalHistory FROM users WHERE id = ?').get(req.params.id);
  res.json(updatedUser);
});

app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@example.com' && password === 'admin123') {
    return res.json({ id: 'admin-1', name: 'Admin User', email: 'admin@example.com', role: 'admin' });
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password);
  if (user) {
    delete user.password;
    res.json(user);
  } else {
    res.status(401).json({ error: 'Invalid email or password' });
  }
});

app.post('/api/users/reset', (req, res) => {
  const { email, newPassword } = req.body;
  if (email === 'admin@example.com') {
    return res.status(400).json({ error: 'Cannot reset password for the demo admin account.' });
  }
  const result = db.prepare('UPDATE users SET password = ? WHERE email = ?').run(newPassword, email);
  if (result.changes > 0) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found with this email address.' });
  }
});

// Doctors
app.get('/api/doctors', (req, res) => {
  const doctors = db.prepare('SELECT * FROM doctors').all();
  const formatted = doctors.map(d => ({
    ...d,
    workingHours: { start: d.workingHoursStart || '09:00', end: d.workingHoursEnd || '17:00' }
  }));
  res.json(formatted);
});

app.post('/api/doctors', (req, res) => {
  const { id, name, specialty, bio, experience, image, workingHours } = req.body;
  const start = workingHours?.start || '09:00';
  const end = workingHours?.end || '17:00';
  
  const stmt = db.prepare('INSERT INTO doctors (id, name, specialty, bio, experience, image, workingHoursStart, workingHoursEnd) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  stmt.run(id, name, specialty, bio, experience, image, start, end);
  res.json({ success: true });
});

app.put('/api/doctors/:id', (req, res) => {
  const { name, specialty, bio, experience, image, workingHours } = req.body;
  const updates = [];
  const params = [];
  
  if (name !== undefined) { updates.push('name = ?'); params.push(name); }
  if (specialty !== undefined) { updates.push('specialty = ?'); params.push(specialty); }
  if (bio !== undefined) { updates.push('bio = ?'); params.push(bio); }
  if (experience !== undefined) { updates.push('experience = ?'); params.push(experience); }
  if (image !== undefined) { updates.push('image = ?'); params.push(image); }
  if (workingHours !== undefined) {
    if (workingHours.start) { updates.push('workingHoursStart = ?'); params.push(workingHours.start); }
    if (workingHours.end) { updates.push('workingHoursEnd = ?'); params.push(workingHours.end); }
  }
  
  if (updates.length > 0) {
    params.push(req.params.id);
    const stmt = db.prepare(`UPDATE doctors SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params);
  }
  res.json({ success: true });
});

app.delete('/api/doctors/:id', (req, res) => {
  db.prepare('DELETE FROM doctors WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Appointments
app.get('/api/appointments', (req, res) => {
  const appts = db.prepare('SELECT * FROM appointments').all();
  res.json(appts);
});

app.post('/api/appointments', (req, res) => {
  try {
    const { id, patientId, patientName, email, phone, doctor, date, time, status, notes, createdAt, reminderTime, reminderType } = req.body;
    
    // Check double booking
    const existing = db.prepare('SELECT id FROM appointments WHERE doctor = ? AND date = ? AND time = ? AND status NOT IN (\'cancelled\', \'rejected\')').get(doctor, date, time);
    if (existing) {
      return res.status(400).json({ error: `The time slot ${time} on ${date} is already booked for this doctor. Please choose another time.` });
    }

    const stmt = db.prepare('INSERT INTO appointments (id, patientId, patientName, email, phone, doctor, date, time, status, notes, createdAt, reminderTime, reminderType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, patientId, patientName, email, phone, doctor, date, time, status || 'pending', notes, createdAt || Date.now(), reminderTime, reminderType);
    res.json({ success: true, message: 'Appointment booked successfully.' });
  } catch (err) {
    console.error('Error booking appointment:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/appointments/:id', (req, res) => {
  const updates = [];
  const params = [];
  
  const fields = ['status', 'notes', 'reminderTime', 'reminderType'];
  fields.forEach(f => {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      params.push(req.body[f]);
    }
  });
  
  if (updates.length > 0) {
    params.push(req.params.id);
    const stmt = db.prepare(`UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params);
  }
  res.json({ success: true });
});

app.delete('/api/appointments/:id', (req, res) => {
  db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
