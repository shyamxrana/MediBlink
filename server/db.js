import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'database.sqlite'), { verbose: console.log });

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT,
    phone TEXT,
    emergencyContact TEXT,
    medicalHistory TEXT
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    name TEXT,
    specialty TEXT,
    bio TEXT,
    experience TEXT,
    image TEXT,
    workingHoursStart TEXT,
    workingHoursEnd TEXT
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    patientId TEXT,
    patientName TEXT,
    email TEXT,
    phone TEXT,
    doctor TEXT,
    date TEXT,
    time TEXT,
    status TEXT,
    notes TEXT,
    createdAt INTEGER,
    reminderTime TEXT,
    reminderType TEXT
  );
`);

// Seed doctors if empty
const doctorCount = db.prepare('SELECT COUNT(*) as count FROM doctors').get().count;
if (doctorCount === 0) {
  const seedDoctors = [
    {
      id: 'dr-smith',
      name: 'Dr. Sarah Smith',
      specialty: 'Cardiologist',
      workingHoursStart: '10:00', workingHoursEnd: '17:00',
      bio: 'Dr. Smith has over 15 years of experience in treating complex heart conditions. She is dedicated to providing personalized care to her patients.',
      experience: '15+ Years',
      image: 'https://picsum.photos/seed/dr-smith/200/200'
    },
    {
      id: 'dr-jones',
      name: 'Dr. Michael Jones',
      specialty: 'Dermatologist',
      workingHoursStart: '10:00', workingHoursEnd: '17:00',
      bio: 'Dr. Jones specializes in both medical and cosmetic dermatology. He is known for his gentle approach and effective treatments.',
      experience: '10+ Years',
      image: 'https://picsum.photos/seed/dr-jones/200/200'
    },
    {
      id: 'dr-williams',
      name: 'Dr. Emily Williams',
      specialty: 'Pediatrician',
      workingHoursStart: '09:00', workingHoursEnd: '16:00',
      bio: 'Dr. Williams loves working with children and helping them stay healthy. She focuses on preventive care and developmental milestones.',
      experience: '8+ Years',
      image: 'https://picsum.photos/seed/dr-williams/200/200'
    },
    {
      id: 'dr-davis',
      name: 'Dr. Robert Davis',
      specialty: 'Neurologist',
      workingHoursStart: '08:00', workingHoursEnd: '15:00',
      bio: "Dr. Davis is an expert in treating disorders of the nervous system, including migraines, epilepsy, and Parkinson's disease.",
      experience: '20+ Years',
      image: 'https://picsum.photos/seed/dr-davis/200/200'
    },
    {
      id: 'dr-miller',
      name: 'Dr. Jessica Miller',
      specialty: 'Orthopedic Surgeon',
      workingHoursStart: '11:00', workingHoursEnd: '18:00',
      bio: 'Dr. Miller specializes in sports injuries and joint replacements. She is committed to helping patients regain mobility and live pain-free.',
      experience: '12+ Years',
      image: 'https://picsum.photos/seed/dr-miller/200/200'
    },
    {
      id: 'dr-wilson',
      name: 'Dr. David Wilson',
      specialty: 'Ophthalmologist',
      workingHoursStart: '09:00', workingHoursEnd: '17:00',
      bio: 'Dr. Wilson provides comprehensive eye care, from routine exams to advanced surgical procedures like LASIK and cataract surgery.',
      experience: '18+ Years',
      image: 'https://picsum.photos/seed/dr-wilson/200/200'
    }
  ];

  const insert = db.prepare('INSERT INTO doctors (id, name, specialty, bio, experience, image, workingHoursStart, workingHoursEnd) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  seedDoctors.forEach(d => {
    insert.run(d.id, d.name, d.specialty, d.bio, d.experience, d.image, d.workingHoursStart, d.workingHoursEnd);
  });
  console.log('Seeded 6 doctors into the database.');
}

// Seed admin user if not exists
const adminExists = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get().count;
if (adminExists === 0) {
  db.prepare("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)").run(
    'admin-1', 'Admin User', 'admin@example.com', 'admin123', 'admin'
  );
  console.log('Seeded admin user: admin@example.com / admin123');
}

export default db;
