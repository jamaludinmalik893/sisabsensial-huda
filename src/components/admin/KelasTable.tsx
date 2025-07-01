
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, User } from 'lucide-react';

interface Kelas {
  id_kelas: string;
  nama_kelas: string;
  logo_url?: string;
  wali_kelas?: {
    nama_lengkap: string;
    nip: string;
  };
}

interface KelasTableProps {
  kelasList: Kelas[];
  onEdit: (kelas: Kelas) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

const KelasTable: React.FC<KelasTableProps> = ({
  kelasList,
  onEdit,
  onDelete,
  loading
}) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Memuat data kelas...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Nama Kelas</TableHead>  
            <TableHead>Wali Kelas</TableHead>
            <TableHead>NIP Wali Kelas</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {kelasList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                Belum ada data kelas
              </TableCell>
            </TableRow>
          ) : (
            kelasList.map((kelas, index) => (
              <TableRow key={kelas.id_kelas}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{kelas.nama_kelas}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    {kelas.wali_kelas?.nama_lengkap || 'Belum ditentukan'}
                  </div>
                </TableCell>
                <TableCell>
                  {kelas.wali_kelas?.nip || '-'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(kelas)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(kelas.id_kelas)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default KelasTable;
