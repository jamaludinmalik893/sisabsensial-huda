import React from "react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Nilai } from "./NilaiOverviewTable";

interface StudentCellProps {
  siswa: Nilai["siswa"];
  onClickProfil: (siswa: Nilai["siswa"]) => void;
}

const StudentCell: React.FC<StudentCellProps> = ({ siswa, onClickProfil }) => (
  <div className="flex flex-col justify-center">
    <button
      onClick={() => onClickProfil(siswa)}
      className="text-left hover:text-blue-600 hover:underline transition-colors"
    >
      <div className="text-sm font-medium">{siswa.nama_lengkap}</div>
    </button>
    <div className="text-xs text-gray-500">{siswa.nisn}</div>
  </div>
);

export default StudentCell;
