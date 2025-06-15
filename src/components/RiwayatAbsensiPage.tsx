
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Filter, FileText, Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import AbsensiOverviewTable from './absensi/AbsensiOverviewTable';

interface RiwayatAbsensiPageProps {
  userSession: UserSession;
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

interface Siswa {
  id_siswa: string;
  nama_lengkap: string;
  nisn: string;
}

interface FilterState {
  kelas: string;
  status: string;
  mapel: string;
  siswa: string;
  tanggalMulai: string;
  tanggalAkhir: string;
  searchJudul: string;
}

const RiwayatAbsensiPage: React.FC<RiwayatAbsensiPageProps> = ({ userSession }) => {
  const [riwayatAbsensi, setRiwayatAbsensi] = useState<RiwayatAbsensi[]>([]);
  const [loading, setLoading] = useState(true);
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [mapelList, setMapelList] = useState<any[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  
  const [filters, setFilters] = useState<FilterState>({
    kelas: 'all',
    status: 'all',
    mapel: 'all',
    siswa: 'all',
    tanggalMulai: '',
    tanggalAkhir: '',
    searchJudul: ''
  });

  useEffect(() => {
    loadInitialData();
  }, [userSession]);

  useEffect(() => {
    loadRiwayatAbsensi();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadKelasList(),
        loadMapelList(),
        loadSiswaList()
      ]);
      loadRiwayatAbsensi();
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadKelasList = async () => {
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

  const loadMapelList = async () => {
    try {
      // Hanya load mata pelajaran yang diampu oleh guru ini
      const { data, error } = await supabase
        .from('mata_pelajaran')
        .select(`
          id_mapel, 
          nama_mapel,
          guru_mata_pelajaran!inner(id_guru)
        `)
        .eq('guru_mata_pelajaran.id_guru', userSession.guru.id_guru)
        .order('nama_mapel');

      if (error) throw error;
      setMapelList(data || []);
    } catch (error) {
      console.error('Error loading mata pelajaran:', error);
    }
  };

  const loadSiswaList = async () => {
    try {
      const { data, error } = await supabase
        .from('siswa')
        .select('id_siswa, nama_lengkap, nisn')
        .order('nama_lengkap');

      if (error) throw error;
      setSiswaList(data || []);
    } catch (error) {
      console.error('Error loading siswa:', error);
    }
  };

  const loadRiwayatAbsensi = async () => {
    setLoading(true);
    try {
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
            id_guru,
            mata_pelajaran!inner(
              nama_mapel, 
              id_mapel,
              guru_mata_pelajaran!inner(id_guru)
            ),
            kelas!inner(nama_kelas, id_kelas)
          )
        `)
        .eq('jurnal_harian.mata_pelajaran.guru_mata_pelajaran.id_guru', userSession.guru.id_guru);

      // Apply filters
      if (filters.kelas !== 'all') {
        query = query.eq('jurnal_harian.kelas.id_kelas', filters.kelas);
      }

      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.mapel !== 'all') {
        query = query.eq('jurnal_harian.mata_pelajaran.id_mapel', filters.mapel);
      }

      if (filters.siswa !== 'all') {
        query = query.eq('siswa.id_siswa', filters.siswa);
      }

      if (filters.tanggalMulai) {
        query = query.gte('jurnal_harian.tanggal_pelajaran', filters.tanggalMulai);
      }

      if (filters.tanggalAkhir) {
        query = query.lte('jurnal_harian.tanggal_pelajaran', filters.tanggalAkhir);
      }

      if (filters.searchJudul) {
        query = query.ilike('jurnal_harian.judul_materi', `%${filters.searchJudul}%`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      setRiwayatAbsensi(data || []);
    } catch (error) {
      console.error('Error loading riwayat absensi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      kelas: 'all',
      status: 'all',
      mapel: 'all',
      siswa: 'all',
      tanggalMulai: '',
      tanggalAkhir: '',
      searchJudul: ''
    });
  };

  const getStatusStats = () => {
    const stats = {
      total: riwayatAbsensi.length,
      hadir: riwayatAbsensi.filter(r => r.status === 'Hadir').length,
      izin: riwayatAbsensi.filter(r => r.status === 'Izin').length,
      sakit: riwayatAbsensi.filter(r => r.status === 'Sakit').length,
      alpha: riwayatAbsensi.filter(r => r.status === 'Alpha').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Riwayat Absensi</h1>
        <Badge variant="outline" className="text-sm">
          <FileText className="w-4 h-4 mr-1" />
          {stats.total} Record
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.hadir}</div>
            <div className="text-sm text-gray-500">Hadir</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.izin}</div>
            <div className="text-sm text-gray-500">Izin</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.sakit}</div>
            <div className="text-sm text-gray-500">Sakit</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.alpha}</div>
            <div className="text-sm text-gray-500">Alpha</div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Data Absensi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Kelas</Label>
              <Select value={filters.kelas} onValueChange={(value) => handleFilterChange('kelas', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kelas" />
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

            <div>
              <Label className="text-sm font-medium mb-2 block">Mata Pelajaran</Label>
              <Select value={filters.mapel} onValueChange={(value) => handleFilterChange('mapel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Mata Pelajaran" />
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
              <Label className="text-sm font-medium mb-2 block">Siswa</Label>
              <Select value={filters.siswa} onValueChange={(value) => handleFilterChange('siswa', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Siswa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Siswa</SelectItem>
                  {siswaList.map((siswa) => (
                    <SelectItem key={siswa.id_siswa} value={siswa.id_siswa}>
                      {siswa.nama_lengkap} - {siswa.nisn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Status Kehadiran</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="Hadir">Hadir</SelectItem>
                  <SelectItem value="Izin">Izin</SelectItem>
                  <SelectItem value="Sakit">Sakit</SelectItem>
                  <SelectItem value="Alpha">Alpha</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Tanggal Mulai</Label>
              <Input
                type="date"
                value={filters.tanggalMulai}
                onChange={(e) => handleFilterChange('tanggalMulai', e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Tanggal Akhir</Label>
              <Input
                type="date"
                value={filters.tanggalAkhir}
                onChange={(e) => handleFilterChange('tanggalAkhir', e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-sm font-medium mb-2 block">Cari Judul Materi</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Masukkan judul materi..."
                  value={filters.searchJudul}
                  onChange={(e) => handleFilterChange('searchJudul', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rekapitulasi Absensi Table */}
      <AbsensiOverviewTable 
        riwayatAbsensi={riwayatAbsensi}
        loading={loading}
        selectedMapel={filters.mapel}
        selectedKelas={filters.kelas}
        mapelList={mapelList}
        kelasList={kelasList}
      />
    </div>
  );
};

export default RiwayatAbsensiPage;
