import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { Nilai, MataPelajaran, Kelas } from '@/types/nilai';
import type { Siswa as SiswaIndex } from '@/types/index';
import { SemesterType } from '@/types/semester';

export function useNilaiQueries(userSession: UserSession) {
  const loadMataPelajaranByGuru = async (): Promise<MataPelajaran[]> => {
    const { data, error } = await supabase
      .from('guru_mata_pelajaran')
      .select(`
        mata_pelajaran!inner(
          id_mapel,
          nama_mapel
        )
      `)
      .eq('id_guru', userSession.guru.id_guru);

    if (error) throw error;
    
    return data?.map(item => item.mata_pelajaran).flat() || [];
  };

  const loadKelas = async (): Promise<Kelas[]> => {
    const { data, error } = await supabase
      .from('kelas')
      .select('id_kelas, nama_kelas')
      .order('nama_kelas');

    if (error) throw error;
    return data || [];
  };

  const loadNilai = async (semesterFilter?: string): Promise<Nilai[]> => {
    console.log('DEBUG loadNilai: userSession.guru.id_guru:', userSession.guru.id_guru);

    // Dapatkan semua id_mapel yang diampu guru (tanpa join jurnal)
    const mapelGuruRes = await supabase
      .from('guru_mata_pelajaran')
      .select('id_mapel')
      .eq('id_guru', userSession.guru.id_guru);

    if (mapelGuruRes.error) throw mapelGuruRes.error;

    const mapelIds = (mapelGuruRes.data || []).map((item:any) => item.id_mapel);
    if (!mapelIds.length) {
      console.log("DEBUG loadNilai: Guru ini tidak mengampu mapel apapun.");
      return [];
    }

    let nilaiQuery = supabase
      .from('nilai')
      .select(`
        id_nilai,
        skor,
        jenis_nilai,
        catatan,
        judul_tugas,
        tanggal_tugas_dibuat,
        tanggal_nilai,
        semester,
        siswa!inner(
          id_siswa,
          nama_lengkap,
          nisn,
          jenis_kelamin,
          tanggal_lahir,
          tempat_lahir,
          alamat,
          nomor_telepon,
          nomor_telepon_orang_tua,
          nomor_telepon_siswa,
          nama_orang_tua,
          id_kelas,
          id_guru_wali,
          tahun_masuk,
          foto_url,
          created_at,
          updated_at,
          kelas(
            id_kelas,
            nama_kelas
          ),
          guru_wali:guru(
            id_guru,
            nip,
            nama_lengkap,
            email,
            status
          )
        ),
        mata_pelajaran!inner(
          id_mapel,
          nama_mapel
        )
      `)
      .in('id_mapel', mapelIds);

    // Add semester filter if provided
    if (semesterFilter && semesterFilter !== 'all') {
      const [semester] = semesterFilter.split('-');
      nilaiQuery = nilaiQuery.eq('semester', semester as SemesterType);
    }

    const { data, error } = await nilaiQuery.order('tanggal_nilai', { ascending: false });

    console.log("DEBUG loadNilai: hasil Supabase query nilai:", { data, error });

    if (error) throw error;
    
    // Transform the data to match expected types
    const transformedData = (data || []).map(item => ({
      ...item,
      siswa: item.siswa ? {
        ...item.siswa,
        created_at: item.siswa.created_at || new Date().toISOString(),
        updated_at: item.siswa.updated_at || new Date().toISOString(),
        guru_wali: item.siswa.guru_wali ? {
          id_guru: item.siswa.guru_wali.id_guru || '',
          nip: item.siswa.guru_wali.nip || '',
          nama_lengkap: item.siswa.guru_wali.nama_lengkap || '',
          email: item.siswa.guru_wali.email || '',
          status: item.siswa.guru_wali.status || 'guru',
          roles: []
        } : undefined
      } : undefined
    }));
    
    return transformedData as Nilai[];
  };

  const loadSiswaByKelas = async (kelasId: string): Promise<SiswaIndex[]> => {
    const { data, error } = await supabase
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
        nomor_telepon_orang_tua,
        nomor_telepon_siswa,
        nama_orang_tua,
        id_kelas,
        id_guru_wali,
        tahun_masuk,
        foto_url,
        created_at,
        updated_at,
        kelas (
          id_kelas,
          nama_kelas
        ),
        guru_wali:guru (
          id_guru,
          nip,
          nama_lengkap,
          email,
          status
        )
      `)
      .eq('id_kelas', kelasId)
      .order('nama_lengkap');

    if (error) throw error;
    
    console.log("[DEBUG useNilaiQueries.ts] Siswa fetch raw result:", data);

    // Transform to match SiswaIndex type
    const transformedData = (data || []).map(siswa => ({
      ...siswa,
      jenis_kelamin: siswa.jenis_kelamin as 'Laki-laki' | 'Perempuan',
      created_at: siswa.created_at || new Date().toISOString(),
      updated_at: siswa.updated_at || new Date().toISOString(),
      guru_wali: siswa.guru_wali ? {
        id_guru: siswa.guru_wali.id_guru || '',
        nip: siswa.guru_wali.nip || '',
        nama_lengkap: siswa.guru_wali.nama_lengkap || '',
        email: siswa.guru_wali.email || '',
        status: siswa.guru_wali.status || 'guru',
        roles: [] as ('admin' | 'guru' | 'wali_kelas')[]
      } : undefined
    }));

    return transformedData as SiswaIndex[];
  };

  const updateNilai = async (nilaiId: string, newSkor: number, newCatatan?: string): Promise<boolean> => {
    const { error } = await supabase
      .from('nilai')
      .update({ 
        skor: newSkor,
        catatan: newCatatan,
        updated_at: new Date().toISOString()
      })
      .eq('id_nilai', nilaiId);

    if (error) throw error;
    return true;
  };

  const deleteNilai = async (nilaiId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('nilai')
      .delete()
      .eq('id_nilai', nilaiId);
    if (error) throw error;
    return true;
  };

  return {
    loadMataPelajaranByGuru,
    loadKelas,
    loadNilai,
    loadSiswaByKelas,
    updateNilai,
    deleteNilai
  };
}
