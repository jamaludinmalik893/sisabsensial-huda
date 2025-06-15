
import React from "react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Nilai } from "./NilaiOverviewTable";

interface StudentCellProps {
  siswa: Nilai["siswa"];
  onClickProfil: (siswa: Nilai["siswa"]) => void;
}

const StudentCell: React.FC<StudentCellProps> = ({ siswa, onClickProfil }) => (
  <div className="flex items-center gap-2">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onClickProfil(siswa)}
      className="p-1 h-6 w-6"
    >
      <User className="h-3 w-3" />
    </Button>
    <button
      onClick={() => onClickProfil(siswa)}
      className="text-left hover:text-blue-600 hover:underline transition-colors"
    >
      <div className="text-sm font-medium">{siswa.nama_lengkap}</div>
    </button>
  </div>
);

export default StudentCell;

