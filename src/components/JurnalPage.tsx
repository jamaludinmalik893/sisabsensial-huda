
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, BookOpen, Clock, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JurnalPageProps {
  userSession: UserSession;
}

interface JurnalEntry {
  id_jurnal: string;
  tanggal_pelajaran: string;
  waktu_mulai: string;
  waktu_selesai: string;
  judul_materi: string;
  materi_diajarkan: string;
  mata_pelajaran: {
    nama_mapel: string;
  };
  kelas: {
    nama_kelas: string;
  };
}

interface Kelas {
  id_kelas: string;
  nama_kelas: string;
}

interface MataPelajaran {
  id_mapel: string;
  nama_mapel: string;
}

const JurnalPage: React.FC<JurnalPageProps> = ({ userSession }) => {
  const [jurnalList, setJurnalList] = useState<JurnalEntry[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    id_kelas: '',
    id_mapel: '',
    tanggal_pelajaran: new Date().toISOString().split('T')[0],
    waktu_mulai: '',
    waktu_selesai: '',
    judul_materi: '',
    materi_diajarkan: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, [userSession]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadJurnal(),
        loadKelas(),
        loadMataPelajaran()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJurnal = async () => {
    try {
      const { data, error } = await supabase
        .from('jurnal_harian')
        .select(`
          id_jurnal,
          tanggal_pelajaran,
          waktu_mulai,
          waktu_selesai,
          judul_materi,
          materi_diajarkan,
          mata_pelajaran!inner(nama_mapel),
          kelas!inner(nama_kelas)
        `)
        .eq('id_guru', userSession.guru.id_guru)
        .order('tanggal_pelajaran', { ascending: false });

      if (error) throw error;
      setJurnalList(data || []);
    } catch (error) {
      console.error('Error loading jurnal:', error);
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
    
    if (!formData.id_kelas || !formData.id_mapel || !formData.judul_materi || !formData.materi_diajarkan) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('jurnal_harian')
        .insert({
          id_guru: userSession.guru.id_guru,
          id_kelas: formData.id_kelas,
          id_mapel: formData.id_mapel,
          tanggal_pelajaran: formData.tanggal_pelajaran,
          waktu_mulai: formData.waktu_mulai,
          waktu_selesai: formData.waktu_selesai,
          judul_materi: formData.judul_materi,
          materi_diajarkan: formData.materi_diajarkan
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Jurnal pembelajaran berhasil ditambahkan"
      });

      setIsDialogOpen(false);
      setFormData({
        id_kelas: '',
        id_mapel: '',
        tanggal_pelajaran: new Date().toISOString().split('T')[0],
        waktu_mulai: '',
        waktu_selesai: '',
        judul_materi: '',
        materi_diajarkan: ''
      });
      loadJurnal();
    } catch (error) {
      console.error('Error saving jurnal:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan jurnal pembelajaran",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jurnal Pembelajaran</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Jurnal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Tambah Jurnal Pembelajaran</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Kelas *</label>
                  <Select value={formData.id_kelas} onValueChange={(value) => setFormData({...formData, id_kelas: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {kelasList.map((kelas) => (
                        <SelectItem key={kelas.id_kelas} value={kelas.id_kelas}>
                          {kelas.nama_kelas}
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
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Tanggal *</label>
                  <Input
                    type="date"
                    value={formData.tanggal_pelajaran}
                    onChange={(e) => setFormData({...formData, tanggal_pelajaran: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Waktu Mulai *</label>
                  <Input
                    type="time"
                    value={formData.waktu_mulai}
                    onChange={(e) => setFormData({...formData, waktu_mulai: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Waktu Selesai *</label>
                  <Input
                    type="time"
                    value={formData.waktu_selesai}
                    onChange={(e) => setFormData({...formData, waktu_selesai: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Judul Materi *</label>
                <Input
                  value={formData.judul_materi}
                  onChange={(e) => setFormData({...formData, judul_materi: e.target.value})}
                  placeholder="Masukkan judul materi"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Materi yang Diajarkan *</label>
                <Textarea
                  value={formData.materi_diajarkan}
                  onChange={(e) => setFormData({...formData, materi_diajarkan: e.target.value})}
                  placeholder="Jelaskan materi yang diajarkan"
                  rows={4}
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
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{jurnalList.length}</div>
                <div className="text-sm text-gray-500">Total Jurnal</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {jurnalList.filter(j => j.tanggal_pelajaran === new Date().toISOString().split('T')[0]).length}
                </div>
                <div className="text-sm text-gray-500">Hari Ini</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {jurnalList.filter(j => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(j.tanggal_pelajaran) >= weekAgo;
                  }).length}
                </div>
                <div className="text-sm text-gray-500">Minggu Ini</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Jurnal Pembelajaran</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Mata Pelajaran</TableHead>
                  <TableHead>Judul Materi</TableHead>
                  <TableHead>Materi Diajarkan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jurnalList.map((jurnal) => (
                  <TableRow key={jurnal.id_jurnal}>
                    <TableCell>
                      {new Date(jurnal.tanggal_pelajaran).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {jurnal.waktu_mulai} - {jurnal.waktu_selesai}
                      </Badge>
                    </TableCell>
                    <TableCell>{jurnal.kelas.nama_kelas}</TableCell>
                    <TableCell>{jurnal.mata_pelajaran.nama_mapel}</TableCell>
                    <TableCell className="font-medium">{jurnal.judul_materi}</TableCell>
                    <TableCell className="max-w-xs truncate">{jurnal.materi_diajarkan}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!loading && jurnalList.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Belum ada jurnal pembelajaran
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JurnalPage;
