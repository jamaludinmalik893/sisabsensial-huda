
export interface Database {
  public: {
    Tables: {
      kelas: {
        Row: {
          id_kelas: string;
          nama_kelas: string;
          logo_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id_kelas?: string;
          nama_kelas: string;
          logo_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id_kelas?: string;
          nama_kelas?: string;
          logo_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      mata_pelajaran: {
        Row: {
          id_mapel: string;
          nama_mapel: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id_mapel?: string;
          nama_mapel: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id_mapel?: string;
          nama_mapel?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      guru: {
        Row: {
          id_guru: string;
          nip: string;
          nama_lengkap: string;
          email: string;
          password: string;
          nomor_telepon?: string;
          alamat?: string;
          wali_kelas?: string;
          status: 'admin' | 'guru';
          foto_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id_guru?: string;
          nip: string;
          nama_lengkap: string;
          email: string;
          password: string;
          nomor_telepon?: string;
          alamat?: string;
          wali_kelas?: string;
          status?: 'admin' | 'guru';
          foto_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id_guru?: string;
          nip?: string;
          nama_lengkap?: string;
          email?: string;
          password?: string;
          nomor_telepon?: string;
          alamat?: string;
          wali_kelas?: string;
          status?: 'admin' | 'guru';
          foto_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      siswa: {
        Row: {
          id_siswa: string;
          nisn: string;
          nama_lengkap: string;
          jenis_kelamin: 'Laki-laki' | 'Perempuan';
          tanggal_lahir: string;
          tempat_lahir: string;
          alamat: string;
          nomor_telepon?: string;
          nama_orang_tua: string;
          nomor_telepon_orang_tua?: string;
          id_kelas: string;
          id_guru_wali: string;
          tahun_masuk: number;
          foto_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id_siswa?: string;
          nisn: string;
          nama_lengkap: string;
          jenis_kelamin: 'Laki-laki' | 'Perempuan';
          tanggal_lahir: string;
          tempat_lahir: string;
          alamat: string;
          nomor_telepon?: string;
          nama_orang_tua: string;
          nomor_telepon_orang_tua?: string;
          id_kelas: string;
          id_guru_wali: string;
          tahun_masuk: number;
          foto_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id_siswa?: string;
          nisn?: string;
          nama_lengkap?: string;
          jenis_kelamin?: 'Laki-laki' | 'Perempuan';
          tanggal_lahir?: string;
          tempat_lahir?: string;
          alamat?: string;
          nomor_telepon?: string;
          nama_orang_tua?: string;
          nomor_telepon_orang_tua?: string;
          id_kelas?: string;
          id_guru_wali?: string;
          tahun_masuk?: number;
          foto_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      jurnal_harian: {
        Row: {
          id_jurnal: string;
          id_guru: string;
          id_mapel: string;
          id_kelas: string;
          tanggal_pelajaran: string;
          waktu_mulai: string;
          waktu_selesai: string;
          judul_materi: string;
          materi_diajarkan: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id_jurnal?: string;
          id_guru: string;
          id_mapel: string;
          id_kelas: string;
          tanggal_pelajaran: string;
          waktu_mulai: string;
          waktu_selesai: string;
          judul_materi: string;
          materi_diajarkan: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id_jurnal?: string;
          id_guru?: string;
          id_mapel?: string;
          id_kelas?: string;
          tanggal_pelajaran?: string;
          waktu_mulai?: string;
          waktu_selesai?: string;
          judul_materi?: string;
          materi_diajarkan?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      absensi: {
        Row: {
          id_absensi: string;
          id_jurnal: string;
          id_siswa: string;
          status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha';
          catatan?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id_absensi?: string;
          id_jurnal: string;
          id_siswa: string;
          status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha';
          catatan?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id_absensi?: string;
          id_jurnal?: string;
          id_siswa?: string;
          status?: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha';
          catatan?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      nilai: {
        Row: {
          id_nilai: string;
          id_siswa: string;
          id_mapel: string;
          id_jurnal: string;
          jenis_nilai: string;
          skor: number;
          tanggal_nilai: string;
          catatan?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id_nilai?: string;
          id_siswa: string;
          id_mapel: string;
          id_jurnal: string;
          jenis_nilai: string;
          skor: number;
          tanggal_nilai: string;
          catatan?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id_nilai?: string;
          id_siswa?: string;
          id_mapel?: string;
          id_jurnal?: string;
          jenis_nilai?: string;
          skor?: number;
          tanggal_nilai?: string;
          catatan?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
