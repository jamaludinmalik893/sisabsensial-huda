
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Filter, FileText } from 'lucide-react';

interface RiwayatAbsensiPageProps {
  userSession: UserSession;
}

interface RiwayatAbsensi {
  id_absensi: string;
  status: string;
  catatan?: string;
  created_at: string;
  siswa: {
    nama_lengkap: string;
    nisn: string;
  };
  jurnal_harian: {
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
  const [riwayatAbsensi, setRiwayatAbsensi] = useState<RiwayatAbsensi[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [kelasList, setKelasList] = useState<any[]>([]);

  useEffect(() => {
    loadKelasList();
    loadRiwayatAbsensi();
  }, [userSession]);

  useEffect(() => {
    loadRiwayatAbsensi();
  }, [filterKelas, filterStatus]);

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
          siswa!inner(nama_lengkap, nisn),
          jurnal_harian!inner(
            tanggal_pelajaran,
            judul_materi,
            id_guru,
            mata_pelajaran!inner(nama_mapel),
            kelas!inner(nama_kelas, id_kelas)
          )
        `)
        .eq('jurnal_harian.id_guru', userSession.guru.id_guru);

      if (filterKelas !== 'all') {
        query = query.eq('jurnal_harian.kelas.id_kelas', filterKelas);
      }

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setRiwayatAbsensi(data || []);
    } catch (error) {
      console.error('Error loading riwayat absensi:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hadir': return 'bg-green-100 text-green-800';
      case 'Izin': return 'bg-yellow-100 text-yellow-800';
      case 'Sakit': return 'bg-blue-100 text-blue-800';
      case 'Alpha': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Kelas</label>
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
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
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
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data Absensi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Siswa</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Mata Pelajaran</TableHead>
                  <TableHead>Materi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riwayatAbsensi.map((absensi) => (
                  <TableRow key={absensi.id_absensi}>
                    <TableCell>
                      {new Date(absensi.jurnal_harian.tanggal_pelajaran).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{absensi.siswa.nama_lengkap}</div>
                        <div className="text-sm text-gray-500">{absensi.siswa.nisn}</div>
                      </div>
                    </TableCell>
                    <TableCell>{absensi.jurnal_harian.kelas.nama_kelas}</TableCell>
                    <TableCell>{absensi.jurnal_harian.mata_pelajaran.nama_mapel}</TableCell>
                    <TableCell className="max-w-xs truncate">{absensi.jurnal_harian.judul_materi}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(absensi.status)}>
                        {absensi.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{absensi.catatan || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!loading && riwayatAbsensi.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data absensi ditemukan
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RiwayatAbsensiPage;
