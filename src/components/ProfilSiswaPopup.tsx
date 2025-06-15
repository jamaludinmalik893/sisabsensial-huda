
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={siswa.foto_url} alt={siswa.nama_lengkap} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
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
          {/* Informasi Dasar */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                Informasi Dasar
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-xs font-medium text-gray-500">Jenis Kelamin</label>
                  <div className="mt-1">
                    <Badge variant={siswa.jenis_kelamin === 'Laki-laki' ? 'default' : 'secondary'} className="text-xs">
                      {siswa.jenis_kelamin}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Umur</label>
                  <p className="mt-1 font-medium">{calculateAge(siswa.tanggal_lahir)} tahun</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500">Tanggal Lahir</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-xs">{formatDate(siswa.tanggal_lahir)}</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500">Tempat Lahir</label>
                  <div className="mt-1 flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="text-xs">{siswa.tempat_lahir}</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500">Alamat</label>
                  <p className="mt-1 text-xs">{siswa.alamat}</p>
                </div>
                {siswa.nomor_telepon && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-500">Nomor Telepon</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span className="text-xs">{siswa.nomor_telepon}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informasi Akademik */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4" />
                Informasi Akademik
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-xs font-medium text-gray-500">Kelas</label>
                  <div className="mt-1">
                    {siswa.kelas ? (
                      <Badge variant="outline" className="text-xs">{siswa.kelas.nama_kelas}</Badge>
                    ) : (
                      <span className="text-gray-400 text-xs">Belum ditentukan</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Tahun Masuk</label>
                  <p className="mt-1 font-medium">{siswa.tahun_masuk}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500">Wali Kelas</label>
                  <p className="mt-1 text-xs">{siswa.guru_wali?.nama_lengkap || 'Belum ditentukan'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informasi Orang Tua */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Informasi Orang Tua
              </h3>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <label className="text-xs font-medium text-gray-500">Nama Orang Tua</label>
                  <p className="mt-1 font-medium">{siswa.nama_orang_tua}</p>
                </div>
                {siswa.nomor_telepon_orang_tua && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Nomor Telepon Orang Tua</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span className="text-xs">{siswa.nomor_telepon_orang_tua}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilSiswaPopup;
