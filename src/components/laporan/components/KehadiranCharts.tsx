
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

const KehadiranCharts: React.FC = () => {
  // Data untuk pie chart
  const pieData = [
    { name: 'Hadir', value: 87, fill: '#22c55e' },
    { name: 'Izin', value: 8, fill: '#eab308' },
    { name: 'Sakit', value: 3, fill: '#3b82f6' },
    { name: 'Alpha', value: 2, fill: '#ef4444' }
  ];

  // Data untuk trend kehadiran
  const trendData = [
    { bulan: 'Jan', persentase: 85 },
    { bulan: 'Feb', persentase: 88 },
    { bulan: 'Mar', persentase: 92 },
    { bulan: 'Apr', persentase: 87 },
    { bulan: 'Mei', persentase: 90 },
    { bulan: 'Jun', persentase: 89 }
  ];

  // Data untuk kehadiran per mata pelajaran
  const kehadiranMapelData = [
    { mapel: 'Matematika', hadir: 92, izin: 5, sakit: 2, alpha: 1 },
    { mapel: 'Pemrograman', hadir: 89, izin: 7, sakit: 3, alpha: 1 },
    { mapel: 'Basis Data', hadir: 91, izin: 6, sakit: 2, alpha: 1 },
    { mapel: 'PKK', hadir: 88, izin: 8, sakit: 3, alpha: 1 }
  ];

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
          </CardContent>
        </Card>

        {/* Line Chart Trend Kehadiran */}
        <Card>
          <CardHeader>
            <CardTitle>Trend Kehadiran Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart Kehadiran per Mata Pelajaran */}
      <Card>
        <CardHeader>
          <CardTitle>Kehadiran per Mata Pelajaran</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={kehadiranMapelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mapel" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="hadir" stackId="a" fill="#22c55e" name="Hadir" />
              <Bar dataKey="izin" stackId="a" fill="#eab308" name="Izin" />
              <Bar dataKey="sakit" stackId="a" fill="#3b82f6" name="Sakit" />
              <Bar dataKey="alpha" stackId="a" fill="#ef4444" name="Alpha" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
};

export default KehadiranCharts;
