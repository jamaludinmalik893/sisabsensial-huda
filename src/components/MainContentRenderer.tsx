
import React from 'react';
import Dashboard from '@/components/Dashboard';
import AbsensiPage from '@/components/AbsensiPage';
import RiwayatAbsensiPage from '@/components/RiwayatAbsensiPage';
import NilaiPage from '@/components/NilaiPage';
import JurnalPage from '@/components/JurnalPage';
import ProfilSiswaPage from '@/components/ProfilSiswaPage';
import WaliKelasPage from '@/components/WaliKelasPage';
import AdminSiswaPage from '@/components/admin/AdminSiswaPage';
import AdminGuruPage from '@/components/admin/AdminGuruPage';
import AdminKelasPage from '@/components/admin/AdminKelasPage';
import AdminMapelPage from '@/components/admin/AdminMapelPage';
import NilaiRekapitulasiPage from '@/components/NilaiRekapitulasiPage';
import NilaiEntryPage from '@/components/NilaiEntryPage';
import LaporanPage from '@/components/LaporanPage';
import { UserSession } from '@/types';

interface MainContentRendererProps {
  currentPage: string;
  userSession: UserSession;
}

const MainContentRenderer: React.FC<MainContentRendererProps> = ({ currentPage, userSession }) => {
  switch (currentPage) {
    case 'beranda':
      return <Dashboard userSession={userSession} />;
    case 'absensi':
      return <AbsensiPage userSession={userSession} />;
    case 'riwayat-absensi':
      return <RiwayatAbsensiPage userSession={userSession} />;
    case 'nilai':
      return <NilaiPage />;
    case 'jurnal':
      return <JurnalPage userSession={userSession} />;
    case 'profil-siswa':
      return <ProfilSiswaPage userSession={userSession} />;
    case 'wali-kelas':
      return <WaliKelasPage userSession={userSession} />;
    case 'nilai-rekapitulasi':
      return <NilaiRekapitulasiPage userSession={userSession} />;
    case 'nilai-entry':
      return <NilaiEntryPage userSession={userSession} />;
    case 'laporan':
      return <LaporanPage userSession={userSession} />;
    case 'admin-siswa':
      return userSession.isAdmin ? (
        <AdminSiswaPage userSession={userSession} />
      ) : (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Akses ditolak. Hanya admin yang dapat mengakses halaman ini.</p>
          </div>
        </div>
      );
    case 'admin-guru':
      return userSession.isAdmin ? (
        <AdminGuruPage userSession={userSession} />
      ) : (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Akses ditolak. Hanya admin yang dapat mengakses halaman ini.</p>
          </div>
        </div>
      );
    case 'admin-kelas':
      return userSession.isAdmin ? (
        <AdminKelasPage userSession={userSession} />
      ) : (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Akses ditolak. Hanya admin yang dapat mengakses halaman ini.</p>
          </div>
        </div>
      );
    case 'admin-mapel':
      return userSession.isAdmin ? (
        <AdminMapelPage userSession={userSession} />
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

export default MainContentRenderer;
