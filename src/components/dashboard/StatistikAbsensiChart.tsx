
import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

// Dummy/mock data rekap absensi harian minggu ini
const data = [
  { day: "Sen", hadir: 30, izin: 3, sakit: 2, alpha: 1 },
  { day: "Sel", hadir: 31, izin: 2, sakit: 1, alpha: 2 },
  { day: "Rab", hadir: 29, izin: 3, sakit: 2, alpha: 2 },
  { day: "Kam", hadir: 32, izin: 1, sakit: 1, alpha: 1 },
  { day: "Jum", hadir: 30, izin: 2, sakit: 0, alpha: 3 },
];

const StatistikAbsensiChart: React.FC = () => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="h-5 w-5 text-green-600" />
        <span className="font-semibold text-gray-900">Rekap Harian Kehadiran Siswa</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis minTickGap={1} />
          <Tooltip />
          <Legend />
          <Bar dataKey="hadir" fill="#22c55e" name="Hadir" />
          <Bar dataKey="izin" fill="#eab308" name="Izin" />
          <Bar dataKey="sakit" fill="#2563eb" name="Sakit" />
          <Bar dataKey="alpha" fill="#ef4444" name="Alpha" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default StatistikAbsensiChart;
