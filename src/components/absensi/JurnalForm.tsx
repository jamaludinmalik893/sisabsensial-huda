
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Kelas {
  id_kelas: string;
  nama_kelas: string;
}

interface MataPelajaran {
  id_mapel: string;
  nama_mapel: string;
}

interface JurnalFormProps {
  kelasList: Kelas[];
  mapelList: MataPelajaran[];
  guruId: string;
  onJurnalCreated: () => void;
}

const JurnalForm: React.FC<JurnalFormProps> = ({ 
  kelasList, 
  mapelList, 
  guruId, 
  onJurnalCreated 
}) => {
  const [formData, setFormData] = useState({
    id_kelas: '',
    id_mapel: '',
    tanggal_pelajaran: new Date().toISOString().split('T')[0],
    waktu_mulai: '',
    waktu_selesai: '',
    judul_materi: '',
    materi_diajarkan: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

    setLoading(true);
    try {
      const { error } = await supabase
        .from('jurnal_harian')
        .insert({
          id_guru: guruId,
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
        description: "Jurnal pembelajaran berhasil dibuat"
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
        description: "Gagal membuat jurnal pembelajaran",
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
          <Plus className="h-5 w-5" />
          Buat Jurnal Pembelajaran
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="id_kelas">Kelas *</Label>
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
              <Label htmlFor="id_mapel">Mata Pelajaran *</Label>
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
              <Label htmlFor="tanggal_pelajaran">Tanggal *</Label>
              <Input
                id="tanggal_pelajaran"
                type="date"
                value={formData.tanggal_pelajaran}
                onChange={(e) => setFormData({...formData, tanggal_pelajaran: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="waktu_mulai">Waktu Mulai</Label>
              <Input
                id="waktu_mulai"
                type="time"
                value={formData.waktu_mulai}
                onChange={(e) => setFormData({...formData, waktu_mulai: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="waktu_selesai">Waktu Selesai</Label>
              <Input
                id="waktu_selesai"
                type="time"
                value={formData.waktu_selesai}
                onChange={(e) => setFormData({...formData, waktu_selesai: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="judul_materi">Judul Materi *</Label>
            <Input
              id="judul_materi"
              value={formData.judul_materi}
              onChange={(e) => setFormData({...formData, judul_materi: e.target.value})}
              placeholder="Masukkan judul materi"
              required
            />
          </div>

          <div>
            <Label htmlFor="materi_diajarkan">Materi yang Diajarkan *</Label>
            <Textarea
              id="materi_diajarkan"
              value={formData.materi_diajarkan}
              onChange={(e) => setFormData({...formData, materi_diajarkan: e.target.value})}
              placeholder="Jelaskan materi yang diajarkan"
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Membuat...' : 'Buat Jurnal'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default JurnalForm;
