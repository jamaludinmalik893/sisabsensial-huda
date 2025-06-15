
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import JurnalForm from './absensi/JurnalForm';
import JurnalSelector from './absensi/JurnalSelector';
import AbsensiList from './absensi/AbsensiList';

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
  const [jurnalList, setJurnalList] = useState<JurnalHarian[]>([]);
  const [selectedJurnal, setSelectedJurnal] = useState<string>('');
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
    if (selectedJurnal) {
      loadSiswaByJurnal();
    }
  }, [selectedJurnal]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadJurnalHarian(),
        loadKelas(),
        loadMataPelajaran()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

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

  const loadSiswaByJurnal = async () => {
    try {
      const jurnal = jurnalList.find(j => j.id_jurnal === selectedJurnal);
      if (!jurnal) return;

      console.log('Loading siswa for kelas:', jurnal.kelas.id_kelas);

      const { data, error } = await supabase
        .from('siswa')
        .select('id_siswa, nama_lengkap, nisn, foto_url')
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

  const handleJurnalCreated = () => {
    loadJurnalHarian();
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

      <JurnalForm
        kelasList={kelasList}
        mapelList={mapelList}
        guruId={userSession.guru.id_guru}
        onJurnalCreated={handleJurnalCreated}
      />

      <JurnalSelector
        jurnalList={jurnalList}
        selectedJurnal={selectedJurnal}
        onJurnalChange={setSelectedJurnal}
      />

      {selectedJurnal && siswaList.length > 0 && (
        <AbsensiList
          siswaList={siswaList}
          absensiData={absensiData}
          loading={loading}
          onStatusUpdate={updateAbsensiStatus}
          onSaveAbsensi={saveAbsensi}
        />
      )}
    </div>
  );
};

export default AbsensiPage;
