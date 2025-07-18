import { User } from '../types';

const API_BASE_URL = '/api';

export const signUp = async (email: string, password: string, fullName: string, role: string = 'customer') => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, fullName, role }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sign up');
  }

  return response.json();
};

export const signIn = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sign in');
  }

  return response.json();
};

export const signOut = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/signout`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to sign out');
  }

  return response.json();
};

export const getCurrentUser = async (): Promise<User | null> => {
  const response = await fetch(`${API_BASE_URL}/auth/user`);
  
  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.user;
};

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  // TODO: Implement update user profile API
  return null;
};