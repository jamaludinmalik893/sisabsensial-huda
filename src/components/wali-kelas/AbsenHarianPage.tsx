
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, BookOpen, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AbsenHarianPageProps {
  userSession: UserSession;
}

interface SiswaAbsensi {
  id_siswa: string;
  nama_lengkap: string;
  nisn: string;
  status_absensi: Record<string, 'Hadir' | 'Izin' | 'Sakit' | 'Alpha' | null>;
}

interface JurnalHari {
  id_jurnal: string;
  mata_pelajaran: string;
  nama_guru: string;
  waktu_mulai: string;
  waktu_selesai: string;
  judul_materi: string;
  jam_diklat: number;
}

const AbsenHarianPage: React.FC<AbsenHarianPageProps> = ({ userSession }) => {
  const [tanggalPilihan, setTanggalPilihan] = useState(new Date().toISOString().split('T')[0]);
  const [siswaAbsensi, setSiswaAbsensi] = useState<SiswaAbsensi[]>([]);
  const [jurnalHari, setJurnalHari] = useState<JurnalHari[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userSession.isWaliKelas && userSession.kelasWali) {
      loadDataAbsensi();
    }
  }, [tanggalPilihan, userSession]);

  const loadDataAbsensi = async () => {
    if (!userSession.kelasWali) return;
    
    setLoading(true);
    try {
      // Load siswa kelas
      const { data: siswaData, error: siswaError } = await supabase
        .from('siswa')
        .select('id_siswa, nama_lengkap, nisn')
        .eq('id_kelas', userSession.kelasWali.id_kelas)
        .order('nama_lengkap');

      if (siswaError) throw siswaError;

      // Load jurnal harian untuk tanggal yang dipilih
      const { data: jurnalData, error: jurnalError } = await supabase
        .from('jurnal_harian')
        .select(`
          id_jurnal,
          waktu_mulai,
          waktu_selesai,
          judul_materi,
          mata_pelajaran!inner(nama_mapel),
          guru!inner(nama_lengkap)
        `)
        .eq('id_kelas', userSession.kelasWali.id_kelas)
        .eq('tanggal_pelajaran', tanggalPilihan)
        .order('waktu_mulai');

      if (jurnalError) throw jurnalError;

      // Load absensi untuk tanggal yang dipilih
      const jurnalIds = jurnalData?.map(j => j.id_jurnal) || [];
      let absensiData = [];
      
      if (jurnalIds.length > 0) {
        const { data, error: absensiError } = await supabase
          .from('absensi')
          .select('id_siswa, id_jurnal, status')
          .in('id_jurnal', jurnalIds);

        if (absensiError) throw absensiError;
        absensiData = data || [];
      }

      // Process data
      const processedSiswa = (siswaData || []).map(siswa => {
        const statusAbsensi: Record<string, 'Hadir' | 'Izin' | 'Sakit' | 'Alpha' | null> = {};
        
        jurnalIds.forEach((jurnalId, index) => {
          const absen = absensiData.find(a => a.id_siswa === siswa.id_siswa && a.id_jurnal === jurnalId);
          statusAbsensi[`jam_${index + 1}`] = absen ? absen.status as any : null;
        });

        return {
          ...siswa,
          status_absensi: statusAbsensi
        };
      });

      const processedJurnal = (jurnalData || []).map((jurnal, index) => ({
        id_jurnal: jurnal.id_jurnal,
        mata_pelajaran: (jurnal.mata_pelajaran as any)?.nama_mapel || '',
        nama_guru: (jurnal.guru as any)?.nama_lengkap || '',
        waktu_mulai: jurnal.waktu_mulai,
        waktu_selesai: jurnal.waktu_selesai,
        judul_materi: jurnal.judul_materi,
        jam_diklat: index + 1
      }));

      setSiswaAbsensi(processedSiswa);
      setJurnalHari(processedJurnal);
    } catch (error) {
      console.error('Error loading data absensi:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data absensi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <span className="text-gray-400">-</span>;
    
    const variants = {
      'Hadir': 'bg-green-500',
      'Izin': 'bg-yellow-500', 
      'Sakit': 'bg-blue-500',
      'Alpha': 'bg-red-500'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-500'}>
        {status}
      </Badge>
    );
  };

  const countStatus = (status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha') => {
    return siswaAbsensi.reduce((count, siswa) => {
      return count + Object.values(siswa.status_absensi).filter(s => s === status).length;
    }, 0);
  };

  if (!userSession.isWaliKelas) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Anda bukan wali kelas dari kelas manapun.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Presensi Harian</h1>
          <p className="text-gray-600">Kelas {userSession.kelasWali?.nama_kelas}</p>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <Label htmlFor="tanggal">Tanggal</Label>
            <Input
              id="tanggal"
              type="date"
              value={tanggalPilihan}
              onChange={(e) => setTanggalPilihan(e.target.value)}
              className="w-40"
            />
          </div>
          <Button onClick={loadDataAbsensi} disabled={loading}>
            {loading ? 'Memuat...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Header Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{countStatus('Hadir')}</div>
            <div className="text-sm text-gray-500">Hadir</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{countStatus('Izin')}</div>
            <div className="text-sm text-gray-500">Izin</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{countStatus('Sakit')}</div>
            <div className="text-sm text-gray-500">Sakit</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{countStatus('Alpha')}</div>
            <div className="text-sm text-gray-500">Alpha</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Presensi */}
      <Card>
        <CardHeader>
          <CardTitle>Presensi Harian Bulan {new Date(tanggalPilihan).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No.</TableHead>
                    <TableHead>Nama</TableHead>
                    {jurnalHari.map((_, index) => (
                      <TableHead key={index} className="text-center min-w-20">
                        Jam Diklat Ke {index + 1}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {siswaAbsensi.map((siswa, index) => (
                    <TableRow key={siswa.id_siswa}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{siswa.nama_lengkap}</div>
                          <div className="text-sm text-gray-500">{siswa.nisn}</div>
                        </div>
                      </TableCell>
                      {jurnalHari.map((_, jamIndex) => (
                        <TableCell key={jamIndex} className="text-center">
                          {getStatusBadge(siswa.status_absensi[`jam_${jamIndex + 1}`])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {!loading && siswaAbsensi.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data siswa untuk tanggal ini
            </div>
          )}
        </CardContent>
      </Card>

      {/* Jurnal Mengajar */}
      <Card>
        <CardHeader>
          <CardTitle>Jurnal Mengajar Tanggal {new Date(tanggalPilihan).toLocaleDateString('id-ID')}</CardTitle>
        </CardHeader>
        <CardContent>
          {jurnalHari.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Program Diklat</TableHead>
                    <TableHead>Nama Guru dan Toolman</TableHead>
                    <TableHead>Pokok Pembahasan</TableHead>
                    <TableHead>Paraf</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jurnalHari.map((jurnal) => (
                    <TableRow key={jurnal.id_jurnal}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{jurnal.mata_pelajaran}</div>
                          <div className="text-sm text-gray-500">
                            <Clock className="inline h-3 w-3 mr-1" />
                            {jurnal.waktu_mulai} - {jurnal.waktu_selesai}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {jurnal.nama_guru}
                        </div>
                      </TableCell>
                      <TableCell>{jurnal.judul_materi}</TableCell>
                      <TableCell>
                        <div className="w-16 h-8 border border-gray-300 rounded"></div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Tidak ada jurnal untuk tanggal ini
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AbsenHarianPage;
