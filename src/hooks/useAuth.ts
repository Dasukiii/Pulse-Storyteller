import { useState, useEffect } from 'react';
import { supabase, type Profile } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        session,
      }));

      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setAuthState((prev) => ({
          ...prev,
          user: session?.user ?? null,
          session,
        }));

        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setAuthState((prev) => ({
            ...prev,
            profile: null,
            loading: false,
          }));
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      setAuthState((prev) => ({
        ...prev,
        profile: data,
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading profile:', error);
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    companyName: string,
    role: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          company_name: companyName,
          role,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('Failed to create user');

    if (data.session) {
      await loadProfile(data.user.id);
    }

    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      await loadProfile(data.user.id);
    }

    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    setAuthState({
      user: null,
      profile: null,
      session: null,
      loading: false,
    });
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
  };
}
