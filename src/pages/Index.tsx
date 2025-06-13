
import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import LoginPage from '@/components/LoginPage';
import AppSidebar from '@/components/AppSidebar';
import Dashboard from '@/components/Dashboard';
import { UserSession, Guru } from '@/types';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('beranda');
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check existing session on app start
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

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      // Mock authentication - dalam implementasi nyata akan menggunakan Supabase Auth
      console.log('Attempting login with:', { email, password });
      
      // Demo accounts
      const demoAccounts = [
        {
          email: 'ahmad.wijaya@smkalhuda.sch.id',
          password: 'admin123',
          guru: {
            id_guru: '1',
            nip: '196801011990011001',
            nama_lengkap: 'Drs. Ahmad Wijaya, M.Pd',
            email: 'ahmad.wijaya@smkalhuda.sch.id',
            nomor_telepon: '081234567890',
            status: 'admin' as const,
            alamat: 'Jl. Veteran No. 123, Kediri',
            wali_kelas: undefined
          }
        },
        {
          email: 'sri.mulyati@smkalhuda.sch.id',
          password: 'guru123',
          guru: {
            id_guru: '2',
            nip: '197205151998022002',
            nama_lengkap: 'Sri Mulyati, S.Kom',
            email: 'sri.mulyati@smkalhuda.sch.id',
            nomor_telepon: '081234567891',
            status: 'guru' as const,
            alamat: 'Jl. Hayam Wuruk No. 45, Kediri',
            wali_kelas: 'kelas-1'
          }
        }
      ];

      const account = demoAccounts.find(acc => acc.email === email && acc.password === password);
      
      if (account) {
        const session: UserSession = {
          guru: account.guru,
          isAdmin: account.guru.status === 'admin',
          isWaliKelas: !!account.guru.wali_kelas,
          kelasWali: account.guru.wali_kelas ? {
            id_kelas: account.guru.wali_kelas,
            nama_kelas: 'X RPL 1'
          } : undefined
        };

        setUserSession(session);
        setIsLoggedIn(true);
        
        // Save session to localStorage
        localStorage.setItem('userSession', JSON.stringify(session));
        
        toast({
          title: "Login Berhasil",
          description: `Selamat datang, ${account.guru.nama_lengkap}!`,
        });

        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserSession(null);
    setCurrentPage('beranda');
    localStorage.removeItem('userSession');
    
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari sistem",
    });
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    if (!userSession) return null;

    switch (currentPage) {
      case 'beranda':
        return <Dashboard userSession={userSession} />;
      case 'absensi':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Absensi Harian</h1>
            <p className="text-gray-600">Halaman absensi akan segera dibuat...</p>
          </div>
        );
      case 'riwayat-absensi':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Riwayat Absensi</h1>
            <p className="text-gray-600">Halaman riwayat absensi akan segera dibuat...</p>
          </div>
        );
      case 'nilai':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Manajemen Nilai</h1>
            <p className="text-gray-600">Halaman nilai akan segera dibuat...</p>
          </div>
        );
      case 'jurnal':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Jurnal Pembelajaran</h1>
            <p className="text-gray-600">Halaman jurnal akan segera dibuat...</p>
          </div>
        );
      case 'profil-siswa':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Profil Siswa</h1>
            <p className="text-gray-600">Halaman profil siswa akan segera dibuat...</p>
          </div>
        );
      case 'wali-kelas':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Dashboard Wali Kelas</h1>
            {userSession.isWaliKelas ? (
              <div>
                <p className="text-gray-600 mb-4">
                  Selamat datang, Anda adalah wali kelas {userSession.kelasWali?.nama_kelas}
                </p>
                <p className="text-gray-500">Laporan statistik kelas akan segera dibuat...</p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  Anda bukan wali kelas dari kelas manapun.
                </p>
              </div>
            )}
          </div>
        );
      // Admin pages
      case 'admin-siswa':
        return userSession.isAdmin ? (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Administrasi Siswa</h1>
            <p className="text-gray-600">Halaman administrasi siswa akan segera dibuat...</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Akses ditolak. Hanya admin yang dapat mengakses halaman ini.</p>
            </div>
          </div>
        );
      case 'admin-guru':
        return userSession.isAdmin ? (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Administrasi Guru</h1>
            <p className="text-gray-600">Halaman administrasi guru akan segera dibuat...</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Akses ditolak. Hanya admin yang dapat mengakses halaman ini.</p>
            </div>
          </div>
        );
      case 'admin-kelas':
        return userSession.isAdmin ? (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Administrasi Kelas</h1>
            <p className="text-gray-600">Halaman administrasi kelas akan segera dibuat...</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Akses ditolak. Hanya admin yang dapat mengakses halaman ini.</p>
            </div>
          </div>
        );
      case 'admin-mapel':
        return userSession.isAdmin ? (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Administrasi Mata Pelajaran</h1>
            <p className="text-gray-600">Halaman administrasi mata pelajaran akan segera dibuat...</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Akses ditolak. Hanya admin yang dapat mengakses halaman ini.</p>
            </div>
          </div>
        );
      default:
        return <Dashboard userSession={userSession} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (!userSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <p className="text-red-600">Error: Session tidak valid</p>
          <button
            onClick={() => {
              localStorage.removeItem('userSession');
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reset Aplikasi
          </button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar
          currentPage={currentPage}
          onPageChange={handlePageChange}
          userSession={userSession}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-auto">
          <div className="bg-white border-b border-gray-200 px-6 py-4 lg:hidden">
            <SidebarTrigger className="text-gray-600 hover:text-gray-900" />
          </div>
          {renderCurrentPage()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
