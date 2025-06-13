
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';

export const useSupabaseAuth = () => {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const authenticateWithDatabase = async (email: string, password: string): Promise<UserSession | null> => {
    try {
      const { data: guru, error } = await supabase
        .from('guru')
        .select(`
          *,
          wali_kelas:kelas(id_kelas, nama_kelas)
        `)
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !guru) {
        console.error('Login error:', error);
        return null;
      }

      const session: UserSession = {
        guru: {
          id_guru: guru.id_guru,
          nip: guru.nip,
          nama_lengkap: guru.nama_lengkap,
          email: guru.email,
          nomor_telepon: guru.nomor_telepon,
          alamat: guru.alamat,
          status: guru.status,
          wali_kelas: guru.wali_kelas?.id_kelas,
          foto_url: guru.foto_url
        },
        isAdmin: guru.status === 'admin',
        isWaliKelas: !!guru.wali_kelas,
        kelasWali: guru.wali_kelas ? {
          id_kelas: guru.wali_kelas.id_kelas,
          nama_kelas: guru.wali_kelas.nama_kelas
        } : undefined
      };

      return session;
    } catch (error) {
      console.error('Database authentication error:', error);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const session = await authenticateWithDatabase(email, password);
    
    if (session) {
      setUserSession(session);
      setIsLoggedIn(true);
      localStorage.setItem('userSession', JSON.stringify(session));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserSession(null);
    localStorage.removeItem('userSession');
  };

  useEffect(() => {
    const checkSession = () => {
      const savedSession = localStorage.getItem('userSession');
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          setUserSession(session);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Error parsing saved session:', error);
          localStorage.removeItem('userSession');
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  return {
    userSession,
    isLoggedIn,
    loading,
    login,
    logout
  };
};
