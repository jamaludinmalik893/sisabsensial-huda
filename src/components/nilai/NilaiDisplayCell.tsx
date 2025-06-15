
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { MessageCircle } from "lucide-react";

interface NilaiDisplayCellProps {
  skor: number;
  catatan?: string;
  getScoreColor: (score: number) => string;
  onDoubleClick?: () => void;
}

const NilaiDisplayCell: React.FC<NilaiDisplayCellProps> = ({
  skor,
  catatan,
  getScoreColor,
  onDoubleClick
}) => (
  <div
    className="flex items-center gap-1 cursor-pointer"
    onDoubleClick={onDoubleClick}
    title="Double klik untuk edit nilai & catatan"
  >
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative">
          <Badge className={`text-xs cursor-pointer ${getScoreColor(skor)}`}>
            {skor}
          </Badge>
          {catatan && (
            <span className="absolute -top-1 -right-1">
              <MessageCircle className="h-3 w-3 text-blue-500" />
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-xs">
          <p>Nilai: {skor}</p>
          {catatan && <p>Catatan: {catatan}</p>}
          <p className="text-gray-400 mt-1">Double klik untuk edit</p>
        </div>
      </TooltipContent>
    </Tooltip>
  </div>
);

export default NilaiDisplayCell;
