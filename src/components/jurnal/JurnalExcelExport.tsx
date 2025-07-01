
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface JurnalData {
  id_jurnal: string;
  tanggal_pelajaran: string;
  jam_pelajaran: number;
  waktu_mulai: string;
  waktu_selesai: string;
  judul_materi: string;
  materi_diajarkan: string;
  mata_pelajaran: {
    nama_mapel: string;
  };
  kelas: {
    nama_kelas: string;
  };
  guru: {
    nama_lengkap: string;
    nip: string;
  };
}

interface JurnalExcelExportProps {
  jurnalData: JurnalData[];
  selectedMapel?: string;
  selectedKelas?: string;
  mapelList?: Array<{id_mapel: string; nama_mapel: string}>;
  kelasList?: Array<{id_kelas: string; nama_kelas: string}>;
}

const JurnalExcelExport: React.FC<JurnalExcelExportProps> = ({
  jurnalData,
  selectedMapel = 'all',
  selectedKelas = 'all',
  mapelList = [],
  kelasList = []
}) => {
  const exportToExcel = () => {
    const worksheetData = [];
    
    // Header
    worksheetData.push(['JURNAL PEMBELAJARAN HARIAN']);
    worksheetData.push([]);
    
    const mapelName = selectedMapel === 'all' ? 'Semua Mata Pelajaran' : mapelList.find(m => m.id_mapel === selectedMapel)?.nama_mapel;
    const kelasName = selectedKelas === 'all' ? 'Semua Kelas' : kelasList.find(k => k.id_kelas === selectedKelas)?.nama_kelas;
    
    worksheetData.push([`Mata Pelajaran: ${mapelName}`]);
    worksheetData.push([`Kelas: ${kelasName}`]);
    worksheetData.push([]);
    
    // Table header
    worksheetData.push([
      'No',
      'Tanggal',
      'Hari',
      'JP',
      'Waktu',
      'Mata Pelajaran',
      'Kelas',
      'Guru',
      'NIP',
      'Judul Materi',
      'Materi yang Diajarkan'
    ]);
    
    // Data rows
    const sortedJurnal = [...jurnalData].sort((a, b) => {
      const dateA = new Date(a.tanggal_pelajaran);
      const dateB = new Date(b.tanggal_pelajaran);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      return a.jam_pelajaran - b.jam_pelajaran;
    });
    
    sortedJurnal.forEach((jurnal, index) => {
      const tanggal = new Date(jurnal.tanggal_pelajaran);
      const hari = tanggal.toLocaleDateString('id-ID', { weekday: 'long' });
      const tanggalStr = tanggal.toLocaleDateString('id-ID');
      const waktu = `${jurnal.waktu_mulai} - ${jurnal.waktu_selesai}`;
      
      worksheetData.push([
        index + 1,
        tanggalStr,
        hari,
        jurnal.jam_pelajaran,
        waktu,
        jurnal.mata_pelajaran.nama_mapel,
        jurnal.kelas.nama_kelas,
        jurnal.guru.nama_lengkap,
        jurnal.guru.nip,
        jurnal.judul_materi,
        jurnal.materi_diajarkan
      ]);
    });
    
    // Summary
    worksheetData.push([]);
    worksheetData.push([`Total Jurnal: ${jurnalData.length}`]);
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    const columnWidths = [
      { wch: 5 },  // No
      { wch: 12 }, // Tanggal
      { wch: 10 }, // Hari
      { wch: 5 },  // JP
      { wch: 15 }, // Waktu
      { wch: 20 }, // Mata Pelajaran
      { wch: 12 }, // Kelas
      { wch: 25 }, // Guru
      { wch: 20 }, // NIP
      { wch: 30 }, // Judul Materi
      { wch: 50 }  // Materi Diajarkan
    ];
    
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Jurnal Pembelajaran');
    
    XLSX.writeFile(workbook, `Jurnal_Pembelajaran_${kelasName}_${mapelName}.xlsx`);
  };

  return (
    <Button onClick={exportToExcel} variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Export Jurnal
    </Button>
  );
};

export default JurnalExcelExport;
