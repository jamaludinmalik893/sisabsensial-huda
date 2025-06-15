
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

interface ExportButtonsProps {
  data: object[];
  fileName: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ data, fileName }) => {
  // Export to Excel (CSV) using xlsx
  const exportToExcel = () => {
    if (!data.length) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, fileName + ".xlsx");
  };

  // Export to PDF using jsPDF
  const exportToPDF = () => {
    if (!data.length) return;
    const doc = new jsPDF();
    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers.map(header => String((row as any)[header] ?? ""))
    );
    // Simple table output
    doc.text(fileName, 10, 10);
    let y = 20;
    doc.setFontSize(10);
    // Headers
    doc.text(headers.join(" | "), 10, y);
    y += 8;
    rows.forEach(row => {
      doc.text(row.join(" | "), 10, y);
      y += 8;
      if (y > 270) {
        doc.addPage(); y = 10;
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
