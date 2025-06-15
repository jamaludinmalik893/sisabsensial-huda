
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

interface EditNilaiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSkor: number | "";
  initialCatatan: string;
  onSave: (updatedSkor: number, updatedCatatan: string) => Promise<void>;
  namaSiswa: string;
  judulTugas: string;
}

const EditNilaiDialog: React.FC<EditNilaiDialogProps> = ({
  open,
  onOpenChange,
  initialSkor,
  initialCatatan,
  onSave,
  namaSiswa,
  judulTugas,
}) => {
  const [skor, setSkor] = useState<number | "">(initialSkor);
  const [catatan, setCatatan] = useState<string>(initialCatatan ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSkor(initialSkor);
    setCatatan(initialCatatan ?? "");
  }, [initialSkor, initialCatatan, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(Number(skor), catatan);
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit Nilai</DialogTitle>
            <DialogDescription>
              {namaSiswa} <br />
              <span className="text-xs text-gray-500">{judulTugas}</span>
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="block text-xs font-medium mb-1">Nilai</label>
            <Input
              type="number"
              min={0}
              max={100}
              className="w-24"
              value={skor}
              onChange={(e) => setSkor(e.target.value === "" ? "" : Math.max(0, Math.min(100, Number(e.target.value))))}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Catatan (Opsional)</label>
            <Input
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan nilai"
              className="w-full"
              maxLength={200}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              Simpan
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

export default EditNilaiDialog;
