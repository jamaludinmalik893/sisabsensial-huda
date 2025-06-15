
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { User, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Guru, Kelas, UserSession, SimpleGuruRole } from '@/types';
import GuruForm from './GuruForm';
import GuruTable from './GuruTable';
import GuruSearch from './GuruSearch';

interface AdminGuruPageProps {
  userSession: UserSession;
}

interface GuruWithRoles extends Guru {
  kelas_wali?: { nama_kelas: string };
  guru_roles?: SimpleGuruRole[];
  roles?: ('admin' | 'guru' | 'wali_kelas')[];
}

const AdminGuruPage: React.FC<AdminGuruPageProps> = ({ userSession }) => {
  const [guruList, setGuruList] = useState<GuruWithRoles[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGuru, setEditingGuru] = useState<GuruWithRoles | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: guruData, error: guruError } = await supabase
        .from('guru')
        .select(`
          *,
          kelas_wali:wali_kelas(nama_kelas),
          guru_roles(role)
        `);

      if (guruError) throw guruError;

      const { data: kelasData, error: kelasError } = await supabase
        .from('kelas')
        .select('*')
        .order('nama_kelas');

      if (kelasError) throw kelasError;

      const transformedGuruData: GuruWithRoles[] = guruData?.map(guru => ({
        ...guru,
        kelas_wali: guru.kelas_wali,
        guru_roles: guru.guru_roles as SimpleGuruRole[],
        roles: guru.guru_roles?.map((gr: SimpleGuruRole) => gr.role) || []
      })) || [];

      setGuruList(transformedGuruData);
      setKelasList(kelasData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data guru",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (formData.roles.length === 0) {
        toast({
          title: "Error",
          description: "Pilih minimal satu peran untuk guru",
          variant: "destructive"
        });
        return;
      }

      const { password, ...restOfData } = formData;
      const guruFormData: any = {
          ...restOfData,
          wali_kelas: formData.wali_kelas || null,
          status: formData.roles.includes('admin') ? 'admin' : 'guru'
      };

      if (password) {
        guruFormData.password = password;
      }

      let guruId: string;

      if (editingGuru) {
        const { error } = await supabase
          .from('guru')
          .update(guruFormData)
          .eq('id_guru', editingGuru.id_guru);

        if (error) throw error;
        guruId = editingGuru.id_guru;
      } else {
        guruFormData.password = password; // Ensure password is set for new user
        const { data: newGuru, error } = await supabase
          .from('guru')
          .insert(guruFormData)
          .select()
          .single();

        if (error) throw error;
        guruId = newGuru.id_guru;
      }

      if (editingGuru) {
        const { error: deleteError } = await supabase
          .from('guru_roles')
          .delete()
          .eq('id_guru', guruId);
        
        if (deleteError) throw deleteError;
      }

      const roleInserts = formData.roles.map((role: string) => ({
        id_guru: guruId,
        role: role
      }));

      const { error: rolesError } = await supabase
        .from('guru_roles')
        .insert(roleInserts);

      if (rolesError) throw rolesError;

      toast({
        title: "Sukses",
        description: editingGuru ? "Data guru berhasil diperbarui" : "Guru baru berhasil ditambahkan",
      });

      setIsDialogOpen(false);
      setEditingGuru(null);
      fetchData();
    } catch (error) {
      console.error('Error saving guru:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan data guru",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (guru: GuruWithRoles) => {
    setEditingGuru(guru);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id_guru: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus guru ini?')) return;

    try {
      const { error: rolesError } = await supabase
        .from('guru_roles')
        .delete()
        .eq('id_guru', id_guru);

      if (rolesError) throw rolesError;

      const { error } = await supabase
        .from('guru')
        .delete()
        .eq('id_guru', id_guru);

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Guru berhasil dihapus",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error deleting guru:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus guru",
        variant: "destructive"
      });
    }
  };

  const filteredGuru = guruList.filter(guru => 
    guru.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guru.nip.includes(searchTerm) ||
    guru.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <User className="h-6 w-6" />
          Administrasi Guru
        </h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingGuru(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Guru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingGuru ? 'Edit Guru' : 'Tambah Guru Baru'}
              </DialogTitle>
              <DialogDescription>
                {editingGuru ? 'Edit informasi guru yang sudah ada' : 'Tambahkan guru baru ke dalam sistem'}
              </DialogDescription>
            </DialogHeader>
            <GuruForm
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
              isEditing={!!editingGuru}
              editingGuru={editingGuru}
              kelasList={kelasList}
            />
          </DialogContent>
        </Dialog>
      </div>

      <GuruSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <Card>
        <CardHeader>
          <CardTitle>Daftar Guru ({filteredGuru.length} guru)</CardTitle>
        </CardHeader>
        <CardContent>
          <GuruTable
            guruList={filteredGuru}
            onEdit={handleEdit}
            onDelete={handleDelete}
            userSession={userSession}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGuruPage;
