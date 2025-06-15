
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteNilaiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  judulTugas?: string;
  namaSiswa?: string;
}

const DeleteNilaiDialog: React.FC<DeleteNilaiDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  judulTugas,
  namaSiswa,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Nilai</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin <b>menghapus</b> nilai
            {namaSiswa && <> milik <b>{namaSiswa}</b></>} 
            {judulTugas && <> untuk tugas <b>{judulTugas}</b></>}
            ?<br />
            Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="destructive" onClick={onConfirm}>
            Hapus
          </Button>
          <DialogClose asChild>
            <Button variant="outline" onClick={onCancel}>Batal</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteNilaiDialog;
