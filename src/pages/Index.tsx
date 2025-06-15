
import React, { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import LoginPage from '@/components/LoginPage';
import AppSidebar from '@/components/AppSidebar';
import MainContentRenderer from '@/components/MainContentRenderer';
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
          <MainContentRenderer currentPage={currentPage} userSession={userSession} />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
