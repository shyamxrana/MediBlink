import { Appointment, User, Doctor, DEFAULT_DOCTORS } from '../types';

const API_ROOT = '/api';

// --- Doctors ---

export const getDoctors = async (): Promise<Doctor[]> => {
  const res = await aFetch(`${API_ROOT}/doctors`);
  return res || DEFAULT_DOCTORS;
};

export const saveDoctor = async (doctor: Doctor): Promise<void> => {
  await aFetch(`${API_ROOT}/doctors`, {
    method: 'POST',
    body: JSON.stringify(doctor)
  });
};

export const updateDoctor = async (id: string, updatedData: Partial<Doctor>): Promise<void> => {
  await aFetch(`${API_ROOT}/doctors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedData)
  });
};

export const deleteDoctor = async (id: string): Promise<void> => {
  await aFetch(`${API_ROOT}/doctors/${id}`, {
    method: 'DELETE'
  });
};

// --- Users ---

export const getUsers = async (): Promise<User[]> => {
  return await aFetch(`${API_ROOT}/users`) || [];
};

export const saveUser = async (user: User): Promise<void> => {
  const res = await fetch(`${API_ROOT}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to save user');
  }
};

export const updateUser = async (id: string, updatedData: Partial<User>): Promise<void> => {
  await aFetch(`${API_ROOT}/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedData)
  });
  // Update local session
  const currentUserData = localStorage.getItem('mediblink_current_user');
  if (currentUserData) {
    const currentUser = JSON.parse(currentUserData);
    if (currentUser.id === id) {
      localStorage.setItem('mediblink_current_user', JSON.stringify({ ...currentUser, ...updatedData }));
    }
  }
};

export const resetPassword = async (email: string, newPassword: string): Promise<void> => {
  const res = await fetch(`${API_ROOT}/users/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'User not found');
  }
};

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  const res = await fetch(`${API_ROOT}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (res.ok) {
    return res.json();
  }
  return null;
};

// --- Appointments ---

export const getAppointments = async (): Promise<Appointment[]> => {
  return await aFetch(`${API_ROOT}/appointments`) || [];
};

export const saveAppointment = async (appointment: Appointment): Promise<void> => {
  const result = await aFetch(`${API_ROOT}/appointments`, {
    method: 'POST',
    body: JSON.stringify(appointment)
  });
  if (!result) {
    throw new Error('Failed to book appointment');
  }
};

export const updateAppointment = async (id: string, updatedData: Partial<Appointment>): Promise<void> => {
  await aFetch(`${API_ROOT}/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedData)
  });
};

export const deleteAppointment = async (id: string): Promise<void> => {
  await aFetch(`${API_ROOT}/appointments/${id}`, {
    method: 'DELETE'
  });
};

export const getAvailableSlots = async (doctorId: string, date: string): Promise<string[]> => {
  const startHour = 10;
  const endHour = 17;
  
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  const appointments = await getAppointments();
  const bookedSlots = appointments
    .filter(
      (appt) =>
        appt.doctor === doctorId &&
        appt.date === date &&
        appt.status !== 'cancelled' &&
        appt.status !== 'rejected'
    )
    .map((appt) => appt.time);

  // Filter out past slots if date is today
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  let availableSlots = slots.filter((slot) => !bookedSlots.includes(slot));
  
  if (date === today) {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    availableSlots = availableSlots.filter(slot => {
      const [slotHour, slotMinute] = slot.split(':').map(Number);
      if (slotHour > currentHour) return true;
      if (slotHour === currentHour && slotMinute > currentMinute + 30) return true; // Give 30 min buffer
      return false;
    });
  }

  return availableSlots;
};

// Helper fetch to reduce boilerplate
async function aFetch(url: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  });
  if (!res.ok) return null;
  return res.json();
}
