
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Trophy, Filter, Save } from 'lucide-react';
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
  kelas?: {
    nama_kelas: string;
  };
}

interface MataPelajaran {
  id_mapel: string;
  nama_mapel: string;
}

interface Kelas {
  id_kelas: string;
  nama_kelas: string;
}

interface BulkNilaiEntry {
  id_siswa: string;
  skor: string;
  catatan: string;
}

const NilaiPage: React.FC<NilaiPageProps> = ({ userSession }) => {
  const [nilaiList, setNilaiList] = useState<Nilai[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkEntryMode, setBulkEntryMode] = useState(false);
  const [bulkValues, setBulkValues] = useState<Record<string, BulkNilaiEntry>>({});
  
  // Filter states
  const [selectedMapel, setSelectedMapel] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedJenisNilai, setSelectedJenisNilai] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, [userSession]);

  useEffect(() => {
    if (selectedMapel && selectedKelas) {
      loadSiswaByKelas();
    }
  }, [selectedKelas]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadNilai(),
        loadMataPelajaranGuru(),
        loadKelas()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNilai = async () => {
    try {
      let query = supabase
        .from('nilai')
        .select(`
          id_nilai,
          jenis_nilai,
          skor,
          tanggal_nilai,
          catatan,
          siswa!inner(nama_lengkap, nisn),
          mata_pelajaran!inner(nama_mapel)
        `);

      // Filter berdasarkan mata pelajaran yang diampu guru jika bukan admin
      if (!userSession.isAdmin) {
        const { data: guruMapel } = await supabase
          .from('guru_mata_pelajaran')
          .select('id_mapel')
          .eq('id_guru', userSession.guru.id_guru);
        
        if (guruMapel && guruMapel.length > 0) {
          const mapelIds = guruMapel.map(gm => gm.id_mapel);
          query = query.in('id_mapel', mapelIds);
        }
      }

      query = query.order('tanggal_nilai', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      setNilaiList(data || []);
    } catch (error) {
      console.error('Error loading nilai:', error);
    }
  };

  const loadMataPelajaranGuru = async () => {
    try {
      let query = supabase.from('mata_pelajaran').select('id_mapel, nama_mapel');

      // Filter berdasarkan mata pelajaran yang diampu guru jika bukan admin
      if (!userSession.isAdmin) {
        const { data: guruMapel } = await supabase
          .from('guru_mata_pelajaran')
          .select('id_mapel')
          .eq('id_guru', userSession.guru.id_guru);
        
        if (guruMapel && guruMapel.length > 0) {
          const mapelIds = guruMapel.map(gm => gm.id_mapel);
          query = query.in('id_mapel', mapelIds);
        }
      }

      query = query.order('nama_mapel');

      const { data, error } = await query;
      if (error) throw error;
      setMapelList(data || []);
    } catch (error) {
      console.error('Error loading mata pelajaran:', error);
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

  const loadSiswaByKelas = async () => {
    if (!selectedKelas) return;

    try {
      const { data, error } = await supabase
        .from('siswa')
        .select(`
          id_siswa, 
          nama_lengkap, 
          nisn,
          kelas(nama_kelas)
        `)
        .eq('id_kelas', selectedKelas)
        .order('nama_lengkap');

      if (error) throw error;
      setSiswaList(data || []);
      
      // Initialize bulk values
      const initialBulkValues: Record<string, BulkNilaiEntry> = {};
      data?.forEach(siswa => {
        initialBulkValues[siswa.id_siswa] = {
          id_siswa: siswa.id_siswa,
          skor: '',
          catatan: ''
        };
      });
      setBulkValues(initialBulkValues);
    } catch (error) {
      console.error('Error loading siswa:', error);
    }
  };

  const handleBulkValueChange = (siswaId: string, field: 'skor' | 'catatan', value: string) => {
    setBulkValues(prev => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        [field]: value
      }
    }));
  };

  const handleBulkSubmit = async () => {
    if (!selectedMapel || !selectedJenisNilai) {
      toast({
        title: "Error",
        description: "Pilih mata pelajaran dan jenis nilai terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    // Filter siswa yang memiliki nilai
    const validEntries = Object.values(bulkValues).filter(entry => 
      entry.skor && parseFloat(entry.skor) >= 0 && parseFloat(entry.skor) <= 100
    );

    if (validEntries.length === 0) {
      toast({
        title: "Error",
        description: "Masukkan minimal satu nilai yang valid (0-100)",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get the first available jurnal (simplified for demo)
      const { data: jurnalData } = await supabase
        .from('jurnal_harian')
        .select('id_jurnal')
        .limit(1)
        .single();

      const nilaiData = validEntries.map(entry => ({
        id_siswa: entry.id_siswa,
        id_mapel: selectedMapel,
        id_jurnal: jurnalData?.id_jurnal || '00000000-0000-0000-0000-000000000000',
        jenis_nilai: selectedJenisNilai,
        skor: parseFloat(entry.skor),
        tanggal_nilai: new Date().toISOString().split('T')[0],
        catatan: entry.catatan || null
      }));

      const { error } = await supabase
        .from('nilai')
        .insert(nilaiData);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: `${validEntries.length} nilai berhasil disimpan`
      });

      // Reset form
      setBulkEntryMode(false);
      const resetBulkValues: Record<string, BulkNilaiEntry> = {};
      siswaList.forEach(siswa => {
        resetBulkValues[siswa.id_siswa] = {
          id_siswa: siswa.id_siswa,
          skor: '',
          catatan: ''
        };
      });
      setBulkValues(resetBulkValues);
      loadNilai();
    } catch (error) {
      console.error('Error saving bulk nilai:', error);
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

  const filteredNilai = nilaiList.filter(nilai => {
    if (selectedMapel && nilai.mata_pelajaran.nama_mapel !== mapelList.find(m => m.id_mapel === selectedMapel)?.nama_mapel) return false;
    if (selectedJenisNilai && nilai.jenis_nilai !== selectedJenisNilai) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manajemen Nilai</h1>
        <div className="flex gap-2">
          <Button 
            variant={bulkEntryMode ? "destructive" : "default"}
            onClick={() => setBulkEntryMode(!bulkEntryMode)}
          >
            {bulkEntryMode ? "Batal Entry Massal" : "Entry Nilai Massal"}
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Mata Pelajaran</label>
              <Select value={selectedMapel} onValueChange={setSelectedMapel}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih mata pelajaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Mata Pelajaran</SelectItem>
                  {mapelList.map((mapel) => (
                    <SelectItem key={mapel.id_mapel} value={mapel.id_mapel}>
                      {mapel.nama_mapel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Kelas</label>
              <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Kelas</SelectItem>
                  {kelasList.map((kelas) => (
                    <SelectItem key={kelas.id_kelas} value={kelas.id_kelas}>
                      {kelas.nama_kelas}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Jenis Nilai</label>
              <Select value={selectedJenisNilai} onValueChange={setSelectedJenisNilai}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis nilai" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Jenis</SelectItem>
                  <SelectItem value="Tugas Harian">Tugas Harian</SelectItem>
                  <SelectItem value="Quiz">Quiz</SelectItem>
                  <SelectItem value="UTS">UTS</SelectItem>
                  <SelectItem value="UAS">UAS</SelectItem>
                  <SelectItem value="Praktikum">Praktikum</SelectItem>
                  <SelectItem value="Proyek">Proyek</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Entry Mode */}
      {bulkEntryMode && (
        <Card>
          <CardHeader>
            <CardTitle>Entry Nilai Massal - Mode Excel</CardTitle>
            <p className="text-sm text-gray-600">
              Pilih mata pelajaran, kelas, dan jenis nilai, kemudian masukkan nilai untuk setiap siswa
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Mata Pelajaran *</label>
                <Select value={selectedMapel} onValueChange={setSelectedMapel}>
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
                <label className="text-sm font-medium mb-2 block">Kelas *</label>
                <Select value={selectedKelas} onValueChange={setSelectedKelas}>
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
                <label className="text-sm font-medium mb-2 block">Jenis Nilai *</label>
                <Select value={selectedJenisNilai} onValueChange={setSelectedJenisNilai}>
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
            </div>

            {selectedMapel && selectedKelas && selectedJenisNilai && siswaList.length > 0 && (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-12">No</TableHead>
                        <TableHead>NISN</TableHead>
                        <TableHead>Nama Siswa</TableHead>
                        <TableHead className="w-24">Nilai (0-100)</TableHead>
                        <TableHead className="w-48">Catatan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {siswaList.map((siswa, index) => (
                        <TableRow key={siswa.id_siswa}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{siswa.nisn}</TableCell>
                          <TableCell>{siswa.nama_lengkap}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={bulkValues[siswa.id_siswa]?.skor || ''}
                              onChange={(e) => handleBulkValueChange(siswa.id_siswa, 'skor', e.target.value)}
                              placeholder="0-100"
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={bulkValues[siswa.id_siswa]?.catatan || ''}
                              onChange={(e) => handleBulkValueChange(siswa.id_siswa, 'catatan', e.target.value)}
                              placeholder="Catatan (opsional)"
                              className="w-full"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleBulkSubmit} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Simpan Semua Nilai
                  </Button>
                </div>
              </>
            )}

            {selectedMapel && selectedKelas && selectedJenisNilai && siswaList.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Tidak ada siswa di kelas yang dipilih
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{filteredNilai.length}</div>
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
                  {filteredNilai.filter(n => n.skor >= 75).length}
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
                {filteredNilai.map((nilai) => (
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
          
          {!loading && filteredNilai.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Belum ada data nilai sesuai filter
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NilaiPage;
