
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

interface ExportButtonsProps {
  data: object[];
  fileName: string;
  columns?: string[];
  mapelName?: string;
  kelasName?: string;
}

/**
 * ExportButtons
 * Cetak/export format rekap tugas: No, Nama, semua tugas, rata-rata.
 * Menambahkan judul rekap sesuai filter di atas tabel (mapel & kelas),
 * dan mengatur lebar kolom agar sesuai (No pendek, Nama panjang, tugas normal).
 */
const ExportButtons: React.FC<ExportButtonsProps> = ({
  data,
  fileName,
  columns,
  mapelName,
  kelasName,
}) => {
  // Export to Excel (XLSX)
  const exportToExcel = () => {
    if (!data.length) return;
    let exportRows = data;
    if (columns) {
      exportRows = data.map((row) => {
        const ordered: any = {};
        columns.forEach((c) => {
          ordered[c] = (row as any)[c];
        });
        return ordered;
      });
    }
    const ws = XLSX.utils.json_to_sheet(exportRows);

    // Atur lebar kolom No (6), Nama (22), sisanya (14), rata2 (12)
    if (columns && ws['!cols'] === undefined) {
      ws['!cols'] = columns.map((col, idx) => {
        if (idx === 0) return { wch: 6 };
        if (idx === 1) return { wch: 22 };
        if (idx === columns.length - 1) return { wch: 12 };
        return { wch: 14 };
      });
    }

    // Sisipkan judul di atas header
    const title = "Rekapitulasi Nilai Siswa";
    let mapelInfo = mapelName ? `Mata Pelajaran: ${mapelName}` : "";
    let kelasInfo = kelasName ? `Kelas: ${kelasName}` : "";
    const startRow = [];
    startRow.push([title]);
    if (mapelInfo) startRow.push([mapelInfo]);
    if (kelasInfo) startRow.push([kelasInfo]);

    XLSX.utils.sheet_add_aoa(ws, startRow, { origin: 0 });
    // Geser header dan data setelah judul
    XLSX.utils.sheet_add_json(ws, exportRows, { origin: -1, skipHeader: false, header: columns });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, fileName + ".xlsx");
  };

  // Export to PDF (rekap per tugas)
  const exportToPDF = () => {
    if (!data.length) return;
    const doc = new jsPDF({ orientation: "landscape" });
    const marginLeft = 10;
    let positionY = 15;

    // Judul besar
    doc.setFontSize(15);
    doc.text("Rekapitulasi Nilai Siswa", marginLeft, positionY);
    positionY += 8;

    // Tambah info mapel & kelas jika ada
    doc.setFontSize(11);
    if (mapelName) {
      doc.text(`Mata Pelajaran: ${mapelName}`, marginLeft, positionY);
      positionY += 6;
    }
    if (kelasName) {
      doc.text(`Kelas: ${kelasName}`, marginLeft, positionY);
      positionY += 6;
    }
    if (mapelName || kelasName) positionY += 2;

    // Buat header kolom dan data
    const headers = columns ?? Object.keys(data[0]);
    const rows = (data as any[]).map((row) => headers.map((h) => String(row[h] ?? "")));

    // Set style dan posisi kolom dinamis: No(13), Nama(44), tugas(30), rata(20)
    const colWidths = headers.map((_, idx) => {
      if (idx === 0) return 13;
      if (idx === 1) return 44;
      if (idx === headers.length - 1) return 20;
      return 30;
    });

    doc.setFontSize(10);
    let currentX = marginLeft;
    headers.forEach((header, idx) => {
      const lines = header.split("\n");
      lines.forEach((line, lidx) => {
        doc.text(line, currentX, positionY + lidx * 4);
      });
      currentX += colWidths[idx];
    });

    // Draw rows data dengan lebar kolom sesuai
    let rowY = positionY + 10;
    rows.forEach((row) => {
      let rowX = marginLeft;
      row.forEach((val, idx) => {
        doc.text(String(val), rowX, rowY);
        rowX += colWidths[idx];
      });
      rowY += 7;
      // max y: new page jika lebih dari 190
      if (rowY > 190) {
        doc.addPage();
        rowY = 20;
        let headerX = marginLeft;
        headers.forEach((header, idx) => {
          const lines = header.split("\n");
          lines.forEach((line, lidx) => {
            doc.text(line, headerX, rowY + lidx * 4);
          });
          headerX += colWidths[idx];
        });
        rowY += 10;
      }
    });

    doc.save(fileName + ".pdf");
  };

  return (
    <div className="flex gap-2 justify-end">
      <Button onClick={exportToExcel} size="sm" variant="outline">
        <Download className="mr-1 h-4 w-4" />
        Excel
      </Button>
      <Button onClick={exportToPDF} size="sm" variant="outline">
        <FileText className="mr-1 h-4 w-4" />
        PDF
      </Button>
    </div>
  );
};

export default ExportButtons;
