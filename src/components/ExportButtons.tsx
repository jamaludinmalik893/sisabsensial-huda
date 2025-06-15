
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

interface ExportButtonsProps {
  data: object[];
  fileName: string;
  columns?: string[];
}

/**
 * ExportButtons
 * Tambahan: custom columns pada export, jika props.columns disediakan.
 */
const ExportButtons: React.FC<ExportButtonsProps> = ({ data, fileName, columns }) => {
  // Export to Excel (XLSX)
  const exportToExcel = () => {
    if (!data.length) return;
    let exportRows = data;
    if (columns) {
      // Urutkan kolom sesuai header jika columns disediakan
      exportRows = data.map(row => {
        const ordered: any = {};
        columns.forEach(c => { ordered[c] = (row as any)[c]; });
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
    // PDF table header
    const headers = columns ?? Object.keys(data[0]);
    // PDF max per page
    const rows = (data as any[]).map(row => headers.map(h => String(row[h] ?? "")));
    doc.setFontSize(12);
    doc.text(fileName, 10, 10);
    let y = 20;
    // Draw header
    doc.setFontSize(10);
    let x = 10;
    headers.forEach((header, i) => {
      doc.text(header, x, y);
      x += 30;
    });

    // Draw rows
    y += 7;
    rows.forEach(row => {
      x = 10;
      row.forEach(col => {
        doc.text(col, x, y);
        x += 30;
      });
      y += 7;
      if (y > 190) { doc.addPage(); y = 20; }
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
