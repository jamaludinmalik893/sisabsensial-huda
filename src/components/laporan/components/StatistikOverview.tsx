
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Calendar, TrendingUp } from 'lucide-react';

const StatistikOverview: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Siswa</p>
              <p className="text-2xl font-bold text-gray-900">150</p>
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
              <p className="text-2xl font-bold text-green-600">87%</p>
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
              <p className="text-2xl font-bold text-green-600">96%</p>
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
              <p className="text-2xl font-bold text-red-600">12</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatistikOverview;
