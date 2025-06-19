
// Helper function to process nilai data
export const processNilaiData = (nilaiData: any[]) => {
  const grouped = nilaiData.reduce((acc, curr) => {
    const key = curr.id_siswa;
    if (!acc[key]) {
      acc[key] = {
        nama_siswa: curr.siswa.nama_lengkap,
        nisn: curr.siswa.nisn,
        kelas: curr.siswa.kelas?.nama_kelas || '',
        nilai: []
      };
    }
    acc[key].nilai.push(curr.skor);
    return acc;
  }, {});

  return Object.values(grouped).map((student: any, index) => {
    const nilai = student.nilai;
    const rataRata = nilai.length > 0 ? nilai.reduce((a: number, b: number) => a + b, 0) / nilai.length : 0;
    const tertinggi = nilai.length > 0 ? Math.max(...nilai) : 0;
    const terendah = nilai.length > 0 ? Math.min(...nilai) : 0;

    return {
      nama_siswa: student.nama_siswa,
      nisn: student.nisn,
      kelas: student.kelas,
      rata_rata_nilai: Math.round(rataRata * 100) / 100,
      nilai_tertinggi: tertinggi,
      nilai_terendah: terendah,
      jumlah_tugas: nilai.length,
      tugas_selesai: nilai.length,
      ranking: index + 1
    };
  }).sort((a, b) => b.rata_rata_nilai - a.rata_rata_nilai).map((item, index) => ({
    ...item,
    ranking: index + 1
  }));
};
