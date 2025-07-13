import { supabase } from './supabase';
import { User } from '../types';

export const signUp = async (email: string, password: string, fullName: string, role: string = 'customer') => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  });

  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile ? {
    id: user.id,
    email: user.email!,
    role: profile.role,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    created_at: profile.created_at,
    is_banned: profile.is_banned,
  } : null;
};