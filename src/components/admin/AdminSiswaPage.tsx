
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Kelas, Guru, UserSession } from '@/types';
import ProfilSiswaPopup from '@/components/ProfilSiswaPopup';
import StudentFilters from './StudentFilters';
import StudentTable from './StudentTable';
import StudentForm from './StudentForm';

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
  nomor_telepon_siswa?: string;
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
    nomor_telepon_siswa: '',
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
      nomor_telepon_siswa: siswa.nomor_telepon_siswa || '',
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
      nomor_telepon_siswa: '',
      nama_orang_tua: '',
      nomor_telepon_orang_tua: '',
      id_kelas: '',
      id_guru_wali: '',
      tahun_masuk: new Date().getFullYear(),
      foto_url: ''
    });
    setEditingSiswa(null);
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
              <StudentForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                onCancel={() => setIsDialogOpen(false)}
                isEditing={!!editingSiswa}
                kelasList={kelasList}
                guruList={guruList}
              />
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <StudentFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedKelas={selectedKelas}
        onKelasChange={setSelectedKelas}
        kelasList={kelasList}
      />

      {/* Table */}
      <StudentTable
        siswaList={filteredSiswa}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSiswaClick={handleSiswaClick}
      />

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
