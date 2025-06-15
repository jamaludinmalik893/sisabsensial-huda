
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Kelas {
  id_kelas: string;
  nama_kelas: string;
}

interface MataPelajaran {
  id_mapel: string;
  nama_mapel: string;
}

interface PembelajaranDataFormProps {
  selectedKelas: string;
  selectedMapel: string;
  judulMateri: string;
  materiDiajarkan: string;
  waktuMulai: string;
  waktuSelesai: string;
  kelasList: Kelas[];
  mapelList: MataPelajaran[];
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
  onTanggalPelajaranChange,
}) => {
  // Konversi yyyy-mm-dd ke Date (untuk DatePicker)
  const selectedDate = tanggalPelajaran ? new Date(tanggalPelajaran) : undefined;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Data Pembelajaran</CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="tanggal-pelajaran" className="text-sm font-medium whitespace-nowrap">
              Tanggal Pembelajaran:
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate
                    ? selectedDate.toLocaleDateString("id-ID", { 
                        day: "2-digit", 
                        month: "short", 
                        year: "numeric" 
                      })
                    : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      // Ubah ke format yyyy-mm-dd
                      const formatted = date.toISOString().split("T")[0];
                      onTanggalPelajaranChange(formatted);
                    }
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Grid untuk input utama */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Kelas */}
          <div className="space-y-2">
            <Label htmlFor="kelas">Kelas</Label>
            <Select value={selectedKelas} onValueChange={onKelasChange}>
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

          {/* Mapel */}
          <div className="space-y-2">
            <Label htmlFor="mapel">Mata Pelajaran</Label>
            <Select value={selectedMapel} onValueChange={onMapelChange}>
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

          {/* Waktu - dalam satu kolom dengan flex */}
          <div className="space-y-2">
            <Label>Waktu Pembelajaran</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="waktu-mulai"
                  type="time"
                  value={waktuMulai}
                  onChange={(e) => onWaktuMulaiChange(e.target.value)}
                  placeholder="Mulai"
                />
              </div>
              <div className="flex items-center px-2 text-sm text-gray-500">s/d</div>
              <div className="flex-1">
                <Input
                  id="waktu-selesai"
                  type="time"
                  value={waktuSelesai}
                  onChange={(e) => onWaktuSelesaiChange(e.target.value)}
                  placeholder="Selesai"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Judul Materi */}
        <div className="space-y-2">
          <Label htmlFor="judul-materi">Judul Materi</Label>
          <Input
            id="judul-materi"
            placeholder="Masukkan judul materi pembelajaran"
            value={judulMateri}
            onChange={(e) => onJudulMateriChange(e.target.value)}
          />
        </div>

        {/* Materi yang Diajarkan */}
        <div className="space-y-2">
          <Label htmlFor="materi-diajarkan">Materi yang Diajarkan</Label>
          <Textarea
            id="materi-diajarkan"
            placeholder="Deskripsikan materi yang diajarkan secara detail..."
            value={materiDiajarkan}
            onChange={(e) => onMateriDiajarkanChange(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PembelajaranDataForm;
