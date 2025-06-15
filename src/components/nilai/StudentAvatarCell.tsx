
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
  siswa: {
    nama_lengkap: string;
    foto_url?: string;
  };
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

const StudentAvatarCell: React.FC<StudentAvatarCellProps> = ({
  siswa,
  onClick,
  size = "md"
}) => {
  let dim = "h-9 w-9";
  if (size === "sm") dim = "h-7 w-7";
  if (size === "lg") dim = "h-14 w-14";
  return (
    <Avatar
      className={`${dim} ring-2 ring-blue-200 cursor-pointer`}
      onClick={onClick}
      title="Lihat profil siswa"
    >
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
