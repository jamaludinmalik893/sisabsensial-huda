import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Users, GraduationCap, Filter, Phone } from 'lucide-react';
import ProfilSiswaPopup from './ProfilSiswaPopup';
import ProfilSiswaStats from "./profil-siswa/ProfilSiswaStats";
import ProfilSiswaFilter from "./profil-siswa/ProfilSiswaFilter";
import ProfilSiswaTable from "./profil-siswa/ProfilSiswaTable";

interface ProfilSiswaPageProps {
  userSession: UserSession;
}

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
  kelas: {
    nama_kelas: string;
  };
  guru_wali: {
    nama_lengkap: string;
  };
}

interface Kelas {
  id_kelas: string;
  nama_kelas: string;
}

const ProfilSiswaPage: React.FC<ProfilSiswaPageProps> = ({ userSession }) => {
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [isProfilOpen, setIsProfilOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [userSession]);

  useEffect(() => {
    loadSiswa();
  }, [filterKelas, searchTerm]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSiswa(),
        loadKelas()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSiswa = async () => {
    try {
      let query = supabase
        .from('siswa')
        .select(`
          id_siswa,
          nisn,
          nama_lengkap,
          jenis_kelamin,
          tanggal_lahir,
          tempat_lahir,
          alamat,
          nomor_telepon,
          nomor_telepon_siswa,
          nama_orang_tua,
          nomor_telepon_orang_tua,
          tahun_masuk,
          foto_url,
          kelas!inner(nama_kelas),
          guru_wali:guru!inner(nama_lengkap)
        `);

      if (filterKelas !== 'all') {
        query = query.eq('id_kelas', filterKelas);
      }

      if (searchTerm) {
        query = query.or(`nama_lengkap.ilike.%${searchTerm}%,nisn.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('nama_lengkap');

      if (error) throw error;
      setSiswaList(data || []);
    } catch (error) {
      console.error('Error loading siswa:', error);
    }
  };

  const loadKelas = async () => {
    try {
      const { data, error } = await supabase
        .from('kelas')
        .select('id_kelas, nama_kelas')
        .order('nama_kelas');

      if (error) throw error;
      setKelasList(data || []);
    } catch (error) {
      console.error('Error loading kelas:', error);
    }
  };

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

  const getStatistics = () => {
    return {
      total: siswaList.length,
      lakiLaki: siswaList.filter(s => s.jenis_kelamin === 'Laki-laki').length,
      perempuan: siswaList.filter(s => s.jenis_kelamin === 'Perempuan').length,
      tahunIni: siswaList.filter(s => s.tahun_masuk === new Date().getFullYear()).length
    };
  };

  const handleSiswaClick = (siswa: Siswa) => {
    setSelectedSiswa(siswa);
    setIsProfilOpen(true);
  };

  const stats = getStatistics();

  return (
    <div className="p-6 space-y-6">
      <ProfilSiswaStats stats={stats} />

      <ProfilSiswaFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterKelas={filterKelas}
        setFilterKelas={setFilterKelas}
        kelasList={kelasList}
      />

      <ProfilSiswaTable
        siswaList={siswaList}
        loading={loading}
        calculateAge={calculateAge}
        handleSiswaClick={handleSiswaClick}
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

export default ProfilSiswaPage;
