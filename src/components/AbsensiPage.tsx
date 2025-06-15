import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import AbsensiList from './absensi/AbsensiList';

interface AbsensiPageProps {
  userSession: UserSession;
}

interface Siswa {
  id_siswa: string;
  nama_lengkap: string;
  nisn: string;
  foto_url?: string;
}

interface AbsensiData {
  id_siswa: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha';
  catatan?: string;
}

interface Kelas {
  id_kelas: string;
  nama_kelas: string;
}

interface MataPelajaran {
  id_mapel: string;
  nama_mapel: string;
}

const AbsensiPage: React.FC<AbsensiPageProps> = ({ userSession }) => {
  const [selectedKelas, setSelectedKelas] = useState<string>('');
  const [selectedMapel, setSelectedMapel] = useState<string>('');
  const [judulMateri, setJudulMateri] = useState<string>('');
  const [materiDiajarkan, setMateriDiajarkan] = useState<string>('');
  const [waktuMulai, setWaktuMulai] = useState<string>('');
  const [waktuSelesai, setWaktuSelesai] = useState<string>('');
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [absensiData, setAbsensiData] = useState<AbsensiData[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadInitialData();
  }, [userSession]);

  useEffect(() => {
    if (selectedKelas) {
      loadSiswaByKelas();
    }
  }, [selectedKelas]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadKelas(),
        loadMataPelajaranByGuru()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
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

  const loadSiswaByKelas = async () => {
    try {
      console.log('Loading siswa for kelas:', selectedKelas);

      const { data, error } = await supabase
        .from('siswa')
        .select('id_siswa, nama_lengkap, nisn, foto_url')
        .eq('id_kelas', selectedKelas)
        .order('nama_lengkap');

      if (error) {
        console.error('Error loading siswa:', error);
        throw error;
      }

      console.log('Siswa data loaded:', data);
      setSiswaList(data || []);
      
      // Initialize absensi data
      const initialAbsensi = (data || []).map(siswa => ({
        id_siswa: siswa.id_siswa,
        status: 'Hadir' as const,
        catatan: ''
      }));
      setAbsensiData(initialAbsensi);
    } catch (error) {
      console.error('Error loading siswa:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data siswa",
        variant: "destructive"
      });
    }
  };

  const updateAbsensiStatus = (id_siswa: string, status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha') => {
    setAbsensiData(prev => 
      prev.map(item => 
        item.id_siswa === id_siswa ? { ...item, status } : item
      )
    );
  };

  const updateAbsensiCatatan = (id_siswa: string, catatan: string) => {
    setAbsensiData(prev => 
      prev.map(item => 
        item.id_siswa === id_siswa ? { ...item, catatan } : item
      )
    );
  };

  const saveAbsensi = async () => {
    if (!selectedKelas || !selectedMapel || !judulMateri || !materiDiajarkan || !waktuMulai || !waktuSelesai) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // First create jurnal
      const { data: jurnalData, error: jurnalError } = await supabase
        .from('jurnal_harian')
        .insert({
          id_guru: userSession.guru.id_guru,
          id_mapel: selectedMapel,
          id_kelas: selectedKelas,
          tanggal_pelajaran: today,
          waktu_mulai: waktuMulai,
          waktu_selesai: waktuSelesai,
          judul_materi: judulMateri,
          materi_diajarkan: materiDiajarkan
        })
        .select()
        .single();

      if (jurnalError) throw jurnalError;

      // Then save absensi
      const absensiToInsert = absensiData.map(item => ({
        id_jurnal: jurnalData.id_jurnal,
        id_siswa: item.id_siswa,
        status: item.status,
        catatan: item.catatan
      }));

      const { error: absensiError } = await supabase
        .from('absensi')
        .upsert(absensiToInsert);

      if (absensiError) throw absensiError;

      toast({
        title: "Berhasil",
        description: "Jurnal dan absensi berhasil disimpan"
      });

      // Reset form
      setSelectedKelas('');
      setSelectedMapel('');
      setJudulMateri('');
      setMateriDiajarkan('');
      setWaktuMulai('');
      setWaktuSelesai('');
      setSiswaList([]);
      setAbsensiData([]);
    } catch (error) {
      console.error('Error saving absensi:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Absensi Harian</h1>
        <Badge variant="outline" className="text-sm">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date(today).toLocaleDateString('id-ID')}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Pembelajaran</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kelas">Kelas</Label>
              <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                <SelectTrigger id="kelas">
                  <SelectValue placeholder="Pilih Kelas" />
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
              <Label htmlFor="mapel">Mata Pelajaran</Label>
              <Select value={selectedMapel} onValueChange={setSelectedMapel}>
                <SelectTrigger id="mapel">
                  <SelectValue placeholder="Pilih Mata Pelajaran" />
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
              <Label htmlFor="waktu-mulai">Waktu Mulai</Label>
              <Input
                id="waktu-mulai"
                type="time"
                value={waktuMulai}
                onChange={(e) => setWaktuMulai(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="waktu-selesai">Waktu Selesai</Label>
              <Input
                id="waktu-selesai"
                type="time"
                value={waktuSelesai}
                onChange={(e) => setWaktuSelesai(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="judul-materi">Judul Materi</Label>
            <Input
              id="judul-materi"
              placeholder="Masukkan judul materi"
              value={judulMateri}
              onChange={(e) => setJudulMateri(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="materi-diajarkan">Materi yang Diajarkan</Label>
            <Textarea
              id="materi-diajarkan"
              placeholder="Masukkan materi yang diajarkan"
              value={materiDiajarkan}
              onChange={(e) => setMateriDiajarkan(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {selectedKelas && siswaList.length > 0 && (
        <AbsensiList
          siswaList={siswaList}
          absensiData={absensiData}
          loading={loading}
          onStatusUpdate={updateAbsensiStatus}
          onCatatanUpdate={updateAbsensiCatatan}
          onSaveAbsensi={saveAbsensi}
        />
      )}
    </div>
  );
};

export default AbsensiPage;
