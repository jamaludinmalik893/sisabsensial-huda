
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Calendar, TrendingUp } from 'lucide-react';

interface StatistikOverviewProps {
  overview: {
    total_siswa: number;
    rata_rata_kehadiran: number;
    kehadiran_tertinggi: number;
    siswa_alpha_tinggi: number;
  };
  loading?: boolean;
}

const StatistikOverview: React.FC<StatistikOverviewProps> = ({ overview, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Siswa</p>
              <p className="text-2xl font-bold text-gray-900">{overview.total_siswa}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rata-rata Kehadiran</p>
              <p className="text-2xl font-bold text-green-600">{overview.rata_rata_kehadiran}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Kehadiran Tertinggi</p>
              <p className="text-2xl font-bold text-green-600">{overview.kehadiran_tertinggi}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Siswa Alpha {'>'}5%</p>
              <p className="text-2xl font-bold text-red-600">{overview.siswa_alpha_tinggi}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatistikOverview;
