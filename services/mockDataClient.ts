// Client-side mock data - can be imported by client components
import { Doctor, Specialty, Prescription } from '../types';

// Mock Doctors Data
export const DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: Specialty.GeneralPractice,
    rating: 4.8,
    experience: 12,
    image: 'https://picsum.photos/seed/doctor1/300/300',
    availability: ['2025-02-01', '2025-02-02', '2025-02-03'],
    bio: 'Experienced general practitioner with a focus on preventive care.',
    price: 50
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: Specialty.Cardiology,
    rating: 4.9,
    experience: 15,
    image: 'https://picsum.photos/seed/doctor2/300/300',
    availability: ['2025-02-01', '2025-02-02'],
    bio: 'Board-certified cardiologist specializing in heart disease prevention.',
    price: 120
  },
  {
    id: '3',
    name: 'Dr. Emily Davis',
    specialty: Specialty.Dermatology,
    rating: 4.7,
    experience: 10,
    image: 'https://picsum.photos/seed/doctor3/300/300',
    availability: ['2025-02-03', '2025-02-04'],
    bio: 'Expert in skin care and cosmetic dermatology.',
    price: 75
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    specialty: Specialty.Pediatrics,
    rating: 4.9,
    experience: 18,
    image: 'https://picsum.photos/seed/doctor4/300/300',
    availability: ['2025-02-01', '2025-02-05'],
    bio: 'Compassionate pediatrician dedicated to child health and development.',
    price: 60
  },
  {
    id: '5',
    name: 'Dr. Lisa Anderson',
    specialty: Specialty.Neurology,
    rating: 4.6,
    experience: 14,
    image: 'https://picsum.photos/seed/doctor5/300/300',
    availability: ['2025-02-02', '2025-02-04'],
    bio: 'Specialist in neurological disorders and migraine treatment.',
    price: 110
  },
  {
    id: '6',
    name: 'Dr. Robert Martinez',
    specialty: Specialty.Orthopedics,
    rating: 4.8,
    experience: 16,
    image: 'https://picsum.photos/seed/doctor6/300/300',
    availability: ['2025-02-01', '2025-02-03'],
    bio: 'Orthopedic surgeon specializing in joint replacement and sports medicine.',
    price: 100
  },
  {
    id: '7',
    name: 'Dr. Patricia Lee',
    specialty: Specialty.Psychiatry,
    rating: 4.7,
    experience: 12,
    image: 'https://picsum.photos/seed/doctor7/300/300',
    availability: ['2025-02-02', '2025-02-05'],
    bio: 'Licensed psychiatrist providing compassionate mental health care.',
    price: 90
  }
];

// Mock Prescriptions Data
export const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: '1',
    medication: 'Amoxicillin',
    dosage: '500mg, twice daily for 7 days',
    doctorName: 'Dr. Sarah Johnson',
    dateIssued: '2025-01-20',
    status: 'active'
  },
  {
    id: '2',
    medication: 'Lisinopril',
    dosage: '10mg, once daily',
    doctorName: 'Dr. Michael Chen',
    dateIssued: '2025-01-15',
    status: 'active'
  },
  {
    id: '3',
    medication: 'Tretinoin Cream',
    dosage: '0.025%, apply before bed',
    doctorName: 'Dr. Emily Davis',
    dateIssued: '2025-01-10',
    status: 'active'
  }
];
