
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';

interface JurnalHarian {
  id_jurnal: string;
  tanggal_pelajaran: string;
  waktu_mulai: string;
  waktu_selesai: string;
  judul_materi: string;
  mata_pelajaran: { nama_mapel: string };
  kelas: { nama_kelas: string; id_kelas: string };
}

interface JurnalSelectorProps {
  jurnalList: JurnalHarian[];
  selectedJurnal: string;
  onJurnalChange: (value: string) => void;
}

const JurnalSelector: React.FC<JurnalSelectorProps> = ({
  jurnalList,
  selectedJurnal,
  onJurnalChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pilih Pembelajaran
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedJurnal} onValueChange={onJurnalChange}>
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
  );
};

export default JurnalSelector;
