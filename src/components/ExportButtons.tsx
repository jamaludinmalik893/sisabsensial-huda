
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
 * Untuk format rekap tugas: No, Nama, semua tugas, rata-rata.
 * Versi terbaru: kolom header sesuai props.columns (termasuk new line).
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
      // urutkan kolom sesuai columns yg diberikan
      exportRows = data.map((row) => {
        const ordered: any = {};
        columns.forEach((c) => {
          ordered[c] = (row as any)[c];
        });
        return ordered;
      });
    }
    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, fileName + ".xlsx");
  };

  // Export to PDF (rekap per tugas)
  const exportToPDF = () => {
    if (!data.length) return;
    const doc = new jsPDF({ orientation: "landscape" });
    const marginLeft = 10;
    let positionY = 12;

    doc.setFontSize(14);
    doc.text(fileName.replace(/_/g, " "), marginLeft, positionY);

    // Tambahkan info mapel & kelas jika ada
    doc.setFontSize(12);
    positionY += 9;
    if (mapelName) {
      doc.text("Mata Pelajaran: " + mapelName, marginLeft, positionY);
      positionY += 7;
    }
    if (kelasName) {
      doc.text("Kelas         : " + kelasName, marginLeft, positionY);
      positionY += 7;
    }
    if (mapelName || kelasName) positionY += 3;

    // Header format
    const headers = columns ?? Object.keys(data[0]);
    const rows = (data as any[]).map((row) => headers.map((h) => String(row[h] ?? "")));

    // Draw header (wrap jika ada \n)
    doc.setFontSize(10);
    let currentX = marginLeft;
    headers.forEach((header) => {
      const lines = header.split("\n");
      lines.forEach((line, idx) => {
        doc.text(line, currentX, positionY + idx * 4);
      });
      currentX += 36;
    });

    // Draw rows data
    let rowY = positionY + 10;
    rows.forEach((row) => {
      let rowX = marginLeft;
      row.forEach((col) => {
        doc.text(String(col), rowX, rowY);
        rowX += 36;
      });
      rowY += 7;
      // max y: new page jika lebih dari 190
      if (rowY > 190) {
        doc.addPage();
        rowY = 20;
        let headerX = marginLeft;
        headers.forEach((header) => {
          const lines = header.split("\n");
          lines.forEach((line, idx) => {
            doc.text(line, headerX, rowY + idx * 4);
          });
          headerX += 36;
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
