import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '$lib/types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  session: null,
  loading: true
};

export const auth = writable<AuthState>(initialState);

class AuthService {
  constructor() {
    this.init();
  }

  private async init() {
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      await this.setSession(session);
    } else {
      auth.update(state => ({ ...state, loading: false }));
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await this.setSession(session);
      } else if (event === 'SIGNED_OUT') {
        auth.set({ user: null, profile: null, session: null, loading: false });
      }
    });
  }

  private async setSession(session: Session) {
    const user = session.user;
    const profile = await this.getProfile(user.id);
    
    auth.set({
      user,
      profile,
      session,
      loading: false
    });
  }

  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  async signInWithApple() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      console.error('Error signing in with Apple:', error);
      throw error;
    }
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist yet
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  async createProfile(profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'is_admin'>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        ...profileData,
        is_admin: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }

    // Update the auth store with the new profile
    auth.update(state => ({
      ...state,
      profile: data
    }));

    return data;
  }

  async updateProfile(updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    // Update the auth store with the updated profile
    auth.update(state => ({
      ...state,
      profile: data
    }));

    return data;
  }
}

export const authService = new AuthService();
