import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from './database';
import { User } from '../types';

// Session storage (in production, use proper session management)
let currentUser: User | null = null;

export const signUp = async (email: string, password: string, fullName: string, role: string = 'customer') => {
  try {
    // Check if user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, 10);
    const userId = uuidv4();

    // Insert new user
    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, role)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertUser.run(userId, email, passwordHash, fullName, role);

    return { user: { id: userId, email, full_name: fullName, role } };
  } catch (error) {
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    // Find user by email
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isValidPassword = bcrypt.compareSync(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Check if user is banned
    if (user.is_banned) {
      throw new Error('Your account has been banned. Please contact support.');
    }

    // Set current user
    currentUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      is_banned: user.is_banned,
    };

    return { user: currentUser };
  } catch (error) {
    throw error;
  }
};

export const signOut = async () => {
  currentUser = null;
};

export const getCurrentUser = async (): Promise<User | null> => {
  return currentUser;
};

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  try {
    const updateFields = [];
    const values = [];

    if (updates.full_name !== undefined) {
      updateFields.push('full_name = ?');
      values.push(updates.full_name);
    }
    if (updates.avatar_url !== undefined) {
      updateFields.push('avatar_url = ?');
      values.push(updates.avatar_url);
    }

    if (updateFields.length === 0) {
      return currentUser;
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);

    const updateUser = db.prepare(`
      UPDATE users SET ${updateFields.join(', ')} WHERE id = ?
    `);

    updateUser.run(...values);

    // Update current user if it's the same user
    if (currentUser && currentUser.id === userId) {
      currentUser = { ...currentUser, ...updates };
    }

    return currentUser;
  } catch (error) {
    throw error;
  }
};