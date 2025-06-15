
import React from "react";
import { Badge } from "@/components/ui/badge";
import StudentCell from "./StudentCell";
import { TableRow, TableCell } from "@/components/ui/table";
import { Nilai } from "./NilaiOverviewTable";

interface NilaiTableRowProps {
  studentData: {
    siswa: Nilai["siswa"];
    grades: {
      [taskKey: string]: {
        skor: number;
        tanggal: string;
        catatan?: string;
        id_nilai: string;
        judul_tugas: string;
      };
    };
    average: number;
  };
  idx: number;
  taskList: { name: string; date: string }[];
  openEditDialog: (nilaiId: string, skor: number, catatan: string, siswaName: string, judulTugas: string) => void;
  getScoreColor: (skor: number) => string;
  handleSiswaClick: (siswa: Nilai["siswa"]) => void;
}

const NilaiTableRow: React.FC<NilaiTableRowProps> = ({
  studentData,
  idx,
  taskList,
  openEditDialog,
  getScoreColor,
  handleSiswaClick,
}) => (
  <TableRow key={studentData.siswa.id_siswa} className="hover:bg-gray-50 group">
    {/* No Absen pindah ke paling kiri */}
    <TableCell className="p-2 text-center align-middle">
      {idx + 1}
    </TableCell>
    {/* Nama Siswa (with avatar and clickable for popup) */}
    <TableCell className="p-2 align-middle">
      <StudentCell
        siswa={studentData.siswa}
        onClickProfil={handleSiswaClick}
      />
    </TableCell>
    {/* Rekapitulasi (average) */}
    <TableCell className="p-2 text-center align-middle">
      {studentData.average > 0 ? (
        <Badge
          variant="outline"
          className={`text-xs font-semibold ${getScoreColor(studentData.average)}`}
        >
          {studentData.average}
        </Badge>
      ) : (
        <span className="text-gray-400 text-xs">-</span>
      )}
    </TableCell>
    {/* Task/score columns */}
    {taskList.map((task) => {
      const grade = studentData.grades[task.name];
      return (
        <TableCell key={task.name} className="text-center p-2 align-middle">
          {grade !== undefined ? (
            <div
              onDoubleClick={() =>
                openEditDialog(
                  grade.id_nilai,
                  grade.skor,
                  grade.catatan ?? "",
                  studentData.siswa.nama_lengkap,
                  grade.judul_tugas
                )
              }
              className="inline-block cursor-pointer group relative"
              title="Double klik untuk edit nilai & catatan"
            >
              <Badge className={`text-xs ${getScoreColor(grade.skor)} relative`}>
                {grade.skor}
                {grade.catatan && (
                  <span className="absolute top-[-3px] right-[-3px]">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500 border-2 border-white shadow" />
                  </span>
                )}
              </Badge>
            </div>
          ) : (
            <span className="text-gray-400 text-xs">-</span>
          )}
        </TableCell>
      );
    })}
  </TableRow>
);

export default NilaiTableRow;

