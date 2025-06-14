
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AbsensiPageProps {
  userSession: UserSession;
}

interface JurnalHarian {
  id_jurnal: string;
  tanggal_pelajaran: string;
  waktu_mulai: string;
  waktu_selesai: string;
  judul_materi: string;
  mata_pelajaran: { nama_mapel: string };
  kelas: { nama_kelas: string; id_kelas: string };
}

interface Siswa {
  id_siswa: string;
  nama_lengkap: string;
  nisn: string;
}

interface AbsensiData {
  id_siswa: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha';
  catatan?: string;
}

const AbsensiPage: React.FC<AbsensiPageProps> = ({ userSession }) => {
  const [jurnalList, setJurnalList] = useState<JurnalHarian[]>([]);
  const [selectedJurnal, setSelectedJurnal] = useState<string>('');
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [absensiData, setAbsensiData] = useState<AbsensiData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadJurnalHarian();
  }, [userSession]);

  useEffect(() => {
    if (selectedJurnal) {
      loadSiswaByJurnal();
    }
  }, [selectedJurnal]);

  const loadJurnalHarian = async () => {
    try {
      console.log('Loading jurnal for guru ID:', userSession.guru.id_guru);
      
      const { data, error } = await supabase
        .from('jurnal_harian')
        .select(`
          id_jurnal,
          tanggal_pelajaran,
          waktu_mulai,
          waktu_selesai,
          judul_materi,
          id_kelas,
          mata_pelajaran!inner(nama_mapel),
          kelas!inner(nama_kelas, id_kelas)
        `)
        .eq('id_guru', userSession.guru.id_guru)
        .eq('tanggal_pelajaran', today)
        .order('waktu_mulai');

      if (error) {
        console.error('Error loading jurnal:', error);
        throw error;
      }

      console.log('Jurnal data loaded:', data);
      setJurnalList(data || []);
    } catch (error) {
      console.error('Error loading jurnal:', error);
      toast({
        title: "Error",
        description: "Gagal memuat jurnal pembelajaran",
        variant: "destructive"
      });
    }
  };

  const loadSiswaByJurnal = async () => {
    try {
      const jurnal = jurnalList.find(j => j.id_jurnal === selectedJurnal);
      if (!jurnal) return;

      console.log('Loading siswa for kelas:', jurnal.kelas.id_kelas);

      const { data, error } = await supabase
        .from('siswa')
        .select('id_siswa, nama_lengkap, nisn')
        .eq('id_kelas', jurnal.kelas.id_kelas)
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

      // Load existing absensi if any
      loadExistingAbsensi(selectedJurnal);
    } catch (error) {
      console.error('Error loading siswa:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data siswa",
        variant: "destructive"
      });
    }
  };

  const loadExistingAbsensi = async (jurnalId: string) => {
    try {
      const { data, error } = await supabase
        .from('absensi')
        .select('id_siswa, status, catatan')
        .eq('id_jurnal', jurnalId);

      if (error) throw error;

      if (data && data.length > 0) {
        setAbsensiData(prev => 
          prev.map(item => {
            const existing = data.find(abs => abs.id_siswa === item.id_siswa);
            return existing ? { 
              ...item, 
              status: existing.status as 'Hadir' | 'Izin' | 'Sakit' | 'Alpha', 
              catatan: existing.catatan || '' 
            } : item;
          })
        );
      }
    } catch (error) {
      console.error('Error loading existing absensi:', error);
    }
  };

  const updateAbsensiStatus = (id_siswa: string, status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha') => {
    setAbsensiData(prev => 
      prev.map(item => 
        item.id_siswa === id_siswa ? { ...item, status } : item
      )
    );
  };

  const saveAbsensi = async () => {
    if (!selectedJurnal) {
      toast({
        title: "Error",
        description: "Pilih jurnal pembelajaran terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const absensiToInsert = absensiData.map(item => ({
        id_jurnal: selectedJurnal,
        id_siswa: item.id_siswa,
        status: item.status,
        catatan: item.catatan
      }));

      const { error } = await supabase
        .from('absensi')
        .upsert(absensiToInsert);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Data absensi berhasil disimpan"
      });
    } catch (error) {
      console.error('Error saving absensi:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan data absensi",
        variant: "destructive"
      });
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
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pilih Pembelajaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedJurnal} onValueChange={setSelectedJurnal}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih pembelajaran hari ini" />
            </SelectTrigger>
            <SelectContent>
              {jurnalList.map((jurnal) => (
                <SelectItem key={jurnal.id_jurnal} value={jurnal.id_jurnal}>
                  {jurnal.waktu_mulai} - {jurnal.mata_pelajaran.nama_mapel} ({jurnal.kelas.nama_kelas})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {jurnalList.length === 0 && (
            <p className="text-gray-500 mt-2">Tidak ada pembelajaran hari ini</p>
          )}
        </CardContent>
      </Card>

      {selectedJurnal && siswaList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Daftar Siswa ({siswaList.length} siswa)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {siswaList.map((siswa, index) => (
                <div key={siswa.id_siswa} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{siswa.nama_lengkap}</p>
                    <p className="text-sm text-gray-500">NISN: {siswa.nisn}</p>
                  </div>
                  <div className="flex gap-2">
                    {(['Hadir', 'Izin', 'Sakit', 'Alpha'] as const).map((status) => (
                      <Button
                        key={status}
                        variant={absensiData[index]?.status === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateAbsensiStatus(siswa.id_siswa, status)}
                        className={absensiData[index]?.status === status ? getStatusColor(status) : ''}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button onClick={saveAbsensi} disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Absensi'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AbsensiPage;
