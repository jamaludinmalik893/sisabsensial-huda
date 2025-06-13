
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, GraduationCap, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NilaiPageProps {
  userSession: UserSession;
}

interface Nilai {
  id_nilai: string;
  jenis_nilai: string;
  skor: number;
  tanggal_nilai: string;
  catatan?: string;
  siswa: {
    nama_lengkap: string;
    nisn: string;
  };
  mata_pelajaran: {
    nama_mapel: string;
  };
}

interface Siswa {
  id_siswa: string;
  nama_lengkap: string;
  nisn: string;
}

interface MataPelajaran {
  id_mapel: string;
  nama_mapel: string;
}

const NilaiPage: React.FC<NilaiPageProps> = ({ userSession }) => {
  const [nilaiList, setNilaiList] = useState<Nilai[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    id_siswa: '',
    id_mapel: '',
    jenis_nilai: '',
    skor: '',
    catatan: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, [userSession]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadNilai(),
        loadSiswa(),
        loadMataPelajaran()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNilai = async () => {
    try {
      const { data, error } = await supabase
        .from('nilai')
        .select(`
          id_nilai,
          jenis_nilai,
          skor,
          tanggal_nilai,
          catatan,
          siswa:siswa(nama_lengkap, nisn),
          mata_pelajaran:mata_pelajaran(nama_mapel)
        `)
        .order('tanggal_nilai', { ascending: false });

      if (error) throw error;
      setNilaiList(data || []);
    } catch (error) {
      console.error('Error loading nilai:', error);
    }
  };

  const loadSiswa = async () => {
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

  const loadMataPelajaran = async () => {
    try {
      const { data, error } = await supabase
        .from('mata_pelajaran')
        .select('id_mapel, nama_mapel')
        .order('nama_mapel');

      if (error) throw error;
      setMapelList(data || []);
    } catch (error) {
      console.error('Error loading mata pelajaran:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id_siswa || !formData.id_mapel || !formData.jenis_nilai || !formData.skor) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('nilai')
        .insert({
          id_siswa: formData.id_siswa,
          id_mapel: formData.id_mapel,
          id_jurnal: '00000000-0000-0000-0000-000000000000', // Temporary, should be from actual jurnal
          jenis_nilai: formData.jenis_nilai,
          skor: parseFloat(formData.skor),
          tanggal_nilai: new Date().toISOString().split('T')[0],
          catatan: formData.catatan || null
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Nilai berhasil ditambahkan"
      });

      setIsDialogOpen(false);
      setFormData({
        id_siswa: '',
        id_mapel: '',
        jenis_nilai: '',
        skor: '',
        catatan: ''
      });
      loadNilai();
    } catch (error) {
      console.error('Error saving nilai:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan nilai",
        variant: "destructive"
      });
    }
  };

  const getScoreColor = (skor: number) => {
    if (skor >= 85) return 'bg-green-100 text-green-800';
    if (skor >= 75) return 'bg-blue-100 text-blue-800';
    if (skor >= 65) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getAverageScore = () => {
    if (nilaiList.length === 0) return 0;
    const total = nilaiList.reduce((sum, nilai) => sum + nilai.skor, 0);
    return (total / nilaiList.length).toFixed(1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manajemen Nilai</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Nilai
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Nilai Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Siswa *</label>
                <Select value={formData.id_siswa} onValueChange={(value) => setFormData({...formData, id_siswa: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih siswa" />
                  </SelectTrigger>
                  <SelectContent>
                    {siswaList.map((siswa) => (
                      <SelectItem key={siswa.id_siswa} value={siswa.id_siswa}>
                        {siswa.nama_lengkap} ({siswa.nisn})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Mata Pelajaran *</label>
                <Select value={formData.id_mapel} onValueChange={(value) => setFormData({...formData, id_mapel: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mata pelajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {mapelList.map((mapel) => (
                      <SelectItem key={mapel.id_mapel} value={mapel.id_mapel}>
                        {mapel.nama_mapel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Jenis Nilai *</label>
                <Select value={formData.jenis_nilai} onValueChange={(value) => setFormData({...formData, jenis_nilai: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis nilai" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tugas Harian">Tugas Harian</SelectItem>
                    <SelectItem value="Quiz">Quiz</SelectItem>
                    <SelectItem value="UTS">UTS</SelectItem>
                    <SelectItem value="UAS">UAS</SelectItem>
                    <SelectItem value="Praktikum">Praktikum</SelectItem>
                    <SelectItem value="Proyek">Proyek</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Skor (0-100) *</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.skor}
                  onChange={(e) => setFormData({...formData, skor: e.target.value})}
                  placeholder="Masukkan skor"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Catatan</label>
                <Input
                  value={formData.catatan}
                  onChange={(e) => setFormData({...formData, catatan: e.target.value})}
                  placeholder="Catatan tambahan (opsional)"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  Simpan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{nilaiList.length}</div>
                <div className="text-sm text-gray-500">Total Nilai</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{getAverageScore()}</div>
                <div className="text-sm text-gray-500">Rata-rata</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Badge className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {nilaiList.filter(n => n.skor >= 75).length}
                </div>
                <div className="text-sm text-gray-500">Nilai ≥ 75</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Nilai</CardTitle>
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
                  <TableHead>Mata Pelajaran</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Skor</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nilaiList.map((nilai) => (
                  <TableRow key={nilai.id_nilai}>
                    <TableCell>
                      {new Date(nilai.tanggal_nilai).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{nilai.siswa.nama_lengkap}</div>
                        <div className="text-sm text-gray-500">{nilai.siswa.nisn}</div>
                      </div>
                    </TableCell>
                    <TableCell>{nilai.mata_pelajaran.nama_mapel}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{nilai.jenis_nilai}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getScoreColor(nilai.skor)}>
                        {nilai.skor}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {nilai.catatan || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!loading && nilaiList.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Belum ada data nilai
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NilaiPage;
