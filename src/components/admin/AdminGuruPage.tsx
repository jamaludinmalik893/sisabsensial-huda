
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Guru, Kelas, MataPelajaran, UserSession, SimpleGuruRole } from '@/types';

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
  const [mataPelajaranList, setMataPelajaranList] = useState<MataPelajaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGuru, setEditingGuru] = useState<GuruWithRoles | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nip: '',
    nama_lengkap: '',
    email: '',
    password: '',
    nomor_telepon: '',
    alamat: '',
    wali_kelas: '',
    roles: [] as ('admin' | 'guru' | 'wali_kelas')[],
    mata_pelajaran: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch guru with relations and roles
      const { data: guruData, error: guruError } = await supabase
        .from('guru')
        .select(`
          *,
          kelas_wali:wali_kelas(nama_kelas),
          guru_roles(role)
        `);

      if (guruError) throw guruError;

      // Fetch kelas
      const { data: kelasData, error: kelasError } = await supabase
        .from('kelas')
        .select('*')
        .order('nama_kelas');

      if (kelasError) throw kelasError;

      // Fetch mata pelajaran
      const { data: mapelData, error: mapelError } = await supabase
        .from('mata_pelajaran')
        .select('*')
        .order('nama_mapel');

      if (mapelError) throw mapelError;

      // Transform guru data to include roles array with proper typing
      const transformedGuruData: GuruWithRoles[] = guruData?.map(guru => ({
        ...guru,
        kelas_wali: guru.kelas_wali,
        guru_roles: guru.guru_roles as SimpleGuruRole[],
        roles: guru.guru_roles?.map((gr: SimpleGuruRole) => gr.role) || []
      })) || [];

      setGuruList(transformedGuruData);
      setKelasList(kelasData || []);
      setMataPelajaranList(mapelData || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate that at least one role is selected
      if (formData.roles.length === 0) {
        toast({
          title: "Error",
          description: "Pilih minimal satu peran untuk guru",
          variant: "destructive"
        });
        return;
      }

      const guruFormData = {
        nip: formData.nip,
        nama_lengkap: formData.nama_lengkap,
        email: formData.email,
        password: formData.password,
        nomor_telepon: formData.nomor_telepon,
        alamat: formData.alamat,
        wali_kelas: formData.wali_kelas || null,
        status: formData.roles.includes('admin') ? 'admin' : 'guru' // Keep for backward compatibility
      };

      let guruId: string;

      if (editingGuru) {
        // Update guru
        const { error } = await supabase
          .from('guru')
          .update(guruFormData)
          .eq('id_guru', editingGuru.id_guru);

        if (error) throw error;
        guruId = editingGuru.id_guru;
      } else {
        // Create new guru
        const { data: newGuru, error } = await supabase
          .from('guru')
          .insert(guruFormData)
          .select()
          .single();

        if (error) throw error;
        guruId = newGuru.id_guru;
      }

      // Update roles
      // First, delete existing roles if editing
      if (editingGuru) {
        const { error: deleteError } = await supabase
          .from('guru_roles')
          .delete()
          .eq('id_guru', guruId);
        
        if (deleteError) throw deleteError;
      }

      // Insert new roles
      const roleInserts = formData.roles.map(role => ({
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
      resetForm();
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
    setFormData({
      nip: guru.nip,
      nama_lengkap: guru.nama_lengkap,
      email: guru.email,
      password: '',
      nomor_telepon: guru.nomor_telepon || '',
      alamat: guru.alamat || '',
      wali_kelas: guru.wali_kelas || '',
      roles: guru.roles || [],
      mata_pelajaran: []
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id_guru: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus guru ini?')) return;

    try {
      // Delete roles first (will cascade)
      const { error: rolesError } = await supabase
        .from('guru_roles')
        .delete()
        .eq('id_guru', id_guru);

      if (rolesError) throw rolesError;

      // Delete guru
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

  const resetForm = () => {
    setFormData({
      nip: '',
      nama_lengkap: '',
      email: '',
      password: '',
      nomor_telepon: '',
      alamat: '',
      wali_kelas: '',
      roles: [],
      mata_pelajaran: []
    });
    setEditingGuru(null);
  };

  const handleRoleToggle = (role: 'admin' | 'guru' | 'wali_kelas', checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        roles: [...prev.roles, role]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        roles: prev.roles.filter(r => r !== role)
      }));
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'wali_kelas': return 'secondary';
      default: return 'outline';
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
            <Button onClick={resetForm}>
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nip">NIP</Label>
                  <Input
                    id="nip"
                    value={formData.nip}
                    onChange={(e) => setFormData({...formData, nip: e.target.value})}
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
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder={editingGuru ? "Kosongkan jika tidak ingin mengubah" : ""}
                    required={!editingGuru}
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
                <div className="col-span-2">
                  <Label htmlFor="alamat">Alamat</Label>
                  <Input
                    id="alamat"
                    value={formData.alamat}
                    onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                  />
                </div>
                
                {/* Multiple Roles Selection */}
                <div className="col-span-2">
                  <Label>Peran/Status <span className="text-red-500">*</span></Label>
                  <div className="space-y-3 mt-2 p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="role-admin"
                        checked={formData.roles.includes('admin')}
                        onCheckedChange={(checked) => handleRoleToggle('admin', checked as boolean)}
                      />
                      <Label htmlFor="role-admin" className="cursor-pointer">
                        Administrator - Akses penuh sistem
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="role-guru"
                        checked={formData.roles.includes('guru')}
                        onCheckedChange={(checked) => handleRoleToggle('guru', checked as boolean)}
                      />
                      <Label htmlFor="role-guru" className="cursor-pointer">
                        Guru - Mengajar dan input nilai
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="role-wali"
                        checked={formData.roles.includes('wali_kelas')}
                        onCheckedChange={(checked) => handleRoleToggle('wali_kelas', checked as boolean)}
                      />
                      <Label htmlFor="role-wali" className="cursor-pointer">
                        Wali Kelas - Mengelola kelas dan siswa
                      </Label>
                    </div>
                  </div>
                  {formData.roles.length === 0 && (
                    <p className="text-sm text-red-500 mt-1">Pilih minimal satu peran</p>
                  )}
                </div>

                {/* Wali Kelas Selection - only show if wali_kelas role is selected */}
                {formData.roles.includes('wali_kelas') && (
                  <div className="col-span-2">
                    <Label htmlFor="wali_kelas">Kelas yang Diwali</Label>
                    <Select value={formData.wali_kelas} onValueChange={(value) => setFormData({...formData, wali_kelas: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kelas untuk menjadi wali" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Belum ditentukan</SelectItem>
                        {kelasList.map((kelas) => (
                          <SelectItem key={kelas.id_kelas} value={kelas.id_kelas}>
                            {kelas.nama_kelas}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingGuru ? 'Perbarui' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari guru (nama, NIP, atau email)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Guru ({filteredGuru.length} guru)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIP</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Peran/Status</TableHead>
                <TableHead>Wali Kelas</TableHead>
                <TableHead>No. Telepon</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuru.map((guru) => (
                <TableRow key={guru.id_guru}>
                  <TableCell className="font-mono">{guru.nip}</TableCell>
                  <TableCell className="font-medium">{guru.nama_lengkap}</TableCell>
                  <TableCell>{guru.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {guru.roles && guru.roles.length > 0 ? (
                        guru.roles.map((role) => (
                          <Badge key={role} variant={getRoleBadgeVariant(role)} className="text-xs">
                            {role === 'admin' ? 'Admin' : 
                             role === 'wali_kelas' ? 'Wali Kelas' : 'Guru'}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="secondary">Guru</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {guru.kelas_wali ? (
                      <Badge variant="outline">{guru.kelas_wali.nama_kelas}</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>{guru.nomor_telepon || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(guru)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(guru.id_guru)}
                        disabled={guru.id_guru === userSession.guru.id_guru}
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
    </div>
  );
};

export default AdminGuruPage;
