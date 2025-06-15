import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, GraduationCap, Calendar, TrendingUp, Award, Plus, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import StudentForm from './admin/StudentForm';

interface WaliKelasPageProps {
  userSession: UserSession;
}

interface SiswaKelas {
  id_siswa: string;
  nisn: string;
  nama_lengkap: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  tanggal_lahir: string;
  tempat_lahir: string;
  alamat: string;
  nomor_telepon?: string;
  nomor_telepon_siswa?: string;
  nama_orang_tua: string;
  nomor_telepon_orang_tua?: string;
  id_kelas: string;
  id_guru_wali: string;
  tahun_masuk: number;
  foto_url?: string;
}

interface StatistikAbsensi {
  total_pertemuan: number;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
  persentase_kehadiran: number;
}

interface NilaiRataRata {
  id_siswa: string;
  rata_rata: number;
  jumlah_nilai: number;
}

const WaliKelasPage: React.FC<WaliKelasPageProps> = ({ userSession }) => {
  const [siswaKelas, setSiswaKelas] = useState<SiswaKelas[]>([]);
  const [statistikAbsensi, setStatistikAbsensi] = useState<Record<string, StatistikAbsensi>>({});
  const [nilaiRataRata, setNilaiRataRata] = useState<Record<string, NilaiRataRata>>({});
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<SiswaKelas | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nisn: '',
    nama_lengkap: '',
    jenis_kelamin: '',
    tanggal_lahir: '',
    tempat_lahir: '',
    alamat: '',
    nomor_telepon: '',
    nomor_telepon_siswa: '',
    nama_orang_tua: '',
    nomor_telepon_orang_tua: '',
    id_kelas: userSession.kelasWali?.id_kelas || '',
    id_guru_wali: userSession.guru.id_guru,
    tahun_masuk: new Date().getFullYear(),
    foto_url: ''
  });

  useEffect(() => {
    if (userSession.isWaliKelas && userSession.kelasWali) {
      loadDataKelas();
    }
  }, [userSession]);

  const loadDataKelas = async () => {
    if (!userSession.kelasWali) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadSiswaKelas(),
        loadStatistikAbsensi(),
        loadNilaiRataRata()
      ]);
    } catch (error) {
      console.error('Error loading data kelas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSiswaKelas = async () => {
    if (!userSession.kelasWali) return;

    try {
      const { data, error } = await supabase
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
          nomor_telepon_siswa,
          nama_orang_tua,
          nomor_telepon_orang_tua,
          id_kelas,
          id_guru_wali,
          tahun_masuk,
          foto_url
        `)
        .eq('id_kelas', userSession.kelasWali.id_kelas)
        .order('nama_lengkap');

      if (error) throw error;
      setSiswaKelas(data || []);
    } catch (error) {
      console.error('Error loading siswa kelas:', error);
    }
  };

  const loadStatistikAbsensi = async () => {
    if (!userSession.kelasWali) return;

    try {
      // Get absensi data for this class
      const { data: absensiData, error } = await supabase
        .from('absensi')
        .select(`
          id_siswa,
          status,
          jurnal_harian!inner(id_kelas)
        `)
        .eq('jurnal_harian.id_kelas', userSession.kelasWali.id_kelas);

      if (error) throw error;

      // Calculate statistics per student
      const stats: Record<string, StatistikAbsensi> = {};
      
      siswaKelas.forEach(siswa => {
        const siswaAbsensi = absensiData?.filter(a => a.id_siswa === siswa.id_siswa) || [];
        const total = siswaAbsensi.length;
        const hadir = siswaAbsensi.filter(a => a.status === 'Hadir').length;
        const izin = siswaAbsensi.filter(a => a.status === 'Izin').length;
        const sakit = siswaAbsensi.filter(a => a.status === 'Sakit').length;
        const alpha = siswaAbsensi.filter(a => a.status === 'Alpha').length;
        
        stats[siswa.id_siswa] = {
          total_pertemuan: total,
          hadir,
          izin,
          sakit,
          alpha,
          persentase_kehadiran: total > 0 ? Math.round((hadir / total) * 100) : 0
        };
      });

      setStatistikAbsensi(stats);
    } catch (error) {
      console.error('Error loading statistik absensi:', error);
    }
  };

  const loadNilaiRataRata = async () => {
    try {
      // Get nilai data for students in this class
      const { data: nilaiData, error } = await supabase
        .from('nilai')
        .select(`
          id_siswa,
          skor,
          siswa!inner(id_kelas)
        `)
        .eq('siswa.id_kelas', userSession.kelasWali?.id_kelas);

      if (error) throw error;

      // Calculate average scores per student
      const rataRata: Record<string, NilaiRataRata> = {};
      
      siswaKelas.forEach(siswa => {
        const siswaNilai = nilaiData?.filter(n => n.id_siswa === siswa.id_siswa) || [];
        const jumlahNilai = siswaNilai.length;
        const totalSkor = siswaNilai.reduce((sum, n) => sum + n.skor, 0);
        
        rataRata[siswa.id_siswa] = {
          id_siswa: siswa.id_siswa,
          rata_rata: jumlahNilai > 0 ? Math.round((totalSkor / jumlahNilai) * 100) / 100 : 0,
          jumlah_nilai: jumlahNilai
        };
      });

      setNilaiRataRata(rataRata);
    } catch (error) {
      console.error('Error loading nilai rata-rata:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSiswa) {
        // Update siswa
        const { error } = await supabase
          .from('siswa')
          .update(formData)
          .eq('id_siswa', editingSiswa.id_siswa);

        if (error) throw error;

        toast({
          title: "Sukses",
          description: "Data siswa berhasil diperbarui",
        });
      } else {
        // Create new siswa
        const { error } = await supabase
          .from('siswa')
          .insert(formData);

        if (error) throw error;

        toast({
          title: "Sukses",
          description: "Siswa baru berhasil ditambahkan",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadDataKelas();
    } catch (error) {
      console.error('Error saving siswa:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan data siswa",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (siswa: SiswaKelas) => {
    setEditingSiswa(siswa);
    setFormData({
      nisn: siswa.nisn,
      nama_lengkap: siswa.nama_lengkap,
      jenis_kelamin: siswa.jenis_kelamin,
      tanggal_lahir: siswa.tanggal_lahir,
      tempat_lahir: siswa.tempat_lahir,
      alamat: siswa.alamat,
      nomor_telepon: siswa.nomor_telepon || '',
      nomor_telepon_siswa: siswa.nomor_telepon_siswa || '',
      nama_orang_tua: siswa.nama_orang_tua,
      nomor_telepon_orang_tua: siswa.nomor_telepon_orang_tua || '',
      id_kelas: siswa.id_kelas,
      id_guru_wali: siswa.id_guru_wali,
      tahun_masuk: siswa.tahun_masuk,
      foto_url: siswa.foto_url || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id_siswa: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus siswa ini?')) return;

    try {
      const { error } = await supabase
        .from('siswa')
        .delete()
        .eq('id_siswa', id_siswa);

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Siswa berhasil dihapus",
      });
      
      loadDataKelas();
    } catch (error) {
      console.error('Error deleting siswa:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus siswa",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nisn: '',
      nama_lengkap: '',
      jenis_kelamin: '',
      tanggal_lahir: '',
      tempat_lahir: '',
      alamat: '',
      nomor_telepon: '',
      nomor_telepon_siswa: '',
      nama_orang_tua: '',
      nomor_telepon_orang_tua: '',
      id_kelas: userSession.kelasWali?.id_kelas || '',
      id_guru_wali: userSession.guru.id_guru,
      tahun_masuk: new Date().getFullYear(),
      foto_url: ''
    });
    setEditingSiswa(null);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getOverallStatistics = () => {
    const totalSiswa = siswaKelas.length;
    const siswaLakiLaki = siswaKelas.filter(s => s.jenis_kelamin === 'Laki-laki').length;
    const siswaPerempuan = siswaKelas.filter(s => s.jenis_kelamin === 'Perempuan').length;
    
    const kehadiranRataRata = Object.values(statistikAbsensi).length > 0 
      ? Math.round(Object.values(statistikAbsensi).reduce((sum, stat) => sum + stat.persentase_kehadiran, 0) / Object.values(statistikAbsensi).length)
      : 0;
    
    const nilaiRataRataKelas = Object.values(nilaiRataRata).length > 0
      ? Math.round(Object.values(nilaiRataRata).reduce((sum, nilai) => sum + nilai.rata_rata, 0) / Object.values(nilaiRataRata).length * 100) / 100
      : 0;

    return {
      totalSiswa,
      siswaLakiLaki,
      siswaPerempuan,
      kehadiranRataRata,
      nilaiRataRataKelas
    };
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

  const stats = getOverallStatistics();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Wali Kelas</h1>
          <p className="text-gray-600">Kelas {userSession.kelasWali?.nama_kelas}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            <Users className="w-4 h-4 mr-1" />
            {stats.totalSiswa} Siswa
          </Badge>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Siswa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSiswa ? 'Edit Siswa' : 'Tambah Siswa Baru'}
                </DialogTitle>
                <StudentForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleSubmit}
                  onCancel={() => setIsDialogOpen(false)}
                  isEditing={!!editingSiswa}
                  kelasList={userSession.kelasWali ? [userSession.kelasWali] : []}
                  guruList={[userSession.guru]}
                />
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{stats.totalSiswa}</div>
            <div className="text-sm text-gray-500">Total Siswa</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.siswaLakiLaki}</div>
            <div className="text-sm text-gray-500">Laki-laki</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">{stats.siswaPerempuan}</div>
            <div className="text-sm text-gray-500">Perempuan</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold">{stats.kehadiranRataRata}%</div>
            <div className="text-sm text-gray-500">Kehadiran</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold">{stats.nilaiRataRataKelas}</div>
            <div className="text-sm text-gray-500">Rata-rata Nilai</div>
          </CardContent>
        </Card>
      </div>

      {/* Student Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performa Siswa Kelas {userSession.kelasWali?.nama_kelas}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Siswa</TableHead>
                  <TableHead>NISN</TableHead>
                  <TableHead>Jenis Kelamin</TableHead>
                  <TableHead>Kehadiran</TableHead>
                  <TableHead>Rata-rata Nilai</TableHead>
                  <TableHead>Orang Tua</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {siswaKelas.map((siswa) => {
                  const absensiStats = statistikAbsensi[siswa.id_siswa] || {
                    total_pertemuan: 0,
                    hadir: 0,
                    izin: 0,
                    sakit: 0,
                    alpha: 0,
                    persentase_kehadiran: 0
                  };
                  const nilaiStats = nilaiRataRata[siswa.id_siswa] || {
                    id_siswa: siswa.id_siswa,
                    rata_rata: 0,
                    jumlah_nilai: 0
                  };

                  return (
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
                            {siswa.nomor_telepon_siswa && (
                              <div className="text-sm text-gray-500">{siswa.nomor_telepon_siswa}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{siswa.nisn}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={siswa.jenis_kelamin === 'Laki-laki' ? 'default' : 'secondary'}>
                          {siswa.jenis_kelamin}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{absensiStats.persentase_kehadiran}%</span>
                            <span className="text-gray-500">
                              {absensiStats.hadir}/{absensiStats.total_pertemuan}
                            </span>
                          </div>
                          <Progress value={absensiStats.persentase_kehadiran} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="text-lg font-semibold">
                            {nilaiStats.rata_rata > 0 ? nilaiStats.rata_rata : '-'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {nilaiStats.jumlah_nilai} nilai
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{siswa.nama_orang_tua}</div>
                          {siswa.nomor_telepon_orang_tua && (
                            <div className="text-sm text-gray-500">{siswa.nomor_telepon_orang_tua}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(siswa)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(siswa.id_siswa)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          
          {!loading && siswaKelas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data siswa di kelas ini
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WaliKelasPage;
