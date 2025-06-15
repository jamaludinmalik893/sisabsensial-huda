
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TaskHeaderActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialJudul: string;
  initialTanggal: string;
  onEdit: (newJudul: string, newTanggal: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

const TaskHeaderActionsDialog: React.FC<TaskHeaderActionsDialogProps> = ({
  open,
  onOpenChange,
  initialJudul,
  initialTanggal,
  onEdit,
  onDelete,
}) => {
  const [judul, setJudul] = useState(initialJudul);
  const [tanggal, setTanggal] = useState(initialTanggal);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setJudul(initialJudul);
    setTanggal(initialTanggal);
  }, [initialJudul, initialTanggal, open]);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onEdit(judul, tanggal);
    setLoading(false);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    await onDelete();
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit/Hapus Tugas & Tanggal</DialogTitle>
          <DialogDescription>
            Anda dapat mengedit judul/tanggal tugas ini atau menghapus seluruh nilai pada tugas ini (untuk semua siswa).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEdit} className="space-y-3">
          <div>
            <label className="text-xs mb-1 block">Judul Tugas</label>
            <Input
              value={judul}
              onChange={e => setJudul(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs mb-1 block">Tanggal Nilai</label>
            <Input
              type="date"
              value={tanggal}
              onChange={e => setTanggal(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              Simpan Perubahan
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              Hapus Tugas Ini
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskHeaderActionsDialog;
