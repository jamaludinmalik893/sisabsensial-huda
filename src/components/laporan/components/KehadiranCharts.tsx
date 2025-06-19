
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { StatistikKelas, TrendKehadiran } from '@/types/laporan';

interface KehadiranChartsProps {
  statistikKelas: StatistikKelas[];
  trendKehadiran: TrendKehadiran[];
  loading?: boolean;
}

const KehadiranCharts: React.FC<KehadiranChartsProps> = ({ 
  statistikKelas, 
  trendKehadiran, 
  loading = false 
}) => {
  // Calculate pie data from class statistics
  const pieData = React.useMemo(() => {
    if (!statistikKelas.length) return [];
    
    const totals = statistikKelas.reduce((acc, curr) => ({
      hadir: acc.hadir + curr.total_hadir,
      izin: acc.izin + curr.total_izin,
      sakit: acc.sakit + curr.total_sakit,
      alpha: acc.alpha + curr.total_alpha
    }), { hadir: 0, izin: 0, sakit: 0, alpha: 0 });

    const total = totals.hadir + totals.izin + totals.sakit + totals.alpha;
    
    if (total === 0) return [];

    return [
      { name: 'Hadir', value: Math.round((totals.hadir / total) * 100), fill: '#22c55e' },
      { name: 'Izin', value: Math.round((totals.izin / total) * 100), fill: '#eab308' },
      { name: 'Sakit', value: Math.round((totals.sakit / total) * 100), fill: '#3b82f6' },
      { name: 'Alpha', value: Math.round((totals.alpha / total) * 100), fill: '#ef4444' }
    ];
  }, [statistikKelas]);

  // Transform trend data for chart
  const trendData = React.useMemo(() => {
    return trendKehadiran.map(item => ({
      bulan: item.periode.split('-')[1] || item.periode,
      persentase: Number(item.persentase_hadir) || 0
    }));
  }, [trendKehadiran]);

  // Transform class data for bar chart
  const kehadiranKelasData = React.useMemo(() => {
    return statistikKelas.map(item => ({
      kelas: item.nama_kelas,
      hadir: item.total_hadir,
      izin: item.total_izin,
      sakit: item.total_sakit,
      alpha: item.total_alpha
    }));
  }, [statistikKelas]);

  if (loading) {
    return (
      <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] bg-gray-100 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] bg-gray-100 rounded animate-pulse"></div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      {/* Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart Distribusi Kehadiran */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Status Kehadiran</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Tidak ada data kehadiran
              </div>
            )}
          </CardContent>
        </Card>

        {/* Line Chart Trend Kehadiran */}
        <Card>
          <CardHeader>
            <CardTitle>Trend Kehadiran Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="persentase" stroke="#22c55e" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Tidak ada data trend
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart Kehadiran per Kelas */}
      <Card>
        <CardHeader>
          <CardTitle>Kehadiran per Kelas</CardTitle>
        </CardHeader>
        <CardContent>
          {kehadiranKelasData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={kehadiranKelasData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="kelas" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hadir" stackId="a" fill="#22c55e" name="Hadir" />
                <Bar dataKey="izin" stackId="a" fill="#eab308" name="Izin" />
                <Bar dataKey="sakit" stackId="a" fill="#3b82f6" name="Sakit" />
                <Bar dataKey="alpha" stackId="a" fill="#ef4444" name="Alpha" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-gray-500">
              Tidak ada data kelas
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default KehadiranCharts;
