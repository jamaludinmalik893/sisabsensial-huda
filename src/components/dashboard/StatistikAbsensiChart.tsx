
import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

type StatistikHari = {
  tanggal: string;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
};

interface StatistikAbsensiChartProps {
  data: StatistikHari[];
  loading?: boolean;
}
const labelHari = ["Min","Sen", "Sel", "Rab", "Kam", "Jum", "Sabtu"];
function tanggalToLabel(tanggal: string) {
  const date = new Date(tanggal);
  return labelHari[date.getDay()];
}

const StatistikAbsensiChart: React.FC<StatistikAbsensiChartProps> = ({ data, loading }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="h-5 w-5 text-green-600" />
        <span className="font-semibold text-gray-900">Rekap Harian Kehadiran Siswa</span>
      </div>
      {loading ? (
        <div className="h-[220px] flex items-center justify-center">Loading...</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data.map(item => ({
            ...item,
            day: tanggalToLabel(item.tanggal)
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis minTickGap={1} allowDecimals={false}/>
            <Tooltip />
            <Legend />
            <Bar dataKey="hadir" fill="#22c55e" name="Hadir" />
            <Bar dataKey="izin" fill="#eab308" name="Izin" />
            <Bar dataKey="sakit" fill="#2563eb" name="Sakit" />
            <Bar dataKey="alpha" fill="#ef4444" name="Alpha" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
);

export default StatistikAbsensiChart;
