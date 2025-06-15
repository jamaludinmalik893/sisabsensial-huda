
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Kelas, Guru } from '@/types';

interface GuruWithRoles extends Guru {
  roles?: ('admin' | 'guru' | 'wali_kelas')[];
}

interface GuruFormProps {
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
  isEditing: boolean;
  editingGuru: GuruWithRoles | null;
  kelasList: Kelas[];
}

const GuruForm: React.FC<GuruFormProps> = ({ onSubmit, onCancel, isEditing, editingGuru, kelasList }) => {
    const [formData, setFormData] = useState({
        nip: '',
        nama_lengkap: '',
        email: '',
        password: '',
        nomor_telepon: '',
        alamat: '',
        wali_kelas: '',
        roles: [] as ('admin' | 'guru' | 'wali_kelas')[],
    });

    useEffect(() => {
        if (isEditing && editingGuru) {
            setFormData({
                nip: editingGuru.nip,
                nama_lengkap: editingGuru.nama_lengkap,
                email: editingGuru.email,
                password: '',
                nomor_telepon: editingGuru.nomor_telepon || '',
                alamat: editingGuru.alamat || '',
                wali_kelas: editingGuru.wali_kelas || '',
                roles: editingGuru.roles || [],
            });
        } else {
             setFormData({
                nip: '',
                nama_lengkap: '',
                email: '',
                password: '',
                nomor_telepon: '',
                alamat: '',
                wali_kelas: '',
                roles: [],
            });
        }
    }, [isEditing, editingGuru]);

    const handleRoleToggle = (role: 'admin' | 'guru' | 'wali_kelas', checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            roles: checked ? [...prev.roles, role] : prev.roles.filter(r => r !== role)
        }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    }

    return (
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
                  placeholder={isEditing ? "Kosongkan jika tidak ingin mengubah" : ""}
                  required={!isEditing}
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

              {formData.roles.includes('wali_kelas') && (
                <div className="col-span-2">
                  <Label htmlFor="wali_kelas">Kelas yang Diwali</Label>
                  <Select value={formData.wali_kelas} onValueChange={(value) => setFormData({...formData, wali_kelas: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kelas untuk menjadi wali" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Belum ditentukan</SelectItem>
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
              <Button type="button" variant="outline" onClick={onCancel}>
                Batal
              </Button>
              <Button type="submit">
                {isEditing ? 'Perbarui' : 'Simpan'}
              </Button>
            </div>
        </form>
    );
}

export default GuruForm;
