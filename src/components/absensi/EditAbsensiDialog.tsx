
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface EditAbsensiDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingAbsensi: {
    id_absensi: string;
    status: string;
    catatan?: string;
    siswa_nama: string;
    tanggal: string;
    materi: string;
  } | null;
  onSave: () => Promise<void>;
  onUpdate: (updates: Partial<{status: string; catatan: string}>) => void;
}

const EditAbsensiDialog: React.FC<EditAbsensiDialogProps> = ({
  isOpen,
  onClose,
  editingAbsensi,
  onSave,
  onUpdate
}) => {
  if (!editingAbsensi) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Kehadiran</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Siswa</Label>
            <p className="text-sm">{editingAbsensi.siswa_nama}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Tanggal</Label>
            <p className="text-sm">{editingAbsensi.tanggal}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Materi</Label>
            <p className="text-sm">{editingAbsensi.materi}</p>
          </div>
          <div>
            <Label htmlFor="status">Status Kehadiran</Label>
            <Select 
              value={editingAbsensi.status} 
              onValueChange={(value) => onUpdate({status: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hadir">Hadir</SelectItem>
                <SelectItem value="Izin">Izin</SelectItem>
                <SelectItem value="Sakit">Sakit</SelectItem>
                <SelectItem value="Alpha">Alpha</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="catatan">Catatan (Opsional)</Label>
            <Textarea
              id="catatan"
              value={editingAbsensi.catatan || ''}
              onChange={(e) => onUpdate({catatan: e.target.value})}
              placeholder="Tambahkan catatan..."
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button onClick={onSave}>
              Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditAbsensiDialog;
