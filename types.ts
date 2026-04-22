export enum Specialty {
  GeneralPractice = "General Practice",
  Cardiology = "Cardiology",
  Dermatology = "Dermatology",
  Pediatrics = "Pediatrics",
  Neurology = "Neurology",
  Orthopedics = "Orthopedics",
  Psychiatry = "Psychiatry"
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Only used internally during auth checks, not exposed usually
}

export interface Doctor {
  id: string;
  name: string;
  specialty: Specialty;
  rating: number;
  experience: number; // years
  image: string;
  availability: string[]; // ISO Date strings or simple time slots
  bio: string;
  price: number;
}

export interface Appointment {
  id: string;
  userId: string; // Link appointment to specific user
  doctorId: string;
  doctorName: string;
  doctorSpecialty: Specialty;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
  type: 'video' | 'in-person';
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  doctorName: string;
  dateIssued: string;
  status: 'active' | 'archived';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedDoctorIds?: string[];
}