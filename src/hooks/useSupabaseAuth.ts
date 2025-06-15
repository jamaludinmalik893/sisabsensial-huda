
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession, Guru } from '@/types';

export const useSupabaseAuth = () => {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      
      // Check if there's a stored session
      const storedSession = localStorage.getItem('userSession');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        
        // Verify the session is still valid by checking the database
        const { data: guru, error } = await supabase
          .from('guru')
          .select(`
            *,
            kelas_wali:wali_kelas(id_kelas, nama_kelas),
            guru_roles(role)
          `)
          .eq('id_guru', session.guru.id_guru)
          .single();

        if (!error && guru) {
          // Extract roles from guru_roles
          const roles = guru.guru_roles?.map((gr: any) => gr.role) || [];
          
          const userSession: UserSession = {
            guru: {
              ...guru,
              roles: roles
            },
            isAdmin: roles.includes('admin'),
            isGuru: roles.includes('guru'),
            isWaliKelas: roles.includes('wali_kelas'),
            kelasWali: guru.kelas_wali || undefined,
            roles: roles
          };

          setUserSession(userSession);
          setIsLoggedIn(true);
          
          // Update stored session with latest data
          localStorage.setItem('userSession', JSON.stringify(userSession));
        } else {
          // Invalid session, clear it
          localStorage.removeItem('userSession');
          setUserSession(null);
          setIsLoggedIn(false);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('userSession');
      setUserSession(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      // Query guru with all necessary relations and roles
      const { data: guru, error } = await supabase
        .from('guru')
        .select(`
          *,
          kelas_wali:wali_kelas(id_kelas, nama_kelas),
          guru_roles(role)
        `)
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !guru) {
        console.error('Login error:', error);
        return false;
      }

      // Extract roles from guru_roles
      const roles = guru.guru_roles?.map((gr: any) => gr.role) || [];

      const userSession: UserSession = {
        guru: {
          ...guru,
          roles: roles
        },
        isAdmin: roles.includes('admin'),
        isGuru: roles.includes('guru'),
        isWaliKelas: roles.includes('wali_kelas'),
        kelasWali: guru.kelas_wali || undefined,
        roles: roles
      };

      setUserSession(userSession);
      setIsLoggedIn(true);
      
      // Store session
      localStorage.setItem('userSession', JSON.stringify(userSession));

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('userSession');
    setUserSession(null);
    setIsLoggedIn(false);
  };

  return {
    userSession,
    isLoggedIn,
    loading,
    login,
    logout,
    checkAuth
  };
};
