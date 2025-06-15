
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash } from 'lucide-react';

interface EditJurnalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingJurnal: {
    id_jurnal: string;
    judul_materi: string;
    tanggal_pelajaran: string;
    materi_diajarkan: string;
    waktu_mulai: string;
    waktu_selesai: string;
  } | null;
  onSave: () => Promise<void>;
  onDelete: () => void;
  onUpdate: (updates: any) => void;
}

const EditJurnalDialog: React.FC<EditJurnalDialogProps> = ({
  isOpen,
  onClose,
  editingJurnal,
  onSave,
  onDelete,
  onUpdate
}) => {
  if (!editingJurnal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Jurnal Harian
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="judul_materi">Judul Materi</Label>
            <Input
              id="judul_materi"
              value={editingJurnal.judul_materi}
              onChange={(e) => onUpdate({...editingJurnal, judul_materi: e.target.value})}
              placeholder="Masukkan judul materi..."
            />
          </div>
          <div>
            <Label htmlFor="tanggal_pelajaran">Tanggal Pelajaran</Label>
            <Input
              id="tanggal_pelajaran"
              type="date"
              value={editingJurnal.tanggal_pelajaran}
              onChange={(e) => onUpdate({...editingJurnal, tanggal_pelajaran: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="waktu_mulai">Waktu Mulai</Label>
              <Input
                id="waktu_mulai"
                type="time"
                value={editingJurnal.waktu_mulai}
                onChange={(e) => onUpdate({...editingJurnal, waktu_mulai: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="waktu_selesai">Waktu Selesai</Label>
              <Input
                id="waktu_selesai"
                type="time"
                value={editingJurnal.waktu_selesai}
                onChange={(e) => onUpdate({...editingJurnal, waktu_selesai: e.target.value})}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="materi_diajarkan">Materi yang Diajarkan</Label>
            <Textarea
              id="materi_diajarkan"
              value={editingJurnal.materi_diajarkan}
              onChange={(e) => onUpdate({...editingJurnal, materi_diajarkan: e.target.value})}
              placeholder="Deskripsi materi yang diajarkan..."
              rows={4}
            />
          </div>
          <div className="flex gap-2 justify-between">
            <Button 
              variant="destructive" 
              onClick={onDelete}
              className="flex items-center gap-2"
            >
              <Trash className="h-4 w-4" />
              Hapus
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button onClick={onSave}>
                Simpan
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditJurnalDialog;
