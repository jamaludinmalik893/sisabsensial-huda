
import { 
  Home, 
  Calendar, 
  FileText, 
  BookOpen,
  Users,
  User,
  School,
  GraduationCap,
  BarChart3
} from 'lucide-react';
import { MenuItem } from './types';

export const menuUtama: MenuItem[] = [
  {
    title: "Beranda",
    url: "beranda",
    icon: Home,
  },
  {
    title: "Absensi",
    url: "absensi",
    icon: Calendar,
    submenus: [
      {
        title: "Absensi Harian",
        url: "absensi",
      },
      {
        title: "Riwayat Absensi",
        url: "riwayat-absensi",
      },
    ],
  },
  {
    title: "Nilai",
    url: "nilai",
    icon: FileText,
    submenus: [
      {
        title: "Rekapitulasi Nilai",
        url: "nilai-rekapitulasi",
      },
      {
        title: "Entry Nilai",
        url: "nilai-entry",
      },
    ],
  },
  {
    title: "Jurnal",
    url: "jurnal",
    icon: BookOpen,
  },
  {
    title: "Profil Siswa",
    url: "profil-siswa",
    icon: Users,
  },
];

export const menuLaporan: MenuItem[] = [
  {
    title: "Laporan Akademik",
    url: "laporan",
    icon: BarChart3,
  },
];

export const menuAdministrasi: MenuItem[] = [
  {
    title: "Siswa",
    url: "admin-siswa",
    icon: GraduationCap,
  },
  {
    title: "Guru",
    url: "admin-guru",
    icon: User,
  },
  {
    title: "Kelas",
    url: "admin-kelas",
    icon: School,
  },
  {
    title: "Mata Pelajaran",
    url: "admin-mapel",
    icon: BookOpen,
  },
];

export const menuWaliKelas: MenuItem[] = [
  {
    title: "Wali Kelas",
    url: "wali-kelas",
    icon: Users,
    submenus: [
      {
        title: "Siswa",
        url: "wali-kelas-siswa",
      },
      {
        title: "Absen Harian",
        url: "wali-kelas-absen",
      },
      {
        title: "Laporan Akademik",
        url: "wali-kelas-laporan",
      },
    ],
  },
];
