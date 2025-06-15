
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
 * Tambahan: custom columns pada export, jika props.columns disediakan.
 * Versi terbaru: Print PDF sertakan info mapel dan kelas di atas tabel.
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
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, fileName + ".xlsx");
  };

  // Export to PDF (tabel rekap)
  const exportToPDF = () => {
    if (!data.length) return;
    const doc = new jsPDF({ orientation: "landscape" });
    const marginLeft = 10;
    let positionY = 12;

    doc.setFontSize(14);
    doc.text(fileName.replaceAll("_", " "), marginLeft, positionY);

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

    // PDF table header
    const headers = columns ?? Object.keys(data[0]);
    const rows = (data as any[]).map((row) => headers.map((h) => String(row[h] ?? "")));

    // Draw header
    doc.setFontSize(10);
    let currentX = marginLeft;
    headers.forEach((header) => {
      doc.text(header, currentX, positionY);
      currentX += 28;
    });

    // Draw rows data
    let rowY = positionY + 7;
    rows.forEach((row) => {
      let rowX = marginLeft;
      row.forEach((col) => {
        doc.text(col, rowX, rowY);
        rowX += 28;
      });
      rowY += 7;
      // max y: new page jika lebih dari 190  
      if (rowY > 190) {
        doc.addPage();
        rowY = 20;
        let headerX = marginLeft;
        headers.forEach((header) => {
          doc.text(header, headerX, rowY);
          headerX += 28;
        });
        rowY += 7;
      }
    });

    doc.save(fileName + ".pdf");
  };

  return (
    <div className="flex gap-2 mb-4">
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
