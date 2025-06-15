
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Nilai } from "./NilaiOverviewTable";

// Util: ambil inisial dari nama
function getInitials(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface StudentAvatarCellProps {
  siswa: Nilai["siswa"];
}

const StudentAvatarCell: React.FC<StudentAvatarCellProps> = ({ siswa }) => {
  return (
    <Avatar className="h-9 w-9 ml-2 ring-2 ring-blue-200">
      {siswa.foto_url ? (
        <AvatarImage src={siswa.foto_url} alt={siswa.nama_lengkap} />
      ) : (
        <AvatarFallback>
          {getInitials(siswa.nama_lengkap)}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default StudentAvatarCell;
