
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Trophy } from 'lucide-react';

interface Nilai {
  id_nilai: string;
  skor: number;
}

interface NilaiStatisticsProps {
  filteredNilai: Nilai[];
}

const NilaiStatistics: React.FC<NilaiStatisticsProps> = ({ filteredNilai }) => {
  const getAverageScore = () => {
    if (filteredNilai.length === 0) return 0;
    const total = filteredNilai.reduce((sum, nilai) => sum + nilai.skor, 0);
    return (total / filteredNilai.length).toFixed(1);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{filteredNilai.length}</div>
              <div className="text-sm text-gray-500">Total Nilai</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{getAverageScore()}</div>
              <div className="text-sm text-gray-500">Rata-rata</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Badge className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {filteredNilai.filter(n => n.skor >= 75).length}
              </div>
              <div className="text-sm text-gray-500">Nilai ≥ 75</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NilaiStatistics;
