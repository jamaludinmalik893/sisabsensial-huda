
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { Nilai, Siswa, MataPelajaran, Kelas } from '@/types/nilai';
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

  // Perbarui query loadNilai agar hanya bergantung pada tabel nilai
  // dan filter berdasarkan mapel yang diajar guru login
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
          kelas(
            id_kelas,
            nama_kelas
          ),
          guru_wali:guru(nama_lengkap)
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
    return data || [];
  };

  const loadSiswaByKelas = async (kelasId: string) => {
    // Query Siswa, pastikan select field sudah lengkap
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
          nama_lengkap
        )
      `)
      .eq('id_kelas', kelasId)
      .order('nama_lengkap');

    if (error) throw error;
    // LOG sebelum return
    console.log("[DEBUG useNilaiQueries.ts] Siswa fetch raw result:", data);

    return data || [];
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
