
import React from "react";
import { Nilai } from "./NilaiOverviewTable";
import StudentAvatarCell from "./StudentAvatarCell";

interface StudentCellProps {
  siswa: Nilai["siswa"];
  onClickProfil: (siswa: Nilai["siswa"]) => void;
}

const StudentCell: React.FC<StudentCellProps> = ({ siswa, onClickProfil }) => (
  <div className="flex items-center gap-3">
    <div
      className="cursor-pointer"
      onClick={() => onClickProfil(siswa)}
      title="Lihat profil siswa"
    >
      <StudentAvatarCell siswa={siswa} />
    </div>
    <div className="flex flex-col justify-center">
      <button
        type="button"
        onClick={() => onClickProfil(siswa)}
        className="text-left hover:text-blue-600 hover:underline transition-colors"
      >
        <div className="text-sm font-medium">{siswa.nama_lengkap}</div>
      </button>
      <div className="text-xs text-gray-500">{siswa.nisn}</div>
    </div>
  </div>
);

export default StudentCell;

