
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

interface NilaiEditCellProps {
  skor: string;
  catatan: string;
  onChangeSkor: (val: string) => void;
  onChangeCatatan: (val: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const NilaiEditCell: React.FC<NilaiEditCellProps> = ({
  skor,
  catatan,
  onChangeSkor,
  onChangeCatatan,
  onSave,
  onCancel
}) => (
  <div className="flex flex-col gap-1">
    <Input
      type="number"
      min="0"
      max="100"
      value={skor}
      onChange={(e) => onChangeSkor(e.target.value)}
      className="w-16 h-6 text-xs text-center"
    />
    <Input
      value={catatan}
      onChange={(e) => onChangeCatatan(e.target.value)}
      placeholder="Catatan"
      className="w-20 h-6 text-xs"
    />
    <div className="flex gap-1">
      <Button size="sm" onClick={onSave} className="h-5 w-5 p-0">
        <Save className="h-3 w-3" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onCancel}
        className="h-5 w-5 p-0"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  </div>
);

export default NilaiEditCell;
