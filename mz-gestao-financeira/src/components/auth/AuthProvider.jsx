// src/components/auth/AuthProvider.jsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Importa o cliente Supabase do lado do cliente

const AuthContext = createContext(null);

export const AuthProvider = ({ children, session: initialSession }) => {
  const [session, setSession] = useState(initialSession);
  const [user, setUser] = useState(initialSession?.user || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Define a sessão inicial
    setSession(initialSession);
    setUser(initialSession?.user || null);
    setLoading(false);

    // Escuta por mudanças na autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [initialSession]);

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
