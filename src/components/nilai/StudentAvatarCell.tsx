
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
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
    id_siswa?: string;
    nama_lengkap: string;
    foto_url?: string;
  };
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  enableLink?: boolean;
}

const StudentAvatarCell: React.FC<StudentAvatarCellProps> = ({
  siswa,
  onClick,
  size = "md",
  enableLink = false
}) => {
  const dim = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-14 w-14" : "h-9 w-9";
  const navigate = useNavigate();

  const handleClick = () => {
    if (enableLink && siswa.id_siswa) {
      navigate(`/profil-siswa/${siswa.id_siswa}`);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <Avatar
      className={`${dim} ring-2 ring-blue-200 cursor-pointer`}
      onClick={handleClick}
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
