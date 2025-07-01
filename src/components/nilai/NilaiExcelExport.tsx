
import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Nilai, Siswa, MataPelajaran, Kelas } from '@/types/nilai';

interface NilaiExcelExportProps {
  nilai: Nilai[];
  mapelList: MataPelajaran[];
  kelasList: Kelas[];
  selectedMapel: string;
  selectedKelas: string;
}

const NilaiExcelExport: React.FC<NilaiExcelExportProps> = ({
  nilai,
  mapelList,
  kelasList,
  selectedMapel,
  selectedKelas
}) => {
  const exportData = useMemo(() => {
    // Group nilai by siswa
    const siswaMap: Record<string, {
      siswa: Siswa;
      tugas: Record<string, number>;
      jumlahNilai: number;
      totalSkor: number;
    }> = {};

    // Get all unique tasks
    const allTasks = new Set<string>();

    nilai.forEach(n => {
      if (!n.siswa) return;
      
      const siswaId = n.siswa.id_siswa;
      const taskKey = `${n.judul_tugas} (${new Date(n.tanggal_tugas_dibuat).toLocaleDateString('id-ID')})`;
      
      allTasks.add(taskKey);
      
      if (!siswaMap[siswaId]) {
        siswaMap[siswaId] = {
          siswa: n.siswa,
          tugas: {},
          jumlahNilai: 0,
          totalSkor: 0
        };
      }
      
      siswaMap[siswaId].tugas[taskKey] = n.skor;
      siswaMap[siswaId].jumlahNilai++;
      siswaMap[siswaId].totalSkor += n.skor;
    });

    const sortedTasks = Array.from(allTasks).sort();
    const students = Object.values(siswaMap).sort((a, b) => a.siswa.nama_lengkap.localeCompare(b.siswa.nama_lengkap));

    return { students, tasks: sortedTasks };
  }, [nilai]);

  const exportToExcel = () => {
    const worksheetData = [];
    
    // Header rows
    worksheetData.push(['REKAP NILAI SISWA']);
    worksheetData.push([]);
    
    const mapelName = selectedMapel === 'all' ? 'Semua Mata Pelajaran' : mapelList.find(m => m.id_mapel === selectedMapel)?.nama_mapel;
    const kelasName = selectedKelas === 'all' ? 'Semua Kelas' : kelasList.find(k => k.id_kelas === selectedKelas)?.nama_kelas;
    
    worksheetData.push([`Mata Pelajaran: ${mapelName}`]);
    worksheetData.push([`Kelas: ${kelasName}`]);
    worksheetData.push([]);
    
    // Table header
    const headerRow = ['No', 'NISN', 'Nama Siswa', 'Kelas'];
    exportData.tasks.forEach(task => {
      headerRow.push(task);
    });
    headerRow.push('Jumlah Tugas', 'Total Skor', 'Rata-rata');
    worksheetData.push(headerRow);
    
    // Data rows
    exportData.students.forEach((student, index) => {
      const row = [
        index + 1,
        student.siswa.nisn,
        student.siswa.nama_lengkap,
        student.siswa.kelas?.nama_kelas || '-'
      ];
      
      exportData.tasks.forEach(task => {
        row.push(student.tugas[task] || '');
      });
      
      const rataRata = student.jumlahNilai > 0 ? (student.totalSkor / student.jumlahNilai).toFixed(2) : '0';
      row.push(student.jumlahNilai, student.totalSkor, rataRata);
      
      worksheetData.push(row);
    });
    
    // Summary row
    worksheetData.push([]);
    worksheetData.push([`Total Siswa: ${exportData.students.length}`]);
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    const columnWidths = [
      { wch: 5 },  // No
      { wch: 15 }, // NISN
      { wch: 25 }, // Nama
      { wch: 15 }, // Kelas
    ];
    
    exportData.tasks.forEach(() => {
      columnWidths.push({ wch: 12 }); // Task columns
    });
    
    columnWidths.push({ wch: 12 }, { wch: 12 }, { wch: 12 }); // Summary columns
    
    worksheet['!cols'] = columnWidths;
    
    // Style the header
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let row = 0; row <= range.e.r; row++) {
      for (let col = 0; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (worksheet[cellAddress]) {
          if (row === 5) { // Header row
            worksheet[cellAddress].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: 'E2E8F0' } },
              alignment: { horizontal: 'center' }
            };
          }
        }
      }
    }
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Nilai');
    
    XLSX.writeFile(workbook, `Rekap_Nilai_${kelasName}_${mapelName}.xlsx`);
  };

  return (
    <Button onClick={exportToExcel} size="sm" className="ml-2">
      <Download className="h-4 w-4 mr-2" />
      Export Excel
    </Button>
  );
};

export default NilaiExcelExport;
