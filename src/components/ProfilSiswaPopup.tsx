
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Phone, User, Users, GraduationCap } from 'lucide-react';

interface Siswa {
  id_siswa: string;
  nisn: string;
  nama_lengkap: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  tempat_lahir: string;
  alamat: string;
  nomor_telepon?: string;
  nama_orang_tua: string;
  nomor_telepon_orang_tua?: string;
  tahun_masuk: number;
  foto_url?: string;
  kelas?: {
    nama_kelas: string;
  };
  guru_wali?: {
    nama_lengkap: string;
  };
}

interface ProfilSiswaPopupProps {
  siswa: Siswa | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProfilSiswaPopup: React.FC<ProfilSiswaPopupProps> = ({ siswa, isOpen, onClose }) => {
  if (!siswa) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={siswa.foto_url} alt={siswa.nama_lengkap} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                {getInitials(siswa.nama_lengkap)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl font-bold">{siswa.nama_lengkap}</DialogTitle>
              <Badge variant="outline" className="mt-2">
                NISN: {siswa.nisn}
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-center">
            Profil lengkap siswa dengan informasi personal dan akademik
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informasi Personal */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Personal
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Jenis Kelamin:</span>
                <Badge variant={siswa.jenis_kelamin === 'Laki-laki' ? 'default' : 'secondary'}>
                  {siswa.jenis_kelamin}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tanggal Lahir:</span>
                <span className="font-medium">{formatDate(siswa.tanggal_lahir)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Umur:</span>
                <span className="font-medium">{calculateAge(siswa.tanggal_lahir)} tahun</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tempat Lahir:</span>
                <span className="font-medium">{siswa.tempat_lahir}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-600">Alamat:</span>
                <span className="font-medium text-sm">{siswa.alamat}</span>
              </div>
              {siswa.nomor_telepon && (
                <div className="flex justify-between">
                  <span className="text-gray-600">No. Telepon:</span>
                  <span className="font-medium">{siswa.nomor_telepon}</span>
                </div>
              )}
            </div>
          </div>

          {/* Informasi Akademik */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Informasi Akademik
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Kelas:</span>
                {siswa.kelas ? (
                  <Badge variant="outline">{siswa.kelas.nama_kelas}</Badge>
                ) : (
                  <span className="text-gray-400">Belum ditentukan</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tahun Masuk:</span>
                <span className="font-medium">{siswa.tahun_masuk}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Wali Kelas:</span>
                <span className="font-medium">{siswa.guru_wali?.nama_lengkap || 'Belum ditentukan'}</span>
              </div>
            </div>
          </div>

          {/* Informasi Orang Tua */}
          <div className="bg-green-50 rounded-lg p-6 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Informasi Orang Tua
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Nama Orang Tua:</span>
                <span className="font-medium">{siswa.nama_orang_tua}</span>
              </div>
              {siswa.nomor_telepon_orang_tua && (
                <div className="flex justify-between">
                  <span className="text-gray-600">No. Telepon:</span>
                  <span className="font-medium">{siswa.nomor_telepon_orang_tua}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilSiswaPopup;
