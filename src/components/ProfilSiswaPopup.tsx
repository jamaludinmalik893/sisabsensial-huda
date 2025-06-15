
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
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-3">
            <Avatar className="h-48 w-48">
              <AvatarImage src={siswa.foto_url} alt={siswa.nama_lengkap} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-3xl">
                {getInitials(siswa.nama_lengkap)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl font-bold">{siswa.nama_lengkap}</DialogTitle>
              <Badge variant="outline" className="mt-2">
                NISN: {siswa.nisn}
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-center">
            Profil lengkap siswa dengan informasi personal dan akademik
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informasi dalam format list */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              {/* Personal Info */}
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Jenis Kelamin</span>
                </div>
                <Badge variant={siswa.jenis_kelamin === 'Laki-laki' ? 'default' : 'secondary'} className="text-xs">
                  {siswa.jenis_kelamin}
                </Badge>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Tanggal Lahir</span>
                </div>
                <span className="text-sm">{formatDate(siswa.tanggal_lahir)} ({calculateAge(siswa.tanggal_lahir)} tahun)</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Tempat Lahir</span>
                </div>
                <span className="text-sm">{siswa.tempat_lahir}</span>
              </div>

              <div className="flex items-start justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <span className="text-sm font-medium">Alamat</span>
                </div>
                <span className="text-sm text-right max-w-xs">{siswa.alamat}</span>
              </div>

              {siswa.nomor_telepon && (
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">No. Telepon</span>
                  </div>
                  <span className="text-sm">{siswa.nomor_telepon}</span>
                </div>
              )}

              {/* Academic Info */}
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Kelas</span>
                </div>
                {siswa.kelas ? (
                  <Badge variant="outline" className="text-xs">{siswa.kelas.nama_kelas}</Badge>
                ) : (
                  <span className="text-gray-400 text-sm">Belum ditentukan</span>
                )}
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Tahun Masuk</span>
                </div>
                <span className="text-sm font-medium">{siswa.tahun_masuk}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Wali Kelas</span>
                </div>
                <span className="text-sm">{siswa.guru_wali?.nama_lengkap || 'Belum ditentukan'}</span>
              </div>

              {/* Parent Info */}
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Nama Orang Tua</span>
                </div>
                <span className="text-sm font-medium">{siswa.nama_orang_tua}</span>
              </div>

              {siswa.nomor_telepon_orang_tua && (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">No. Telepon Orang Tua</span>
                  </div>
                  <span className="text-sm">{siswa.nomor_telepon_orang_tua}</span>
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
