
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Clock, Users } from 'lucide-react';

interface JurnalFormProps {
  userSession: UserSession;
  onJurnalCreated: () => void;
}

interface Kelas {
  id_kelas: string;
  nama_kelas: string;
}

interface MataPelajaran {
  id_mapel: string;
  nama_mapel: string;
}

const JurnalForm: React.FC<JurnalFormProps> = ({ userSession, onJurnalCreated }) => {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    id_kelas: '',
    id_mapel: '',
    tanggal_pelajaran: new Date().toISOString().split('T')[0],
    waktu_mulai: '',
    waktu_selesai: '',
    judul_materi: '',
    materi_diajarkan: ''
  });

  useEffect(() => {
    loadInitialData();
  }, [userSession]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadKelasList(),
        loadMapelList()
      ]);
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
      let query = supabase
        .from('mata_pelajaran')
        .select(`
          id_mapel, 
          nama_mapel,
          guru_mata_pelajaran!inner(id_guru)
        `)
        .eq('guru_mata_pelajaran.id_guru', userSession.guru.id_guru)
        .order('nama_mapel');

      const { data, error } = await query;
      if (error) throw error;
      
      setMapelList(data || []);
    } catch (error) {
      console.error('Error loading mata pelajaran:', error);
      toast({
        title: "Error",
        description: "Gagal memuat daftar mata pelajaran",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('jurnal_harian')
        .insert({
          ...formData,
          id_guru: userSession.guru.id_guru
        });

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Jurnal berhasil dibuat",
      });

      // Reset form
      setFormData({
        id_kelas: '',
        id_mapel: '',
        tanggal_pelajaran: new Date().toISOString().split('T')[0],
        waktu_mulai: '',
        waktu_selesai: '',
        judul_materi: '',
        materi_diajarkan: ''
      });

      onJurnalCreated();
    } catch (error) {
      console.error('Error creating jurnal:', error);
      toast({
        title: "Error",
        description: "Gagal membuat jurnal",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Buat Jurnal Harian Baru
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="id_kelas">Kelas</Label>
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
              <Label htmlFor="id_mapel">Mata Pelajaran</Label>
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
              <Label htmlFor="tanggal_pelajaran">Tanggal Pelajaran</Label>
              <Input
                id="tanggal_pelajaran"
                type="date"
                value={formData.tanggal_pelajaran}
                onChange={(e) => setFormData({...formData, tanggal_pelajaran: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="waktu_mulai">Waktu Mulai</Label>
                <Input
                  id="waktu_mulai"
                  type="time"
                  value={formData.waktu_mulai}
                  onChange={(e) => setFormData({...formData, waktu_mulai: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="waktu_selesai">Waktu Selesai</Label>
                <Input
                  id="waktu_selesai"
                  type="time"
                  value={formData.waktu_selesai}
                  onChange={(e) => setFormData({...formData, waktu_selesai: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="judul_materi">Judul Materi</Label>
            <Input
              id="judul_materi"
              value={formData.judul_materi}
              onChange={(e) => setFormData({...formData, judul_materi: e.target.value})}
              placeholder="Masukkan judul materi"
              required
            />
          </div>

          <div>
            <Label htmlFor="materi_diajarkan">Materi yang Diajarkan</Label>
            <Textarea
              id="materi_diajarkan"
              value={formData.materi_diajarkan}
              onChange={(e) => setFormData({...formData, materi_diajarkan: e.target.value})}
              placeholder="Jelaskan materi yang akan diajarkan..."
              rows={4}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Menyimpan...' : 'Simpan Jurnal'}
          </Button>
        </form>

        {mapelList.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <Users className="h-5 w-5" />
              <span className="font-medium">Tidak Ada Mata Pelajaran</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Anda belum ditugaskan untuk mengajar mata pelajaran apapun. Silakan hubungi administrator untuk mendapatkan penugasan mata pelajaran.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JurnalForm;
