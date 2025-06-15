
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GraduationCap, Users, User } from 'lucide-react';

interface Siswa {
  id_siswa: string;
  nisn: string;
  nama_lengkap: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  tempat_lahir: string;
  alamat: string;
  nomor_telepon?: string;
  nomor_telepon_siswa?: string;
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

  // Prioritaskan nomor_telepon_siswa jika ada, jika tidak ambil nomor_telepon
  const phone = siswa.nomor_telepon_siswa || siswa.nomor_telepon || "-";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-3">
            <Avatar className="h-36 w-36 mb-2">
              <AvatarImage src={siswa.foto_url} alt={siswa.nama_lengkap} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-3xl">
                {getInitials(siswa.nama_lengkap)}
              </AvatarFallback>
            </Avatar>
            <DialogTitle className="text-xl font-bold leading-tight">{siswa.nama_lengkap}</DialogTitle>
            <Badge variant="outline" className="mt-1">
              NISN: {siswa.nisn}
            </Badge>
            <DialogDescription className="text-center text-sm mt-1 mb-2">
              Profil lengkap siswa dengan informasi personal dan akademik
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Informasi Personal */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Informasi Personal
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Jenis Kelamin:</span>
                <Badge variant={siswa.jenis_kelamin === 'Laki-laki' ? 'default' : 'secondary'} className="text-xs">
                  {siswa.jenis_kelamin}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tanggal Lahir:</span>
                <span className="font-medium">{formatDate(siswa.tanggal_lahir)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Umur:</span>
                <span className="font-medium">{calculateAge(siswa.tanggal_lahir)} tahun</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tempat Lahir:</span>
                <span className="font-medium">{siswa.tempat_lahir}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-600">Alamat:</span>
                <span className="font-medium text-xs leading-relaxed">{siswa.alamat}</span>
              </div>
              {phone && phone !== "-" && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">No. Telepon:</span>
                  <span className="font-medium">{phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Informasi Akademik */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Informasi Akademik
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Kelas:</span>
                {siswa.kelas ? (
                  <Badge variant="outline" className="text-xs">{siswa.kelas.nama_kelas}</Badge>
                ) : (
                  <span className="text-gray-400">Belum ditentukan</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tahun Masuk:</span>
                <span className="font-medium">{siswa.tahun_masuk}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Wali Kelas:</span>
                <span className="font-medium text-xs">{siswa.guru_wali?.nama_lengkap || 'Belum ditentukan'}</span>
              </div>
            </div>
          </div>

          {/* Informasi Orang Tua */}
          <div className="bg-green-50 rounded-lg p-4 md:col-span-2">
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Informasi Orang Tua
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Nama Orang Tua:</span>
                <span className="font-medium">{siswa.nama_orang_tua}</span>
              </div>
              {siswa.nomor_telepon_orang_tua && (
                <div className="flex justify-between items-center">
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
