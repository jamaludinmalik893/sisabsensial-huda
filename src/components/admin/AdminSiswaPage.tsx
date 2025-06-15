import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Siswa, Kelas, Guru, UserSession } from '@/types';
import PhotoCapture from './PhotoCapture';
import ProfilSiswaPopup from '@/components/ProfilSiswaPopup';

interface AdminSiswaPageProps {
  userSession: UserSession;
}

interface SiswaWithRelations {
  id_siswa: string;
  nisn: string;
  nama_lengkap: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  tanggal_lahir: string;
  tempat_lahir: string;
  alamat: string;
  nomor_telepon?: string;
  nama_orang_tua: string;
  nomor_telepon_orang_tua?: string;
  id_kelas: string;
  id_guru_wali: string;
  tahun_masuk: number;
  foto_url?: string;
  created_at?: string;
  updated_at?: string;
  kelas?: { nama_kelas: string };
  guru_wali?: { nama_lengkap: string };
}

const AdminSiswaPage: React.FC<AdminSiswaPageProps> = ({ userSession }) => {
  const [siswaList, setSiswaList] = useState<SiswaWithRelations[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKelas, setSelectedKelas] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<SiswaWithRelations | null>(null);
  const [selectedSiswa, setSelectedSiswa] = useState<SiswaWithRelations | null>(null);
  const [isProfilOpen, setIsProfilOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nisn: '',
    nama_lengkap: '',
    jenis_kelamin: '',
    tanggal_lahir: '',
    tempat_lahir: '',
    alamat: '',
    nomor_telepon: '',
    nama_orang_tua: '',
    nomor_telepon_orang_tua: '',
    id_kelas: '',
    id_guru_wali: '',
    tahun_masuk: new Date().getFullYear(),
    foto_url: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch siswa with relations
      const { data: siswaData, error: siswaError } = await supabase
        .from('siswa')
        .select(`
          *,
          kelas:id_kelas(nama_kelas),
          guru_wali:id_guru_wali(nama_lengkap)
        `);

      if (siswaError) throw siswaError;

      // Fetch kelas
      const { data: kelasData, error: kelasError } = await supabase
        .from('kelas')
        .select('*')
        .order('nama_kelas');

      if (kelasError) throw kelasError;

      // Fetch guru
      const { data: guruData, error: guruError } = await supabase
        .from('guru')
        .select('*')
        .order('nama_lengkap');

      if (guruError) throw guruError;

      // Transform siswa data to match our types
      const transformedSiswaData = siswaData?.map(siswa => ({
        ...siswa,
        jenis_kelamin: siswa.jenis_kelamin as 'Laki-laki' | 'Perempuan',
        kelas: siswa.kelas,
        guru_wali: siswa.guru_wali
      })) || [];

      // Transform guru data to match our types
      const transformedGuruData = guruData?.map(guru => ({
        ...guru,
        status: guru.status as string
      })) || [];

      setSiswaList(transformedSiswaData);
      setKelasList(kelasData || []);
      setGuruList(transformedGuruData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data siswa",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSiswa) {
        // Update siswa
        const { error } = await supabase
          .from('siswa')
          .update(formData)
          .eq('id_siswa', editingSiswa.id_siswa);

        if (error) throw error;

        toast({
          title: "Sukses",
          description: "Data siswa berhasil diperbarui",
        });
      } else {
        // Create new siswa
        const { error } = await supabase
          .from('siswa')
          .insert(formData);

        if (error) throw error;

        toast({
          title: "Sukses",
          description: "Siswa baru berhasil ditambahkan",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving siswa:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan data siswa",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (siswa: SiswaWithRelations) => {
    setEditingSiswa(siswa);
    setFormData({
      nisn: siswa.nisn,
      nama_lengkap: siswa.nama_lengkap,
      jenis_kelamin: siswa.jenis_kelamin,
      tanggal_lahir: siswa.tanggal_lahir,
      tempat_lahir: siswa.tempat_lahir,
      alamat: siswa.alamat,
      nomor_telepon: siswa.nomor_telepon || '',
      nama_orang_tua: siswa.nama_orang_tua,
      nomor_telepon_orang_tua: siswa.nomor_telepon_orang_tua || '',
      id_kelas: siswa.id_kelas || '',
      id_guru_wali: siswa.id_guru_wali || '',
      tahun_masuk: siswa.tahun_masuk,
      foto_url: siswa.foto_url || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id_siswa: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus siswa ini?')) return;

    try {
      const { error } = await supabase
        .from('siswa')
        .delete()
        .eq('id_siswa', id_siswa);

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Siswa berhasil dihapus",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error deleting siswa:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus siswa",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nisn: '',
      nama_lengkap: '',
      jenis_kelamin: '',
      tanggal_lahir: '',
      tempat_lahir: '',
      alamat: '',
      nomor_telepon: '',
      nama_orang_tua: '',
      nomor_telepon_orang_tua: '',
      id_kelas: '',
      id_guru_wali: '',
      tahun_masuk: new Date().getFullYear(),
      foto_url: ''
    });
    setEditingSiswa(null);
  };

  const handlePhotoCapture = (photoUrl: string) => {
    setFormData(prev => ({ ...prev, foto_url: photoUrl }));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSiswaClick = (siswa: SiswaWithRelations) => {
    setSelectedSiswa(siswa);
    setIsProfilOpen(true);
  };

  const filteredSiswa = siswaList.filter(siswa => {
    const matchesSearch = siswa.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         siswa.nisn.includes(searchTerm);
    const matchesKelas = selectedKelas === 'all' || siswa.id_kelas === selectedKelas;
    return matchesSearch && matchesKelas;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Administrasi Siswa
        </h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Siswa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSiswa ? 'Edit Siswa' : 'Tambah Siswa Baru'}
              </DialogTitle>
              <DialogDescription>
                {editingSiswa ? 'Perbarui informasi siswa' : 'Tambahkan siswa baru ke dalam sistem'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Foto Siswa</Label>
                  <PhotoCapture 
                    onPhotoCapture={handlePhotoCapture}
                    currentPhotoUrl={formData.foto_url}
                  />
                </div>
                
                <div>
                  <Label htmlFor="nisn">NISN</Label>
                  <Input
                    id="nisn"
                    value={formData.nisn}
                    onChange={(e) => setFormData({...formData, nisn: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
                  <Input
                    id="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                  <Select value={formData.jenis_kelamin} onValueChange={(value) => setFormData({...formData, jenis_kelamin: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                  <Input
                    id="tanggal_lahir"
                    type="date"
                    value={formData.tanggal_lahir}
                    onChange={(e) => setFormData({...formData, tanggal_lahir: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
                  <Input
                    id="tempat_lahir"
                    value={formData.tempat_lahir}
                    onChange={(e) => setFormData({...formData, tempat_lahir: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tahun_masuk">Tahun Masuk</Label>
                  <Input
                    id="tahun_masuk"
                    type="number"
                    value={formData.tahun_masuk}
                    onChange={(e) => setFormData({...formData, tahun_masuk: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="alamat">Alamat</Label>
                  <Input
                    id="alamat"
                    value={formData.alamat}
                    onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nomor_telepon">Nomor Telepon</Label>
                  <Input
                    id="nomor_telepon"
                    value={formData.nomor_telepon}
                    onChange={(e) => setFormData({...formData, nomor_telepon: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="nama_orang_tua">Nama Orang Tua</Label>
                  <Input
                    id="nama_orang_tua"
                    value={formData.nama_orang_tua}
                    onChange={(e) => setFormData({...formData, nama_orang_tua: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nomor_telepon_orang_tua">Nomor Telepon Orang Tua</Label>
                  <Input
                    id="nomor_telepon_orang_tua"
                    value={formData.nomor_telepon_orang_tua}
                    onChange={(e) => setFormData({...formData, nomor_telepon_orang_tua: e.target.value})}
                  />
                </div>
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
                  <Label htmlFor="id_guru_wali">Guru Wali</Label>
                  <Select value={formData.id_guru_wali} onValueChange={(value) => setFormData({...formData, id_guru_wali: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih guru wali" />
                    </SelectTrigger>
                    <SelectContent>
                      {guruList.map((guru) => (
                        <SelectItem key={guru.id_guru} value={guru.id_guru}>
                          {guru.nama_lengkap}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingSiswa ? 'Perbarui' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari siswa (nama atau NISN)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedKelas} onValueChange={setSelectedKelas}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                {kelasList.map((kelas) => (
                  <SelectItem key={kelas.id_kelas} value={kelas.id_kelas}>
                    {kelas.nama_kelas}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Siswa ({filteredSiswa.length} siswa)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Foto</TableHead>
                <TableHead>NISN</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Jenis Kelamin</TableHead>
                <TableHead>Tahun Masuk</TableHead>
                <TableHead>Guru Wali</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSiswa.map((siswa) => (
                <TableRow key={siswa.id_siswa}>
                  <TableCell>
                    <Avatar 
                      className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleSiswaClick(siswa)}
                    >
                      <AvatarImage src={siswa.foto_url} alt={siswa.nama_lengkap} />
                      <AvatarFallback>{getInitials(siswa.nama_lengkap)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-mono">{siswa.nisn}</TableCell>
                  <TableCell 
                    className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => handleSiswaClick(siswa)}
                  >
                    {siswa.nama_lengkap}
                  </TableCell>
                  <TableCell>
                    {siswa.kelas ? (
                      <Badge variant="outline">{siswa.kelas.nama_kelas}</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>{siswa.jenis_kelamin}</TableCell>
                  <TableCell>{siswa.tahun_masuk}</TableCell>
                  <TableCell>
                    {siswa.guru_wali ? siswa.guru_wali.nama_lengkap : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(siswa)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(siswa.id_siswa)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Popup Profil Siswa */}
      <ProfilSiswaPopup
        siswa={selectedSiswa}
        isOpen={isProfilOpen}
        onClose={() => {
          setIsProfilOpen(false);
          setSelectedSiswa(null);
        }}
      />
    </div>
  );
};

export default AdminSiswaPage;
