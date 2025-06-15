
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogDescription } from '@/components/ui/dialog';
import { Kelas, Guru } from '@/types';
import PhotoCapture from './PhotoCapture';

interface StudentFormData {
  nisn: string;
  nama_lengkap: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  tempat_lahir: string;
  alamat: string;
  nomor_telepon: string;
  nomor_telepon_siswa: string;
  nama_orang_tua: string;
  nomor_telepon_orang_tua: string;
  id_kelas: string;
  id_guru_wali: string;
  tahun_masuk: number;
  foto_url: string;
}

interface StudentFormProps {
  formData: StudentFormData;
  setFormData: React.Dispatch<React.SetStateAction<StudentFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
  kelasList: Kelas[];
  guruList: Guru[];
}

const StudentForm: React.FC<StudentFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEditing,
  kelasList,
  guruList
}) => {
  const handlePhotoCapture = (photoUrl: string) => {
    setFormData(prev => ({ ...prev, foto_url: photoUrl }));
  };

  return (
    <>
      <DialogDescription>
        {isEditing ? 'Perbarui informasi siswa' : 'Tambahkan siswa baru ke dalam sistem'}
      </DialogDescription>
      <form onSubmit={onSubmit} className="space-y-4">
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
            <Label htmlFor="nomor_telepon">Nomor Telepon (Lama)</Label>
            <Input
              id="nomor_telepon"
              value={formData.nomor_telepon}
              onChange={(e) => setFormData({...formData, nomor_telepon: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="nomor_telepon_siswa">Nomor Telepon Siswa</Label>
            <Input
              id="nomor_telepon_siswa"
              value={formData.nomor_telepon_siswa}
              onChange={(e) => setFormData({...formData, nomor_telepon_siswa: e.target.value})}
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit">
            {isEditing ? 'Perbarui' : 'Simpan'}
          </Button>
        </div>
      </form>
    </>
  );
};

export default StudentForm;
