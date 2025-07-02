
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface PembelajaranDataFormProps {
  selectedKelas: string;
  selectedMapel: string;
  judulMateri: string;
  materiDiajarkan: string;
  waktuMulai: string;
  waktuSelesai: string;
  kelasList: Array<{id_kelas: string; nama_kelas: string}>;
  mapelList: Array<{id_mapel: string; nama_mapel: string}>;
  onKelasChange: (value: string) => void;
  onMapelChange: (value: string) => void;
  onJudulMateriChange: (value: string) => void;
  onMateriDiajarkanChange: (value: string) => void;
  onWaktuMulaiChange: (value: string) => void;
  onWaktuSelesaiChange: (value: string) => void;
  tanggalPelajaran: string;
  onTanggalPelajaranChange: (value: string) => void;
}

const PembelajaranDataForm: React.FC<PembelajaranDataFormProps> = ({
  selectedKelas,
  selectedMapel,
  judulMateri,
  materiDiajarkan,
  waktuMulai,
  waktuSelesai,
  kelasList,
  mapelList,
  onKelasChange,
  onMapelChange,
  onJudulMateriChange,
  onMateriDiajarkanChange,
  onWaktuMulaiChange,
  onWaktuSelesaiChange,
  tanggalPelajaran,
  onTanggalPelajaranChange
}) => {
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Format to YYYY-MM-DD to ensure consistency
      const formattedDate = format(date, 'yyyy-MM-dd');
      onTanggalPelajaranChange(formattedDate);
    }
  };

  const selectedDate = tanggalPelajaran ? new Date(tanggalPelajaran + 'T00:00:00') : undefined;

  // Generate jam pelajaran options (1-10)
  const jamPelajaranOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Pembelajaran</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tanggal Pelajaran */}
          <div className="space-y-2">
            <Label htmlFor="tanggal">Tanggal Pelajaran</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP", { locale: id })
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Kelas */}
          <div className="space-y-2">
            <Label htmlFor="kelas">Kelas</Label>
            <Select value={selectedKelas} onValueChange={onKelasChange}>
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

          {/* Mata Pelajaran */}
          <div className="space-y-2">
            <Label htmlFor="mapel">Mata Pelajaran</Label>
            <Select value={selectedMapel} onValueChange={onMapelChange}>
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

          {/* Jam Pelajaran Mulai */}
          <div className="space-y-2">
            <Label htmlFor="jamMulai">Jam Pelajaran Ke</Label>
            <Select value={waktuMulai} onValueChange={onWaktuMulaiChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jam pelajaran mulai" />
              </SelectTrigger>
              <SelectContent>
                {jamPelajaranOptions.map((jp) => (
                  <SelectItem key={jp} value={jp.toString()}>
                    JP {jp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Jam Pelajaran Selesai */}
          <div className="space-y-2">
            <Label htmlFor="jamSelesai">Sampai Jam Pelajaran Ke</Label>
            <Select value={waktuSelesai} onValueChange={onWaktuSelesaiChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jam pelajaran selesai" />
              </SelectTrigger>
              <SelectContent>
                {jamPelajaranOptions.map((jp) => (
                  <SelectItem key={jp} value={jp.toString()}>
                    JP {jp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Judul Materi */}
        <div className="space-y-2">
          <Label htmlFor="judulMateri">Judul Materi</Label>
          <Input
            id="judulMateri"
            value={judulMateri}
            onChange={(e) => onJudulMateriChange(e.target.value)}
            placeholder="Masukkan judul materi"
          />
        </div>

        {/* Materi yang Diajarkan */}
        <div className="space-y-2">
          <Label htmlFor="materiDiajarkan">Materi yang Diajarkan</Label>
          <Textarea
            id="materiDiajarkan"
            value={materiDiajarkan}
            onChange={(e) => onMateriDiajarkanChange(e.target.value)}
            placeholder="Deskripsikan materi yang diajarkan"
            rows={3}
          />
        </div>

        {waktuMulai && waktuSelesai && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Jam Pelajaran:</strong> JP {waktuMulai} - JP {waktuSelesai}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PembelajaranDataForm;
