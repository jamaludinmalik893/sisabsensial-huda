

import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AbsensiTableHeaderProps {
  dateList: Array<[string, string]>;
  onJurnalDoubleClick: (date: string, materi: string) => void;
  onJurnalContextMenu: (date: string, materi: string, event: React.MouseEvent) => void;
}

const AbsensiTableHeader: React.FC<AbsensiTableHeaderProps> = ({
  dateList,
  onJurnalDoubleClick,
  onJurnalContextMenu
}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-8"></TableHead>
        <TableHead className="min-w-40">Nama Siswa</TableHead>
        {dateList.slice(0, 10).map(([date, materi]) => (
          <TableHead key={date} className="text-center min-w-24">
            <div className="flex flex-col">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="cursor-pointer hover:bg-blue-50 p-1 rounded"
                    onDoubleClick={() => onJurnalDoubleClick(date, materi)}
                    onContextMenu={(e) => onJurnalContextMenu(date, materi, e)}
                  >
                    <span className="text-xs font-medium text-blue-600 mb-1">
                      {materi.length > 15 ? `${materi.substring(0, 15)}...` : materi}
                    </span>
                    <br />
                    <span className="text-xs">{date}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    <p>Materi: {materi}</p>
                    <p>Tanggal: {date}</p>
                    <p className="text-gray-400 mt-1">Double klik untuk edit jurnal</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
        ))}
        <TableHead className="text-center min-w-16 bg-green-50">H</TableHead>
        <TableHead className="text-center min-w-16 bg-yellow-50">I</TableHead>
        <TableHead className="text-center min-w-16 bg-blue-50">S</TableHead>
        <TableHead className="text-center min-w-16 bg-red-50">A</TableHead>
        <TableHead className="text-center min-w-20 font-semibold">Prosentase Hadir</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default AbsensiTableHeader;

