
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Users, GraduationCap, Filter } from 'lucide-react';

interface ProfilSiswaPageProps {
  userSession: UserSession;
}

interface Siswa {
  id_siswa: string;
  nisn: string;
  nama_lengkap: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  tempat_lahir: string;
  alamat: string;
  nomor_telepon?: string;
  nama_orang_tua: string;
  nomor_telepon_orang_tua?: string;
  tahun_masuk: number;
  kelas: {
    nama_kelas: string;
  };
  guru_wali: {
    nama_lengkap: string;
  };
}

interface Kelas {
  id_kelas: string;
  nama_kelas: string;
}

const ProfilSiswaPage: React.FC<ProfilSiswaPageProps> = ({ userSession }) => {
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState<string>('all');

  useEffect(() => {
    loadInitialData();
  }, [userSession]);

  useEffect(() => {
    loadSiswa();
  }, [filterKelas, searchTerm]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSiswa(),
        loadKelas()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSiswa = async () => {
    try {
      let query = supabase
        .from('siswa')
        .select(`
          id_siswa,
          nisn,
          nama_lengkap,
          jenis_kelamin,
          tanggal_lahir,
          tempat_lahir,
          alamat,
          nomor_telepon,
          nama_orang_tua,
          nomor_telepon_orang_tua,
          tahun_masuk,
          kelas!inner(nama_kelas),
          guru_wali:guru!inner(nama_lengkap)
        `);

      if (filterKelas !== 'all') {
        query = query.eq('id_kelas', filterKelas);
      }

      if (searchTerm) {
        query = query.or(`nama_lengkap.ilike.%${searchTerm}%,nisn.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('nama_lengkap');

      if (error) throw error;
      setSiswaList(data || []);
    } catch (error) {
      console.error('Error loading siswa:', error);
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getStatistics = () => {
    return {
      total: siswaList.length,
      lakiLaki: siswaList.filter(s => s.jenis_kelamin === 'Laki-laki').length,
      perempuan: siswaList.filter(s => s.jenis_kelamin === 'Perempuan').length,
      tahunIni: siswaList.filter(s => s.tahun_masuk === new Date().getFullYear()).length
    };
  };

  const stats = getStatistics();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profil Siswa</h1>
        <Badge variant="outline" className="text-sm">
          <Users className="w-4 h-4 mr-1" />
          {stats.total} Siswa
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Siswa</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.lakiLaki}</div>
            <div className="text-sm text-gray-500">Laki-laki</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">{stats.perempuan}</div>
            <div className="text-sm text-gray-500">Perempuan</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.tahunIni}</div>
            <div className="text-sm text-gray-500">Siswa Baru</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Cari Siswa</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari nama atau NISN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Filter Kelas</label>
              <Select value={filterKelas} onValueChange={setFilterKelas}>
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
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profil</TableHead>
                  <TableHead>NISN</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Jenis Kelamin</TableHead>
                  <TableHead>Umur</TableHead>
                  <TableHead>Tempat Lahir</TableHead>
                  <TableHead>Orang Tua</TableHead>
                  <TableHead>Wali Kelas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {siswaList.map((siswa) => (
                  <TableRow key={siswa.id_siswa}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getInitials(siswa.nama_lengkap)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{siswa.nama_lengkap}</div>
                          <div className="text-sm text-gray-500">{siswa.alamat}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{siswa.nisn}</Badge>
                    </TableCell>
                    <TableCell>{siswa.kelas.nama_kelas}</TableCell>
                    <TableCell>
                      <Badge variant={siswa.jenis_kelamin === 'Laki-laki' ? 'default' : 'secondary'}>
                        {siswa.jenis_kelamin}
                      </Badge>
                    </TableCell>
                    <TableCell>{calculateAge(siswa.tanggal_lahir)} tahun</TableCell>
                    <TableCell>{siswa.tempat_lahir}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{siswa.nama_orang_tua}</div>
                        {siswa.nomor_telepon_orang_tua && (
                          <div className="text-sm text-gray-500">{siswa.nomor_telepon_orang_tua}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{siswa.guru_wali.nama_lengkap}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!loading && siswaList.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data siswa ditemukan
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilSiswaPage;
