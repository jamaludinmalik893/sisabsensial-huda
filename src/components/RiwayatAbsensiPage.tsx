
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';
import AbsensiOverviewTable from './absensi/AbsensiOverviewTable';

interface RiwayatAbsensiPageProps {
  userSession: UserSession;
}

interface MataPelajaran {
  id_mapel: string;
  nama_mapel: string;
}

interface Kelas {
  id_kelas: string;
  nama_kelas: string;
}

interface RiwayatAbsensi {
  id_absensi: string;
  status: string;
  catatan?: string;
  created_at: string;
  siswa: {
    id_siswa: string;
    nama_lengkap: string;
    nisn: string;
    jenis_kelamin: string;
    tanggal_lahir: string;
    tempat_lahir: string;
    alamat: string;
    nomor_telepon?: string;
    nama_orang_tua: string;
    nomor_telepon_orang_tua?: string;
    tahun_masuk: number;
    foto_url?: string;
    kelas?: {
      nama_kelas: string;
    };
    guru_wali?: {
      nama_lengkap: string;
    };
  };
  jurnal_harian: {
    id_jurnal: string;
    tanggal_pelajaran: string;
    judul_materi: string;
    mata_pelajaran: {
      nama_mapel: string;
    };
    kelas: {
      nama_kelas: string;
    };
  };
}

const RiwayatAbsensiPage: React.FC<RiwayatAbsensiPageProps> = ({ userSession }) => {
  const [selectedMapel, setSelectedMapel] = useState('all');
  const [selectedKelas, setSelectedKelas] = useState('all');
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [riwayatAbsensi, setRiwayatAbsensi] = useState<RiwayatAbsensi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, [userSession]);

  useEffect(() => {
    loadRiwayatAbsensi();
  }, [selectedMapel, selectedKelas, userSession]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadMataPelajaranByGuru(),
        loadKelas()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadMataPelajaranByGuru = async () => {
    try {
      const { data, error } = await supabase
        .from('guru_mata_pelajaran')
        .select(`
          mata_pelajaran!inner(
            id_mapel,
            nama_mapel
          )
        `)
        .eq('id_guru', userSession.guru.id_guru);

      if (error) throw error;
      
      const mapelData = data?.map(item => item.mata_pelajaran).flat() || [];
      setMapelList(mapelData);
    } catch (error) {
      console.error('Error loading mata pelajaran:', error);
    }
  };

  const loadKelas = async () => {
    try {
      const { data, error } = await supabase
        .from('kelas')
        .select('id_kelas, nama_kelas')
        .order('nama_kelas');

      if (error) throw error;
      setKelasList(data || []);
    } catch (error) {
      console.error('Error loading kelas:', error);
    }
  };

  const loadRiwayatAbsensi = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('absensi')
        .select(`
          id_absensi,
          status,
          catatan,
          created_at,
          siswa!inner(
            id_siswa,
            nama_lengkap,
            nisn,
            jenis_kelamin,
            tanggal_lahir,
            tempat_lahir,
            alamat,
            nomor_telepon,
            nama_orang_tua,
            nomor_telepon_orang_tua,
            tahun_masuk,
            foto_url,
            kelas(nama_kelas),
            guru_wali:guru(nama_lengkap)
          ),
          jurnal_harian!inner(
            id_jurnal,
            tanggal_pelajaran,
            judul_materi,
            mata_pelajaran!inner(nama_mapel),
            kelas!inner(nama_kelas),
            id_guru
          )
        `)
        .eq('jurnal_harian.id_guru', userSession.guru.id_guru)
        .order('jurnal_harian.tanggal_pelajaran', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setRiwayatAbsensi(data || []);
    } catch (error) {
      console.error('Error loading riwayat absensi:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Riwayat Absensi</h1>
      
      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Mata Pelajaran</label>
              <Select value={selectedMapel} onValueChange={setSelectedMapel}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih mata pelajaran" />
                </SelectTrigger>
                <SelectContent>
                  {mapelList.length > 1 && (
                    <SelectItem value="all">Semua Mata Pelajaran</SelectItem>
                  )}
                  {mapelList.map((mapel) => (
                    <SelectItem key={mapel.id_mapel} value={mapel.id_mapel}>
                      {mapel.nama_mapel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Kelas</label>
              <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {kelasList.map((kelas) => (
                    <SelectItem key={kelas.id_kelas} value={kelas.id_kelas}>
                      {kelas.nama_kelas}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rekapitulasi Table */}
      <AbsensiOverviewTable 
        riwayatAbsensi={riwayatAbsensi}
        loading={loading}
        selectedMapel={selectedMapel}
        selectedKelas={selectedKelas}
        mapelList={mapelList}
        kelasList={kelasList}
      />
    </div>
  );
};

export default RiwayatAbsensiPage;
