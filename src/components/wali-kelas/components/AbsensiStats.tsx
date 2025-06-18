
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface AbsensiStatsProps {
  countStatus: (status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha') => number;
}

const AbsensiStats: React.FC<AbsensiStatsProps> = ({ countStatus }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{countStatus('Hadir')}</div>
          <div className="text-sm text-gray-500">Hadir</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{countStatus('Izin')}</div>
          <div className="text-sm text-gray-500">Izin</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{countStatus('Sakit')}</div>
          <div className="text-sm text-gray-500">Sakit</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{countStatus('Alpha')}</div>
          <div className="text-sm text-gray-500">Alpha</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbsensiStats;
