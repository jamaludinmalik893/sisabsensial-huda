import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, ArrowUpAZ, ArrowDownAZ } from 'lucide-react';
import { Guru, UserSession } from '@/types';
interface GuruWithRoles extends Guru {
  kelas_wali?: {
    nama_kelas: string;
  };
  roles?: ('admin' | 'guru' | 'wali_kelas')[];
}
interface GuruTableProps {
  guruList: GuruWithRoles[];
  onEdit: (guru: GuruWithRoles) => void;
  onDelete: (id: string) => void;
  userSession: UserSession;
}
const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'admin':
      return 'default';
    case 'wali_kelas':
      return 'secondary';
    default:
      return 'outline';
  }
};
const GuruTable: React.FC<GuruTableProps> = ({
  guruList,
  onEdit,
  onDelete,
  userSession
}) => {
  const [sortAscending, setSortAscending] = useState(true);
  const sortedGuruList = useMemo(() => {
    return [...guruList].sort((a, b) => {
      const comparison = a.nama_lengkap.localeCompare(b.nama_lengkap, 'id', {
        sensitivity: 'base'
      });
      return sortAscending ? comparison : -comparison;
    });
  }, [guruList, sortAscending]);
  const toggleSort = () => {
    setSortAscending(!sortAscending);
  };
  return <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <span>Nama & NIP</span>
                    <Button variant="ghost" size="sm" onClick={toggleSort} className="h-6 w-6 p-0">
                      {sortAscending ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />}
                    </Button>
                  </div>
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Peran/Status</TableHead>
                <TableHead>Wali Kelas</TableHead>
                <TableHead>No. Telepon</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedGuruList.map(guru => <TableRow key={guru.id_guru}>
                  <TableCell className="mx-px">
                    <div className="space-y-1">
                      <div className="font-medium">{guru.nama_lengkap}</div>
                      <div className="text-sm text-gray-500 font-mono">{guru.nip}</div>
                    </div>
                  </TableCell>
                  <TableCell>{guru.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {guru.roles && guru.roles.length > 0 ? guru.roles.map(role => <Badge key={role} variant={getRoleBadgeVariant(role)} className="text-xs">
                            {role === 'admin' ? 'Admin' : role === 'wali_kelas' ? 'Wali Kelas' : 'Guru'}
                          </Badge>) : <Badge variant="secondary">Guru</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {guru.kelas_wali ? <Badge variant="outline">{guru.kelas_wali.nama_kelas}</Badge> : <span className="text-gray-400">-</span>}
                  </TableCell>
                  <TableCell>{guru.nomor_telepon || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => onEdit(guru)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onDelete(guru.id_guru)} disabled={guru.id_guru === userSession.guru.id_guru}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>)}
            </TableBody>
          </Table>;
};
export default GuruTable;