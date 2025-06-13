
import React, { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import LoginPage from '@/components/LoginPage';
import AppSidebar from '@/components/AppSidebar';
import Dashboard from '@/components/Dashboard';
import AbsensiPage from '@/components/AbsensiPage';
import RiwayatAbsensiPage from '@/components/RiwayatAbsensiPage';
import NilaiPage from '@/components/NilaiPage';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('beranda');
  const { userSession, isLoggedIn, loading, login, logout } = useSupabaseAuth();
  const { toast } = useToast();

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    const success = await login(email, password);
    if (success && userSession) {
      toast({
        title: "Login Berhasil",
        description: `Selamat datang, ${userSession.guru.nama_lengkap}!`,
      });
    } else {
      toast({
        title: "Login Gagal",
        description: "Email atau password salah",
        variant: "destructive"
      });
    }
    return success;
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('beranda');
    
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
        return <AbsensiPage userSession={userSession} />;
      case 'riwayat-absensi':
        return <RiwayatAbsensiPage userSession={userSession} />;
      case 'nilai':
        return <NilaiPage userSession={userSession} />;
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
