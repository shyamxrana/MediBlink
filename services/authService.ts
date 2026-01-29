import { User } from '../types';

const USERS_STORAGE_KEY = 'mediblink_users';
const SESSION_STORAGE_KEY = 'mediblink_session';

// Simulate a backend database delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to safely access localStorage
const getStorageItem = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
};

const setStorageItem = (key: string, value: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
};

const removeStorageItem = (key: string) => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
};

export const authService = {
  // Get all users (Simulates reading a user database file)
  getUsers: (): User[] => {
    const usersJson = getStorageItem(USERS_STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  },

  // Save users (Simulates writing to a user database file)
  saveUsers: (users: User[]) => {
    setStorageItem(USERS_STORAGE_KEY, JSON.stringify(users));
  },

  // Register a new user
  register: async (name: string, email: string, password: string): Promise<User> => {
    await delay(500); // Fake network delay
    const users = authService.getUsers();
    
    if (users.find(u => u.email === email)) {
      throw new Error('Email already registered');
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password // In a real app, this MUST be hashed. Storing plain text for demo only.
    };

    users.push(newUser);
    authService.saveUsers(users);
    
    // Auto login after register
    authService.setSession(newUser);
    return newUser;
  },

  // Login existing user
  login: async (email: string, password: string): Promise<User> => {
    await delay(500);
    const users = authService.getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    authService.setSession(user);
    return user;
  },

  // Logout
  logout: () => {
    removeStorageItem(SESSION_STORAGE_KEY);
  },

  // Set current session
  setSession: (user: User) => {
    // Don't store password in session
    const { password, ...safeUser } = user;
    setStorageItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));
  },

  // Get current session
  getCurrentUser: (): User | null => {
    const sessionJson = getStorageItem(SESSION_STORAGE_KEY);
    return sessionJson ? JSON.parse(sessionJson) : null;
  }
};